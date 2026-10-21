import { NextResponse } from 'next/server';
import { callUniversalLLM } from '@/lib/ai/universalAI';

export async function POST(req) {
  try {
    const {
      topic = 'Educational Topic',
      userMessage = '',
      question = '',
      conversationHistory = [],
      history = [],
      context = {},
      currentDepth = 1,
    } = await req.json();

    const query = (userMessage || question || '').trim();
    if (!query) {
      return NextResponse.json({ error: 'Message or question is required' }, { status: 400 });
    }

    const convHistory = conversationHistory.length > 0 ? conversationHistory : history;
    const blueprint = context.blueprint || {};
    const domain = blueprint.domain || context.category || 'General';
    const topicType = blueprint.topic_type || 'concept';
    const tone = blueprint.appropriate_tone || 'conversational';
    const analogies = (blueprint.best_analogies_from || []).join(', ');

    // 1. Detect student intent
    const intentPrompt = `Analyze this student message in an interactive tutoring context for "${topic}":
STUDENT MESSAGE: "${query}"
CONVERSATION CONTEXT (last message): "${convHistory.slice(-1)[0]?.content || 'None'}"

Classify into one intent:
explain | deeper | example | confused | challenge | quiz_me | tangent | clarify | summarize
Output JSON: { "intent": "one_of_the_above" }`;

    let detectedIntent = 'explain';
    try {
      const intentRes = await callUniversalLLM({
        prompt: intentPrompt,
        systemPrompt: 'You are an intent classifier. Output strict JSON only.',
        json: true,
        temperature: 0.1,
        max_tokens: 150,
      });
      if (intentRes?.intent) detectedIntent = intentRes.intent;
    } catch {
      // default to explain
    }

    // Determine target depth (1 to 5)
    let newDepth = currentDepth || 1;
    if (detectedIntent === 'deeper') newDepth = Math.min(5, newDepth + 1);
    if (detectedIntent === 'confused') newDepth = Math.max(1, newDepth - 1);

    // 2. Build Socratic Tutor Prompt
    const tutorSystemPrompt = `You are NeuraGlow's Universal Socratic Tutor teaching: "${topic}".
TOPIC CONTEXT:
- Domain: ${domain}
- Topic type: ${topicType}
- Pedagogical tone: ${tone}
- Best analogies from: ${analogies || 'Everyday life'}
- Current Depth Level: ${newDepth}/5

PEDAGOGICAL RULES:
1. If intent is "deeper": Advance to nuanced systemic depth, avoiding repeating earlier explanations.
2. If intent is "example": Provide a FRESH, vivid, concrete real-world case study or calculation.
3. If intent is "confused": Step down complexity, use an intuitive everyday analogy, and check where the gap is.
4. If intent is "challenge": Engage with intellectual seriousness and cite counter-evidence or theoretical debates.
5. If intent is "quiz_me": Pose a thoughtful scenario or diagnostic check.
6. Always end with a TOPIC-SPECIFIC SOCRATIC QUESTION that pushes student cognition (NEVER a generic "Do you understand?").
7. Keep the response engaging, clear, and structured (under 200 words).

Return ONLY raw JSON with this exact structure:
{
  "main_response": "The clear Socratic explanation and insight.",
  "socratic_question": "A sharp, thought-provoking question directly testing understanding of ${topic}.",
  "analogy_used": "Brief note on analogy used, or null",
  "suggested_follow_ups": [
    "Specific follow-up action 1",
    "Specific follow-up action 2",
    "Specific follow-up action 3"
  ],
  "depth_level_used": ${newDepth}
}`;

    const formattedHistory = convHistory.slice(-4).map((m) => `${m.role || (m.sender === 'user' ? 'student' : 'tutor')}: ${m.content || m.text}`).join('\n');
    const tutorUserPrompt = `CONVERSATION HISTORY:\n${formattedHistory}\n\nSTUDENT LATEST MESSAGE: "${query}"\nDETECTED INTENT: ${detectedIntent}`;

    const tutorResult = await callUniversalLLM({
      prompt: tutorUserPrompt,
      systemPrompt: tutorSystemPrompt,
      json: true,
      temperature: 0.35,
      max_tokens: 1200,
    });

    const responsePayload = {
      explanation: tutorResult.main_response || `Here is an insight on ${topic} to consider.`,
      main_response: tutorResult.main_response || `Here is an insight on ${topic} to consider.`,
      counterQuestion: tutorResult.socratic_question || `How does this dynamic alter the outcome?`,
      socratic_question: tutorResult.socratic_question || `How does this dynamic alter the outcome?`,
      analogy_used: tutorResult.analogy_used || null,
      suggested_follow_ups: Array.isArray(tutorResult.suggested_follow_ups) ? tutorResult.suggested_follow_ups : [
        'Explore a concrete example',
        'Go deeper into mechanisms',
        'Test me on this concept'
      ],
      depth_level_used: tutorResult.depth_level_used || newDepth,
    };

    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error('Universal Socratic Tutor error:', err);
    return NextResponse.json({
      explanation: `Let's break down this aspect of the topic. What particular dynamic would you like to explore further?`,
      main_response: `Let's break down this aspect of the topic. What particular dynamic would you like to explore further?`,
      counterQuestion: `What do you think is the primary cause at work here?`,
      socratic_question: `What do you think is the primary cause at work here?`,
      suggested_follow_ups: ['Give me an intuitive analogy', 'Go one level deeper', 'Quiz my understanding'],
      depth_level_used: 1,
    });
  }
}
