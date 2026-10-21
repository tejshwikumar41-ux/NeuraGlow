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

    const systemPrompt = `You are an expert tutor breaking down '${topic}' into 5 progressive, detailed learning steps.
Category: ${category}

CRITICAL RULES:
1. NO generic placeholder text like 'Step details' or 'Overview of topic'.
2. Each step title must be a specific phase or sub-mechanism name strictly defining '${topic}'.
3. ZERO DOMAIN LEAKAGE: All terminology, formulas, and examples must belong solely to '${topic}' (${category}).
4. Explanations must be 3-4 sentences long with exact technical terms and clear analogies.
5. Common Pitfalls MUST be domain-accurate misconceptions directly related to '${topic}'.

Return STRICT JSON:
{
  "steps": [
    {
      "step": 1,
      "title": "[Phase 1: Specific Foundational Phase Name for ${topic}]",
      "explanation": "3-4 detailed sentences explaining the mechanism clearly with exact technical terms for ${topic}.",
      "simpleExplanation": "Clear, accessible breakdown of this phase for ${topic}.",
      "analogy": "A relatable real-world comparison that precisely illuminates this concept",
      "realExample": "Specific real-world formula, calculation, reaction, or code line defining this step",
      "commonMistake": "Domain-specific misconception directly relevant to this phase of ${topic}",
      "memoryTrick": "A punchy mnemonic or hook to remember this phase"
    }
  ]
}`;

    const userPrompt = `Generate 5 domain-accurate steps for: "${topic}" (Category: ${category}, Difficulty: ${difficulty})`;

    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini steps failed:', err.message);
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
        console.warn('Groq steps failed:', err.message);
      }
    }

    if (parsedResult && Array.isArray(parsedResult.steps) && parsedResult.steps.length > 0) {
      return NextResponse.json({ success: true, data: parsedResult });
    }

    // Never return hardcoded or fake mixed content fallbacks
    return NextResponse.json(
      { success: false, error: `Generation failed for ${topic}. Please retry.` },
      { status: 500 }
    );
  } catch (error) {
    console.error('Steps API Error:', error);
    return NextResponse.json(
      { success: false, error: `Generation failed for ${requestedTopic}: ${error.message}` },
      { status: 500 }
    );
  }
}
