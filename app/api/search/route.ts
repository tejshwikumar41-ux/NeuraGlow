import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { searchQuery } = await req.json();

    if (!searchQuery) {
      return NextResponse.json({ found: false, message: "Search query required" }, { status: 400 });
    }

    // Search Supabase Full-Text Index ($0.00 Cost)
    const { data: chapters, error } = await supabase
      .from("textbook_chapters")
      .select("subject, topic, subtopic, source, difficulty, content_markdown, formulas")
      .textSearch("search_vector", searchQuery, {
        config: "english",
        type: "websearch",
      });

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ found: false, message: "Search failed" }, { status: 500 });
    }

    if (!chapters || chapters.length === 0) {
      return NextResponse.json({
        found: false,
        message: `No textbook module found for "${searchQuery}". Try searching: Gravitation, Laws of Motion, or Work Energy.`,
      });
    }

    // Return ground-truth textbook data
    return NextResponse.json({
      found: true,
      topic: chapters[0].topic,
      subject: chapters[0].subject,
      source: chapters[0].source,
      difficulty: chapters[0].difficulty,
      content: chapters[0].content_markdown,
      formulas: chapters[0].formulas,
    });
  } catch (err) {
    return NextResponse.json({ found: false, message: "Internal server error" }, { status: 500 });
  }
}
