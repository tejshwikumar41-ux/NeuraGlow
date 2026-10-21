import Groq from "groq-sdk";

// Helper to get active AI provider based on environment keys
export function getActiveProvider() {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.GROQ_API_KEY) return "groq";
  return "none";
}

// Groq Client
export const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");
  return new Groq({ apiKey });
};

// Gemini REST API helper
export async function callGemini(prompt, systemInstruction = "") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError = null;

  for (const model of models) {
    try {
      const fullPrompt = systemInstruction
        ? `${systemInstruction}\n\nUser Request: ${prompt}`
        : prompt;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: fullPrompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error?.message || `Gemini API error on model ${model}`);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && typeof text === "string") {
        return text.trim();
      }
    } catch (err) {
      console.warn(`Gemini model ${model} failed, trying next fallback:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini API models failed.");
}

// OpenAI API helper (if key exists)
export async function callOpenAI(prompt, systemInstruction = "") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI API call failed");
  }

  return data.choices[0].message.content;
}

// Safe JSON parser helper
export function safeJsonParse(text) {
  if (!text || typeof text !== "string") return null;

  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const extracted = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(extracted);
      } catch (e) {
        console.error("Regex JSON extraction failed:", e.message);
      }
    }
    return null;
  }
}
