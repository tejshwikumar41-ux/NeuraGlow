import { NextResponse } from 'next/server';
import { callUniversalLLM } from '@/lib/ai/universalAI';

export async function POST(req) {
  try {
    const { topic, prompt, studentExplanation, keyPoints, gradingRubric } = await req.json();

    if (!studentExplanation || !topic) {
      return NextResponse.json({ error: 'studentExplanation and topic are required' }, { status: 400 });
    }

    const systemPrompt = `You are an Expert Evaluator grading a student's open-ended submission using the Feynman Technique.
Your goal is to evaluate if the student truly understands the concept or used forbidden jargon/hand-waving.

TOPIC: "${topic}"
CHALLENGE PROMPT: "${prompt}"
MANDATORY POINTS: ${JSON.stringify(keyPoints || [])}
RUBRIC: "${gradingRubric || 'Grade based on clarity, intuitive analogies, absence of jargon, and conceptual correctness.'}"

Return JSON format:
{
  "scoreOutOf10": 8,
  "mastery_verdict": "Mastery Achieved | Partially Clear | Jargon Heavy / Needs Revision",
  "points_covered": ["List of key points student explained well"],
  "points_missed": ["List of critical points student omitted"],
  "constructive_critique": "2-3 sentences of positive and constructive feedback on their explanation.",
  "improved_feynman_sentence": "How a master teacher would express the most challenging part simply."
}`;

    const userPrompt = `STUDENT EXPLANATION SUBMISSION:\n"${studentExplanation}"\n\nEvaluate and grade. Output raw JSON only.`;

    const gradeResult = await callUniversalLLM({
      prompt: userPrompt,
      systemPrompt,
      json: true,
      temperature: 0.2,
      max_tokens: 1000,
    });

    return NextResponse.json(gradeResult);
  } catch (err) {
    console.error('Error in /api/engine/feynman/grade:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
