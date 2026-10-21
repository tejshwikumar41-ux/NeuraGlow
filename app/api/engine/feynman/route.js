import { NextResponse } from 'next/server';
import { callUniversalLLM } from '@/lib/ai/universalAI';
import { getFeynmanQuizPrompt } from '@/lib/prompts/universalPrompts';

export async function POST(req) {
  try {
    const { topic, coveredSubtopics } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = getFeynmanQuizPrompt({
      mainTopic: topic,
      coveredSubtopics: Array.isArray(coveredSubtopics) ? coveredSubtopics : [],
    });

    const quizData = await callUniversalLLM({
      prompt: userPrompt,
      systemPrompt,
      json: true,
      temperature: 0.3,
      max_tokens: 3000,
    });

    return NextResponse.json(quizData);
  } catch (err) {
    console.error('Error in /api/engine/feynman:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
