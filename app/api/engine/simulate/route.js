import { NextResponse } from 'next/server';
import { callGemini, callOpenAI, getGroqClient, safeJsonParse } from '@/lib/ai/providers';

export async function POST(req) {
  let requestedTopic = 'Topic';
  try {
    const { topic = 'Topic', category = 'GENERAL', subtopics = [] } = await req.json();
    requestedTopic = topic;

    if (!topic || topic.trim() === '') {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    const isCode = category === 'PROGRAMMING' || /python|loop|code|js|javascript|java|c\+\+|function|variable|algorithm/i.test(topic);

    const systemPrompt = `You are SimuExpert, an educational simulation designer creating interactive models like PhET Colorado.
Generate an interactive simulation specifically for: '${topic}'
Category: ${category}

RULES:
- For PROGRAMMING: create a code stepper with real execution trace line-by-line.
- For SCIENCE / PHYSICS / CHEMISTRY / MATH: create a parameter simulation with dynamic sliders that physically affect real outputs, equations, or visual states of '${topic}'.
- ZERO cross-domain contamination: sliders and parameters must specifically represent real physical or mathematical variables for '${topic}' (e.g., Angular Velocity, Torque, Moment of Inertia for Rotational Motion).

For PROGRAMMING topics, RETURN:
{
  "simulationType": "code_stepper",
  "title": "Interactive Code Execution Stepper: [Specific ${topic} Algorithm]",
  "description": "Step line-by-line to observe variable mutations and memory state for ${topic}",
  "code": ["[Working line 1]", "[Working line 2]"],
  "language": "python",
  "steps": [
    {
      "stepNumber": 1,
      "activeLine": 0,
      "highlightLines": [0],
      "variables": { "varName": { "value": 1, "type": "int", "description": "Variable role in algorithm" } },
      "output": [],
      "memory": { "scope": "global", "items": [{ "name": "varName", "val": 1 }] },
      "explanation": "Clear explanation of execution line in ${topic}.",
      "importantNote": "Key takeaway for this instruction."
    }
  ],
  "controls": ["step_back", "step_forward", "auto_play", "reset", "speed"]
}

For SCIENCE / PHYSICS / CHEMISTRY / MATH / BUSINESS topics, RETURN:
{
  "simulationType": "canvas",
  "title": "Interactive Physical Model: ${topic}",
  "description": "Adjust control sliders to observe real-time dynamic behavior and laws of ${topic}",
  "parameters": [
    { "id": "p1", "label": "[Real physical variable 1 for ${topic}, e.g. Angular Velocity]", "min": 0, "max": 100, "default": 50, "unit": "rad/s", "color": "indigo" },
    { "id": "p2", "label": "[Real physical variable 2 for ${topic}, e.g. Moment of Inertia]", "min": 1, "max": 50, "default": 10, "unit": "kg·m²", "color": "emerald" }
  ],
  "states": [
    {
      "id": "state_default",
      "condition": "standard range",
      "title": "Equilibrium or Baseline State",
      "description": "At initial values, ${topic} exhibits standard steady dynamics.",
      "outputMetrics": { "Primary Output": "Value", "Kinetic Energy": "Calculated value" },
      "activeComponents": ["rotor", "axis", "vector_arrow"],
      "visualChanges": "Smooth rotation at baseline angular frequency."
    },
    {
      "id": "state_high",
      "condition": "high range",
      "title": "High-Intensity Dynamics",
      "description": "Elevated parameter input drastically amplifies kinetic forces in ${topic}.",
      "outputMetrics": { "Primary Output": "Peak Value", "Kinetic Energy": "Maximum" },
      "activeComponents": ["accelerated_rotor", "high_torque_vector"],
      "visualChanges": "Rapid spinning with prominent force vectors."
    }
  ],
  "visualElements": [
    { "id": "elem1", "label": "Rotating Body", "type": "circle", "defaultPosition": "200,100" }
  ]
}

Return ONLY valid JSON (no markdown formatting, no backticks).`;

    const userPrompt = `Generate interactive simulation data for: "${topic}" (Category: ${category})`;

    let parsedResult = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini simulate failed:', err.message);
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
        console.warn('Groq simulate failed:', err.message);
      }
    }

    if (parsedResult && (parsedResult.parameters || parsedResult.code || parsedResult.steps)) {
      return NextResponse.json({ success: true, data: parsedResult });
    }

    return NextResponse.json(
      { success: false, error: `Generation failed for ${topic}. Please retry.` },
      { status: 500 }
    );
  } catch (error) {
    console.error('Simulate API Error:', error);
    return NextResponse.json(
      { success: false, error: `Generation failed for ${requestedTopic}: ${error.message}` },
      { status: 500 }
    );
  }
}
