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
      userInput = '',
      mode = 'socratic'
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

    // Build context if section or chapter is supplied
    let contextBlock = '';
    const hasSectionContext = !!(sectionContent || sectionTitle || chapterTitle);
    if (hasSectionContext) {
      const conceptText = (concepts || []).map((c: any) => `- ${c.term}: ${c.definition}`).join('\n');
      const formulaText = (formulas || []).map((f: any) => `- ${f.formula_plain || f.latex}`).join('\n');
      contextBlock = `
ACTIVE STUDY CONTEXT:
- Chapter: ${chapterTitle || 'Physics'}
- Section: ${sectionTitle || 'General'}
${sectionContent ? `TEXTBOOK CONTENT:\n"""\n${sectionContent.slice(0, 8000)}\n"""\n` : ''}
${conceptText ? `KEY CONCEPTS:\n${conceptText}\n` : ''}
${formulaText ? `KEY FORMULAS:\n${formulaText}\n` : ''}
`;
    }

    const modeGuides: Record<string, string> = {
      socratic: "PEDAGOGICAL GOAL (Socratic Inquiry): Guide the student's reasoning through insightful questions, uncovering hidden assumptions and leading them to deduce first principles themselves.",
      explain: "PEDAGOGICAL GOAL (Deep Intuition): Provide a crystal-clear, beautifully intuitive explanation using everyday real-world analogies, physical meaning, and first principles.",
      solver: "PEDAGOGICAL GOAL (Step-by-Step Solver): Break the problem into explicit stages: knowns/unknowns, fundamental physical laws, algebraic derivation with LaTeX math, and units.",
      challenge: "PEDAGOGICAL GOAL (Conceptual Challenge): Test the student with a thought experiment, paradox, or counter-intuitive edge case to push their mastery."
    };

    const activeModeGuide = modeGuides[mode] || modeGuides.socratic;

    const systemPrompt = `You are NeuraGlow's Independent Socratic AI Assistant — an omniscient, design-forward, highly engaging AI tutor for Physics, Science, Mathematics, and STEM learning.

${hasSectionContext ? contextBlock : 'MODE: Completely Independent AI Assistant. You have full mastery of all fields of Physics (Mechanics, Electromagnetism, Optics, Thermodynamics, Modern Physics, Quantum Mechanics, Relativity), Mathematics, and STEM.'}

${activeModeGuide}

OUTPUT STRUCTURE & VISUAL FORMATTING RULES (CRITICAL):
1. CLEAN, BEAUTIFULLY STRUCTURED SECTIONS:
   - Begin with a brief, direct introductory answer (1-2 sentences).
   - Use clear Markdown headings: "### Overview", "### Core Principles", "### Key Insights", or "### Step-by-Step Derivation".
   - Organize facts and concepts using clean bulleted lists with bold lead-ins:
     - **Item Name**: Description or explanation here.
     - **Item Name**: Description or explanation here.
2. STRICT PROHIBITION ON RAW HTML & COLLAPSED TABLES:
   - NEVER output raw HTML like &lt;br&gt;, &lt;div&gt;, &lt;span&gt;. Use standard double newlines and Markdown formatting instead.
   - NEVER cram summaries, biographies, or facts into a cramped pipe-delimited table. ALWAYS use structured bullet points and bold headers instead.
   - If a comparison table is strictly required, ensure every row is on its own separate line with valid Markdown table syntax.
3. SOCRATIC BLOCKQUOTE CLOSING:
   - Conclude your response with a thought-provoking conceptual inquiry wrapped in a clean blockquote:
     > 💡 **Socratic Question:**
     > [Your thought experiment, inquiry, or challenge question here]
4. MATHEMATICAL RIGOR:
   - Format all physics and mathematical formulas with KaTeX LaTeX (inline: $F = ma$, display: $$E_k = \\frac{1}{2}mv^2$$).
5. CONCISE & ENGAGING: Keep responses around 120-220 words so they read like a polished tutoring exchange rather than an unformatted text dump.`;

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
