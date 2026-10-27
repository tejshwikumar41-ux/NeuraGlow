import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { searchQuery } = await req.json();

    if (!searchQuery || searchQuery.trim() === "") {
      return NextResponse.json({ found: false, message: "Please enter a search topic." });
    }

    const cleanQuery = searchQuery.trim();
    console.log("🔍 Searching Supabase for:", cleanQuery);

    // 1. TRY EXACT / PARTIAL TOPIC MATCH FIRST (e.g., "Motion", "Laws of Motion", "Kinematics")
    let { data: chapters, error } = await supabase
      .from("textbook_chapters")
      .select("*")
      .or(`topic.ilike.%${cleanQuery}%,subject.ilike.%${cleanQuery}%,content_markdown.ilike.%${cleanQuery}%`)
      .limit(1);

    // 2. IF NO MATCH, FALLBACK TO FULL-TEXT VECTOR SEARCH
    if (!chapters || chapters.length === 0) {
      const { data: vectorChapters, error: vectorError } = await supabase
        .from("textbook_chapters")
        .select("*")
        .textSearch("search_vector", cleanQuery, {
          config: "english",
          type: "websearch",
        })
        .limit(1);

      if (!vectorError && vectorChapters && vectorChapters.length > 0) {
        chapters = vectorChapters;
      }
    }

    // 3. IF STILL NO MATCH: Return available topics so the user knows what IS in the database
    if (!chapters || chapters.length === 0) {
      const { data: allTopics } = await supabase
        .from("textbook_chapters")
        .select("topic, subject");

      const availableList = allTopics?.map((t) => t.topic).join(", ") || "No topics uploaded yet";

      return NextResponse.json({
        found: false,
        message: `No uploaded PDF matches "${cleanQuery}".`,
        availableTopics: `Available uploaded topics in DB: [${availableList}]`,
      });
    }

    const match = chapters[0];
    console.log("✅ FOUND IN SUPABASE:", match.topic);

    // 4. RETURN THE EXACT PDF TEXTBOOK CONTENT
    return NextResponse.json({
      found: true,
      topic: match.topic,
      subject: match.subject,
      source: match.source,
      difficulty: match.difficulty,
      content: match.content_markdown,
      formulas: match.formulas,
    });
  } catch (err: any) {
    console.error("❌ Search Route Error:", err);
    return NextResponse.json({ found: false, message: "Server error searching database." }, { status: 500 });
  }
}
