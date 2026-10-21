import { callUniversalLLM } from '@/lib/ai/universalAI';

export async function generateUniversalLearningPackage(topic, blueprint) {
  const domain = blueprint.domain || 'general';
  const topicType = blueprint.topic_type || 'concept';
  const simType = blueprint.best_simulation_type || 'data_sliders';
  const tone = blueprint.appropriate_tone || 'conversational';

  const systemPrompt = `You are NeuraGlow's Universal Curriculum Architect and Lead Professor.
You build deep, authentic, topic-agnostic learning packages for ANY subject in human knowledge.

TOPIC: "${topic}"
DOMAIN: ${domain} (${blueprint.sub_domain})
TOPIC TYPE: ${topicType}
APPROPRIATE TONE: ${tone}
RECOMMENDED SIMULATOR: ${simType}
NEEDS FORMULAS: ${blueprint.requires?.mathematical_formulas}
NEEDS TIMELINE: ${blueprint.requires?.historical_timeline}
NEEDS CODE: ${blueprint.requires?.code_examples}
BEST ANALOGIES FROM: ${(blueprint.best_analogies_from || []).join(', ')}

CRITICAL ADAPTATION RULES:
1. If HISTORY / EVENT / PERSON:
   - Simulation MUST be "historical_scenario" or "decision_tree" (give real decision dilemmas with choices, faction impacts, and historical reality).
   - Slides & steps must cite exact dates, locations, turning points, and key figures.
   - Zero fake science equations.
2. If PROGRAMMING / TECH / ALGORITHM:
   - Simulation MUST be "code_sandbox" (provide actual working code, line execution steps, and variable state traces).
   - Slides & steps must explain syntax, runtime complexity O(n), and memory state.
3. If SCIENCE / PHYSICS / CHEMISTRY / BIOLOGY:
   - Simulation MUST be "physics_engine" or "data_sliders" (provide 3 realistic parameters with units, live metric formulas, and 3 state phases).
   - Explain biological structures, physical laws, or chemical reactions.
4. If MATHEMATICS:
   - Simulation MUST be "mathematical_plot" or "data_sliders" (formula, variable parameters, and geometric analysis).
   - Include rigorous definitions, proofs, and computational examples.
5. If LITERATURE / PHILOSOPHY / ARTS:
   - Simulation MUST be "historical_scenario" or "decision_tree" or "concept_explorer" (philosophical dilemma, literary choice point, or dialectic dial).

Return ONLY a strict raw JSON object with this EXACT structure:
{
  "cleanTopic": "${topic}",
  "category": "${domain.toUpperCase()}",
  "summary": "2-3 sentence rigorous summary explaining this concept.",
  "simulation": {
    "type": "${simType}",
    "title": "Interactive Simulator Title for ${topic}",
    "description": "Clear explanation of how the user interacts with this model.",
    "role": "Role of the user (e.g. 'Commander in 1789', 'Lead Engineer', 'Physicist', 'Observer')",
    "scenarioContext": "Setting the stage for the interactive model.",
    "decisionPoints": [
      {
        "id": "dp1",
        "stageTitle": "Critical Turning Point / Dilemma 1",
        "situation": "Detailed historical/practical crisis description.",
        "choices": [
          {
            "id": "c1",
            "text": "Specific decision action A",
            "historicalNote": "Consequence or historical parallel of action A",
            "impact": { "public": 10, "resources": -15, "stability": -5 }
          },
          {
            "id": "c2",
            "text": "Specific decision action B",
            "historicalNote": "Consequence or historical parallel of action B",
            "impact": { "public": -20, "resources": 10, "stability": 15 }
          }
        ],
        "historicalTruth": "What actually happened in reality at this moment."
      }
    ],
    "factions": [
      { "id": "public", "name": "Public / Society", "initial": 50 },
      { "id": "resources", "name": "Treasury / Resources", "initial": 60 },
      { "id": "stability", "name": "Order / Stability", "initial": 55 }
    ],
    "controls": [
      { "id": "param1", "label": "Key Variable 1", "min": 1, "max": 100, "step": 1, "default": 50, "unit": "unit", "description": "What this controls" },
      { "id": "param2", "label": "Key Variable 2", "min": 0, "max": 10, "step": 0.5, "default": 2.5, "unit": "unit", "description": "What this controls" },
      { "id": "param3", "label": "Key Variable 3", "min": 1, "max": 500, "step": 10, "default": 200, "unit": "unit", "description": "What this controls" }
    ],
    "metrics": [
      { "label": "Governing Output 1", "formula": "Mathematical or relational formula", "effect": "How it reacts to input" },
      { "label": "Governing Output 2", "formula": "Mathematical or relational formula", "effect": "How it reacts to input" }
    ],
    "stages": [
      { "title": "Baseline Phase", "description": "System state under standard conditions" },
      { "title": "Dynamic Reaction", "description": "Active steady state as inputs increase" },
      { "title": "Critical Boundary", "description": "Equilibrium or saturation threshold" }
    ],
    "codeSandbox": {
      "language": "python",
      "code": ["def algorithm(n):", "    # line 1", "    return result"],
      "executionTrace": [
        { "line": 0, "active": "def algorithm(n):", "variables": { "n": 5 }, "note": "Function invoked" }
      ]
    },
    "mathPlot": {
      "expression": "f(x) = a * sin(b * x)",
      "parameters": [{ "id": "a", "label": "Amplitude", "default": 1 }, { "id": "b", "label": "Frequency", "default": 2 }],
      "analysis": "Geometric and analytical properties."
    }
  },
  "notes": {
    "title": "Comprehensive Textbook Chapter: ${topic}",
    "estimatedReadingMinutes": 20,
    "sections": [
      {
        "id": "sec1",
        "heading": "Section 1 Title",
        "subheadings": [
          {
            "title": "Subsection 1.1",
            "content": "Detailed, rich educational markdown content (minimum 3 paragraphs) covering mechanisms, evidence, and nuance.",
            "keyTerms": ["Term 1", "Term 2"],
            "analogies": ["Intuitive analogy used here"],
            "visualSuggestion": "Diagram or historical photo description"
          }
        ]
      },
      {
        "id": "sec2",
        "heading": "Section 2 Title",
        "subheadings": [
          {
            "title": "Subsection 2.1",
            "content": "Detailed educational markdown content exploring deeper mechanisms and examples.",
            "keyTerms": ["Term 3"],
            "analogies": ["Analogy"],
            "visualSuggestion": "Visual description"
          }
        ]
      },
      {
        "id": "sec3",
        "heading": "Section 3 Title: Applications & Interpretations",
        "subheadings": [
          {
            "title": "Subsection 3.1",
            "content": "Real-world relevance, case studies, or historical legacy.",
            "keyTerms": ["Term 4"],
            "analogies": [],
            "visualSuggestion": "Visual description"
          }
        ]
      }
    ],
    "glossary": [
      { "term": "Key Term 1", "definition": "Clear concise definition", "context": "How it connects to ${topic}" },
      { "term": "Key Term 2", "definition": "Clear concise definition", "context": "Context" }
    ],
    "keyTakeaways": [
      "Key summary takeaway 1",
      "Key summary takeaway 2",
      "Key summary takeaway 3"
    ],
    "deeperReading": [
      "Seminal book or primary paper title",
      "Authoritative reference or documentary"
    ]
  },
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "subtitle": "Subtitle",
      "bullets": [
        "Concrete fact #1 with real terminology and evidence",
        "Concrete fact #2 with mechanism, dates, or formula",
        "Concrete fact #3 with real-world implication"
      ],
      "detailedExplanation": "Deep paragraph explanation for this slide.",
      "visualPrompt": "Textbook illustration of ${topic}, clean white background",
      "speakerNotes": "Lecture delivery talking points for a professor.",
      "miniQuiz": { "question": "Check question?", "options": ["Ans A", "Ans B", "Ans C", "Ans D"], "correct": 0 }
    }
  ],
  "steps": [
    {
      "step": 1,
      "title": "Phase 1: Foundation",
      "simpleExplanation": "Clear, accessible breakdown of this phase.",
      "analogy": "Intuitive real-world analogy.",
      "realExample": "Concrete calculation, code line, or historical event.",
      "commonMistake": "Domain misconception to avoid.",
      "memoryTrick": "Memorable mnemonic or mental hook."
    }
  ],
  "quiz": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Rigorous question testing core principle or causality?",
      "options": ["Correct Option", "Wrong Distractor 1", "Wrong Distractor 2", "Wrong Distractor 3"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why the correct option is right.",
      "wrongChoiceExplanations": {
        "1": "Why distractor 1 is common misconception",
        "2": "Why distractor 2 is incorrect",
        "3": "Why distractor 3 is incorrect"
      },
      "hint": "Progressive clue to guide the learner.",
      "relatedConcept": "Subtopic to review if missed"
    }
  ],
  "audio": {
    "title": "Mastering ${topic} in 5 Minutes",
    "paragraphs": [
      "Paragraph 1: Compelling narrative hook, setting the historical or scientific stage.",
      "Paragraph 2: Deep dive into the central mechanism, conflict, or law.",
      "Paragraph 3: Key turning points, edge cases, and real-world implications.",
      "Paragraph 4: Lasting legacy, philosophical takeaway, or modern applications."
    ]
  }
}`;

  const prompt = `Generate the comprehensive learning package for: "${topic}".
Follow the blueprint strictly. Ensure 4 detailed slides, 4 progressive steps, 4 quiz questions, 4 audio paragraphs, and a minimum of 3 deep notes sections.
Output raw JSON only.`;

  const pkg = await callUniversalLLM({
    prompt,
    systemPrompt,
    json: true,
    temperature: 0.25,
    max_tokens: 4000,
  });

  return sanitizePackage(pkg, topic, blueprint);
}

function sanitizePackage(pkg, topic, blueprint) {
  const domain = blueprint.domain || 'general';

  // Ensure simulation structure is robust
  const sim = pkg?.simulation || {};
  const isHistorical = blueprint.best_simulation_type === 'historical_scenario' || domain === 'history' || blueprint.topic_type === 'event';

  const sanitizedSim = {
    type: sim.type || blueprint.best_simulation_type || (isHistorical ? 'historical_scenario' : 'data_sliders'),
    title: sim.title || `Interactive Simulation: ${topic}`,
    description: sim.description || `Interactive model demonstrating ${topic}.`,
    role: sim.role || (isHistorical ? `Historical Decision Maker in ${topic}` : `Lead Investigator of ${topic}`),
    scenarioContext: sim.scenarioContext || `Explore the key dynamics, turning points, and trade-offs of ${topic}.`,
    decisionPoints: Array.isArray(sim.decisionPoints) && sim.decisionPoints.length > 0 ? sim.decisionPoints : [
      {
        id: 'dp1',
        stageTitle: `Critical Turning Point in ${topic}`,
        situation: `A pivotal juncture in ${topic} where strategic choices defined the outcome.`,
        choices: [
          {
            id: 'c1',
            text: `Adopt progressive reform / active initiative in ${topic}`,
            historicalNote: `Emphasizes long-term adaptation with immediate reallocation of resources.`,
            impact: { public: 15, resources: -10, stability: 5 }
          },
          {
            id: 'c2',
            text: `Enforce traditional controls / consolidate power in ${topic}`,
            historicalNote: `Maintains existing structures but heightens systemic friction over time.`,
            impact: { public: -15, resources: 10, stability: -10 }
          }
        ],
        historicalTruth: `Historically, dynamic compromises and emerging pressures shaped the eventual trajectory of ${topic}.`
      }
    ],
    factions: Array.isArray(sim.factions) && sim.factions.length > 0 ? sim.factions : [
      { id: 'public', name: 'Public Sentiment', initial: 50 },
      { id: 'resources', name: 'Resource Capacity', initial: 60 },
      { id: 'stability', name: 'System Stability', initial: 55 }
    ],
    controls: Array.isArray(sim.controls) && sim.controls.length > 0 ? sim.controls : [
      { id: 'intensity', label: 'System Intensity', min: 1, max: 100, step: 1, default: 50, unit: '%', description: 'Core operational drive' },
      { id: 'scale', label: 'Domain Magnitude', min: 1, max: 10, step: 0.5, default: 5, unit: 'x', description: 'Scope of interaction' }
    ],
    metrics: Array.isArray(sim.metrics) && sim.metrics.length > 0 ? sim.metrics : [
      { label: 'System Equilibrium', formula: 'E = f(inputs)', effect: 'Maintains balance as parameters change' }
    ],
    stages: Array.isArray(sim.stages) && sim.stages.length > 0 ? sim.stages : [
      { title: 'Baseline State', description: `Initial setup of ${topic}` },
      { title: 'Active Transition', description: `Dynamic equilibrium under steady inputs` },
      { title: 'Peak Equilibrium', description: `Boundary limit or peak saturation` }
    ],
    codeSandbox: sim.codeSandbox || null,
    mathPlot: sim.mathPlot || null
  };

  return {
    cleanTopic: pkg?.cleanTopic || topic,
    category: pkg?.category || domain.toUpperCase(),
    summary: pkg?.summary || `Comprehensive guide to ${topic}.`,
    blueprint,
    simulation: sanitizedSim,
    notes: pkg?.notes || {
      title: `Study Chapter: ${topic}`,
      estimatedReadingMinutes: 15,
      sections: [
        {
          id: 'sec1',
          heading: `Introduction & Foundational Context`,
          subheadings: [
            {
              title: `Core Overview`,
              content: pkg?.summary || `${topic} is a significant subject in ${domain}.`,
              keyTerms: [topic],
              analogies: blueprint.best_analogies_from || [],
              visualSuggestion: 'Overview diagram'
            }
          ]
        }
      ],
      glossary: [{ term: topic, definition: `Primary subject of study.`, context: domain }],
      keyTakeaways: [`Understand foundational principles of ${topic}`],
      deeperReading: [`Foundational texts in ${domain}`]
    },
    slides: Array.isArray(pkg?.slides) && pkg.slides.length > 0 ? pkg.slides : [
      {
        slideNumber: 1,
        title: `Introduction to ${topic}`,
        subtitle: `Core Principles & Context`,
        bullets: [
          `Key principle defining ${topic} in ${domain}.`,
          `Fundamental mechanisms and evidence.`,
          `Broad impact across research, history, and practice.`
        ],
        detailedExplanation: `${topic} provides essential insights into ${domain}.`,
        visualPrompt: `Illustration of ${topic}, vector style, clean white background`,
        speakerNotes: `Welcome everyone. Today we examine the foundations of ${topic}.`
      }
    ],
    steps: Array.isArray(pkg?.steps) && pkg.steps.length > 0 ? pkg.steps : [
      {
        step: 1,
        title: `Phase 1: Initial Principles`,
        simpleExplanation: `The foundational mechanism initiating ${topic}.`,
        analogy: (blueprint.best_analogies_from && blueprint.best_analogies_from[0]) || 'A foundational building block',
        realExample: `Concrete manifestation in ${domain}.`,
        commonMistake: `Confusing surface symptoms with underlying causes.`,
        memoryTrick: `Anchor to the first core principle.`
      }
    ],
    quiz: Array.isArray(pkg?.quiz) && pkg.quiz.length > 0 ? pkg.quiz : [
      {
        id: 1,
        type: 'multiple_choice',
        question: `What is a defining characteristic of ${topic}?`,
        options: [`Primary driving factor`, `Random anomaly`, `Unrelated effect`, `Temporary artifact`],
        correctAnswer: 0,
        explanation: `Option 0 defines the core mechanism governing ${topic}.`,
        hint: `Think about the foundational laws or events of ${domain}.`
      }
    ],
    audio: pkg?.audio || {
      title: `Understanding ${topic}`,
      paragraphs: [
        `Welcome to this briefing on ${topic}. In this lesson, we explore how ${topic} shapes our understanding of ${domain}.`,
        `The fundamental drivers behind ${topic} demonstrate key principles in action.`,
        `By examining real-world case studies, we see why ${topic} remains critical today.`
      ]
    }
  };
}
