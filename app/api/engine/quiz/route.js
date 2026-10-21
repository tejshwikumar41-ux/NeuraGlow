import { NextResponse } from 'next/server';
import { callGemini, callOpenAI, getGroqClient, safeJsonParse } from '@/lib/ai/providers';

export async function POST(req) {
  let requestedTopic = 'Topic';
  try {
    const { topic = 'Topic', category = 'GENERAL', difficulty = 'beginner' } = await req.json();
    requestedTopic = topic;

    if (!topic || topic.trim() === '') {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    const systemPrompt = `You are a university assessment writer in ${category}. Create 6 challenging, factual practice questions strictly for: '${topic}'.

STRICT DOMAIN ISOLATION & ACCURACY:
- All questions, choices, explanations, and hints MUST test facts, equations, or concepts directly from '${topic}'.
- ZERO cross-domain contamination: never include computer science terms for physics/biology, and never include biology terms for physics/programming.
- Options must test real conceptual depth, not trivia or generic fillers.

Return STRICT JSON:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Direct factual question testing a core principle or formula of ${topic}",
      "options": [
        "Correct domain-specific answer for ${topic}",
        "Plausible technical distractor 1",
        "Plausible technical distractor 2",
        "Plausible technical distractor 3"
      ],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why option 0 is correct using exact technical laws, equations, or rules of ${topic}",
      "hint": "Domain-specific clue guiding thinking toward the correct answer"
    }
  ]
}`;

    const userPrompt = `Create 6 factual practice questions for: "${topic}" (Category: ${category}, Difficulty: ${difficulty})`;

    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini quiz failed:', err.message);
      }
    }

    if (!parsedResult && process.env.GROQ_API_KEY) {
      try {
        const groq = getGroqClient();
        const comp = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: 'llama-3.1-70b-versatile',
          temperature: 0.2,
          response_format: { type: 'json_object' },
        });
        if (comp?.choices?.[0]?.message?.content) {
          parsedResult = safeJsonParse(comp.choices[0].message.content);
        }
      } catch (err) {
        console.warn('Groq quiz failed:', err.message);
      }
    }

    if (parsedResult && Array.isArray(parsedResult.questions) && parsedResult.questions.length > 0) {
      return NextResponse.json({ success: true, data: parsedResult });
    }

    // Never return hardcoded or fake mixed content fallbacks
    return NextResponse.json(
      { success: false, error: `Generation failed for ${topic}. Please retry.` },
      { status: 500 }
    );
  } catch (error) {
    console.error('Quiz API Error:', error);
    return NextResponse.json(
      { success: false, error: `Generation failed for ${requestedTopic}: ${error.message}` },
      { status: 500 }
    );
  }
}
