import { NextResponse } from 'next/server';
import { callGemini, getGroqClient, safeJsonParse } from '@/lib/ai/providers';

export async function POST(req) {
  try {
    const { topic = 'Topic', category = 'GENERAL', difficulty = 'beginner' } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const systemPrompt = `You are DeepGuide, an expert research scientist and textbook author.
Create a comprehensive, structured deep-dive research guide for the topic: "${topic}".
Category: ${category}. Difficulty: ${difficulty}.

Return STRICT JSON:
{
  "title": "Comprehensive Deep Guide: ${topic}",
  "sections": [
    {
      "heading": "Foundational Principles of ${topic}",
      "content": "In-depth explanation covering background, underlying mechanics, and key principles...",
      "codeExample": "Optional concrete code snippet or mathematical example",
      "pitfalls": "Critical warning or common misunderstanding to avoid",
      "checkYourself": {
        "question": "Quick check question on this module",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0
      }
    },
    {
      "heading": "Architecture & Inner Machinery",
      "content": "Step-by-step breakdown of structural components and operational execution...",
      "codeExample": "Practical demonstration",
      "pitfalls": "Performance or conceptual edge cases",
      "checkYourself": {
        "question": "Quick check question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 1
      }
    },
    {
      "heading": "Real-World Applications & Future Horizons",
      "content": "How this concept applies across industry and modern research...",
      "codeExample": "Real-world scenario example",
      "pitfalls": "Anti-patterns in real world usage",
      "checkYourself": {
        "question": "Application check question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 2
      }
    }
  ]
}`;

    const userPrompt = `Generate Deep Research Guide for topic: "${topic}"`;
    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini deep guide failed:', err.message);
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
        console.warn('Groq deep guide failed:', err.message);
      }
    }

    if (!parsedResult || !parsedResult.sections) {
      parsedResult = {
        title: `Comprehensive Deep Guide: ${topic}`,
        sections: [
          {
            heading: `Foundational Principles of ${topic}`,
            content: `${topic} is an essential domain of knowledge. Understanding its core principles provides a bedrock foundation for advanced applications.`,
            codeExample: category === 'PROGRAMMING' ? `def analyze_${topic.toLowerCase().replace(/\\s+/g, '_')}():\n    return "Initialized ${topic}"` : null,
            pitfalls: `Misunderstanding the underlying assumptions of ${topic}.`,
            checkYourself: {
              question: `What is the core premise of ${topic}?`,
              options: ['To structure domain understanding', 'To create complexity', 'None', 'All of the above'],
              correctAnswer: 0
            }
          }
        ]
      };
    }

    return NextResponse.json({ success: true, data: parsedResult });
  } catch (error) {
    console.error('DeepGuide API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
