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

CHAPTERS = [
    {
        "filename": "keph101.pdf",
        "subject": "Physics",
        "topic": "Units and Measurements",
        "source": "NCERT Class 11 Physics - Chapter 1",
        "difficulty": "Beginner"
    },
    {
        "filename": "keph102.pdf",
        "subject": "Physics",
        "topic": "Motion in a Straight Line",
        "source": "NCERT Class 11 Physics - Chapter 2",
        "difficulty": "Intermediate"
    },
    {
        "filename": "keph103.pdf",
        "subject": "Physics",
        "topic": "Motion in a Plane (Kinematics)",
        "source": "NCERT Class 11 Physics - Chapter 3",
        "difficulty": "Intermediate"
    },
    {
        "filename": "keph104.pdf",
        "subject": "Physics",
        "topic": "Laws of Motion",
        "source": "NCERT Class 11 Physics - Chapter 4",
        "difficulty": "Intermediate"
    },
    {
        "filename": "keph105.pdf",
        "subject": "Physics",
        "topic": "Work, Energy and Power",
        "source": "NCERT Class 11 Physics - Chapter 5",
        "difficulty": "Intermediate"
    },
    {
        "filename": "keph106.pdf",
        "subject": "Physics",
        "topic": "System of Particles and Rotational Motion",
        "source": "NCERT Class 11 Physics - Chapter 6",
        "difficulty": "Advanced"
    },
    {
        "filename": "keph107.pdf",
        "subject": "Physics",
        "topic": "Gravitation",
        "source": "NCERT Class 11 Physics - Chapter 7",
        "difficulty": "Intermediate"
    },
    {
        "filename": "keph1a1.pdf",
        "subject": "Physics",
        "topic": "Appendices & Mathematical Tools",
        "source": "NCERT Class 11 Physics - Appendices",
        "difficulty": "Intermediate"
    },
    {
        "filename": "keph1an.pdf",
        "subject": "Physics",
        "topic": "Answers & Solutions",
        "source": "NCERT Class 11 Physics - Answers",
        "difficulty": "Intermediate"
    },
    {
        "filename": "keph1ps.pdf",
        "subject": "Physics",
        "topic": "Curriculum Overview & Table of Contents",
        "source": "NCERT Class 11 Physics - Prelims",
        "difficulty": "Beginner"
    }
]


def connect_to_db():
    try:
        conn = psycopg2.connect(SUPABASE_DB_URI)
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to DB: {e}")
        return None


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
        return None, []


def upload_all():
    print("⚡ Connecting to Supabase PostgreSQL Database...")
    conn = connect_to_db()
    if not conn:
        print("❌ Could not connect to database. Aborting.")
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

    base_dir = os.path.dirname(os.path.abspath(__file__))
    successful = 0

    print(f"\n🚀 Beginning Ingestion of {len(CHAPTERS)} PDF Chapters into Supabase...\n")

    for idx, chap in enumerate(CHAPTERS, 1):
        filename = chap["filename"]
        pdf_path = os.path.join(base_dir, filename)

        if not os.path.exists(pdf_path):
            print(f"[{idx}/{len(CHAPTERS)}] ⚠️ File '{filename}' not found. Skipping.")
            continue

        print(f"[{idx}/{len(CHAPTERS)}] 📖 Processing '{filename}' -> {chap['topic']}...")
        parsed_result = parse_pdf(pdf_path)
        if not parsed_result or not parsed_result[0]:
            print(f"  ❌ Failed to extract text from '{filename}'.")
            continue

        markdown, formulas, pages = parsed_result
        print(f"  📄 Extracted {pages} pages, {len(formulas)} formulas, {len(markdown):,} chars.")

        # Clean existing record for this topic to avoid duplicates
        cursor.execute("DELETE FROM textbook_chapters WHERE source = %s;", (chap["source"],))

        # Insert new record
        query = """
        INSERT INTO textbook_chapters (subject, topic, subtopic, source, difficulty, content_markdown, formulas)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """
        cursor.execute(query, (
            chap["subject"],
            chap["topic"],
            "Complete Chapter",
            chap["source"],
            chap["difficulty"],
            markdown,
            json.dumps(formulas)
        ))
        conn.commit()
        successful += 1
        print(f"  ✅ Uploaded to Supabase successfully!\n")

    cursor.close()
    conn.close()

    print("==================================================")
    print(f"🎉 ALL DONE! {successful}/{len(CHAPTERS)} chapters stored in Supabase database!")
    print("==================================================")


if __name__ == "__main__":
    upload_all()
