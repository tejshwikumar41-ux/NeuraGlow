import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function searchChapters(query: string) {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    const { data: allChapters } = await supabase
      .from('chapters')
      .select('*')
      .order('id', { ascending: true })
      .limit(20);
    return allChapters || [];
  }

  // 1. Direct match on chapter title
  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .ilike('chapter_title', `%${cleanQuery}%`)
    .limit(10);

  if (chapters && chapters.length > 0) {
    return chapters;
  }

  // 2. Search in sections content & title
  const { data: sections } = await supabase
    .from('chapter_sections')
    .select('chapter_id, section_title')
    .or(`section_title.ilike.%${cleanQuery}%,content_markdown.ilike.%${cleanQuery}%`)
    .limit(15);

  if (sections && sections.length > 0) {
    const chapterIds = Array.from(new Set(sections.map((s) => s.chapter_id)));
    const { data: foundChapters } = await supabase
      .from('chapters')
      .select('*')
      .in('id', chapterIds);
    if (foundChapters && foundChapters.length > 0) {
      return foundChapters;
    }
  }

  return [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const chapters = await searchChapters(query);
    return NextResponse.json({ chapters: chapters || [] });
  } catch (err: any) {
    console.error('Search GET Error:', err);
    return NextResponse.json({ error: 'Search failed', chapters: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body.searchQuery || body.q || '';
    const chapters = await searchChapters(query);

    if (!chapters || chapters.length === 0) {
      const { data: allChapters } = await supabase.from('chapters').select('chapter_title, subject');
      const availableList = allChapters?.map((c) => c.chapter_title).join(', ') || 'No chapters uploaded yet';
      return NextResponse.json({
        found: false,
        chapters: [],
        message: `No uploaded chapter matches "${query}".`,
        availableTopics: `Available uploaded topics in DB: [${availableList}]`,
      });
    }

    const match = chapters[0];
    return NextResponse.json({
      found: true,
      chapters: chapters,
      id: match.id,
      topic: match.chapter_title,
      subject: match.subject,
      source: match.source,
      total_sections: match.total_sections,
    });
  } catch (err: any) {
    console.error('Search POST Error:', err);
    return NextResponse.json({ found: false, error: 'Search error', chapters: [] }, { status: 500 });
  }
}
