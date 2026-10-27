import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const {
      chapterTitle = '',
      sectionTitle = '',
      sectionContent = '',
      concepts = [],
      formulas = [],
      messages = [],
      userInput = ''
    } = await req.json();

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!groqKey && !geminiKey && !openaiKey && !openrouterKey) {
      return NextResponse.json(
        { reply: "⚠️ No AI API keys found in environment variables. Please check your .env.local or Render settings." },
        { status: 500 }
      );
    }

    // Prepare system prompt with ground-truth PDF textbook content
    const conceptText = (concepts || []).map((c: any) => `- ${c.term}: ${c.definition}`).join('\n');
    const formulaText = (formulas || []).map((f: any) => `- ${f.formula_plain || f.latex}`).join('\n');

    const systemPrompt = `You are NeuraGlow's Socratic Physics AI Tutor.
You are having an interactive 2-sided dialogue with a student studying ${chapterTitle} - ${sectionTitle}.

TEXTBOOK PDF CONTENT FOR THIS SECTION:
"""
${(sectionContent || '').slice(0, 8000)}
"""

KEY CONCEPTS IN THIS SECTION:
${conceptText || 'None extracted.'}

KEY FORMULAS IN THIS SECTION:
${formulaText || 'None extracted.'}

STRICT BEHAVIOR & SOCRATIC RULES:
1. OFF-TOPIC GUARD: If the user asks something off-topic (e.g. politics, "who is modi", sports, movies, general trivia), POLITELY REFUSE in 1 short sentence and re-direct them to a physics question about ${sectionTitle}.
2. GROUNDING: Ground all physics explanations and evaluations strictly on the textbook content provided above.
3. ANSWER EVALUATION:
   - If the student's answer is WRONG or NONSENSE: Explicitly state that it is incorrect without false praise. Briefly explain why using the textbook text, give a helpful hint, and ask them to try again.
   - If the student's answer is CORRECT: Praise them briefly, explain the physical principle in 1 concise sentence, and ask a deeper Socratic question (elevating conceptual depth).
4. TWO-WAY DIALOGUE: If the student asks a valid question about physics or ${sectionTitle}, answer clearly with LaTeX math ($F = ma$ or $$...$$), then ask a follow-up Socratic question to test their understanding.
5. FORMATTING: Use clean Markdown with Bold key terms and KaTeX LaTeX for formulas. Keep replies concise (80-150 words).`;

    let aiReply = '';

    // --- PROVIDER 1: GROQ (Ultra-fast LLMs) ---
    if (groqKey && !aiReply) {
      const groqModels = ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'llama-3.1-8b-instant', 'llama3-70b-8192'];
      for (const model of groqModels) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                ...(messages || []).map((m: any) => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: m.text
                })),
                { role: 'user', content: userInput }
              ],
              temperature: 0.6,
              max_tokens: 600
            })
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            aiReply = data.choices?.[0]?.message?.content || '';
            if (aiReply) break;
          }
        } catch (e) {
          console.warn(`Groq (${model}) error:`, e);
        }
      }
    }

    // --- PROVIDER 2: GEMINI (Massive context window) ---
    if (geminiKey && !aiReply) {
      const geminiModels = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
      for (const model of geminiModels) {
        try {
          // Build alternating turn structure for Gemini
          const geminiContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
          const rawHistory = [
            ...(messages || []).map((m: any) => ({
              role: m.sender === 'user' ? 'user' : 'model',
              text: m.text
            })),
            { role: 'user', text: userInput }
          ];

          for (const item of rawHistory) {
            if (!item.text || !item.text.trim()) continue;
            if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === item.role) {
              geminiContents[geminiContents.length - 1].parts[0].text += `\n${item.text}`;
            } else {
              geminiContents.push({
                role: item.role,
                parts: [{ text: item.text }]
              });
            }
          }

          if (geminiContents.length > 0 && geminiContents[0].role === 'model') {
            geminiContents.unshift({
              role: 'user',
              parts: [{ text: `Hello! Let's discuss ${sectionTitle}.` }]
            });
          }

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: {
                  parts: [{ text: systemPrompt }]
                },
                contents: geminiContents
              })
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (aiReply) break;
          }
        } catch (e) {
          console.warn(`Gemini (${model}) error:`, e);
        }
      }
    }

    // --- PROVIDER 3: OPENAI / OPENROUTER FALLBACK ---
    if ((openaiKey || openrouterKey) && !aiReply) {
      try {
        const endpoint = openrouterKey 
          ? 'https://openrouter.ai/api/v1/chat/completions' 
          : 'https://api.openai.com/v1/chat/completions';
        
        const authHeader = openrouterKey 
          ? `Bearer ${openrouterKey}` 
          : `Bearer ${openaiKey}`;

        const openRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: openrouterKey ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...(messages || []).map((m: any) => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
              })),
              { role: 'user', content: userInput }
            ],
            temperature: 0.6
          })
        });

        if (openRes.ok) {
          const data = await openRes.json();
          aiReply = data.choices?.[0]?.message?.content || '';
        } else {
          console.warn('OpenAI/OpenRouter response status:', openRes.status);
        }
      } catch (e) {
        console.warn('OpenAI/OpenRouter failed:', e);
      }
    }

    if (!aiReply) {
      return NextResponse.json({
        reply: "⚠️ Unable to get response from AI providers. Please check your API key quotas or internet connection."
      }, { status: 500 });
    }

    return NextResponse.json({ reply: aiReply });

  } catch (err: any) {
    console.error('Socratic Route Error:', err);
    return NextResponse.json({ reply: "⚠️ Internal Server Error in Socratic AI Engine." }, { status: 500 });
  }
}
