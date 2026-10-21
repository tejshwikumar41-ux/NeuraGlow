import { NextResponse } from 'next/server';
import { callGemini, callOpenAI, getGroqClient, safeJsonParse } from '@/lib/ai/providers';

export async function POST(req) {
  let requestedTopic = 'Topic';
  try {
    const { topic = 'Topic', category = 'GENERAL', subtopics = [], difficulty = 'beginner' } = await req.json();
    requestedTopic = topic;

    if (!topic || topic.trim() === '') {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert textbook author and university lecturer in ${category}.
Your task is to create 5-6 detailed, educational presentation slides strictly on the topic: '${topic}'.

CRITICAL QUALITY RULES:
1. NEVER output meta-descriptions or placeholders like 'Core concept explained simply', 'Step details', or 'Overview of topic'.
2. EVERY bullet point must contain concrete, specific facts, real terms, formulas, or code that directly define '${topic}'.
3. ZERO DOMAIN LEAKAGE: All content, equations, and vocabulary MUST belong strictly to '${topic}' (${category}). Never borrow terms from unrelated fields.
4. For SCIENCE/PHYSICS/CHEMISTRY: Include exact physical equations, laws, units, principles, and real-world mechanisms.
5. For PROGRAMMING: Include actual, working code blocks with syntax explanation.
6. For HISTORY/BUSINESS: Include exact dates, key figures, economic models, and real-world case studies.

Return STRICT JSON:
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "[Topic-Specific Core Concept Name]",
      "subtitle": "[Technical Sub-heading for ${topic}]",
      "bullets": [
        "[Specific mechanism, law, or formula defining ${topic}]",
        "[Technical details detailing inputs, forces, components, or processes]",
        "[Concrete real-world significance or mathematical relationship]"
      ],
      "detailedExplanation": "A 3-sentence deep paragraph fully explaining the mechanism shown on this slide regarding ${topic}.",
      "codeSnippet": "Working code snippet if programming topic, else null",
      "visualPrompt": "Educational diagram or technical visualization of [specific concept on this slide for ${topic}], clean white background, high resolution textbook illustration",
      "speakerNotes": "Exact verbal script a professor would use to present this slide to university students",
      "miniQuiz": {
        "question": "Domain-specific check question directly testing a fact on this slide",
        "options": ["Correct factual answer", "Plausible wrong answer 1", "Plausible wrong answer 2", "Plausible wrong answer 3"],
        "correct": 0
      }
    }
  ]
}`;

    const userPrompt = `Generate 5-6 fact-dense presentation slides for: "${topic}" (Category: ${category}, Difficulty: ${difficulty})`;

    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini slides failed:', err.message);
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
        console.warn('Groq slides failed:', err.message);
      }
    }

    if (parsedResult && Array.isArray(parsedResult.slides) && parsedResult.slides.length > 0) {
      return NextResponse.json({ success: true, data: parsedResult });
    }

    // Never return hardcoded or fake mixed content fallbacks
    return NextResponse.json(
      { success: false, error: `Generation failed for ${topic}. Please retry.` },
      { status: 500 }
    );
  } catch (error) {
    console.error('Slides API Error:', error);
    return NextResponse.json(
      { success: false, error: `Generation failed for ${requestedTopic}: ${error.message}` },
      { status: 500 }
    );
  }
}
