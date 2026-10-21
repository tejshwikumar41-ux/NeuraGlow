import { NextResponse } from 'next/server';
import { callUniversalLLM } from '@/lib/ai/universalAI';
import { getBlueprintPrompt } from '@/lib/prompts/universalPrompts';

export async function POST(req) {
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'Valid topic string is required' }, { status: 400 });
    }

    const { systemPrompt, userPrompt } = getBlueprintPrompt(topic.trim());
    const blueprint = await callUniversalLLM({
      prompt: userPrompt,
      systemPrompt,
      json: true,
      temperature: 0.2,
      max_tokens: 3000,
    });

    return NextResponse.json(blueprint);
  } catch (err) {
    console.error('Error in /api/generate/blueprint:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
