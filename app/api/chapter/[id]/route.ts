import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const chapterId = resolvedParams.id;

    if (!chapterId) {
      return NextResponse.json({ error: 'Chapter ID required' }, { status: 400 });
    }

    const [chapter, sections, questions] = await Promise.all([
      supabase.from('chapters').select('*').eq('id', chapterId).maybeSingle(),
      supabase.from('chapter_sections').select('*').eq('chapter_id', chapterId).order('section_order'),
      supabase.from('quiz_questions').select('*').eq('chapter_id', chapterId)
    ]);

    if (!sections.data || sections.data.length === 0) {
      return NextResponse.json({ error: 'Chapter not found or has no sections' }, { status: 404 });
    }

    // For each section, fetch all its related data
    const sectionsWithDetails = await Promise.all(
      sections.data.map(async (section) => {
        const [concepts, formulas, examples, audio, slides, socratic] = await Promise.all([
          supabase.from('concepts').select('*').eq('section_id', section.id),
          supabase.from('formulas').select('*').eq('section_id', section.id),
          supabase.from('examples').select('*').eq('section_id', section.id),
          supabase.from('audio_scripts').select('*').eq('section_id', section.id).maybeSingle(),
          supabase.from('slides').select('*').eq('section_id', section.id).order('slide_number'),
          supabase.from('socratic_qa').select('*').eq('section_id', section.id).order('depth_level')
        ]);

        return {
          ...section,
          concepts: concepts.data || [],
          formulas: formulas.data || [],
          examples: examples.data || [],
          audio_script: audio.data,
          slides: slides.data || [],
          socratic_qa: socratic.data || []
        };
      })
    );

    return NextResponse.json({
      chapter: chapter.data,
      sections: sectionsWithDetails,
      all_questions: questions.data || []
    });
  } catch (err: any) {
    console.error('Error fetching chapter details:', err);
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 });
  }
}
