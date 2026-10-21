export const mockVisualizeData = {
  cleanTopic: "Photosynthesis",
  category: "BIOLOGY",
  difficulty: "beginner",
  simpleGoal: "Master how plant chloroplasts convert solar light energy into chemical energy stored in glucose (C6H12O6).",
  recommendedEngines: [
    "slides",
    "interactive_simulator",
    "steps",
    "knowledge_map",
    "practice",
    "audio",
    "tutor",
    "deep_guide"
  ],
  slides: [
    {
      slideNumber: 1,
      title: "Biochemical Overview of Photosynthesis",
      subtitle: "Solar Energy Conversion in Chloroplasts",
      layout: "hero_split",
      bullets: [
        "Solar radiation is converted into chemical potential energy via pigment excitation.",
        "Overall Reaction: 6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2",
        "Takes place in specialized double-membrane organelles called chloroplasts."
      ],
      detailedExplanation: "Photosynthesis is the fundamental metabolic process where photoautotrophs convert light energy into chemical energy. Chlorophyll a and b pigments inside thylakoid membranes absorb specific wavelengths of light, driving water photolysis and electron transport.",
      visualPrompt: "Cinematic textbook diagram of chloroplast thylakoid membrane during Photosynthesis, 6CO2 and 6H2O converting to glucose C6H12O6, clean scientific vector illustration, white background",
      speakerNotes: "Welcome class. Today we cover Photosynthesis. Notice how photon absorption in Photosystem II splits H2O molecules to release oxygen as a byproduct.",
      miniQuiz: {
        question: "Where do the light-dependent reactions take place inside a plant cell?",
        options: ["Thylakoid Membranes", "Stroma Matrix", "Mitochondrial Matrix", "Cytoplasm"],
        correct: 0
      }
    },
    {
      slideNumber: 2,
      title: "Light-Dependent Reactions & Photolysis",
      subtitle: "Electron Transport & ATP Synthesis",
      bullets: [
        "Photons energize electrons in P680 reaction centers within Photosystem II.",
        "Photolysis splits H2O: 2H2O -> 4H+ + 4e- + O2 gas released into atmosphere.",
        "Proton gradient across thylakoid membrane drives ATP Synthase to generate ATP & NADPH."
      ],
      detailedExplanation: "High-energy electrons move through cytochrome b6f complexes to Photosystem I (P700). NADP+ reductase reduces NADP+ to NADPH while ATP synthase leverages proton motive force across the thylakoid lumen.",
      visualPrompt: "Detailed scientific diagram of Z-scheme electron transport chain in thylakoid membrane, Photosystem II splitting water, ATP synthase rotor, clean vector art",
      speakerNotes: "Focus on the proton concentration gradient. The lumen accumulates H+ ions, establishing a electrochemical potential difference used by ATP synthase.",
      miniQuiz: {
        question: "What is the primary electron donor for the light-dependent reactions?",
        options: ["Water (H2O)", "Carbon Dioxide (CO2)", "Glucose (C6H12O6)", "NADPH"],
        correct: 0
      }
    },
    {
      slideNumber: 3,
      title: "The Calvin Cycle (Light-Independent Phase)",
      subtitle: "Carbon Fixation & Glucose Synthesis in Stroma",
      bullets: [
        "Rubisco (RuBP carboxylase-oxygenase) fixes atmospheric CO2 onto 5-carbon RuBP.",
        "Consumes 9 ATP and 6 NADPH per 3-carbon G3P (glyceraldehyde 3-phosphate) molecule produced.",
        "Two G3P molecules condense to form one 6-carbon glucose (C6H12O6) molecule."
      ],
      detailedExplanation: "Occurring in the stroma, the Calvin Cycle consists of three phases: Carbon Fixation by Rubisco, Reduction of 3-PGA to G3P using NADPH/ATP, and Regeneration of RuBP to sustain the cycle.",
      visualPrompt: "Biochemical pathway circular diagram of Calvin Cycle in stroma, RuBP carbon fixation by Rubisco enzyme, ATP and NADPH consumption, G3P output, textbook illustration",
      speakerNotes: "Rubisco is the most abundant enzyme on Earth. It catalyzes the initial step of carbon fixation, bonding CO2 to ribulose 1,5-bisphosphate.",
      miniQuiz: {
        question: "Which enzyme catalyzes the initial carbon fixation step in the Calvin Cycle?",
        options: ["Rubisco", "ATP Synthase", "DNA Polymerase", "Amylase"],
        correct: 0
      }
    }
  ],
  simulatorData: {
    simulationType: "canvas",
    title: "Photosynthesis Interactive Reaction Model",
    description: "Adjust photon light intensity and CO2 concentration to observe oxygen generation rates and ATP output.",
    parameters: [
      { id: "p1", label: "Light Intensity (Photons)", min: 0, max: 100, default: 60, unit: "µmol/m²/s", color: "indigo" },
      { id: "p2", label: "CO2 Concentration", min: 0, max: 100, default: 45, unit: "ppm", color: "emerald" }
    ],
    states: [
      {
        id: "state_default",
        condition: "default",
        title: "Optimal Photosynthetic Rate",
        description: "At 60% light intensity and 45ppm CO2, oxygen bubbles evolve steadily from thylakoid membranes.",
        outputMetrics: { "O2 Production": "85%", "ATP Yield": "Optimal" },
        activeComponents: ["photosystem_2", "cytochrome_complex", "rubisco_stroma"],
        visualChanges: "Green chloroplasts absorb photon rays; O2 gas bubbles evolve from thylakoid membranes."
      }
    ]
  },
  steps: [
    {
      step: 1,
      title: "Phase 1: Photon Absorption & Water Photolysis in Thylakoids",
      explanation: "Solar photons strike Chlorophyll pigments in Photosystem II inside thylakoid membranes. This light energy excites electrons to a high energy level, splitting H2O molecules into protons (H+), electrons (e-), and byproduct O2 gas.",
      analogy: "Like a solar panel capturing sunlight to charge a battery and split water into hydrogen fuel and oxygen.",
      realExample: "2H2O + light photons -> 4H+ + 4e- + O2 released into atmospheric air.",
      commonMistake: "Thinking oxygen is created during carbon fixation instead of light-dependent water photolysis.",
      memoryTrick: "Light splits Water in the Thylakoid!"
    },
    {
      step: 2,
      title: "Phase 2: Electron Transport Chain & Proton Gradient Creation",
      explanation: "High-energy electrons travel along cytochrome b6f complexes to Photosystem I. As electrons move, protons (H+) are pumped across the thylakoid membrane into the lumen, establishing a steep electrochemical proton motive force.",
      analogy: "Like a water dam building up pressure to spin a hydroelectric turbine.",
      realExample: "High H+ lumen concentration forces protons through ATP Synthase rotors.",
      commonMistake: "Confusing proton gradient generation in thylakoids with mitochondrial cristae respiration.",
      memoryTrick: "Proton Pump Drives Power!"
    },
    {
      step: 3,
      title: "Phase 3: ATP & NADPH Energy Storage",
      explanation: "NADP+ reductase reduces NADP+ into energy-carrying NADPH. Simultaneously, ATP Synthase uses proton flow to phosphorylate ADP into ATP in the chloroplast stroma.",
      analogy: "Charging chemical batteries (ATP and NADPH) for later use in the dark assembly line.",
      realExample: "ADP + Pi -> ATP; NADP+ + 2e- + H+ -> NADPH.",
      commonMistake: "Believing ATP produced in chloroplasts is primarily used for general cell movement rather than Calvin Cycle carbon fixation.",
      memoryTrick: "ATP + NADPH = Chemical Charge!"
    }
  ],
  knowledgeMap: {
    root: {
      label: "Photosynthesis",
      explanation: "Metabolic process converting solar energy, CO2, and H2O into glucose (C6H12O6) and O2."
    },
    branches: [
      {
        id: "b1",
        label: "Light-Dependent Reactions",
        explanation: "Thylakoid membrane reactions split H2O and generate ATP + NADPH using photon energy.",
        example: "Photosystem II splitting 2H2O into 4H+, 4e-, and O2 gas.",
        memoryHook: "Light splits Water in Thylakoids!",
        children: [
          { id: "b1c1", label: "Photosystem II (P680)", explanation: "Water-splitting complex releasing O2." },
          { id: "b1c2", label: "ATP Synthase", explanation: "Proton-driven turbine synthesizing ATP." }
        ]
      },
      {
        id: "b2",
        label: "Calvin Cycle (Stroma)",
        explanation: "Light-independent carbon fixation reactions in stroma synthesizing G3P and glucose.",
        example: "Rubisco bonding CO2 to RuBP.",
        memoryHook: "Rubisco Locks Carbon!",
        children: [
          { id: "b2c1", label: "Carbon Fixation", explanation: "CO2 + RuBP via Rubisco enzyme." },
          { id: "b2c2", label: "G3P Reduction", explanation: "ATP and NADPH convert 3-PGA to G3P." }
        ]
      }
    ]
  },
  practice: [
    {
      id: 1,
      type: "multiple_choice",
      question: "What is the primary function of Photosynthesis in green plants?",
      options: [
        "Conversion of solar light energy into chemical energy stored in glucose (C6H12O6)",
        "Direct absorption of atmospheric oxygen to generate ATP in mitochondria",
        "Synthesis of amino acids from soil nitrogen without light input",
        "Breakdown of cellular starch into atmospheric carbon dioxide gas"
      ],
      correctAnswer: 0,
      explanation: "Photosynthesis uses light energy absorbed by chlorophyll pigments to drive photolysis of water and fixation of CO2 into glucose (C6H12O6).",
      hint: "Think about how plants convert light and water into carbohydrates and oxygen."
    },
    {
      id: 2,
      type: "multiple_choice",
      question: "Where do the light-dependent reactions of photosynthesis take place within a plant cell?",
      options: [
        "In the thylakoid membranes of chloroplasts",
        "In the stroma fluid of chloroplasts",
        "Inside the mitochondrial matrix",
        "Along the outer plasma membrane"
      ],
      correctAnswer: 0,
      explanation: "Light-dependent reactions occur in thylakoid membranes where Photosystem II, Photosystem I, and ATP Synthase are embedded.",
      hint: "Focus on the membrane structures containing chlorophyll pigments."
    }
  ],
  audioLesson: {
    title: "Mastering Photosynthesis: The Audio Experience",
    scriptParagraphs: [
      {
        number: 1,
        text: "Welcome to NeuraGlow Audio! Photosynthesis is the ultimate solar engine on Earth. Every breath of oxygen you take originated from water photolysis in thylakoids.",
        teaches: "Introduction & Hook"
      },
      {
        number: 2,
        text: "Imagine solar panels powering an automated assembly line that splits water molecules and builds high-density energy bricks called glucose. That's photosynthesis in a nutshell.",
        teaches: "Core Analogy"
      }
    ]
  }
}
