import os
import re
import sys
import json
import pdfplumber
import psycopg2

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')


def get_db_uri():
    if os.getenv("SUPABASE_DB_URI"):
        return os.getenv("SUPABASE_DB_URI")
    env_path = os.path.join(os.path.dirname(__file__), ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("SUPABASE_DB_URI="):
                    return line.strip().split("=", 1)[1]
    return "postgresql://postgres:Pflg782012006@db.iulnjxewpbwlazspvkmb.supabase.co:5432/postgres"


SUPABASE_DB_URI = get_db_uri()


def connect_to_db():
    try:
        conn = psycopg2.connect(SUPABASE_DB_URI)
        print("⚡ Connected to Supabase Database successfully!")
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to DB: {e}")
        return None


def clean_topic_name(filename):
    name = os.path.splitext(filename)[0]
    if name.startswith("Physics_"):
        name = name[len("Physics_"):]
    # Insert space before capital letters if CamelCase
    formatted = re.sub(r'([a-z])([A-Z])', r'\1 \2', name)
    return formatted


def parse_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        return None, []

    full_markdown = ""
    formulas = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            for page in pdf.pages:
                try:
                    text = page.extract_text()
                    if not text:
                        continue
                    for line in text.split("\n"):
                        line_clean = line.strip()
                        if not line_clean:
                            continue
                        if re.match(r'^\d+\.\d+\s+[A-Z]', line_clean) or (len(line_clean) < 45 and line_clean.isupper()):
                            full_markdown += f"\n\n## {line_clean.title()}\n\n"
                        elif re.search(r'[a-zA-Z]\s*=\s*[a-zA-Z0-9\+\-\*/\^]', line_clean):
                            full_markdown += f"\n\n $${line_clean}$$ \n\n"
                            formulas.append(line_clean)
                        else:
                            full_markdown += f"{line_clean} "
                except Exception:
                    continue
            return full_markdown, formulas, total_pages
    except Exception as e:
        print(f"  ⚠️ Error opening {pdf_path}: {e}")
        return None, [], 0


def ingest_all_pdfs(folder="pdf_library"):
    print(f"⚡ Beginning bulk ingestion from '{folder}'...")
    if not os.path.exists(folder):
        print(f"❌ Folder '{folder}' does not exist!")
        return

    conn = connect_to_db()
    if not conn:
        print("❌ Cannot proceed without database connection.")
        return

    cursor = conn.cursor()

    # Ensure table exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS textbook_chapters (
        id BIGSERIAL PRIMARY KEY,
        subject TEXT NOT NULL,
        topic TEXT NOT NULL,
        subtopic TEXT,
        source TEXT,
        difficulty TEXT,
        content_markdown TEXT,
        formulas JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    """)
    conn.commit()

    pdf_files = [f for f in sorted(os.listdir(folder)) if f.lower().endswith('.pdf')]
    if not pdf_files:
        print(f"⚠️ No PDF files found in '{folder}'.")
        cursor.close()
        conn.close()
        return

    print(f"📚 Found {len(pdf_files)} PDFs in '{folder}' to ingest.\n")
    uploaded = 0

    for idx, filename in enumerate(pdf_files, 1):
        pdf_path = os.path.join(folder, filename)
        topic = clean_topic_name(filename)
        source_name = f"NCERT Class 11 Physics - {filename}"
        subject = "Physics"
        difficulty = "Intermediate"

        print(f"[{idx}/{len(pdf_files)}] 📖 Processing: '{filename}' -> '{topic}'...")
        res = parse_pdf(pdf_path)
        if not res or not res[0]:
            print(f"   ❌ Failed to extract text from {filename}\n")
            continue

        markdown, formulas, pages = res
        print(f"   📄 Extracted {pages} pages, {len(formulas)} formulas, {len(markdown):,} chars.")

        cursor.execute("DELETE FROM textbook_chapters WHERE source = %s OR topic = %s;", (source_name, topic))

        query = """
        INSERT INTO textbook_chapters (subject, topic, subtopic, source, difficulty, content_markdown, formulas)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        cursor.execute(query, (
            subject,
            topic,
            "Complete Chapter",
            source_name,
            difficulty,
            markdown,
            json.dumps(formulas)
        ))
        conn.commit()
        uploaded += 1
        print(f"   ✅ Successfully stored '{topic}' in Supabase!\n")

    cursor.close()
    conn.close()
    print("==================================================")
    print(f"🎉 Bulk Ingestion Complete! {uploaded}/{len(pdf_files)} PDFs stored in Supabase!")
    print("==================================================")


if __name__ == "__main__":
    ingest_all_pdfs()
