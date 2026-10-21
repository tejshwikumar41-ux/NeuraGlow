import { NextResponse } from 'next/server';
import { callGemini, callOpenAI, getGroqClient, safeJsonParse } from '@/lib/ai/providers';

export async function POST(req) {
  let requestedTopic = 'Topic';
  try {
    const { topic = 'Topic', category = 'GENERAL' } = await req.json();
    requestedTopic = topic;

    if (!topic || topic.trim() === '') {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    const systemPrompt = `You are ConceptMapper, an expert in ${category} breaking down topics into hierarchical knowledge trees.
Generate a detailed knowledge map strictly for: '${topic}'

IMPORTANT:
- Every node must have a clear, short label (max 5 words)
- Every node must have a detailed explanation (2-3 sentences)
- Every node must have at least one concrete example or formula
- Branches should be logical conceptual sub-domains of '${topic}' (not generic programming terms)
- Include memory hooks for complex concepts

RETURN THIS EXACT JSON (no markdown formatting, no backticks):
{
  "root": {
    "id": "root",
    "label": "${topic}",
    "explanation": "2-sentence overview defining the foundational principles of ${topic}.",
    "memoryHook": "Easy mnemonic or hook to remember what ${topic} is fundamentally about"
  },
  "branches": [
    {
      "id": "b1",
      "label": "[Sub-domain 1 of ${topic}]",
      "explanation": "Detailed explanation of this sub-domain for ${topic}",
      "example": "Real-world equation, case, or phenomenon",
      "memoryHook": "Trick to remember this concept",
      "children": [
        {
          "id": "b1c1",
          "label": "[Specific mechanism within sub-domain]",
          "explanation": "Technical breakdown of this specific mechanism",
          "example": "Concrete example",
          "memoryHook": "Trick to remember"
        }
      ]
    }
  ],
  "connections": [
    { "from": "b1", "to": "b2", "label": "Relationship between components" }
  ],
  "keyTerms": [
    { "term": "[Key Term 1 for ${topic}]", "definition": "Clear scientific/technical definition", "example": "Real application" }
  ]
}`;

    const userPrompt = `Generate a detailed knowledge map for topic: "${topic}" (Category: ${category})`;

    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini knowledge failed:', err.message);
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
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });
        if (comp?.choices?.[0]?.message?.content) {
          parsedResult = safeJsonParse(comp.choices[0].message.content);
        }
      } catch (err) {
        console.warn('Groq knowledge failed:', err.message);
      }
    }

    if (parsedResult && parsedResult.root && Array.isArray(parsedResult.branches) && parsedResult.branches.length > 0) {
      return NextResponse.json({ success: true, data: parsedResult });
    }

    return NextResponse.json(
      { success: false, error: `Generation failed for ${topic}. Please retry.` },
      { status: 500 }
    );
  } catch (error) {
    console.error('Knowledge API Error:', error);
    return NextResponse.json(
      { success: false, error: `Generation failed for ${requestedTopic}: ${error.message}` },
      { status: 500 }
    );
  }
}
