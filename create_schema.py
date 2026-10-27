import psycopg2
import sys
import os

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

SCHEMA_SQL = """
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS chapter_sections CASCADE;
DROP TABLE IF EXISTS concepts CASCADE;
DROP TABLE IF EXISTS formulas CASCADE;
DROP TABLE IF EXISTS examples CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS audio_scripts CASCADE;
DROP TABLE IF EXISTS slides CASCADE;
DROP TABLE IF EXISTS socratic_qa CASCADE;

CREATE TABLE chapters (
  id BIGSERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  chapter_number INT,
  chapter_title TEXT NOT NULL,
  source TEXT NOT NULL,
  total_sections INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chapter_sections (
  id BIGSERIAL PRIMARY KEY,
  chapter_id BIGINT REFERENCES chapters(id) ON DELETE CASCADE,
  section_number TEXT,
  section_title TEXT NOT NULL,
  section_order INT,
  content_markdown TEXT NOT NULL,
  summary TEXT,
  word_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE concepts (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT REFERENCES chapter_sections(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  context TEXT,
  importance INT DEFAULT 1
);

CREATE TABLE formulas (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT REFERENCES chapter_sections(id) ON DELETE CASCADE,
  formula_latex TEXT NOT NULL,
  formula_plain TEXT NOT NULL,
  variables JSONB,
  description TEXT
);

CREATE TABLE examples (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT REFERENCES chapter_sections(id) ON DELETE CASCADE,
  example_number TEXT,
  problem_statement TEXT NOT NULL,
  solution_steps JSONB,
  final_answer TEXT
);

CREATE TABLE quiz_questions (
  id BIGSERIAL PRIMARY KEY,
  chapter_id BIGINT REFERENCES chapters(id) ON DELETE CASCADE,
  section_id BIGINT REFERENCES chapter_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT,
  source_text TEXT
);

CREATE TABLE audio_scripts (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT REFERENCES chapter_sections(id) ON DELETE CASCADE,
  script_text TEXT NOT NULL,
  estimated_duration_sec INT
);

CREATE TABLE slides (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT REFERENCES chapter_sections(id) ON DELETE CASCADE,
  slide_number INT,
  title TEXT NOT NULL,
  bullet_points JSONB,
  slide_type TEXT
);

CREATE TABLE socratic_qa (
  id BIGSERIAL PRIMARY KEY,
  section_id BIGINT REFERENCES chapter_sections(id) ON DELETE CASCADE,
  depth_level INT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  follow_up_hint TEXT
);

CREATE INDEX IF NOT EXISTS idx_sections_search ON chapter_sections USING GIN(to_tsvector('english', section_title || ' ' || content_markdown));
CREATE INDEX IF NOT EXISTS idx_chapters_title ON chapters(chapter_title);

-- Row-Level Security: Enable Public Read Access for Next.js anon client
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['chapters', 'chapter_sections', 'concepts', 'formulas', 'examples', 'quiz_questions', 'audio_scripts', 'slides', 'socratic_qa'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON %I;', t);
    EXECUTE format('CREATE POLICY "Allow public read access" ON %I FOR SELECT USING (true);', t);
  END LOOP;
END $$;
"""

def create_schema():
    uri = get_db_uri()
    print("🔌 Connecting to Supabase PostgreSQL...")
    conn = psycopg2.connect(uri)
    conn.autocommit = True
    cur = conn.cursor()
    print("⚡ Executing fresh database schema migration...")
    cur.execute(SCHEMA_SQL)
    print("✅ Schema created: chapters, sections, concepts, formulas, examples, quiz_questions, audio_scripts, slides, socratic_qa!")
    cur.close()
    conn.close()

if __name__ == "__main__":
    create_schema()
