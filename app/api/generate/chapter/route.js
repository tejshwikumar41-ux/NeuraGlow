import { NextResponse } from 'next/server';
import { callUniversalLLM } from '@/lib/ai/universalAI';
import { getChapterPrompt } from '@/lib/prompts/universalPrompts';

export async function POST(req) {
  try {
    const { subtopicTitle, subtopicId, mainTopic, domain, analogyDomain } = await req.json();

    if (!subtopicTitle || !mainTopic) {
      return NextResponse.json({ error: 'subtopicTitle and mainTopic are required' }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = getChapterPrompt({
      subtopicTitle,
      subtopicId: subtopicId || 'subtopic_1',
      mainTopic,
      domain: domain || 'General Academic',
      analogyDomain: analogyDomain || 'Everyday life',
    });

    const chapter = await callUniversalLLM({
      prompt: userPrompt,
      systemPrompt,
      json: true,
      temperature: 0.4,
      max_tokens: 4000,
    });

    return NextResponse.json(chapter);
  } catch (err) {
    console.error('Error in /api/generate/chapter:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
