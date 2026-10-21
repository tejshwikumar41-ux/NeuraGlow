import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { topic, question, history = [] } = await req.json();

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { success: false, error: "Question is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "GROQ_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = `You are NeuraGlow AI Tutor, an expert educator and tutor. The user is currently learning about "${topic || "the topic"}". Your goal is to answer the user's questions, clear up doubts, provide detailed explanations, and help them master this topic.

Guidelines:
- Give clear, structured, and insightful answers.
- Use bullet points, bold headers, and short paragraphs for readability.
- If appropriate, use real-world analogies to make complex ideas simple.
- Encourage critical thinking and invite further cross-questioning.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: question.trim() }
    ];

    const modelsToTry = [
      "openai/gpt-oss-120b",
      "llama-3.1-70b-versatile",
      "llama-3.3-70b-versatile",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "llama3-70b-8192",
    ];

    let completion = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        completion = await groq.chat.completions.create({
          messages: formattedMessages,
          model: model,
          temperature: 0.5,
          max_tokens: 1000,
        });
        if (completion?.choices?.[0]?.message?.content) {
          break;
        }
      } catch (err) {
        console.warn(`Groq model ${model} failed for chat, trying fallback:`, err?.message);
        lastError = err;
      }
    }

    if (!completion?.choices?.[0]?.message?.content) {
      throw lastError || new Error("Failed to generate response from Groq API.");
    }

    const answer = completion.choices[0].message.content.trim();

    return NextResponse.json({
      success: true,
      answer: answer,
    });
  } catch (error) {
    console.error("Groq Chat API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred while processing your question.",
      },
      { status: 500 }
    );
  }
}
