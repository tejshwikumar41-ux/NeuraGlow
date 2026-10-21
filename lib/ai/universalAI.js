import Groq from 'groq-sdk';

// Safe JSON parser helper
export function safeJsonParse(text) {
  if (!text || typeof text !== 'string') return null;

  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    return JSON.parse(cleaned.trim());
  } catch (err) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const extracted = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(extracted);
      } catch (e) {
        console.error('Regex JSON parse fallback failed:', e.message);
      }
    }
    return null;
  }
}

// Universal resilient LLM caller
export async function callUniversalLLM({
  prompt,
  systemPrompt = 'You are an expert educational AI. Output strict raw JSON.',
  json = true,
  temperature = 0.25,
  max_tokens = 4000,
}) {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 1. Try Groq with active, supported models
  if (groqApiKey) {
    const groq = new Groq({ apiKey: groqApiKey });
    const groqModels = [
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-20b',
    ];

    for (const model of groqModels) {
      try {
        const options = {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens,
        };
        if (json) {
          options.response_format = { type: 'json_object' };
        }

        const comp = await groq.chat.completions.create(options);
        const content = comp.choices[0]?.message?.content;
        if (content) {
          if (!json) return content;
          const parsed = safeJsonParse(content);
          if (parsed) return parsed;
        }
      } catch (err) {
        console.warn(`[UniversalAI] Groq model ${model} failed:`, err.message);
      }
    }
  }

  // 2. Try Gemini REST API as high-reliability fallback
  if (geminiApiKey) {
    const geminiModels = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'];
    for (const model of geminiModels) {
      try {
        const fullPrompt = `${systemPrompt}\n\n${json ? 'IMPORTANT: Return ONLY a valid JSON object without markdown or backticks.' : ''}\n\nUser Request: ${prompt}`;
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            }),
          }
        );
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          if (!json) return text;
          const parsed = safeJsonParse(text);
          if (parsed) return parsed;
        }
      } catch (err) {
        console.warn(`[UniversalAI] Gemini model ${model} failed:`, err.message);
      }
    }
  }

  // 3. Try OpenRouter as fallback
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;
  if (openrouterApiKey) {
    const openrouterModels = [
      'liquid/lfm-2.5-2.6b:free',
      'nvidia/nemotron-3.5-lightning:free'
    ];
    for (const model of openrouterModels) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            response_format: json ? { type: 'json_object' } : undefined
          })
        });
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          if (!json) return content;
          const parsed = safeJsonParse(content);
          if (parsed) return parsed;
        }
      } catch (err) {
        console.warn(`[UniversalAI] OpenRouter model ${model} failed:`, err.message);
      }
    }
  }

  // 4. Try OpenAI as final fallback
  if (openaiApiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature,
          response_format: json ? { type: 'json_object' } : undefined,
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        if (!json) return content;
        const parsed = safeJsonParse(content);
        if (parsed) return parsed;
      }
    } catch (err) {
      console.warn('[UniversalAI] OpenAI failed:', err.message);
    }
  }

  throw new Error('All universal AI providers failed to generate valid output.');
}
