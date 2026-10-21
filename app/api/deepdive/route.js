import { NextResponse } from 'next/server';
import { callGemini, callOpenAI, getGroqClient, safeJsonParse } from '@/lib/ai/providers';

export async function POST(req) {
  try {
    const {
      topic = 'Learning Topic',
      engine = 'general',
      itemTitle = '',
      itemContent = '',
      action = 'explain_more',
      question = '',
      history = [],
    } = await req.json();

    const systemPrompt = `You are NeuraGlow Deep Tutor. The learner wants to go deeper into one specific part of a topic.
Be simple enough for a beginner, accurate, and practical.
Use short paragraphs, concrete examples, and real-world analogies.
End with exactly ONE engaging counter-question to check the learner's understanding.
Do not repeat the whole topic. Focus strictly on the selected item.

Return ONLY valid JSON matching this exact structure:
{
  "answer": "Simple, structured response (1. Simple Meaning, 2. Example, 3. Why it matters)",
  "followUpQuestion": "One engaging counter-question to check understanding",
  "nextSuggestions": ["Next Question 1", "Next Question 2", "Next Question 3"]
}`;

    const userPrompt = `TOPIC: "${topic}"
CURRENT ENGINE: ${engine}
SELECTED ITEM: "${itemTitle}"
ITEM CONTENT: "${itemContent}"
USER ACTION / QUESTION: ${question ? `"${question}"` : `Action requested: ${action}`}

${history.length > 0 ? `CONVERSATION RECENT HISTORY:\n${JSON.stringify(history.slice(-4))}` : ''}`;

    let parsedResult = null;

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini deepdive failed:', err.message);
      }
    }

    // 2. Try Groq
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
        console.warn('Groq deepdive failed:', err.message);
      }
    }

    // Fallback if parsing fails
    if (!parsedResult) {
      parsedResult = {
        answer: `Here is a deeper look at **${itemTitle || topic}**:
1. **Simple Meaning:** This component represents a key building block in ${topic}.
2. **Example:** Think of it like a specific step in a recipe. If you skip it, the dish won't turn out right.
3. **Why It Matters:** Understanding this helps you master how the entire system connects together.`,
        followUpQuestion: `How would you explain ${itemTitle || topic} in your own words to a friend?`,
        nextSuggestions: [
          `Give me another example of ${itemTitle || topic}`,
          `What is a common mistake here?`,
          `Quiz me on this concept!`
        ],
      };
    }

    return NextResponse.json({ success: true, ...parsedResult });
  } catch (error) {
    console.error('DeepDive API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process deep dive request.',
      },
      { status: 500 }
    );
  }
}
