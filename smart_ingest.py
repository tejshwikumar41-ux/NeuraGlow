"""
smart_ingest.py
Deeply parses NCERT PDFs using pymupdf4llm, cleans fake-bold duplicate artifacts,
formats math in KaTeX $$...$$, and populates all 9 learning feature tables in Supabase.
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

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import fitz
import pymupdf4llm
import psycopg2
from psycopg2.extras import execute_batch

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
# NCERT FAKE-BOLD & MATH DEDUPLICATION CLEANER
# ─────────────────────────────────────────────
def fix_ncert_math(text):
    def deduplicate(match):
        return match.group(1)
    
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        if '=' in line or re.search(r'\(\d+\.\d+\)', line) or any(c in line for c in ['Δ', '∝', '+', '-', '/', '∑', '∫']):
            # Remove fake-bold duplicate layers printed 4-5 times in NCERT PDFs (e.g. d d d m m t t)
            line = re.sub(r'([a-zA-Z=+\-\(\)\[\]Δ∝])(?:\s*\1)+', deduplicate, line)
            
            # Reconnect separated calculus/physics variables
            replacements = {
                r'\b[d]\s+[t]\b': 'dt',
                r'\b[d]\s+[p]\b': 'dp',
                r'\b[d]\s+[v]\b': 'dv',
                r'\b[d]\s+[x]\b': 'dx',
                r'\b[m]\s+[v]\b': 'mv',
                r'\b[m]\s+[a]\b': 'ma',
                r'Δ\s+[t]\b': 'Δt',
                r'Δ\s+[p]\b': 'Δp',
                r'Δ\s+[v]\b': 'Δv',
                r'\(\s*\)': ''
            }
            for pat, rep in replacements.items():
                line = re.sub(pat, rep, line)
            
            # Wrap standalone math equations in KaTeX block delimiters $$ ... $$
            stripped = line.strip()
            if '=' in stripped and len(stripped) < 95 and not stripped.startswith('$$') and not stripped.startswith('#'):
                match = re.search(r'^(.*?)(\(\d+\.\d+\))$', stripped)
                if match:
                    eq = match.group(1).strip()
                    num = match.group(2).strip()
                    line = f"\n$$ {eq} $$  *{num}*\n"
                elif not stripped.startswith('*') and not stripped.startswith('-'):
                    line = f"\n$$ {stripped} $$\n"
                    
        cleaned_lines.append(line)
        
    return '\n'.join(cleaned_lines)

def extract_clean_text(pdf_path):
    print(f"📖 Extracting layout-preserved Markdown with pymupdf4llm: {os.path.basename(pdf_path)}...")
    md_text = pymupdf4llm.to_markdown(pdf_path)
    md_text = fix_ncert_math(md_text)
    md_text = re.sub(r'(?im)^(PHYSICS|CHEMISTRY|MATHEMATICS|BIOLOGY|NCERT|not to be republished|©.*|rationalised \d+-\d+).*$', '', md_text, flags=re.MULTILINE)
    md_text = re.sub(r'\n{3,}', '\n\n', md_text)
    return md_text.strip()

# ─────────────────────────────────────────────
# PARSE INTO CHAPTER STRUCTURE
# ─────────────────────────────────────────────
def parse_chapter_structure(text, filename):
    raw_name = filename.replace('.pdf', '').replace('Physics_', '').replace('_', ' ')
    clean_title = re.sub(r'([a-z])([A-Z])', r'\1 \2', raw_name).strip().title()
    chapter_title = clean_title

    title_match = re.search(r'CHAPTER\s+\w+\s*\n+\s*([A-Z][A-Z\s]{3,60})', text[:2000])
    if title_match:
        matched = title_match.group(1).strip().title()
        if len(matched) > 4:
            chapter_title = matched

    # Split into sections using markdown headers and numbered sections
    section_pattern = r'(?=(?:^|\n)(?:#{1,4}\s+)?(?:\*\*)?\d+\.\d+(?:\.\d+)?(?:\*\*)?\s+[A-Z])'
    parts = re.split(section_pattern, text)
    
    sections = []
    for i, part in enumerate(parts):
        part = part.strip()
        if len(part) < 80:
            continue
        
        first_line_match = re.search(r'(?:#{1,4}\s+)?(?:\*\*)?(\d+\.\d+(?:\.\d+)?)(?:\*\*)?\s+(.+?)(?:\n|$)', part)
        if first_line_match:
            sec_num = first_line_match.group(1)
            raw_sec_title = first_line_match.group(2).strip()[:200]
            sec_title = re.sub(r'[*#_]', '', raw_sec_title).strip()
            sec_content = part[first_line_match.end():].strip()
        else:
            sec_num = f"0.{i}"
            sec_title = "Introduction & Overview" if i == 0 else f"Section {i}"
            sec_content = part
        
        if len(sec_content) < 60:
            continue
        
        sections.append({
            'number': sec_num,
            'title': sec_title,
            'content': sec_content,
            'order': i
        })
    
    # Fallback if no numbered sections found
    if len(sections) < 2:
        paragraphs = text.split('\n\n')
        chunks, current, current_size = [], [], 0
        for para in paragraphs:
            current.append(para)
            current_size += len(para)
            if current_size > 3000:
                chunks.append('\n\n'.join(current))
                current, current_size = [], 0
        if current:
            chunks.append('\n\n'.join(current))
        sections = [{
            'number': f'1.{i+1}',
            'title': f'{chapter_title} - Part {i+1}',
            'content': chunk,
            'order': i
        } for i, chunk in enumerate(chunks)]
    
    return {'title': chapter_title, 'sections': sections}

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
            term = re.sub(r'[*_#]', '', match.group(1)).strip()
            definition = re.sub(r'[*_#]', '', match.group(2)).strip()
            if 3 < len(term) < 60 and 15 < len(definition) < 300:
                concepts.append({
                    'term': term,
                    'definition': definition,
                    'context': match.group(0)[:400],
                    'importance': 3
                })
    seen, unique = set(), []
    for c in concepts:
        key = c['term'].lower()
        if key not in seen:
            seen.add(key)
            unique.append(c)
    return unique[:15]

# ─────────────────────────────────────────────
# EXTRACT FORMULAS (for Simulator & Solver)
# ─────────────────────────────────────────────
def extract_formulas(content):
    formulas = []
    pattern = r'([A-Za-z](?:_[a-zA-Z0-9]+)?)\s*=\s*([^.;\n,]{3,80}?)(?=[.;\n,]|\s+(?:where|is|and))'
    for match in re.finditer(pattern, content):
        lhs = match.group(1).strip().replace('$', '')
        rhs = match.group(2).strip().replace('$', '')
        plain = f"{lhs} = {rhs}"
        if len(plain) < 100 and not any(x in rhs for x in ['Figure', 'Table', 'Chapter', 'Section']):
            vars_desc = [{'symbol': var, 'name': var, 'unit': ''} for var in re.findall(r'[A-Za-z]', lhs + rhs)]
            formulas.append({
                'latex': plain,
                'plain': plain,
                'variables': vars_desc[:5],
                'description': "Derived formula from textbook section"
            })
    seen, unique = set(), []
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
    pattern = r'Example\s+(\d+\.\d+)(.*?)(?=Example\s+\d+\.\d+|\n\n\d+\.\d+\s+[A-Z]|$)'
    for match in re.finditer(pattern, content, re.DOTALL):
        ex_num = match.group(1)
        ex_body = match.group(2).strip()
        if len(ex_body) < 50:
            continue
        soln_split = re.split(r'\b(?:Answer|Solution|Ans)\s*[:.]?\s*', ex_body, maxsplit=1, flags=re.IGNORECASE)
        problem = soln_split[0].strip()[:800]
        solution = soln_split[1].strip()[:1500] if len(soln_split) == 2 else ex_body[400:1500]
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
        examples.append({'number': ex_num, 'problem': problem, 'steps': steps, 'final_answer': final})
    return examples[:8]

# ─────────────────────────────────────────────
# GENERATE UNIQUE QUIZ QUESTIONS (150+ Questions)
# ─────────────────────────────────────────────
def generate_quiz_questions(section_title, content, concepts, formulas, examples):
    questions = []
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', content) if 40 < len(s.strip()) < 300]
    
    # 1. Concept definition MCQs
    for concept in concepts[:10]:
        correct_opt = concept['definition'][:100]
        wrong_options = [c['definition'][:100] for c in concepts if c['term'] != concept['term'] and c['definition'][:100] != correct_opt][:3]
        fallback_distractors = [
            "A scalar constant independent of system frame",
            "An intrinsic kinematic vector quantity",
            "A relativistic invariant physical parameter"
        ]
        for fb in fallback_distractors:
            if len(wrong_options) < 3 and fb not in wrong_options:
                wrong_options.append(fb)
        options = [correct_opt] + wrong_options[:3]
        random.shuffle(options)
        questions.append({
            'text': f"What is {concept['term']}?",
            'type': 'mcq',
            'options': options,
            'correct': correct_opt,
            'explanation': f"NCERT textbook definition: {concept['context'][:300]}",
            'difficulty': 'easy',
            'source': concept['context'][:200]
        })
        
    # 2. Fill-in-the-blank questions
    for sent in sentences[:15]:
        words = sent.split()
        candidates = [w for w in words if len(w) > 5 and w.isalpha()]
        if not candidates:
            continue
        blank_word = random.choice(candidates)
        blanked = sent.replace(blank_word, "______", 1)
        distractors = list(set([w for w in content.split() if len(w) > 5 and w.isalpha()]) - {blank_word})[:3]
        while len(distractors) < 3:
            distractors.append(blank_word[::-1])
        options = [blank_word] + distractors[:3]
        random.shuffle(options)
        questions.append({
            'text': f"Fill in the blank: {blanked}",
            'type': 'fill_blank',
            'options': options,
            'correct': blank_word,
            'explanation': f"Full textbook citation: {sent}",
            'difficulty': 'medium',
            'source': sent
        })

    # 3. Formula questions
    for formula in formulas[:5]:
        plain = formula['plain']
        wrong = [plain.replace('=', '≠'), f"{plain} / 2", f"{plain} + C"]
        options = [plain] + wrong
        random.shuffle(options)
        questions.append({
            'text': f"Which equation is valid for {section_title}?",
            'type': 'mcq',
            'options': options,
            'correct': plain,
            'explanation': f"Derived directly in {section_title}.",
            'difficulty': 'medium',
            'source': plain
        })

    # 4. True / False statements
    for sent in sentences[15:25]:
        questions.append({
            'text': f"True or False: {sent}",
            'type': 'true_false',
            'options': ['True', 'False'],
            'correct': 'True',
            'explanation': f"This statement is excerpted from {section_title}.",
            'difficulty': 'easy',
            'source': sent
        })

    return questions

# ─────────────────────────────────────────────
# GENERATE AUDIO SCRIPT (Conversational Tone)
# ─────────────────────────────────────────────
def generate_audio_script(section_title, content):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', content) if 20 < len(s.strip()) < 400]
    script = f"Hello and welcome back to NeuraGlow. Today we're exploring {section_title}. Let me break this concept down step by step.\n\n"
    for i, sent in enumerate(sentences[:35]):
        if i % 4 == 0:
            script += f"\n\nHere's an important insight: {sent} "
        else:
            script += f"{sent} "
    script += f"\n\nThat wraps up our audio exploration of {section_title}. Review the formulas and practice questions next!"
    return script, int(len(script.split()) * 0.4)

# ─────────────────────────────────────────────
# GENERATE SLIDES (16:9 Presentation Engine)
# ─────────────────────────────────────────────
def generate_slides(section_title, content, concepts, formulas):
    slides = [
        {'number': 1, 'title': section_title, 'bullets': [f"Lecture Series: {section_title}", "Core Principles & Mathematical Models"], 'type': 'title'},
    ]
    for i in range(0, len(concepts), 3):
        batch = concepts[i:i+3]
        slides.append({
            'number': len(slides) + 1,
            'title': 'Key Definitions',
            'bullets': [f"**{c['term']}**: {c['definition'][:120]}" for c in batch],
            'type': 'content'
        })
    if formulas:
        slides.append({
            'number': len(slides) + 1,
            'title': 'Mathematical Formulas',
            'bullets': [f['plain'] for f in formulas[:6]],
            'type': 'formula'
        })
    return slides

# ─────────────────────────────────────────────
# GENERATE SOCRATIC Q&A (Depth Levels 1 - 5)
# ─────────────────────────────────────────────
def generate_socratic_qa(section_title, content, concepts):
    qa_list = []
    for d in range(1, 6):
        c = concepts[d-1] if d-1 < len(concepts) else {'term': section_title, 'definition': content[:150]}
        qa_list.append({
            'depth': d,
            'question': f"[Depth Level {d}] What is the core physical significance of {c['term']} in {section_title}?",
            'answer': f"Level {d} Insight: {c['definition']}",
            'hint': "Relate this directly to real-world physical systems."
        })
    return qa_list

# ─────────────────────────────────────────────
# INGEST PDF INTO SUPABASE WITH FAST BATCHING
# ─────────────────────────────────────────────
def ingest_pdf(filepath, subject, source):
    filename = os.path.basename(filepath)
    raw_name = filename.replace('.pdf', '').replace('Physics_', '').replace('_', ' ')
    clean_title = re.sub(r'([a-z])([A-Z])', r'\1 \2', raw_name).strip().title()

    # Check if chapter already exists before doing heavy PDF extraction
    uri = get_db_uri()
    conn = psycopg2.connect(uri)
    cur = conn.cursor()
    cur.execute("SELECT id, chapter_title FROM chapters WHERE chapter_title ILIKE %s", (f"%{clean_title}%",))
    existing = cur.fetchone()
    if existing:
        print(f"⏭️ Chapter '{existing[1]}' already ingested in Supabase (ID: {existing[0]}). Skipping extraction.")
        cur.close()
        conn.close()
        return
    cur.close()
    conn.close()

    print(f"\n{'='*70}\n🚀 Processing: {filename}\n{'='*70}")
    # Extract and clean text
    text = extract_clean_text(filepath)
    chapter_data = parse_chapter_structure(text, filename)
    
    # Connect fresh to insert data
    conn = psycopg2.connect(uri)
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO chapters (subject, chapter_title, source, total_sections) VALUES (%s, %s, %s, %s) RETURNING id",
        (subject, chapter_data['title'], source, len(chapter_data['sections']))
    )
    chapter_id = cur.fetchone()[0]
    print(f"✅ Created Chapter: '{chapter_data['title']}' [ID: {chapter_id}] with {len(chapter_data['sections'])} sections")

    total_questions = 0

    for section in chapter_data['sections']:
        content_md = section['content']
        summary = ' '.join(section['content'].split()[:40]) + '...'
        
        cur.execute("""
            INSERT INTO chapter_sections (chapter_id, section_number, section_title, section_order, content_markdown, summary, word_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
        """, (chapter_id, section['number'], section['title'], section['order'], content_md, summary, len(content_md.split())))
        section_id = cur.fetchone()[0]
        
        # Concepts
        concepts = extract_concepts(section['content'])
        if concepts:
            concept_rows = [(section_id, c['term'], c['definition'], c['context'], c['importance']) for c in concepts]
            execute_batch(cur, "INSERT INTO concepts (section_id, term, definition, context, importance) VALUES (%s, %s, %s, %s, %s)", concept_rows)
        
        # Formulas
        formulas = extract_formulas(section['content'])
        if formulas:
            formula_rows = [(section_id, f['latex'], f['plain'], json.dumps(f['variables']), f['description']) for f in formulas]
            execute_batch(cur, "INSERT INTO formulas (section_id, formula_latex, formula_plain, variables, description) VALUES (%s, %s, %s, %s::jsonb, %s)", formula_rows)
        
        # Examples
        examples = extract_examples(section['content'])
        if examples:
            example_rows = [(section_id, ex['number'], ex['problem'], json.dumps(ex['steps']), ex['final_answer']) for ex in examples]
            execute_batch(cur, "INSERT INTO examples (section_id, example_number, problem_statement, solution_steps, final_answer) VALUES (%s, %s, %s, %s::jsonb, %s)", example_rows)
        
        # Quiz Questions
        questions = generate_quiz_questions(section['title'], section['content'], concepts, formulas, examples)
        total_questions += len(questions)
        if questions:
            q_rows = [(chapter_id, section_id, q['text'], q['type'], json.dumps(q['options']), q['correct'], q['explanation'], q['difficulty'], q['source']) for q in questions]
            execute_batch(cur, """
                INSERT INTO quiz_questions (chapter_id, section_id, question_text, question_type, options, correct_answer, explanation, difficulty, source_text)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s)
            """, q_rows)
        
        # Audio Script
        script, duration = generate_audio_script(section['title'], section['content'])
        cur.execute("INSERT INTO audio_scripts (section_id, script_text, estimated_duration_sec) VALUES (%s, %s, %s)", (section_id, script, duration))
        
        # Slides
        slides = generate_slides(section['title'], section['content'], concepts, formulas)
        if slides:
            slide_rows = [(section_id, s['number'], s['title'], json.dumps(s['bullets']), s['type']) for s in slides]
            execute_batch(cur, "INSERT INTO slides (section_id, slide_number, title, bullet_points, slide_type) VALUES (%s, %s, %s, %s::jsonb, %s)", slide_rows)
        
        # Socratic QA
        qa_list = generate_socratic_qa(section['title'], section['content'], concepts)
        if qa_list:
            qa_rows = [(section_id, qa['depth'], qa['question'], qa['answer'], qa['hint']) for qa in qa_list]
            execute_batch(cur, "INSERT INTO socratic_qa (section_id, depth_level, question, answer, follow_up_hint) VALUES (%s, %s, %s, %s, %s)", qa_rows)
        
        print(f"   ├─ Section {section['number']} ({section['title'][:32]}): {len(concepts)} concepts | {len(formulas)} formulas | {len(questions)} questions")
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"🎉 Finished Chapter '{chapter_data['title']}': {total_questions} questions generated!")

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_folder = os.path.join(script_dir, "pdf_library")
    if not os.path.exists(pdf_folder):
        print(f"❌ '{pdf_folder}' folder not found!")
        return

    files = [f for f in sorted(os.listdir(pdf_folder)) if f.lower().endswith('.pdf')]
    print(f"📚 Ingesting {len(files)} PDFs with PyMuPDF4LLM + Math Cleaner:")
    for f in files:
        print(f"   • {f}")
    
    for filename in files:
        filepath = os.path.join(pdf_folder, filename)
        ingest_pdf(filepath, 'Physics', 'NCERT Class 11')

    print("\n🌟 ALL CHAPTERS INGESTED SUCCESSFULLY WITH CLEAN MATH & STRUCTURED TABLES!")

if __name__ == "__main__":
    main()
