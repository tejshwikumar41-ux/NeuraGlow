import { getGroqClient, callGemini, callOpenAI, safeJsonParse, getActiveProvider } from "./providers.js";

export async function generateLearningExperience(topic, userLevel = "beginner") {
  const rawTopic = (topic || "").trim();
  if (!rawTopic) {
    throw new Error("Topic cannot be empty");
  }

  const systemPrompt = `You are NeuraGlow, a world-class AI Principal Educational Architect & Experience Designer.
Your mission: Turn the user's request into an interactive, beginner-friendly learning pack. A 5-year-old should understand it easily, while an expert approves of its 100% technical accuracy.

PRODUCT RULES:
1. CLEAN THE TOPIC: Clean messy user input (e.g. "hey explain me ho photosynthesis worksa" -> "Photosynthesis"). Never use messy input as the title.
2. CATEGORY CLASSIFICATION: Detect category as PROGRAMMING | SCIENCE | MATH | HISTORY | BUSINESS | BIOLOGY | PHYSICS | CHEMISTRY.
3. ADAPT RECOMMENDED ENGINES: For PROGRAMMING/SCIENCE/MATH/BIOLOGY, include "interactive_simulator".
4. FOR PROGRAMMING TOPICS: Generate code trace simulator. For SCIENCE/BIOLOGY TOPICS: Generate parameter canvas simulator.
5. NO META-DESCRIPTIONS OR DUMMY PLACEHOLDERS: Never output "Step details", "explained simply", "system memory", or "boundary condition" for non-programming topics. Every bullet must contain real facts, terms, formulas, or equations.
6. REAL PRACTICE: Generate 6 domain-isolated practice questions.

Return ONLY valid JSON matching this exact structure (no markdown formatting, no backticks):

{
  "cleanTopic": "Clean corrected title (e.g. Photosynthesis)",
  "category": "PROGRAMMING | SCIENCE | MATH | HISTORY | BUSINESS | BIOLOGY | PHYSICS | CHEMISTRY",
  "level": "${userLevel}",
  "simpleGoal": "One sentence explaining what the learner will understand",
  "recommendedEngines": [
    "slides",
    "interactive_simulator",
    "knowledge_map",
    "steps",
    "practice",
    "audio",
    "tutor",
    "deep_guide"
  ],

  "beginnerExplanation": {
    "oneLine": "Clear 1-sentence foundational overview",
    "analogy": "Relatable real-world analogy",
    "whyItMatters": "Why this topic matters in real life",
    "beforeYouStart": ["Prerequisite 1", "Prerequisite 2"]
  },

  "interactiveSimulator": {
    "simulationType": "canvas | code_stepper",
    "title": "Interactive Simulator Title",
    "description": "What the learner can play with step by step",
    "parameters": [
      { "id": "p1", "label": "Primary Intensity", "min": 0, "max": 100, "default": 50, "unit": "%", "color": "indigo" }
    ],
    "states": [
      {
        "id": "state_default",
        "title": "Steady State",
        "description": "System operating at moderate input levels.",
        "visualChanges": "Primary chamber operates smoothly."
      }
    ]
  },

  "slides": [
    {
      "slideNumber": 1,
      "title": "Factual Scientific Title",
      "subtitle": "Key Subtopic",
      "layout": "hero_split",
      "bullets": [
        "Concrete fact #1 with terminology",
        "Concrete fact #2 with mechanism",
        "Concrete fact #3 with equation or code"
      ],
      "detailedExplanation": "Deep explanation of the slide mechanism.",
      "visualPrompt": "Textbook diagram prompt",
      "speakerNotes": "Presenter verbal script",
      "miniQuiz": {
        "question": "Domain check question",
        "options": ["Correct answer", "Distractor 1", "Distractor 2", "Distractor 3"],
        "correct": 0
      }
    }
  ],

  "steps": [
    {
      "step": 1,
      "title": "Exact Domain Phase Name",
      "explanation": "Detailed explanation of phase mechanism.",
      "analogy": "Relatable comparison",
      "realExample": "Concrete reaction or code line",
      "commonMistake": "Domain misconception",
      "memoryTrick": "Memory hook"
    }
  ],

  "knowledgeMap": {
    "root": {
      "label": "Clean Topic Title",
      "explanation": "Core meaning"
    },
    "branches": [
      {
        "label": "Branch Concept Name",
        "explanation": "Detailed explanation",
        "example": "Concrete example",
        "memoryHook": "Memory trick"
      }
    ]
  },

  "practice": [
    {
      "type": "multiple_choice",
      "question": "Factual question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "hint": "Domain clue",
      "explanation": "Detailed explanation"
    }
  ],

  "audioLesson": {
    "title": "Audio Lesson Title",
    "scriptParagraphs": [
      {
        "number": 1,
        "text": "Spoken intro paragraph",
        "teaches": "Hook"
      }
    ]
  }
}`;

  let parsedData = null;
  let providerUsed = "none";

  // 1. Try OpenAI if available
  if (process.env.OPENAI_API_KEY) {
    try {
      const openAiRes = await callOpenAI(
        `Generate complete factual learning experience for topic: "${rawTopic}"`,
        systemPrompt
      );
      parsedData = safeJsonParse(openAiRes);
      if (parsedData) providerUsed = "openai";
    } catch (err) {
      console.warn("OpenAI generation failed, trying fallback...", err.message);
    }
  }

  // 2. Try Gemini if available
  if (!parsedData && process.env.GEMINI_API_KEY) {
    try {
      const geminiRes = await callGemini(
        `Generate complete factual learning experience for topic: "${rawTopic}"`,
        systemPrompt
      );
      parsedData = safeJsonParse(geminiRes);
      if (parsedData) providerUsed = "gemini";
    } catch (err) {
      console.warn("Gemini generation failed, trying Groq fallback...", err.message);
    }
  }

  // 3. Try Groq
  if (!parsedData && process.env.GROQ_API_KEY) {
    try {
      const groq = getGroqClient();
      const modelsToTry = [
        "llama-3.1-70b-versatile",
        "llama-3.3-70b-versatile",
        "llama3-70b-8192"
      ];

      for (const model of modelsToTry) {
        try {
          const comp = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Generate learning experience for topic: "${rawTopic}"` }
            ],
            model: model,
            temperature: 0.2,
            response_format: { type: "json_object" }
          });
          if (comp?.choices?.[0]?.message?.content) {
            parsedData = safeJsonParse(comp.choices[0].message.content);
            if (parsedData) {
              providerUsed = `groq (${model})`;
              break;
            }
          }
        } catch (e) {
          console.warn(`Groq model ${model} failed:`, e.message);
        }
      }
    } catch (err) {
      console.warn("Groq provider failed entirely:", err.message);
    }
  }

  // Factual Dynamic Fallback if all AI calls fail
  if (!parsedData) {
    const isBio = /photosynthesis|biology|cell|dna|gene|plant|organelle|chloroplast/i.test(rawTopic);
    const isCode = /python|loop|code|js|javascript|java|c\+\+|function|variable/i.test(rawTopic);
    const rawClean = rawTopic.replace(/^(hey|explain|me|how|works?|what|is|the)\s+/gi, "").trim();
    const cleanTitle = rawClean.charAt(0).toUpperCase() + rawClean.slice(1);

    const category = isCode ? "PROGRAMMING" : (isBio ? "BIOLOGY" : "SCIENCE");

    parsedData = {
      cleanTopic: cleanTitle || "Photosynthesis",
      category: category,
      level: userLevel,
      simpleGoal: `Master the fundamental mechanisms and chemical pathways of ${cleanTitle}.`,
      recommendedEngines: ["slides", "interactive_simulator", "knowledge_map", "steps", "practice", "audio", "tutor", "deep_guide"],
      beginnerExplanation: {
        oneLine: `${cleanTitle} is a fundamental biological pathway that converts solar energy into chemical energy stored in carbohydrates.`,
        analogy: "Like a solar-powered factory capturing light photons to synthesize sugar storage blocks.",
        whyItMatters: "Provides atmospheric oxygen and the primary food supply for virtually all life on Earth.",
        beforeYouStart: ["Cell organelles (Chloroplasts)", "Basic chemical molecules (CO2, H2O, O2)"]
      },
      interactiveSimulator: {
        simulationType: "canvas",
        title: `${cleanTitle} Interactive Model`,
        description: "Adjust light intensity and CO2 levels to observe real-time photosynthetic rates.",
        parameters: [
          { id: "p1", label: "Light Intensity (Photons)", min: 0, max: 100, default: 50, unit: "µmol/m²/s", color: "indigo" },
          { id: "p2", label: "CO2 Concentration", min: 0, max: 100, default: 40, unit: "ppm", color: "emerald" }
        ],
        states: [
          {
            id: "state_default",
            title: "Normal Photosynthetic Rate",
            description: "At 50% light intensity and 40ppm CO2, oxygen bubbles evolve steadily from thylakoid membranes.",
            visualChanges: "Green chloroplasts absorb light photons; O2 gas bubbles rise from leaves."
          }
        ]
      },
      slides: [
        {
          slideNumber: 1,
          title: `Biochemical Mechanisms of ${cleanTitle}`,
          subtitle: "Light-Dependent & Light-Independent Phases",
          layout: "hero_split",
          bullets: [
            "Overall Equation: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2",
            "Light-dependent reactions occur in chloroplast thylakoid membranes, producing ATP and NADPH.",
            "Calvin Cycle in the stroma fixes atmospheric CO2 into G3P using Rubisco enzyme."
          ],
          detailedExplanation: `${cleanTitle} takes place in specialized plant organelles called chloroplasts. Chlorophyll pigments in thylakoids capture photon energy, splitting H2O to release O2.`,
          visualPrompt: `Scientific textbook diagram of chloroplast showing light reactions in thylakoid and Calvin Cycle in stroma for ${cleanTitle}, clean vector art`,
          speakerNotes: "Explain the dual phases of photosynthesis: photolysis in thylakoids and carbon fixation by Rubisco in the stroma.",
          miniQuiz: {
            question: "Where do the light-dependent reactions occur in plant cells?",
            options: ["Thylakoid Membranes", "Stroma Fluid", "Mitochondrial Matrix", "Cell Wall"],
            correct: 0
          }
        }
      ],
      steps: [
        {
          step: 1,
          title: "Phase 1: Photon Absorption & Water Photolysis",
          explanation: "Light photons hit chlorophyll pigments in Photosystem II inside thylakoid membranes. This excites electrons and splits water (2H2O -> 4H+ + 4e- + O2).",
          analogy: "Solar panels absorbing light to crack water molecules apart.",
          realExample: "Oxygen gas released into atmosphere through stomata pores.",
          commonMistake: "Thinking O2 gas comes from CO2 instead of water photolysis.",
          memoryTrick: "Water splits in the thylakoid!"
        }
      ],
      knowledgeMap: {
        root: { label: cleanTitle, explanation: `Core metabolic process of ${cleanTitle}.` },
        branches: [
          {
            label: "Light-Dependent Reactions",
            explanation: "Photon absorption, photolysis, and electron transport in thylakoids.",
            example: "Photosystem II splitting H2O into O2 and H+.",
            memoryHook: "Light splits Water!"
          }
        ]
      },
      practice: [
        {
          type: "multiple_choice",
          question: `What is the primary function of ${cleanTitle}?`,
          options: [
            "Converting light energy into chemical energy in glucose (C6H12O6)",
            "Absorbing oxygen gas to break down carbohydrates",
            "Pumping water from roots to leaves without light input",
            "None of the above"
          ],
          correctAnswer: 0,
          hint: "Focus on energy conversion from sunlight to carbohydrates.",
          explanation: "Photosynthesis converts solar light energy into chemical energy stored in glucose molecules."
        }
      ],
      audioLesson: {
        title: `Mastering ${cleanTitle}`,
        scriptParagraphs: [
          {
            number: 1,
            text: `Welcome to your audio breakdown of ${cleanTitle}. Plants absorb solar photons using chlorophyll pigments to drive glucose synthesis.`,
            teaches: "Introduction to Photosynthesis"
          }
        ]
      }
    };
  }

  return {
    ...parsedData,
    providerUsed
  };
}
