import os
import re
import json
import requests
import pdfplumber
import psycopg2

# ==============================================================================
# PASTE YOUR SUPABASE URI LINK BETWEEN THE QUOTES BELOW ⬇️
# ==============================================================================
SUPABASE_DB_URI = "postgresql://postgres.xxxx:NeuraGlow07@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"


def connect_to_db():
    """Connects your laptop to your Supabase PostgreSQL Database"""
    try:
        conn = psycopg2.connect(SUPABASE_DB_URI)
        print("⚡ Connected to Supabase Database successfully!")
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to DB. Check your password/URI. Error: {e}")
        return None


def parse_and_upload_pdf(pdf_filename, subject, topic, source_name, difficulty="Intermediate"):
    """Reads a PDF textbook on your computer and uploads it to Supabase"""
    if not os.path.exists(pdf_filename):
        print(f"❌ File '{pdf_filename}' not found in folder! Check filename.")
        return

    print(f"\n📖 Processing PDF: '{pdf_filename}'...")
    
    full_markdown = ""
    formulas = []

    with pdfplumber.open(pdf_filename) as pdf:
        print(f"📄 Found {len(pdf.pages)} pages in PDF.")

        for page in pdf.pages:
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

    conn = connect_to_db()
    if not conn:
        return

    cursor = conn.cursor()
    query = """
    INSERT INTO textbook_chapters (subject, topic, subtopic, source, difficulty, content_markdown, formulas)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (subject, topic, "Complete Chapter", source_name, difficulty, full_markdown, json.dumps(formulas)))
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"✅ SUCCESS! '{topic}' textbook chapter uploaded to Supabase!")


if __name__ == "__main__":
    # Change "keph103.pdf" to the name of the PDF file you downloaded!
    parse_and_upload_pdf(
        pdf_filename="keph103.pdf", 
        subject="Physics", 
        topic="Kinematics", 
        source_name="NCERT Class 11 Physics", 
        difficulty="Intermediate"
    )
