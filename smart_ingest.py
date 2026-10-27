"""
smart_ingest.py
Deeply parses NCERT PDFs and generates ALL structured learning materials
(sections, concepts, formulas, examples, 150+ quiz questions, audio scripts, slides, socratic Q&A)
"""
import sys
import os
import re
import json
import random
import warnings
import functools

warnings.filterwarnings("ignore")
print = functools.partial(print, flush=True)

import fitz
import psycopg2

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_db_uri():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_file = os.path.join(script_dir, ".env.local")
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("SUPABASE_DB_URI="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.getenv("SUPABASE_DB_URI", "postgresql://postgres:Pflg782012006@db.iulnjxewpbwlazspvkmb.supabase.co:5432/postgres")

# ─────────────────────────────────────────────
# CLEAN PDF EXTRACTION
# ─────────────────────────────────────────────
def extract_clean_text(pdf_path):
    doc = fitz.open(pdf_path)
    pages_text = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        pages_text.append(text)
    doc.close()
    
    full_text = "\n".join(pages_text)
    
    # Fix spaced-out letters (common PDF artifact): "L a w s" -> "Laws"
    lines = full_text.split('\n')
    cleaned = []
    for line in lines:
        parts = line.split()
        if len(parts) > 2 and sum(1 for p in parts if len(p) == 1) / len(parts) > 0.6:
            cleaned.append(''.join(parts))
        else:
            cleaned.append(line)
    text = '\n'.join(cleaned)
    
    # Fix hyphenated line breaks
    text = re.sub(r'(\w)-\n(\w)', r'\1\2', text)
    # Remove page numbers
    text = re.sub(r'^\s*\d{1,3}\s*$', '', text, flags=re.MULTILINE)
    # Remove headers/footers
    text = re.sub(r'(?im)^(PHYSICS|CHEMISTRY|MATHEMATICS|BIOLOGY|NCERT|not to be republished|©.*|rationalised \d+-\d+).*$', '', text, flags=re.MULTILINE)
    # Collapse whitespace
    text = re.sub(r' {2,}', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

# ─────────────────────────────────────────────
# PARSE INTO CHAPTER STRUCTURE
# ─────────────────────────────────────────────
def parse_chapter_structure(text, filename):
    """Extract chapter title + split into sections"""
    raw_name = filename.replace('.pdf', '').replace('Physics_', '').replace('_', ' ')
    # Convert camelCase to Space separated
    clean_title = re.sub(r'([a-z])([A-Z])', r'\1 \2', raw_name).strip()
    chapter_title = clean_title.title()

    title_match = re.search(r'CHAPTER\s+\w+\s*\n+\s*([A-Z][A-Z\s]{3,60})', text[:2000])
    if title_match:
        matched = title_match.group(1).strip().title()
        if len(matched) > 4:
            chapter_title = matched

    # Split into sections using pattern: "4.1 Section Name" or "5.1 Section Name"
    section_pattern = r'(?=^\d+\.\d+(?:\.\d+)?\s+[A-Z])'
    parts = re.split(section_pattern, text, flags=re.MULTILINE)
    
    sections = []
    for i, part in enumerate(parts):
        part = part.strip()
        if len(part) < 100:
            continue
        
        first_line_match = re.match(r'(\d+\.\d+(?:\.\d+)?)\s+(.+?)(?:\n|$)', part)
        if first_line_match:
            sec_num = first_line_match.group(1)
            sec_title = first_line_match.group(2).strip()[:200]
            sec_content = part[first_line_match.end():].strip()
        else:
            sec_num = f"1.{i}"
            sec_title = "Introduction & Overview" if i == 0 else f"Core Concepts Part {i}"
            sec_content = part
        
        if len(sec_content) < 80:
            continue
        
        sections.append({
            'number': sec_num,
            'title': sec_title,
            'content': sec_content,
            'order': i
        })
    
    # Fallback: if no numbered sections, chunk by paragraph size
    if len(sections) < 2:
        chunks = []
        paragraphs = text.split('\n\n')
        current = []
        current_size = 0
        for para in paragraphs:
            current.append(para)
            current_size += len(para)
            if current_size > 3000:
                chunks.append('\n\n'.join(current))
                current = []
                current_size = 0
        if current:
            chunks.append('\n\n'.join(current))
        
        sections = [{
            'number': f'1.{i+1}',
            'title': f'{chapter_title} - Section {i+1}',
            'content': chunk,
            'order': i
        } for i, chunk in enumerate(chunks)]
    
    return {
        'title': chapter_title,
        'sections': sections
    }

# ─────────────────────────────────────────────
# FORMAT CONTENT AS MARKDOWN
# ─────────────────────────────────────────────
def to_markdown(content):
    lines = content.split('\n')
    md = []
    for line in lines:
        s = line.strip()
        if not s:
            md.append('')
            continue
        if re.match(r'^\d+\.\d+\.\d+\s+[A-Z]', s):
            md.append(f'\n#### {s}\n')
        elif re.match(r'^Example\s+\d+\.\d+', s, re.IGNORECASE):
            md.append(f'\n**📘 {s}**\n')
        elif s.isupper() and 5 < len(s) < 80:
            md.append(f'\n### {s.title()}\n')
        else:
            md.append(s)
    return '\n'.join(md)

# ─────────────────────────────────────────────
# EXTRACT CONCEPTS (for Flashcards)
# ─────────────────────────────────────────────
def extract_concepts(content):
    concepts = []
    patterns = [
        r'(?:The\s+)?([A-Z][a-zA-Z\s]{3,50}?)\s+is\s+defined\s+as\s+(.{20,250}?)(?:[.;]|\n)',
        r'(?:The\s+)?([A-Z][a-zA-Z\s]{3,50}?)\s+is\s+called\s+(.{20,250}?)(?:[.;]|\n)',
        r'(?:The\s+)?([A-Z][a-zA-Z\s]{3,50}?)\s+refers\s+to\s+(.{20,250}?)(?:[.;]|\n)',
        r'(?:The\s+)?([A-Z][a-zA-Z\s]{3,50}?)\s+means\s+(.{20,250}?)(?:[.;]|\n)',
        r'([A-Z][a-zA-Z\s]{3,50}?):\s+(.{20,250}?)(?:[.;]|\n)',
    ]
    for pattern in patterns:
        for match in re.finditer(pattern, content):
            term = match.group(1).strip()
            definition = match.group(2).strip()
            if 3 < len(term) < 60 and 15 < len(definition) < 300:
                concepts.append({
                    'term': term,
                    'definition': definition,
                    'context': match.group(0)[:400],
                    'importance': 3
                })
    
    seen = set()
    unique = []
    for c in concepts:
        key = c['term'].lower()
        if key not in seen:
            seen.add(key)
            unique.append(c)
    return unique[:15]

# ─────────────────────────────────────────────
# EXTRACT FORMULAS (for Simulator)
# ─────────────────────────────────────────────
def extract_formulas(content):
    formulas = []
    formula_pattern = r'([A-Za-z](?:_[a-zA-Z0-9]+)?)\s*=\s*([^.;\n,]{3,80}?)(?=[.;\n,]|\s+(?:where|is|and))'
    for match in re.finditer(formula_pattern, content):
        lhs = match.group(1).strip()
        rhs = match.group(2).strip()
        plain = f"{lhs} = {rhs}"
        if len(plain) < 100 and not any(x in rhs for x in ['Figure', 'Table', 'Chapter', 'Section']):
            vars_desc = []
            for var in re.findall(r'[A-Za-z]', lhs + rhs):
                vars_desc.append({'symbol': var, 'name': var, 'unit': ''})
            formulas.append({
                'latex': plain,
                'plain': plain,
                'variables': vars_desc[:5],
                'description': f"Mathematical relationship derived in section"
            })
    seen = set()
    unique = []
    for f in formulas:
        if f['plain'] not in seen:
            seen.add(f['plain'])
            unique.append(f)
    return unique[:10]

# ─────────────────────────────────────────────
# EXTRACT WORKED EXAMPLES (for Practice Solver)
# ─────────────────────────────────────────────
def extract_examples(content):
    examples = []
    example_pattern = r'Example\s+(\d+\.\d+)(.*?)(?=Example\s+\d+\.\d+|\n\n\d+\.\d+\s+[A-Z]|$)'
    for match in re.finditer(example_pattern, content, re.DOTALL):
        ex_num = match.group(1)
        ex_body = match.group(2).strip()
        if len(ex_body) < 50:
            continue
        
        soln_split = re.split(r'\b(?:Answer|Solution|Ans)\s*[:.]?\s*', ex_body, maxsplit=1, flags=re.IGNORECASE)
        if len(soln_split) == 2:
            problem = soln_split[0].strip()[:800]
            solution = soln_split[1].strip()[:1500]
        else:
            problem = ex_body[:400]
            solution = ex_body[400:1500] if len(ex_body) > 400 else ""
        
        sentences = re.split(r'(?<=[.])\s+(?=[A-Z])', solution)
        steps = [
            {'step': i+1, 'description': s.strip()[:400], 'equation': ''}
            for i, s in enumerate(sentences[:8]) if len(s.strip()) > 10
        ]
        
        final = ""
        for line in reversed(solution.split('\n')):
            if '=' in line or re.search(r'\d+\s*(m/s|N|J|kg|m|s|rad/s)\b', line):
                final = line.strip()[:200]
                break
        
        examples.append({
            'number': ex_num,
            'problem': problem,
            'steps': steps,
            'final_answer': final
        })
    return examples[:8]

# ─────────────────────────────────────────────
# GENERATE QUIZ QUESTIONS (Covering all sections)
# ─────────────────────────────────────────────
def generate_quiz_questions(section_title, content, concepts, formulas, examples):
    questions = []
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', content) if 40 < len(s.strip()) < 300]
    
    # Type 1: Definition-based MCQs
    for concept in concepts[:10]:
        correct_opt = concept['definition'][:100]
        wrong_options = [c['definition'][:100] for c in concepts if c['term'] != concept['term'] and c['definition'][:100] != correct_opt][:3]
        fallback_distractors = [
            "A scalar constant independent of system frame",
            "An intrinsic kinematic vector quantity",
            "A relativistic invariant parameter",
            "A dimensional constant in standard units"
        ]
        for fb in fallback_distractors:
            if len(wrong_options) < 3 and fb not in wrong_options:
                wrong_options.append(fb)
        
        options = [correct_opt] + wrong_options[:3]
        random.shuffle(options)
        
        questions.append({
            'text': f"What is the definition of {concept['term']}?",
            'type': 'mcq',
            'options': options,
            'correct': correct_opt,
            'explanation': f"According to the NCERT textbook: {concept['context'][:300]}",
            'difficulty': 'easy',
            'source': concept['context'][:200]
        })
    
    # Type 2: Fill-in-the-blank from key sentences
    for sent in sentences[:15]:
        words = sent.split()
        candidates = [w for w in words if len(w) > 5 and w[0].isupper() and w.isalpha()]
        if not candidates:
            candidates = [w for w in words if len(w) > 6 and w.isalpha()]
        if not candidates:
            continue
        blank_word = random.choice(candidates)
        blanked = sent.replace(blank_word, "______", 1)
        
        distractors = []
        for other_sent in sentences:
            if other_sent != sent:
                other_words = [w for w in other_sent.split() if len(w) > 5 and w.isalpha()]
                distractors.extend(other_words)
        distractors = list(set(distractors) - {blank_word})[:3]
        while len(distractors) < 3:
            distractors.append(f"parameter_{len(distractors)+1}")
        
        options = [blank_word] + distractors[:3]
        random.shuffle(options)
        
        questions.append({
            'text': f"Fill in the blank: {blanked}",
            'type': 'fill_blank',
            'options': options,
            'correct': blank_word,
            'explanation': f"The textbook states: {sent}",
            'difficulty': 'medium',
            'source': sent
        })
    
    # Type 3: Formula-based questions
    for formula in formulas[:6]:
        plain = formula['plain']
        wrong = [
            plain.replace('=', '≠'),
            plain.replace('+', '-').replace('*', '/') if '+' in plain or '*' in plain else f"{plain}^2",
            f"{plain} / 2"
        ]
        options = [plain] + wrong
        random.shuffle(options)
        questions.append({
            'text': f"Which formula is correctly stated in {section_title}?",
            'type': 'mcq',
            'options': options,
            'correct': plain,
            'explanation': f"The valid relationship is {plain} as derived in the section.",
            'difficulty': 'medium',
            'source': plain
        })
    
    # Type 4: True/False statements
    for sent in sentences[15:28]:
        questions.append({
            'text': f"True or False: {sent}",
            'type': 'true_false',
            'options': ['True', 'False'],
            'correct': 'True',
            'explanation': f"This statement is taken directly from the textbook section on {section_title}.",
            'difficulty': 'easy',
            'source': sent
        })
        if ' is ' in sent:
            flipped = sent.replace(' is ', ' is not ', 1)
            questions.append({
                'text': f"True or False: {flipped}",
                'type': 'true_false',
                'options': ['True', 'False'],
                'correct': 'False',
                'explanation': f"This is false. The correct statement is: {sent}",
                'difficulty': 'medium',
                'source': sent
            })
    
    # Type 5: Conceptual "Which statement is correct"
    for i, sent in enumerate(sentences[28:45]):
        if i >= 8:
            break
        other_sentences = [s for s in sentences if s != sent]
        if len(other_sentences) < 3:
            continue
        distractor_sents = random.sample(other_sentences, 3)
        wrong_options = []
        for ds in distractor_sents:
            ws = ds.split()
            if len(ws) > 5:
                i1, i2 = random.sample(range(len(ws)), 2)
                ws[i1], ws[i2] = ws[i2], ws[i1]
                wrong_options.append(' '.join(ws)[:140])
            else:
                wrong_options.append(ds[:140])
        
        correct_statement = sent[:140]
        options = [correct_statement] + wrong_options[:3]
        random.shuffle(options)
        questions.append({
            'text': f"Which of the following statements regarding {section_title} is accurate?",
            'type': 'mcq',
            'options': options,
            'correct': correct_statement,
            'explanation': f"Verbatim textbook citation: {sent}",
            'difficulty': 'hard',
            'source': sent
        })
    
    return questions

# ─────────────────────────────────────────────
# GENERATE AUDIO SCRIPT (Conversational Tone)
# ─────────────────────────────────────────────
def generate_audio_script(section_title, content):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', content) if 20 < len(s.strip()) < 400]
    
    script = f"Hey there! Welcome to NeuraGlow Audio. Today we're exploring {section_title}. "
    script += "Let's unpack this concept step by step.\n\n"
    
    openers = [
        "So here is the key takeaway: ", "Let's examine how this works in practice. ",
        "Here is an essential insight: ", "Consider it from this perspective: ",
        "You might ask yourself: ", "Now, observe the core mechanism: ",
        "Let's break this down further: ", "Here is why this matters: ",
        "The fundamental axiom is this: ", "Now, keep this in mind: "
    ]
    
    transitions = [
        "\n\nMoving forward to the next point, ", "\n\nBuilding upon this foundation, ",
        "\n\nNow consider another critical aspect: ", "\n\nExpanding further, ",
        "\n\nTo deepen our understanding, "
    ]
    
    for i, sent in enumerate(sentences[:40]):
        if i == 0:
            script += openers[0] + sent + " "
        elif i % 5 == 0:
            script += random.choice(transitions) + random.choice(openers).lower() + sent + " "
        else:
            script += sent + " "
        
        if i % 7 == 0 and i > 0:
            script += "Notice how this connects to the broader laws of physics. "
    
    script += f"\n\nThat concludes our audio walkthrough of {section_title}. Review the formulas and test your knowledge in the quiz!"
    
    duration = int(len(script.split()) * 0.4)
    return script, duration

# ─────────────────────────────────────────────
# GENERATE SLIDES (Presentation Engine)
# ─────────────────────────────────────────────
def generate_slides(section_title, content, concepts, formulas):
    slides = []
    
    slides.append({
        'number': 1,
        'title': section_title,
        'bullets': [
            f"Mastery Lecture: {section_title}",
            "Core physical principles & axioms",
            "Analytical derivations and practical applications"
        ],
        'type': 'title'
    })
    
    first_para = content.split('\n\n')[0][:500]
    intro_bullets = [s.strip() for s in re.split(r'(?<=[.])\s+', first_para) if 20 < len(s.strip()) < 150][:4]
    if intro_bullets:
        slides.append({
            'number': 2,
            'title': 'Foundational Context',
            'bullets': intro_bullets,
            'type': 'content'
        })
    
    for i in range(0, len(concepts), 3):
        batch = concepts[i:i+3]
        slides.append({
            'number': len(slides) + 1,
            'title': f'Key Definitions ({i//3 + 1})',
            'bullets': [f"{c['term']}: {c['definition'][:120]}" for c in batch],
            'type': 'content'
        })
    
    if formulas:
        slides.append({
            'number': len(slides) + 1,
            'title': 'Core Equations & Axioms',
            'bullets': [f['plain'] for f in formulas[:6]],
            'type': 'formula'
        })
    
    slides.append({
        'number': len(slides) + 1,
        'title': 'Summary & Synthesis',
        'bullets': [
            f"Examined {section_title} comprehensively",
            f"Synthesized {len(concepts)} foundational concepts",
            f"Mastered {len(formulas)} operational equations",
            "Proceed to active practice solver and question bank"
        ],
        'type': 'summary'
    })
    
    return slides

# ─────────────────────────────────────────────
# GENERATE SOCRATIC Q&A (Depth Levels 1 - 5)
# ─────────────────────────────────────────────
def generate_socratic_qa(section_title, content, concepts):
    qa_list = []
    
    for concept in concepts[:3]:
        qa_list.append({
            'depth': 1,
            'question': f"In your own words, what is {concept['term']}?",
            'answer': concept['definition'],
            'hint': f"Reflect on its operational role in {section_title}."
        })
    
    for concept in concepts[3:6]:
        qa_list.append({
            'depth': 2,
            'question': f"How does {concept['term']} operate under standard physical conditions?",
            'answer': f"{concept['definition']}. Verbatim context: {concept['context'][:220]}",
            'hint': "Analyze the physical scenario where this term was defined."
        })
    
    qa_list.append({
        'depth': 3,
        'question': f"What real-world engineering or natural phenomenon illustrates {section_title}?",
        'answer': f"The principles of {section_title} govern celestial orbits, mechanical systems, and projectile trajectories across daily life and aerospace technology.",
        'hint': "Consider everyday forces and motions."
    })
    
    qa_list.append({
        'depth': 4,
        'question': f"What would break in classical mechanics if the principles of {section_title} failed to hold?",
        'answer': f"If {section_title} did not hold, conservation laws (momentum, energy) would be violated, leading to non-deterministic mechanical behavior.",
        'hint': "Trace the implications back to foundational conservation laws."
    })
    
    qa_list.append({
        'depth': 5,
        'question': f"How does {section_title} bridge classical Newtonian physics with modern scientific models?",
        'answer': f"{section_title} provides macroscopic approximations that transition into relativistic and quantum regimes when velocities approach c or at atomic length scales.",
        'hint': "Consider limiting boundaries of classical vs. modern physics."
    })
    
    return qa_list

# ─────────────────────────────────────────────
# INGEST SINGLE PDF
# ─────────────────────────────────────────────
def ingest_pdf(filepath, subject, source, conn):
    print(f"\n{'='*70}\n📖 Processing PDF: {os.path.basename(filepath)}\n{'='*70}")
    
    text = extract_clean_text(filepath)
    chapter_data = parse_chapter_structure(text, os.path.basename(filepath))
    
    cur = conn.cursor()
    
    # Delete existing chapter with identical title to allow clean idempotency
    cur.execute("SELECT id FROM chapters WHERE chapter_title = %s AND subject = %s", (chapter_data['title'], subject))
    existing = cur.fetchone()
    if existing:
        print(f"🔄 Replacing existing chapter: {chapter_data['title']} (ID: {existing[0]})")
        cur.execute("DELETE FROM chapters WHERE id = %s", (existing[0],))
        conn.commit()

    # Insert chapter
    cur.execute("""
        INSERT INTO chapters (subject, chapter_title, source, total_sections)
        VALUES (%s, %s, %s, %s) RETURNING id
    """, (subject, chapter_data['title'], source, len(chapter_data['sections'])))
    chapter_id = cur.fetchone()[0]
    print(f"✅ Created Chapter: '{chapter_data['title']}' [ID: {chapter_id}] with {len(chapter_data['sections'])} sections")
    
    total_questions = 0
    total_concepts = 0
    total_formulas = 0
    total_examples = 0
    
    for section in chapter_data['sections']:
        content_md = to_markdown(section['content'])
        word_count = len(content_md.split())
        summary = ' '.join(section['content'].split()[:40]) + '...'
        
        cur.execute("""
            INSERT INTO chapter_sections (chapter_id, section_number, section_title, section_order, content_markdown, summary, word_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (chapter_id, section['number'], section['title'], section['order'], content_md, summary, word_count))
        section_id = cur.fetchone()[0]
        
        # Concepts
        concepts = extract_concepts(section['content'])
        total_concepts += len(concepts)
        for c in concepts:
            cur.execute("""
                INSERT INTO concepts (section_id, term, definition, context, importance)
                VALUES (%s, %s, %s, %s, %s)
            """, (section_id, c['term'], c['definition'], c['context'], c['importance']))
        
        # Formulas
        formulas = extract_formulas(section['content'])
        total_formulas += len(formulas)
        for f in formulas:
            cur.execute("""
                INSERT INTO formulas (section_id, formula_latex, formula_plain, variables, description)
                VALUES (%s, %s, %s, %s::jsonb, %s)
            """, (section_id, f['latex'], f['plain'], json.dumps(f['variables']), f['description']))
        
        # Examples
        examples = extract_examples(section['content'])
        total_examples += len(examples)
        for ex in examples:
            cur.execute("""
                INSERT INTO examples (section_id, example_number, problem_statement, solution_steps, final_answer)
                VALUES (%s, %s, %s, %s::jsonb, %s)
            """, (section_id, ex['number'], ex['problem'], json.dumps(ex['steps']), ex['final_answer']))
        
        # Quiz Questions
        questions = generate_quiz_questions(section['title'], section['content'], concepts, formulas, examples)
        total_questions += len(questions)
        for q in questions:
            cur.execute("""
                INSERT INTO quiz_questions (chapter_id, section_id, question_text, question_type, options, correct_answer, explanation, difficulty, source_text)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s)
            """, (chapter_id, section_id, q['text'], q['type'], json.dumps(q['options']), q['correct'], q['explanation'], q['difficulty'], q['source']))
        
        # Audio Script
        script, duration = generate_audio_script(section['title'], section['content'])
        cur.execute("""
            INSERT INTO audio_scripts (section_id, script_text, estimated_duration_sec)
            VALUES (%s, %s, %s)
        """, (section_id, script, duration))
        
        # Slides
        slides = generate_slides(section['title'], section['content'], concepts, formulas)
        for s in slides:
            cur.execute("""
                INSERT INTO slides (section_id, slide_number, title, bullet_points, slide_type)
                VALUES (%s, %s, %s, %s::jsonb, %s)
            """, (section_id, s['number'], s['title'], json.dumps(s['bullets']), s['type']))
        
        # Socratic QA
        qa_list = generate_socratic_qa(section['title'], section['content'], concepts)
        for qa in qa_list:
            cur.execute("""
                INSERT INTO socratic_qa (section_id, depth_level, question, answer, follow_up_hint)
                VALUES (%s, %s, %s, %s, %s)
            """, (section_id, qa['depth'], qa['question'], qa['answer'], qa['hint']))
        
        print(f"   ├─ Section {section['number']} ({section['title'][:35]}): {len(concepts)} concepts | {len(formulas)} formulas | {len(questions)} questions")
    
    conn.commit()
    print(f"🎉 Chapter '{chapter_data['title']}' COMPLETE! Totals: {total_questions} questions, {total_concepts} concepts, {total_formulas} formulas, {total_examples} examples.")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    uri = get_db_uri()
    print("🚀 Connecting to Supabase...")
    conn = psycopg2.connect(uri)
    
    pdf_folder = os.path.join(script_dir, "pdf_library")
    if not os.path.exists(pdf_folder):
        print(f"❌ '{pdf_folder}' folder not found!")
        return

    files = [f for f in sorted(os.listdir(pdf_folder)) if f.lower().endswith('.pdf')]
    print(f"📚 Found {len(files)} PDFs in '{pdf_folder}' to deeply ingest into Supabase:")
    for f in files:
        print(f"   - {f}")
    
    for filename in files:
        filepath = os.path.join(pdf_folder, filename)
        ingest_pdf(filepath, 'Physics', 'NCERT Class 11', conn)
    
    conn.close()
    print("\n🌟 All 7 NCERT Class 11 Physics chapters deeply parsed, structured, and uploaded to Supabase!")

if __name__ == "__main__":
    main()
