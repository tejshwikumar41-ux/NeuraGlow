import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(request) {
  let reqTopic = '';
  try {
    const body = await request.json();
    const topic = body?.topic;
    reqTopic = topic;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'Valid topic string is required' }, { status: 400 });
    }

    // 1. DYNAMIC TOPIC CLEANING & DOMAIN CLASSIFICATION
    const cleanTopic = sanitizeUserTopic(topic);
    const domainProfile = classifyDomain(cleanTopic);

    // 2. BUILD DYNAMIC SYSTEM PROMPT (No hardcoded topics)
    const systemPrompt = `You are NeuraGlow, a world-class educational AI. 
Build a comprehensive learning package for the topic: "${cleanTopic}".
Domain: ${domainProfile.domain}.

CONSTRAINT RULES:
- Math Formulas Allowed: ${domainProfile.allowMath ? 'YES' : 'STRICTLY NO (Do not include LaTeX equations, calculus, or symbols like \\Psi, \\frac, \\int)'}
- Code Snippets Allowed: ${domainProfile.allowCode ? 'YES (Provide real, working code)' : 'STRICTLY NO'}
- Tone & Focus: ${domainProfile.instructions}

Return ONLY a raw JSON object (no markdown, no backticks, no code fences) with this EXACT structure:
{
  "cleanTopic": "${cleanTopic}",
  "category": "${domainProfile.domain}",
  "summary": "Comprehensive 2-3 sentence overview of ${cleanTopic} written for a beginner.",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Title of Slide 1",
      "subtitle": "Subtitle",
      "bullets": [
        "Factual, specific bullet point 1 about ${cleanTopic}",
        "Factual, specific bullet point 2 about ${cleanTopic}",
        "Factual, specific bullet point 3 about ${cleanTopic}"
      ],
      "detailedExplanation": "Deep 3-sentence explanation of this slide's concept.",
      "visualPrompt": "Educational diagram of ${cleanTopic}, clean vector style, white background",
      "speakerNotes": "What an educator says when presenting this slide.",
      "miniQuiz": {
        "question": "Domain-specific check question about ${cleanTopic}?",
        "options": ["Correct Answer", "Wrong Option 1", "Wrong Option 2", "Wrong Option 3"],
        "correct": 0
      }
    },
    {
      "slideNumber": 2,
      "title": "Mechanisms & Key Features",
      "subtitle": "How It Works",
      "bullets": [
        "Key operational aspect 1 of ${cleanTopic}",
        "Key operational aspect 2 of ${cleanTopic}",
        "Key operational aspect 3 of ${cleanTopic}"
      ],
      "detailedExplanation": "Detailed explanation of the inner workings and principles.",
      "visualPrompt": "Detailed technical diagram of ${cleanTopic}, white background",
      "speakerNotes": "Pay close attention to how these mechanisms interact.",
      "miniQuiz": {
        "question": "Key mechanism question?",
        "options": ["Correct Option", "Incorrect 1", "Incorrect 2", "Incorrect 3"],
        "correct": 0
      }
    },
    {
      "slideNumber": 3,
      "title": "Applications & Real-World Impact",
      "subtitle": "Practical Significance",
      "bullets": [
        "Real-world application 1",
        "Real-world application 2",
        "Significance in the field"
      ],
      "detailedExplanation": "Why understanding ${cleanTopic} is essential in practice.",
      "visualPrompt": "Real-world application illustration of ${cleanTopic}, white background",
      "speakerNotes": "In practice, this concept governs major outcomes.",
      "miniQuiz": {
        "question": "Practical impact question?",
        "options": ["Correct Option", "Incorrect 1", "Incorrect 2", "Incorrect 3"],
        "correct": 0
      }
    }
  ],
  "steps": [
    {
      "step": 1,
      "title": "Phase 1: Foundation",
      "simpleExplanation": "Clear, deep explanation of phase 1 for ${cleanTopic}.",
      "analogy": "Relatable real-world analogy.",
      "realExample": "Concrete practical example or case study.",
      "commonMistake": "Domain misconception to avoid.",
      "memoryTrick": "Key hook to remember"
    },
    {
      "step": 2,
      "title": "Phase 2: Core Mechanism",
      "simpleExplanation": "Clear explanation of phase 2.",
      "analogy": "Analogy for phase 2.",
      "realExample": "Example for phase 2.",
      "commonMistake": "Misconception for phase 2.",
      "memoryTrick": "Hook for phase 2."
    },
    {
      "step": 3,
      "title": "Phase 3: Advanced Application",
      "simpleExplanation": "Clear explanation of phase 3.",
      "analogy": "Analogy for phase 3.",
      "realExample": "Example for phase 3.",
      "commonMistake": "Misconception for phase 3.",
      "memoryTrick": "Hook for phase 3."
    }
  ],
  "quiz": [
    {
      "id": 1,
      "question": "Factual question testing knowledge of ${cleanTopic}?",
      "options": ["Correct Option", "Wrong Option 1", "Wrong Option 2", "Wrong Option 3"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why option 0 is correct.",
      "hint": "Domain clue"
    },
    {
      "id": 2,
      "question": "Second key question about ${cleanTopic}?",
      "options": ["Correct Option", "Wrong Option 1", "Wrong Option 2", "Wrong Option 3"],
      "correctAnswer": 0,
      "explanation": "Explanation for second question.",
      "hint": "Domain clue 2"
    }
  ],
  "audio": {
    "title": "Mastering ${cleanTopic} in 5 Minutes",
    "paragraphs": [
      "Welcome to NeuraGlow. Today we're exploring ${cleanTopic}.",
      "First, let's understand the basic principle behind ${cleanTopic}.",
      "Next, we look at how ${cleanTopic} functions in detail.",
      "Furthermore, ${cleanTopic} has significant real-world applications.",
      "In conclusion, mastering ${cleanTopic} provides a powerful foundation for learning."
    ]
  },
  "deepResearch": {
    "introduction": "In-depth academic introduction to ${cleanTopic}.",
    "coreMechanism": "Detailed breakdown of the core principles, causes, or structures.",
    "applications": ["Major application 1", "Major application 2", "Major application 3"],
    "misconceptions": ["Common misconception 1 and correction", "Common misconception 2 and correction"]
  }
}`;

    let rawAiText = null;

    // 3. MULTI-PROVIDER AI EXECUTION PIPELINE

    // Provider A: Groq (Blazing fast: gpt-oss-120b / qwen3.8-27b)
    if (groq) {
      const groqModels = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
      for (const m of groqModels) {
        if (rawAiText) break;
        try {
          const completion = await groq.chat.completions.create({
            model: m,
            messages: [
              { role: 'system', content: 'You output raw valid JSON without backticks or markdown fences.' },
              { role: 'user', content: systemPrompt }
            ],
            response_format: { type: 'json_object' }
          });
          rawAiText = completion.choices[0]?.message?.content;
        } catch (err) {
          console.warn(`Groq model ${m} failed:`, err.message);
        }
      }
    }

    // Provider B: Gemini 3.5 Flash Lite (Google AI Studio)
    if (!rawAiText && genAI) {
      const geminiModels = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'];
      for (const m of geminiModels) {
        if (rawAiText) break;
        try {
          const model = genAI.getGenerativeModel({ model: m });
          const result = await model.generateContent(systemPrompt);
          rawAiText = result.response.text();
        } catch (err) {
          console.warn(`Gemini model ${m} failed:`, err.message);
        }
      }
    }

    // Provider C: OpenRouter
    if (!rawAiText && process.env.OPENROUTER_API_KEY) {
      const orModels = ['liquid/lfm-2.5-2.6b:free', 'nvidia/nemotron-3.5-lightning:free'];
      for (const m of orModels) {
        if (rawAiText) break;
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: m,
              messages: [
                { role: 'system', content: 'You output raw valid JSON without markdown formatting.' },
                { role: 'user', content: systemPrompt }
              ],
              response_format: { type: 'json_object' }
            })
          });
          const jsonRes = await res.json();
          rawAiText = jsonRes.choices?.[0]?.message?.content;
        } catch (err) {
          console.warn(`OpenRouter model ${m} failed:`, err.message);
        }
      }
    }

    // 4. SELF-HEALING JSON PARSER & DOMAIN SANITIZER
    let parsedData = parseAndRepairJson(rawAiText);
    
    // Apply strict Domain Cross-Contamination Guardrails
    parsedData = sanitizeDomainBleed(parsedData, domainProfile);

    // 5. UNIVERSAL PROCEDURAL SYNTHESIZER (Runs ONLY if all network APIs fail)
    // Generates a structural package dynamically from input tokens. ZERO hardcoding!
    const finalPayload = ensureCompletePackage(parsedData, cleanTopic, domainProfile);

    return NextResponse.json(finalPayload);

  } catch (error) {
    console.error('Fatal API Route Error:', error);
    // Dynamic emergency fallback generated from input
    const fallbackTopic = sanitizeUserTopic(reqTopic || 'Educational Topic');
    const fallbackDomain = classifyDomain(fallbackTopic);
    return NextResponse.json(generateProceduralPayload(fallbackTopic, fallbackDomain));
  }
}

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS (ZERO HARDCODED TOPICS)
// ---------------------------------------------------------------------------

function sanitizeUserTopic(raw) {
  if (!raw || typeof raw !== 'string') return 'Educational Topic';
  let text = raw.trim()
    .replace(/^hey\s+/i, '')
    .replace(/^explain\s+(me\s+)?(ho\w*\s+)?(how\s+)?(about\s+)?/i, '')
    .replace(/\s+works?a?$/i, '');
  text = text.replace(/[^a-zA-Z0-9\s\-]/g, '').trim();
  if (!text) return 'Educational Topic';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function classifyDomain(topic) {
  const t = topic.toLowerCase();

  // History & Social Sciences
  if (/\b(revolution|war|history|empire|century|king|queen|president|treaty|rebellion|dynasty|battle|civilization|constitution|political|law|jurisprudence)\b/.test(t)) {
    return {
      domain: 'HISTORY',
      allowMath: false,
      allowCode: false,
      instructions: 'Focus on key dates, historical figures, social causes, political shifts, and long-term societal impacts. DO NOT use math equations or code.'
    };
  }

  // Computer Science & Programming
  if (/\b(python|code|java|javascript|c\+\+|algorithm|loop|recursion|function|class|react|node|database|sql|binary|tree|graph|data structure|api|git)\b/.test(t)) {
    return {
      domain: 'PROGRAMMING',
      allowMath: false,
      allowCode: true,
      instructions: 'Focus on working code syntax, execution logic, variable states, memory stack, and algorithmic complexity.'
    };
  }

  // Physics
  if (/\b(physics|motion|rotation|torque|gravity|quantum|force|velocity|acceleration|momentum|energy|thermodynamics|wave|optics|relativity|electromagnetism)\b/.test(t)) {
    return {
      domain: 'PHYSICS',
      allowMath: true,
      allowCode: false,
      instructions: 'Focus on physical laws, mathematical relationships, vectors, conservation principles, and experimental proofs.'
    };
  }

  // Chemistry
  if (/\b(chemistry|acid|base|atom|molecule|element|reaction|bond|compound|organic|periodic|solution|oxidation|stoichiometry)\b/.test(t)) {
    return {
      domain: 'CHEMISTRY',
      allowMath: true,
      allowCode: false,
      instructions: 'Focus on chemical formulas, molecular structures, reaction pathways, bonding types, and lab procedures.'
    };
  }

  // Biology & Life Sciences
  if (/\b(biology|cell|dna|rna|gene|photosynthesis|organ|organism|protein|enzyme|species|evolution|ecosystem|anatomy|microbiology)\b/.test(t)) {
    return {
      domain: 'BIOLOGY',
      allowMath: false,
      allowCode: false,
      instructions: 'Focus on biological mechanisms, cellular organelles, physiological processes, genetic inheritance, and ecological roles. DO NOT use physics calculus equations or computer code.'
    };
  }

  // Mathematics
  if (/\b(math|calculus|algebra|geometry|matrix|equation|integral|derivative|trigonometry|probability|statistics|theorem|number theory)\b/.test(t)) {
    return {
      domain: 'MATHEMATICS',
      allowMath: true,
      allowCode: false,
      instructions: 'Focus on rigorous definitions, step-by-step proofs, formulas, variable meanings, and geometric or graphical interpretations.'
    };
  }

  // General Knowledge Fallback
  return {
    domain: 'GENERAL',
    allowMath: false,
    allowCode: false,
    instructions: 'Focus on clear definitions, core mechanisms, practical examples, and real-world significance.'
  };
}

// Self-Healing JSON Parser (Fixes broken AI output)
function parseAndRepairJson(text) {
  if (!text || typeof text !== 'string') return null;
  
  // Clean markdown backticks
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  // Extract JSON string if wrapped in extra text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt basic repairs (fix trailing commas, unescaped newlines)
    try {
      const repaired = cleaned
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/[\r\n]+/g, ' ');
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

// Sanitizes Domain Bleed (e.g. Removes LaTeX math from History/Art topics)
function sanitizeDomainBleed(data, profile) {
  if (!data || typeof data !== 'object') return null;

  const jsonString = JSON.stringify(data);

  // If Math is NOT allowed, strip LaTeX equations like \frac, \int, \Psi, \frac{d\Psi}{dt}
  if (!profile.allowMath && /\\(frac|int|Psi|mathcal|d\Psi|theta|omega|alpha)/i.test(jsonString)) {
    let sanitized = jsonString.replace(/\\(frac|int|Psi|mathcal|d\Psi|theta|omega|alpha)(\{[^}]*\})*/gi, '');
    try {
      data = JSON.parse(sanitized);
    } catch {}
  }

  return data;
}

// Ensures payload is complete without hardcoding topic names
function ensureCompletePackage(parsed, topic, profile) {
  const procedural = generateProceduralPayload(topic, profile);
  if (!parsed) return procedural;

  return {
    cleanTopic: parsed.cleanTopic || topic,
    category: parsed.category || profile.domain,
    summary: parsed.summary || procedural.summary,
    recommendedEngines: ['simulator', 'slides', 'steps', 'quiz', 'knowledge', 'audio', 'research'],
    slides: Array.isArray(parsed.slides) && parsed.slides.length >= 2 ? parsed.slides : procedural.slides,
    steps: Array.isArray(parsed.steps) && parsed.steps.length >= 2 ? parsed.steps : procedural.steps,
    quiz: Array.isArray(parsed.quiz) && parsed.quiz.length >= 2 ? parsed.quiz : procedural.quiz,
    audio: parsed.audio?.paragraphs ? parsed.audio : procedural.audio,
    deepResearch: parsed.deepResearch?.introduction ? parsed.deepResearch : procedural.deepResearch
  };
}

// PROCEDURAL SYNTHESIZER (Generates structure dynamically from input tokens - NO HARDCODED TOPICS)
function generateProceduralPayload(topic, profile) {
  return {
    cleanTopic: topic,
    category: profile.domain,
    summary: `${topic} is a core subject in ${profile.domain.toLowerCase()} that defines fundamental principles and practical outcomes.`,
    recommendedEngines: ['simulator', 'slides', 'steps', 'quiz', 'knowledge', 'audio', 'research'],
    slides: [
      {
        slideNumber: 1,
        title: `Introduction to ${topic}`,
        subtitle: `Foundational Principles`,
        bullets: [
          `Core concept defining how ${topic} operates.`,
          `Primary drivers and influential factors shaping ${topic}.`,
          `Essential background required to master this topic.`
        ],
        detailedExplanation: `Understanding ${topic} provides the foundation for broader study in ${profile.domain.toLowerCase()}.`,
        visualPrompt: `Educational diagram of ${topic}, vector illustration, white background`,
        speakerNotes: `Welcome. Today we break down ${topic}. Pay attention to how these foundational elements connect.`,
        miniQuiz: {
          question: `What is the primary focus of ${topic}?`,
          options: [`Understanding core principles`, `Unrelated noise`, `Static non-factor`, `None`],
          correct: 0
        }
      },
      {
        slideNumber: 2,
        title: `Key Mechanisms & Structure`,
        subtitle: `How It Functions`,
        bullets: [
          `First major component governing ${topic}.`,
          `Secondary process and interaction dynamics.`,
          `Expected behavior under standard conditions.`
        ],
        detailedExplanation: `By breaking ${topic} down into its key mechanisms, we can predict outcomes accurately.`,
        visualPrompt: `Detailed structural diagram of ${topic}, clean white background`,
        speakerNotes: `Notice the relationship between the inputs and final output.`,
        miniQuiz: {
          question: `How do the core mechanisms affect ${topic}?`,
          options: [`Directly dictate system outcomes`, `Have no impact`, `Random effect`, `Cancel out`],
          correct: 0
        }
      },
      {
        slideNumber: 3,
        title: `Real-World Impact & Applications`,
        subtitle: `Practical Context`,
        bullets: [
          `Major practical application 1 of ${topic}.`,
          `Broader influence across real-world systems.`,
          `Why professionals and students study this topic.`
        ],
        detailedExplanation: `Mastering ${topic} allows practical application in academic and real-world environments.`,
        visualPrompt: `Real-world application illustration of ${topic}, white background`,
        speakerNotes: `In practice, this principle is applied daily across the field.`,
        miniQuiz: {
          question: `Why is ${topic} studied today?`,
          options: [`For practical application and mastery`, `No reason`, `Purely accidental`, `Obsolete knowledge`],
          correct: 0
        }
      }
    ],
    steps: [
      {
        step: 1,
        title: `Phase 1: Basic Definition`,
        simpleExplanation: `Grasp the initial definition and scope of ${topic}.`,
        analogy: `Like learning the rules before playing a game.`,
        realExample: `Fundamental observation of ${topic} in action.`,
        commonMistake: `Skipping foundational terms before studying advanced parts.`,
        memoryTrick: `Focus on the core meaning first!`
      },
      {
        step: 2,
        title: `Phase 2: Inner Mechanics`,
        simpleExplanation: `Explore how the internal components or rules of ${topic} interact.`,
        analogy: `Like looking inside a clock to see the gears turning.`,
        realExample: `Operational example of ${topic}.`,
        commonMistake: `Confusing cause with effect.`,
        memoryTrick: `Inputs lead to outputs!`
      },
      {
        step: 3,
        title: `Phase 3: Mastery & Synthesis`,
        simpleExplanation: `Apply knowledge of ${topic} to solve problems or analyze scenarios.`,
        analogy: `Using a tool proficiently after practicing.`,
        realExample: `Advanced application of ${topic}.`,
        commonMistake: `Ignoring edge cases or exceptions.`,
        memoryTrick: `Practice makes permanent!`
      }
    ],
    quiz: [
      {
        id: 1,
        question: `What is the most important starting point for understanding ${topic}?`,
        options: [`Mastering the core principles`, `Memorizing random facts`, `Ignoring basic definitions`, `Guessing`],
        correctAnswer: 0,
        explanation: `A solid grasp of core principles is required before moving to advanced applications.`,
        hint: `Start with the foundational definition.`
      },
      {
        id: 2,
        question: `How is ${topic} applied in real-world scenarios?`,
        options: [`To solve problems and analyze outcomes`, `It has no real-world use`, `Only in theoretical void`, `None`],
        correctAnswer: 0,
        explanation: `${topic} provides practical tools and frameworks for solving real problems.`,
        hint: `Think about practical impact.`
      }
    ],
    audio: {
      title: `Understanding ${topic}`,
      paragraphs: [
        `Welcome to NeuraGlow. Today we're exploring ${topic}.`,
        `First, let's understand why ${topic} is so important in ${profile.domain.toLowerCase()}.`,
        `Next, we break down the core mechanisms that make ${topic} function.`,
        `In practice, ${topic} plays a vital role in solving real-world challenges.`,
        `By remembering these key principles, you've taken a major step toward mastering ${topic}.`
      ]
    },
    deepResearch: {
      introduction: `${topic} is a significant subject within ${profile.domain.toLowerCase()}.`,
      coreMechanism: `Detailed breakdown of how ${topic} functions according to established principles.`,
      applications: [
        `Primary application of ${topic} in industry/academics.`,
        `Secondary application in modern systems.`,
        `Future development related to ${topic}.`
      ],
      misconceptions: [
        `Misconception: ${topic} is purely theoretical. Correction: It has widespread practical applications.`,
        `Misconception: ${topic} operates randomly. Correction: It follows strict governing principles.`
      ]
    }
  };
}
