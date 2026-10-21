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
    const isCode = category === 'PROGRAMMING' || /python|loop|code|javascript|js|java|c\+\+|function|variable/i.test(cleanTopic);

    const systemPrompt = `You are SimuEngine, an expert in educational simulations (like PhET Interactive Simulations & PythonTutor). 
Generate a fully interactive, state-driven simulation configuration.

If category is PROGRAMMING:
Return simulationType = "code_stepper" with live variable tracking, active execution lines, and output logs.

If category is SCIENCE / MATH / BUSINESS / GENERAL:
Return simulationType = "interactive_canvas" with 2-3 interactive variable sliders (e.g., Sunlight, CO2, Temperature) and step-by-step state keyframes that dynamically update the visual model state based on slider values!

Return STRICT JSON:
{
  "simulationType": "${isCode ? 'code_stepper' : 'interactive_canvas'}",
  "title": "Interactive Simulation Title",
  "description": "How to use this simulation",
  "controls": [
    {
      "id": "param1",
      "label": "Sunlight Intensity (or Variable 1)",
      "min": 0,
      "max": 100,
      "default": 50,
      "unit": "%"
    },
    {
      "id": "param2",
      "label": "CO2 Concentration (or Variable 2)",
      "min": 0,
      "max": 100,
      "default": 30,
      "unit": "ppm"
    }
  ],
  "canvasStates": [
    {
      "condition": "default",
      "statusTitle": "Normal Process State",
      "outputRate": "Moderate Yield Output",
      "activeElements": ["core_node", "flux_stream", "catalyst"],
      "explanation": "At moderate parameter levels, the system operates at steady state."
    },
    {
      "condition": "high_intensity",
      "statusTitle": "Maximum Absorption Phase",
      "outputRate": "High Production Yield",
      "activeElements": ["electron_transport_peak", "rapid_cycle", "overflow_valve"],
      "explanation": "Increased input parameters accelerate energy transfer and product synthesis."
    }
  ],
  "codeStepperData": {
    "code": [
      "for i in range(1, 4):",
      "    print(f'Processing batch {i}')"
    ],
    "steps": [
      { "line": 1, "variables": { "i": 1 }, "output": [], "explanation": "Loop initializes counter i to 1." },
      { "line": 2, "variables": { "i": 1 }, "output": ["Processing batch 1"], "explanation": "Outputs message for batch 1." },
      { "line": 1, "variables": { "i": 2 }, "output": ["Processing batch 1"], "explanation": "Counter increments to 2." },
      { "line": 2, "variables": { "i": 2 }, "output": ["Processing batch 1", "Processing batch 2"], "explanation": "Outputs message for batch 2." }
    ]
  }
}`;

    const userPrompt = `Generate educational simulation data for topic: "${cleanTopic}" (Category: ${category}).`;

    let parsedResult = null;

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiRes = await callGemini(userPrompt, systemPrompt);
        parsedResult = safeJsonParse(geminiRes);
      } catch (err) {
        console.warn('Gemini simulator generation failed:', err.message);
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
        console.warn('Groq simulator generation failed:', err.message);
      }
    }

    // Fallback if parsing fails
    if (!parsedResult) {
      parsedResult = {
        simulationType: isCode ? 'code_stepper' : 'interactive_canvas',
        title: `${cleanTopic} Interactive Simulation`,
        description: `Explore the dynamic mechanics of ${cleanTopic} using live interactive controls.`,
        controls: [
          { id: 'param1', label: 'Primary Input Rate', min: 0, max: 100, default: 50, unit: '%' },
          { id: 'param2', label: 'System Temperature / Capacity', min: 0, max: 100, default: 30, unit: 'units' }
        ],
        canvasStates: [
          {
            condition: 'default',
            statusTitle: 'Normal Reaction Rate',
            outputRate: '50% Yield Output',
            activeElements: ['input_valve', 'reaction_chamber', 'output_port'],
            explanation: 'Operational state at standard parameter levels.'
          },
          {
            condition: 'high_intensity',
            statusTitle: 'Peak Performance State',
            outputRate: '95% Max Production Rate',
            activeElements: ['turbo_chamber', 'peak_energy_flow', 'active_catalyst'],
            explanation: 'Maximum throughput achieved with optimized input values.'
          }
        ],
        codeStepperData: {
          code: [`for i in range(1, 4):`, `    print(f'Execution step {i}')`],
          steps: [
            { line: 1, variables: { i: 1 }, output: [], explanation: 'Initial iteration i = 1.' },
            { line: 2, variables: { i: 1 }, output: ['Execution step 1'], explanation: 'Print statement executes.' }
          ]
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
    });
  } catch (error) {
    console.error('Simulator API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate simulation configuration.' },
      { status: 500 }
    );
  }
}
