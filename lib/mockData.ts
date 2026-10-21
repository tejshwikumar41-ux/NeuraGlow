export interface TopicEngineData {
  id: string;
  slug: string;
  title: string;
  domain: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  prerequisites: string[];
  summary: string;
  progress: number;
  lastStudied: string;
  notes: {
    chapters: Array<{
      id: string;
      title: string;
      estimatedReadTime: string;
      content: string;
      keyFormulas?: string[];
      reflectionPrompt: string;
    }>;
  };
  slides: Array<{
    slideNumber: number;
    title: string;
    bullets: string[];
    speakerNotes: string;
    visualType: string;
  }>;
  practice: {
    title: string;
    scenario: string;
    steps: Array<{
      stepNumber: number;
      instruction: string;
      hint: string;
      options: string[];
      correctOption: number;
      explanation: string;
    }>;
  };
  quiz: {
    questions: Array<{
      id: string;
      scenario: string;
      options: string[];
      correctOption: number;
      trapExplanation: string;
    }>;
    feynmanPrompt: string;
    rubricPoints: string[];
  };
  audio: {
    title: string;
    duration: string;
    chapters: Array<{ time: string; title: string }>;
    transcript: Array<{ time: string; speaker: string; text: string }>;
  };
  simulator: {
    title: string;
    description: string;
    initialParams: { [key: string]: number };
    paramConfig: Array<{ key: string; label: string; min: number; max: number; step: number; unit: string }>;
    challengeTarget: string;
  };
  tutor: {
    systemContext: string;
    suggestedQueries: string[];
  };
}

export const MOCK_TOPICS: { [slug: string]: TopicEngineData } = {
  'quantum-entanglement': {
    id: 'top-1',
    slug: 'quantum-entanglement',
    title: 'Quantum Entanglement & Non-Locality',
    domain: 'Physics',
    difficulty: 'Advanced',
    duration: '45 mins',
    prerequisites: ['Superposition', 'Linear Algebra Basics'],
    summary: 'A fundamental quantum phenomenon where paired particles remain correlated regardless of the spatial distance separating them.',
    progress: 68,
    lastStudied: 'Yesterday',
    notes: {
      chapters: [
        {
          id: 'ch-1',
          title: 'The EPR Paradox & The Genesis of Non-Locality',
          estimatedReadTime: '8 mins',
          content: `In 1935, Albert Einstein, Boris Podolsky, and Nathan Rosen published a landmark critique of the Copenhagen interpretation of quantum mechanics, famously dubbed the EPR Paradox. They posited that if quantum mechanics were complete, measurement of one entangled particle would instantaneously collapse the state of its paired partner across arbitrary spatial intervals.

Einstein famously referred to this consequence as "spooky action at a distance" (spukhafte Fernwirkung). For classical physics, physical systems possess definite states independent of measurement (realism), and influences cannot propagate faster than the speed of light (locality). The EPR argument suggested that either local realism was violated, or quantum mechanics was fundamentally incomplete, possessing undiscovered "hidden variables".

Decades later, in 1964, Northern Irish physicist John Stewart Bell translated this philosophical dispute into an experimentally testable inequality. Bell demonstrated that NO local hidden variable theory could reproduce all statistical predictions of quantum mechanics.

[REFLECTION: Ask yourself: If information cannot travel faster than light under special relativity, why doesn't quantum state correlation violate causality?]`,
          keyFormulas: [
            '|Ψ⁺⟩ = (1/√2) (|01⟩ + |10⟩)',
            '|S| ≤ 2 (Bell-CHSH Inequality bound for local realism)',
            '|S_quantum| = 2√2 ≈ 2.828 (Maximum Tsirelson bound violation)'
          ],
          reflectionPrompt: 'Does measurement create the property, or merely reveal a pre-existing reality? How does Bell test resolve this?'
        },
        {
          id: 'ch-2',
          title: 'Bell States & Quantum Information Flow',
          estimatedReadTime: '12 mins',
          content: `The four Bell states form the maximally entangled two-qubit orthonormal basis. These states are the bedrock of quantum teleportation, superdense coding, and quantum cryptography (BB84 and E91 protocols).

When two qubits are prepared in the Bell state |Φ⁺⟩ = (1/√2)(|00⟩ + |11⟩), measuring the first qubit in the computational basis yields 0 with 50% probability and 1 with 50% probability. The instant qubit A is determined to be 0, qubit B is guaranteed to be 0 with 100% certainty, even if qubit B resides in the Andromeda galaxy.

Crucially, this correlation cannot be harnessed to transmit classical messages faster than light (the No-Communication Theorem). Because each local observer sees only purely random measurement outcomes, Alice must transmit at least two classical bits via sub-lightspeed channels to Bob before Bob can reconstruct Alice's intended quantum state.`,
          keyFormulas: [
            '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
            '|Φ⁻⟩ = (|00⟩ - |11⟩)/√2',
            '|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2',
            '|Ψ⁻⟩ = (|01⟩ - |10⟩)/√2'
          ],
          reflectionPrompt: 'Why does the No-Communication Theorem safeguard special relativity from quantum measurement collapse?'
        }
      ]
    },
    slides: [
      {
        slideNumber: 1,
        title: 'Quantum Entanglement Foundations',
        bullets: [
          'Paired quantum states cannot be written as separable product states',
          'Measurement on subsystem A instantaneously determines subsystem B',
          'Einstein-Podolsky-Rosen (1935) vs John Bell (1964)'
        ],
        speakerNotes: 'Welcome students. Today we explore non-locality and why quantum entanglement is not simply classical correlation.',
        visualType: 'entangled-pair-vector'
      },
      {
        slideNumber: 2,
        title: 'Bell’s Theorem & Experimental Violation',
        bullets: [
          'Classical local hidden variables cannot exceed correlation bound S = 2',
          'Aspect (1982) and Zeilinger (1998) verified quantum bound S = 2√2',
          'Nobel Prize in Physics 2022 confirmed real-world loophole-free tests'
        ],
        speakerNotes: 'Notice the mathematical rigor of the CHSH inequality: the classical world caps at 2. Quantum reality hits 2.828.',
        visualType: 'bell-correlation-curve'
      },
      {
        slideNumber: 3,
        title: 'Quantum Teleportation Mechanics',
        bullets: [
          'Teleportation transfers quantum states, not physical matter',
          'Requires pre-shared Bell pair + 2 classical communication bits',
          'Conserves the No-Cloning Theorem: original state is destroyed upon measurement'
        ],
        speakerNotes: 'Make sure not to confuse teleportation with sci-fi matter beaming. It is state reconstruction using entanglement.',
        visualType: 'teleportation-circuit'
      }
    ],
    practice: {
      title: 'Calculating Bell Correlation Coefficient',
      scenario: 'Alice and Bob share the singlet state |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2. Alice measures along angle a = 0°, and Bob measures along detector angle b = 45°.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Compute the quantum correlation expectation value E(a, b) using the formula E(a, b) = -cos(θ_a - θ_b). What is θ = 45° - 0°?',
          hint: 'The relative angle between Alice and Bob detector orientations is 45°.',
          options: ['-0.707 (-1/√2)', '+0.707 (+1/√2)', '-1.000', '0.000'],
          correctOption: 0,
          explanation: 'Correct! E(0°, 45°) = -cos(45°) = -1/√2 ≈ -0.707.'
        },
        {
          stepNumber: 2,
          instruction: 'If Alice and Bob test 4 detector angle pairings (0°, 45°, 90°, 135°), compute the CHSH sum S = |E(a,b) - E(a,b\') + E(a\',b) + E(a\',b\')|.',
          hint: 'Summing 4 terms each of magnitude 1/√2 gives 4 * (1/√2) = 2√2.',
          options: ['2.828 (2√2)', '2.000', '1.414 (√2)', '3.141 (π)'],
          correctOption: 0,
          explanation: 'Exact! 2√2 ≈ 2.828, directly violating the classical realism cap of 2.0.'
        }
      ]
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          scenario: 'Alice and Bob share an entangled Bell pair across 10 light-years. Alice measures her particle as spin-up. Can Bob instantly know Alice sent him an emergency distress signal?',
          options: [
            'Yes, because his particle instantly collapsed to spin-down.',
            'No, because Bob only sees a 50/50 random distribution without Alice’s classical message.',
            'Yes, if they use optical fiber repeaters.',
            'No, because entanglement breaks down after 1 light-year.'
          ],
          correctOption: 1,
          trapExplanation: 'Trap: Believing state correlation allows instant signaling. Individual measurements look purely random until classical synchronization bits arrive.'
        },
        {
          id: 'q2',
          scenario: 'What would happen if an experimenter could clone an unknown quantum state without disturbing it?',
          options: [
            'They would violate the No-Cloning theorem and could transmit faster-than-light signals.',
            'Nothing unusual; classical data is duplicated all the time.',
            'It would increase quantum entanglement entropy.',
            'The universe would run out of quantum vacuum energy.'
          ],
          correctOption: 0,
          trapExplanation: 'Cloning unknown states would bypass the uncertainty principle and enable superluminal communication, which is physically prohibited.'
        }
      ],
      feynmanPrompt: 'Explain quantum entanglement to a 10-year-old using the concept of a pair of magic matching socks.',
      rubricPoints: [
        'Use the matching shoes/socks analogy',
        'Clarify that no signal moves through the air',
        'Explain why looking inside one box reveals the other immediately',
        'Avoid technical math jargon'
      ]
    },
    audio: {
      title: 'The Great Bohr-Einstein Debate: Spooky Action Decoded',
      duration: '14:20',
      chapters: [
        { time: '00:00', title: 'Introduction & The 1935 Challenge' },
        { time: '04:15', title: 'John Bell’s Ingenious Mathematical Test' },
        { time: '09:30', title: 'Loophole-Free Experiments & Modern Quantum Tech' }
      ],
      transcript: [
        { time: '00:05', speaker: 'Prof. Miller', text: 'Imagine two coins tossed into the air. In classical probability, whether coin A lands heads has zero bearing on coin B.' },
        { time: '00:22', speaker: 'Dr. Sarah', text: 'Exactly. But in quantum mechanics, if those two coins are entangled, the moment coin A lands heads, coin B instantly lands tails, every single time.' },
        { time: '00:45', speaker: 'Prof. Miller', text: 'And this drove Einstein crazy because neither coin held a hidden internal switch before being caught!' },
        { time: '01:10', speaker: 'Dr. Sarah', text: 'He dubbed it "spooky action at a distance" and assumed quantum mechanics was an incomplete description of physical reality.' },
        { time: '01:35', speaker: 'Prof. Miller', text: 'Thirty years later, Irish physicist John Stewart Bell devised a mathematical theorem proving no local hidden variable theory could reproduce quantum correlations.' },
        { time: '02:00', speaker: 'Dr. Sarah', text: 'And in 2022, the Nobel Prize in Physics recognized Aspect, Clauser, and Zeilinger for proving Bell violation in real-world laboratories.' }
      ]
    },
    simulator: {
      title: 'Interactive Bell Inequality CHSH Analyzer',
      description: 'Adjust Alice and Bob measurement polarizer angles to observe real-time photon coincidence counts and verify quantum violation beyond classical S = 2.',
      initialParams: { aliceAngle: 0, bobAngle: 45, photonPairs: 500 },
      paramConfig: [
        { key: 'aliceAngle', label: 'Alice Detector Angle (θ_A)', min: 0, max: 180, step: 5, unit: '°' },
        { key: 'bobAngle', label: 'Bob Detector Angle (θ_B)', min: 0, max: 180, step: 5, unit: '°' },
        { key: 'photonPairs', label: 'Photon Pairs Emitted (N)', min: 100, max: 2000, step: 50, unit: ' pairs' }
      ],
      challengeTarget: 'Find detector angles that yield maximum CHSH S-score of 2.828!'
    },
    tutor: {
      systemContext: 'You are a Socratic quantum mechanics professor. Guide the student to understand the difference between epistemic ignorance and quantum indeterminacy.',
      suggestedQueries: [
        'Why does entanglement not violate the speed of light?',
        'How does a Bell test prove hidden variables do not exist?',
        'Explain quantum teleportation step-by-step',
        'What was Einstein’s actual disagreement with Bohr?'
      ]
    }
  },

  'french-revolution': {
    id: 'top-2',
    slug: 'french-revolution',
    title: 'The French Revolution: 1789–1799',
    domain: 'History',
    difficulty: 'Intermediate',
    duration: '35 mins',
    prerequisites: ['The European Enlightenment', 'Feudal Estate System'],
    summary: 'A watershed period of radical social and political upheaval in France that dismantled the monarchy and reshaped modern democracy.',
    progress: 85,
    lastStudied: '3 days ago',
    notes: {
      chapters: [
        {
          id: 'ch-1',
          title: 'The Three Estates & The Fiscal Crisis of 1789',
          estimatedReadTime: '10 mins',
          content: `In 1789, France was structured under the Ancien Régime into three distinct estates: the First Estate (Clergy), the Second Estate (Nobility), and the Third Estate (everyone else, representing 98% of the 28 million population).

Despite holding virtually all productive labor, the Third Estate bore almost the entire tax burden (taille, gabelle, and corvée), while the nobility and church enjoyed tax exemptions and feudal privileges. Following costly French involvement in the American Revolutionary War and catastrophic hail storms that destroyed wheat harvests in 1788, bread prices spiked to 88% of an average laborer's daily wage.

King Louis XVI convened the Estates-General at Versailles in May 1789—the first such meeting in 175 years. However, voting was by estate rather than head, allowing the top 2% to outvote the Third Estate 2-to-1.

[REFLECTION: Ask yourself: When systemic inequality is entrenched by law, is peaceful institutional reform ever possible without popular revolt?]`,
          reflectionPrompt: 'Why was voting by head vs voting by estate the decisive flashpoint at the Estates-General?'
        }
      ]
    },
    slides: [
      {
        slideNumber: 1,
        title: 'Ancien Régime: The Powder Keg',
        bullets: [
          '98% Third Estate carried the tax burden for 2% privileged nobility & clergy',
          'Bankruptcy from Seven Years’ War & American Revolution',
          'Bread shortage of 1788-1789 triggered urban starvation'
        ],
        speakerNotes: 'Set the stage: France was not poor, but its tax system was completely broken.',
        visualType: 'three-estates-pyramid'
      }
    ],
    practice: {
      title: 'Analyzing Revolutionary Chronology',
      scenario: 'You are an advisor to the National Assembly in June 1789 after being locked out of the official meeting hall by King Louis XVI.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'What critical resolution should the deputies take on the nearby indoor Tennis Court?',
          hint: 'They swore never to separate until France had a written constitution.',
          options: [
            'Swear the Tennis Court Oath (Serment du Jeu de Paume)',
            'Surrender immediately to royal guards',
            'Declare war on Prussia',
            'Dissolve the assembly'
          ],
          correctOption: 0,
          explanation: 'Exactly! The Tennis Court Oath of June 20, 1789 established the National Assembly as the sovereign representative of France.'
        }
      ]
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          scenario: 'Why did the storming of the Bastille on July 14, 1789 matter so much symbolically?',
          options: [
            'It was a medieval fortress and royal prison embodying arbitrary royal despotism and held gunpowder stores.',
            'It contained all the gold of the royal treasury.',
            'King Louis XVI was residing inside.',
            'It was the largest library in Paris.'
          ],
          correctOption: 0,
          trapExplanation: 'Trap: Thinking it held vast treasure or the King. The fortress held only 7 prisoners, but represented royal tyranny and gunpowder.'
        }
      ],
      feynmanPrompt: 'Explain why the French peasants revolted in 1789 as if explaining to someone planning a dinner budget.',
      rubricPoints: ['Explain the 3 estates', 'Mention taxes vs bread cost', 'Explain lack of voice']
    },
    audio: {
      title: 'From Versailles to the Guillotine: The Storming of Liberty',
      duration: '18:50',
      chapters: [
        { time: '00:00', title: 'The Estates-General Deadlock' },
        { time: '06:10', title: 'Bastille & The Declaration of the Rights of Man' }
      ],
      transcript: [
        { time: '00:10', speaker: 'Historian Claire', text: 'When bread costs a whole day’s wages, philosophy turns into revolution rapidly.' },
        { time: '00:35', speaker: 'Prof. Laurent', text: 'In May 1789, King Louis the Sixteenth was bankrupt and convened the Estates-General at Versailles.' },
        { time: '01:05', speaker: 'Historian Claire', text: 'The Third Estate represented ninety-eight percent of the French population, yet possessed only one vote out of three.' },
        { time: '01:30', speaker: 'Prof. Laurent', text: 'When locked out of their hall, they convened on a nearby tennis court, swearing not to disband until France had a constitution.' },
        { time: '01:55', speaker: 'Historian Claire', text: 'By July fourteenth, the storming of the Bastille fortress shattered the myth of royal absolute power forever.' }
      ]
    },
    simulator: {
      title: 'Revolutionary Budget & Public Unrest Simulator',
      description: 'Adjust grain prices, royal tax rates, and military spending to observe the Revolutionary Unrest Index in Paris.',
      initialParams: { grainPrice: 80, taxOnThirdEstate: 75, troopDeployment: 30 },
      paramConfig: [
        { key: 'grainPrice', label: 'Grain Price (% of daily wage)', min: 20, max: 100, step: 5, unit: '%' },
        { key: 'taxOnThirdEstate', label: 'Third Estate Tax Burden', min: 10, max: 90, step: 5, unit: '%' },
        { key: 'troopDeployment', label: 'Swiss Guards in Paris', min: 0, max: 100, step: 10, unit: ' reg' }
      ],
      challengeTarget: 'Stabilize Paris unrest below 40% without going bankrupt!'
    },
    tutor: {
      systemContext: 'You are an objective historical analyst. Compare the Moderate phase (1789-1791) with the Radical Terror phase (1793-1794).',
      suggestedQueries: [
        'Why did Robespierre justify the Reign of Terror?',
        'How did the American Revolution influence French deputies?',
        'What was the significance of the Civil Constitution of the Clergy?'
      ]
    }
  },

  'react-hooks': {
    id: 'top-3',
    slug: 'react-hooks',
    title: 'React Hooks & State Architecture',
    domain: 'Computer Science',
    difficulty: 'Intermediate',
    duration: '40 mins',
    prerequisites: ['JavaScript Closures', 'React Components'],
    summary: 'Master functional component state, effect dependency graphs, and memoization primitives in modern React.',
    progress: 92,
    lastStudied: 'Today',
    notes: {
      chapters: [
        {
          id: 'ch-1',
          title: 'The Mental Model of Fiber & Hooks',
          estimatedReadTime: '10 mins',
          content: `Before React 16.8, state and lifecycle methods were exclusive to class components. React Hooks revolutionized UI development by allowing developers to attach state and side-effects to functional components without class inheritance.

Under the hood, React stores component hooks as a singly-linked list on the Fiber node. Each time a component renders, React traverses this linked list in the exact order hooks were declared.

This architectural reality gives rise to the two golden Rules of Hooks:
1. Only call Hooks at the top level (never inside loops, conditions, or nested functions).
2. Only call Hooks from React function components or custom Hooks.

[REFLECTION: Ask yourself: What happens inside Fiber memory if a hook is wrapped inside an "if (condition)" and skips a render?]`,
          keyFormulas: [
            'Fiber.memoizedState -> HookNode -> next -> HookNode',
            'useEffect(fn, deps) -> compares deps via Object.is',
            'useCallback(fn, deps) === useMemo(() => fn, deps)'
          ],
          reflectionPrompt: 'Why does React rely on call order rather than property names for hooks storage?'
        }
      ]
    },
    slides: [
      {
        slideNumber: 1,
        title: 'Why Hooks? The Problem with Classes',
        bullets: [
          'Huge boilerplate, confusing "this" keyword binding',
          'Logic split across componentDidMount, componentDidUpdate, componentWillUnmount',
          'Difficult to share stateful logic between components without HOC hell'
        ],
        speakerNotes: 'Hooks let us organize code by feature, not by lifecycle timing.',
        visualType: 'class-vs-hooks-comparison'
      }
    ],
    practice: {
      title: 'Fixing Stale Closure in useEffect',
      scenario: 'You have a timer component where setCount(count + 1) runs inside setInterval, but the counter gets stuck at 1.',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Why does count get stuck at 1 when using count directly in the closure?',
          hint: 'The effect was run once on mount and captured count = 0 forever.',
          options: [
            'Stale closure captured the initial render state of count',
            'JavaScript timers cannot increment past 1',
            'React Fiber crashed',
            'useState is asynchronous'
          ],
          correctOption: 0,
          explanation: 'Exactly! The closure captured count = 0 on mount. Use the functional updater: setCount(prev => prev + 1).'
        }
      ]
    },
    quiz: {
      questions: [
        {
          id: 'q1',
          scenario: 'What is the exact equality comparison React uses to evaluate whether dependency arrays changed in useEffect/useMemo?',
          options: [
            'Object.is (shallow reference equality)',
            'Deep recursive JSON equality (===)',
            'Loose equality (==)',
            'Strict type checking only'
          ],
          correctOption: 0,
          trapExplanation: 'Trap: Assuming React deep-compares objects. Passing a newly created object {} in deps triggers every render because Object.is({}, {}) is false.'
        }
      ],
      feynmanPrompt: 'Explain React useEffect to a junior developer using an automatic dishwasher metaphor.',
      rubricPoints: ['Explain trigger on dirty dishes', 'Explain cleanup cycle', 'Explain dependency array']
    },
    audio: {
      title: 'Under the Hood of React Fiber: How Hooks Actually Work',
      duration: '16:10',
      chapters: [
        { time: '00:00', title: 'The Linked List on Fiber Nodes' },
        { time: '07:20', title: 'Mastering the Dependency Array' }
      ],
      transcript: [
        { time: '00:15', speaker: 'Dan A.', text: 'Hooks are not magic. Under the hood, they are stored as a singly linked list of hook objects attached to each component fiber node.' },
        { time: '00:40', speaker: 'Sophie A.', text: 'This is why hooks must never be called inside conditionals or loops. The call order must remain identical on every render cycle.' },
        { time: '01:05', speaker: 'Dan A.', text: 'When use State is called during a re-render, React simply walks the next pointer on the work-in-progress fiber tree.' },
        { time: '01:30', speaker: 'Sophie A.', text: 'And use Effect schedules side effects to run after the browser paints, avoiding blocking the main thread during layout.' }
      ]
    },
    simulator: {
      title: 'React Render & Re-render Visualizer',
      description: 'Trigger state updates and memoization flags to see which child components re-render in the virtual DOM tree.',
      initialParams: { parentRenders: 1, childMemoized: 1, propsChanged: 0 },
      paramConfig: [
        { key: 'parentRenders', label: 'Parent Render Triggers', min: 1, max: 20, step: 1, unit: 'x' },
        { key: 'childMemoized', label: 'React.memo Active (1=Yes, 0=No)', min: 0, max: 1, step: 1, unit: '' },
        { key: 'propsChanged', label: 'New Object Props Passed (1=Yes, 0=No)', min: 0, max: 1, step: 1, unit: '' }
      ],
      challengeTarget: 'Keep Child render count at 1 even when Parent re-renders 10 times!'
    },
    tutor: {
      systemContext: 'You are a Senior React Architect. Explain race conditions, AbortController in useEffect, and proper useMemo usage.',
      suggestedQueries: [
        'When should I NOT use useMemo and useCallback?',
        'How does useTransition differ from useDeferredValue?',
        'How to prevent infinite re-render loops in useEffect?'
      ]
    }
  }
};

// Global Dashboard & Analytics Mock Data
export const MOCK_DASHBOARD_DATA = {
  user: {
    name: 'Tejshwi Kumar',
    avatar: 'TK',
    email: 'tejshwi@neuraglow.io',
    membership: 'Pro Scholar',
    streakDays: 7,
    topicsExplored: 12,
    quizzesAced: 8,
    hoursLearned: 24,
    grade: 'A+',
  },
  continueLearning: [
    {
      slug: 'quantum-entanglement',
      title: 'Quantum Entanglement & Non-Locality',
      domain: 'Physics',
      progress: 68,
      thumbnail: '⚛️',
      lastEngine: 'Simulator'
    },
    {
      slug: 'french-revolution',
      title: 'The French Revolution: 1789–1799',
      domain: 'History',
      progress: 85,
      thumbnail: '⚔️',
      lastEngine: 'Deep Notes'
    },
    {
      slug: 'react-hooks',
      title: 'React Hooks & State Architecture',
      domain: 'Computer Science',
      progress: 92,
      thumbnail: '💻',
      lastEngine: 'Practice Solver'
    }
  ],
  suggestedTopics: [
    { slug: 'quantum-entanglement', title: 'Quantum Entanglement', domain: 'Physics', tag: 'Quantum' },
    { slug: 'french-revolution', title: 'French Revolution', domain: 'History', tag: 'Europe' },
    { slug: 'react-hooks', title: 'React Hooks Deep Dive', domain: 'Tech', tag: 'Frontend' },
    { slug: 'krebs-cycle', title: 'Citric Acid Cycle', domain: 'Biology', tag: 'Biochem' },
    { slug: 'kinematics', title: 'Kinematics & Motion', domain: 'Physics', tag: 'Mechanics' },
    { slug: 'recursion', title: 'Recursion & Stack Memory', domain: 'Tech', tag: 'Algorithms' }
  ],
  analytics: {
    heatmap: [
      { date: 'Mon', count: 3 },
      { date: 'Tue', count: 5 },
      { date: 'Wed', count: 2 },
      { date: 'Thu', count: 6 },
      { date: 'Fri', count: 8 },
      { date: 'Sat', count: 4 },
      { date: 'Sun', count: 7 },
    ],
    subjectBreakdown: [
      { subject: 'Physics', hours: 10, percent: 42, color: 'var(--primary-clay)' },
      { subject: 'Computer Science', hours: 8, percent: 33, color: 'var(--secondary-clay)' },
      { subject: 'History', hours: 6, percent: 25, color: 'var(--accent-clay)' },
    ],
    milestones: [
      { id: 'm1', name: '7-Day Fire Streak', desc: 'Studied every day for a week', icon: '🔥', unlocked: true },
      { id: 'm2', name: 'Quiz Master', desc: 'Scored 100% on 5 advanced quizzes', icon: '🎯', unlocked: true },
      { id: 'm3', name: 'Feynman Champion', desc: 'Submitted 10 plain-English explanations', icon: '🧠', unlocked: true },
      { id: 'm4', name: 'Deep Diver', desc: 'Read 20,000+ words in deep notes', icon: '📖', unlocked: false }
    ]
  }
};
