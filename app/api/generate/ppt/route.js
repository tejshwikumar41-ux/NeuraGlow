import { NextResponse } from 'next/server';
import { callGemini, callOpenAI, getGroqClient, safeJsonParse } from '@/lib/ai/providers';

export async function POST(req) {
  try {
    const { topic = 'Learning Topic', category = 'GENERAL' } = await req.json();

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    const cleanTopic = topic.trim();

    const systemPrompt = `You are GammaPPT, an expert presentation designer. Generate 5-6 high-impact presentation slides for the topic.
For each slide, decide the optimal slide layout (hero_split | three_card | code_focus | stat_callout | quote_analogy) and determine whether it needs a REAL PHOTO or a SCIENTIFIC DIAGRAM.

Return STRICT JSON matching this structure:
{
  "slides": [
    {
      "slideNumber": 1,
      "layout": "hero_split | three_card | code_focus | stat_callout | quote_analogy",
      "title": "Clear Headline",
      "subtitle": "Brief Subheading",
      "bullets": ["Point 1 with details", "Point 2 with details"],
      "codeSnippet": "Working code snippet if programming topic, else null",
      "statCallout": { "number": "90%", "label": "Key metric" },
      "visualType": "photo | diagram",
      "imageQuery": "2-3 keyword search term for real photo (e.g. 'green leaf sunlight' or 'python computer code')",
      "diagramPrompt": "detailed prompt for AI diagram generator representing this concept visually",
      "keyTakeaway": "One-line golden summary",
      "speakerNotes": "What a presenter should say while explaining this slide",
      "checkQuestion": {
        "question": "Quick check question for slide listeners",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Why Option A is correct"
      }
    }
  ]
}`;

    const userPrompt = `Generate 5-6 high-impact presentation slides for topic: "${cleanTopic}" (Category: ${category}).`;

    let parsedResult = null;

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini PPT generation failed:', err.message);
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
        console.warn('Groq PPT generation failed:', err.message);
      }
    }

    // Fallback slide structure if AI calls fail
    if (!parsedResult || !parsedResult.slides || parsedResult.slides.length === 0) {
      parsedResult = {
        slides: [
          {
            slideNumber: 1,
            layout: 'hero_split',
            title: `Understanding ${cleanTopic}`,
            subtitle: 'Core Foundation & Principles',
            bullets: [
              `Core concept of ${cleanTopic} explained simply.`,
              'Why this matters in real-world applications.',
              'Key takeaways to remember.'
            ],
            codeSnippet: category === 'PROGRAMMING' ? `# Example: ${cleanTopic}\nprint("Mastering ${cleanTopic}")` : null,
            statCallout: { number: '100%', label: 'Mastery Efficiency' },
            visualType: 'diagram',
            imageQuery: `${cleanTopic} diagram`,
            diagramPrompt: `Clean educational diagram illustrating ${cleanTopic} with labeled components on soft background`,
            keyTakeaway: `${cleanTopic} forms an essential foundation.`,
            speakerNotes: `Introduce ${cleanTopic} by walking through its primary real-world application.`,
            checkQuestion: {
              question: `What is the main goal of ${cleanTopic}?`,
              options: ['To simplify complex processes', 'To add unnecessary complexity', 'To confuse learners', 'None of the above'],
              correctAnswer: 0,
              explanation: 'The primary purpose is to simplify and automate complex processes.'
            }
          }
        ]
      };
    }

    // Enrich slides with resolved imageUrl
    const enrichedSlides = parsedResult.slides.map((slide, idx) => {
      const visualType = slide.visualType || (idx % 2 === 0 ? 'photo' : 'diagram');
      let imageUrl = '';

      if (visualType === 'photo') {
        const query = encodeURIComponent(slide.imageQuery || cleanTopic);
        // High quality Unsplash source / Wikimedia fallback keyword URL
        imageUrl = `https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1024&auto=format&fit=crop&q=80`;
        // Include fallback query search URL
        slide.fallbackImageUrl = `https://loremflickr.com/1024/768/${query}`;
      } else {
        const prompt = encodeURIComponent(slide.diagramPrompt || `${cleanTopic} educational diagram`);
        imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&nologo=true&enhance=true&model=flux`;
      }

      return {
        ...slide,
        slideNumber: slide.slideNumber || idx + 1,
        imageUrl,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        topic: cleanTopic,
        slides: enrichedSlides,
      }
    });
  } catch (error) {
    console.error('PPT API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate presentation slides.' },
      { status: 500 }
    );
  }
}
