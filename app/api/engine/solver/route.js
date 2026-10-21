import { NextResponse } from 'next/server';
import { callUniversalLLM } from '@/lib/ai/universalAI';
import { getSolverPrompt } from '@/lib/prompts/universalPrompts';

export async function POST(req) {
  try {
    const { topic, difficultyLevel } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = getSolverPrompt({
      mainTopic: topic,
      difficultyLevel: difficultyLevel || 'Intermediate',
    });

    const solverData = await callUniversalLLM({
      prompt: userPrompt,
      systemPrompt,
      json: true,
      temperature: 0.2,
      max_tokens: 3000,
    });

    return NextResponse.json(solverData);
  } catch (err) {
    console.error('Error in /api/engine/solver:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
