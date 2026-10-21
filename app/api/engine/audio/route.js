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

    const systemPrompt = `You are AudioLesson, an expert educational podcast scriptwriter in ${category}.
Write a 5-paragraph conversational podcast script strictly for: '${topic}'

RULES:
- Sound like a friendly expert tutor directly addressing the student.
- Include 5 distinct paragraphs covering: Hook, Analogy, Core Mechanics, Real Example, Takeaways.
- ZERO cross-domain contamination: use only the exact terminology and facts of '${topic}'.
- Use short, clear, spoken-word sentences.
- Include clear learning takeaways.

RETURN THIS EXACT JSON (no markdown formatting, no backticks):
{
  "title": "Mastering ${topic}: The Audio Crash Course",
  "duration": "4-5 min",
  "scriptParagraphs": [
    {
      "number": 1,
      "text": "Spoken hook paragraph introducing ${topic}...",
      "teaches": "Conceptual Hook",
      "timestamp": "0:00"
    },
    {
      "number": 2,
      "text": "Relatable analogy explaining how ${topic} operates...",
      "teaches": "Core Analogy",
      "timestamp": "0:45"
    },
    {
      "number": 3,
      "text": "Technical mechanics and laws of ${topic}...",
      "teaches": "Core Mechanics",
      "timestamp": "1:30"
    },
    {
      "number": 4,
      "text": "Concrete real-world application of ${topic}...",
      "teaches": "Real-world Application",
      "timestamp": "2:15"
    },
    {
      "number": 5,
      "text": "Key takeaways and recap for ${topic}...",
      "teaches": "Summary & Next Steps",
      "timestamp": "3:00"
    }
  ],
  "paragraphs": [
    {
      "number": 1,
      "text": "Spoken hook paragraph introducing ${topic}...",
      "teaches": "Conceptual Hook",
      "timestamp": "0:00"
    }
  ],
  "keyTakeaways": ["[Key takeaway 1 for ${topic}]", "[Key takeaway 2 for ${topic}]", "[Key takeaway 3 for ${topic}]"]
}`;

    const userPrompt = `Write a 5-paragraph podcast script for topic: "${topic}" (Category: ${category})`;

    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini audio failed:', err.message);
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
        console.warn('Groq audio failed:', err.message);
      }
    }

    if (parsedResult && (parsedResult.scriptParagraphs || parsedResult.paragraphs)) {
      if (!parsedResult.scriptParagraphs && parsedResult.paragraphs) {
        parsedResult.scriptParagraphs = parsedResult.paragraphs;
      }
      return NextResponse.json({ success: true, data: parsedResult });
    }

    return NextResponse.json(
      { success: false, error: `Generation failed for ${topic}. Please retry.` },
      { status: 500 }
    );
  } catch (error) {
    console.error('Audio API Error:', error);
    return NextResponse.json(
      { success: false, error: `Generation failed for ${requestedTopic}: ${error.message}` },
      { status: 500 }
    );
  }
}
