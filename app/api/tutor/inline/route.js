import { NextResponse } from 'next/server';
import { callUniversalLLM } from '@/lib/ai/universalAI';
import { getInlineSocraticPrompt } from '@/lib/prompts/universalPrompts';

export async function POST(req) {
  try {
    const { mainTopic, chapterSectionName, surroundingParagraph, highlightedText, userQuestion } = await req.json();

    if (!highlightedText) {
      return NextResponse.json({ error: 'highlightedText is required' }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = getInlineSocraticPrompt({
      mainTopic: mainTopic || 'Educational Topic',
      chapterSectionName: chapterSectionName || 'Current Section',
      surroundingParagraph: surroundingParagraph || '',
      highlightedText,
      userQuestion: userQuestion || 'Explain simpler',
    });

    const result = await callUniversalLLM({
      prompt: userPrompt,
      systemPrompt,
      json: true,
      temperature: 0.3,
      max_tokens: 600,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error in /api/tutor/inline:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
