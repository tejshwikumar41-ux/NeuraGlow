'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Sliders, Activity, 
  Layers, Sparkles, AlertCircle, Compass, 
  BookOpen, Code, CheckCircle2, ArrowRight, 
  ChevronRight, Users, Coins, ShieldAlert, 
  TrendingUp, HelpCircle
} from 'lucide-react';

export default function InteractiveSimulatorEngine({ pkg }) {
  const topic = pkg?.cleanTopic || 'Educational Concept';
  const category = pkg?.category || 'GENERAL';
  const blueprint = pkg?.blueprint || {};
  const sim = pkg?.simulation || {};
  const simType = sim.type || blueprint.best_simulation_type || 'data_sliders';

  // Branch into appropriate universal simulator template
  if (simType === 'historical_scenario' || simType === 'decision_tree' || blueprint.domain === 'history' || blueprint.topic_type === 'event') {
    return <HistoricalScenarioSimulator topic={topic} sim={sim} blueprint={blueprint} />;
  }

  if (simType === 'code_sandbox' || simType === 'sorting_visualizer' || blueprint.domain === 'technology' || blueprint.requires?.code_examples) {
    return <CodeExecutionSimulator topic={topic} sim={sim} blueprint={blueprint} />;
  }

  if (simType === 'mathematical_plot' || blueprint.domain === 'mathematics' || blueprint.requires?.mathematical_formulas) {
    return <MathPlotSimulator topic={topic} sim={sim} blueprint={blueprint} />;
  }

  // Default to universal physics & parameter dynamic simulator
  return <PhysicsParameterSimulator topic={topic} sim={sim} category={category} blueprint={blueprint} />;
}

// ============================================================================
// 1. HISTORICAL SCENARIO & DECISION TREE SIMULATOR (History / Humanities)
// ============================================================================
function HistoricalScenarioSimulator({ topic, sim, blueprint }) {
  const decisionPoints = sim.decisionPoints || [
    {
      id: 'dp1',
      stageTitle: `Pivotal Moment in ${topic}`,
      situation: `You stand at a critical juncture in ${topic}. The existing order is strained, and rival factions demand immediate action.`,
      choices: [
        {
          id: 'c1',
          text: `Implement radical systemic reform and open dialogue with dissidents.`,
          historicalNote: `Reallocates authority toward the public, but alarms traditional elites.`,
          impact: { public: 20, resources: -15, stability: 5 }
        },
        {
          id: 'c2',
          text: `Enforce strict imperial decrees and deploy armed forces to secure the treasury.`,
          historicalNote: `Consolidates short-term control, but fuels underlying rebellion.`,
          impact: { public: -25, resources: 10, stability: -15 }
        }
      ],
      historicalTruth: `Historically, the leaders faced intense factional stalemate, culminating in a dramatic transformation of the state.`
    }
  ];

  const initialFactions = useMemo(() => {
    const list = sim.factions || [
      { id: 'public', name: 'Public Sentiment', initial: 50 },
      { id: 'resources', name: 'Treasury & Reserves', initial: 60 },
      { id: 'stability', name: 'Political Stability', initial: 55 }
    ];
    const map = {};
    list.forEach(f => { map[f.id] = f.initial; });
    return map;
  }, [sim.factions]);

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [factions, setFactions] = useState(initialFactions);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showReality, setShowReality] = useState(false);

  const activeStage = decisionPoints[currentStageIdx] || decisionPoints[0];

  const handleChoose = (choice) => {
    setSelectedChoice(choice);
    if (choice.impact) {
      setFactions(prev => {
        const next = { ...prev };
        Object.keys(choice.impact).forEach(k => {
          if (next[k] !== undefined) {
            next[k] = Math.max(0, Math.min(100, next[k] + choice.impact[k]));
          }
        });
        return next;
      });
    }
  };

  const handleNextStage = () => {
    if (currentStageIdx < decisionPoints.length - 1) {
      setCurrentStageIdx(prev => prev + 1);
      setSelectedChoice(null);
      setShowReality(false);
    }
  };

  const handleReset = () => {
    setCurrentStageIdx(0);
    setFactions(initialFactions);
    setSelectedChoice(null);
    setShowReality(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Scenario Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Historical Decision Simulator
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Crisis {currentStageIdx + 1} of {decisionPoints.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {sim.title || `${topic}: Interactive Scenario Engine`}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            {sim.description || `Step into the shoes of historical actors during ${topic}. Make crucial choices and compare your decisions against the historical record.`}
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Faction Meters Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Faction Balances</span>
            </div>

            <div className="space-y-4">
              {Object.entries(factions).map(([fKey, score]) => (
                <div key={fKey} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-gray-700 dark:text-gray-300 font-semibold capitalize">
                      {fKey === 'public' ? 'Public Sentiment' : fKey === 'resources' ? 'Treasury / Economy' : 'Order & Stability'}
                    </span>
                    <span className={`font-mono font-bold ${score > 60 ? 'text-emerald-600' : score < 35 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {score}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${score > 60 ? 'bg-emerald-500' : score < 35 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>Role:</strong> {sim.role || `Strategic Decision Maker in ${topic}`}
            </div>
          </div>
        </div>

        {/* Crisis Decision Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-7 shadow-md space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Stage {currentStageIdx + 1}
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                {activeStage.stageTitle}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                {activeStage.situation}
              </p>
            </div>

            {/* Interactive Choices */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                What course of action do you take?
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {activeStage.choices?.map((choice) => {
                  const isSelected = selectedChoice?.id === choice.id;
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleChoose(choice)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-sm leading-snug">{choice.text}</span>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                      </div>

                      {isSelected && choice.historicalNote && (
                        <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-2.5 pt-2.5 border-t border-indigo-200/50 dark:border-indigo-800/40">
                          <strong>Consequence:</strong> {choice.historicalNote}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Historical Reality Check Reveal */}
            {selectedChoice && (
              <div className="space-y-4 pt-2">
                {!showReality ? (
                  <button
                    onClick={() => setShowReality(true)}
                    className="w-full py-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-amber-900 dark:text-amber-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    Reveal What Actually Happened in History
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-950 dark:text-emerald-200 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <Sparkles className="w-4 h-4" /> Historical Reality
                    </div>
                    <p className="text-xs font-medium leading-relaxed">
                      {activeStage.historicalTruth}
                    </p>
                  </div>
                )}

                {currentStageIdx < decisionPoints.length - 1 && (
                  <button
                    onClick={handleNextStage}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    Proceed to Next Crisis <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. CODE EXECUTION & STEPPER SANDBOX (Technology / Computer Science)
// ============================================================================
function CodeExecutionSimulator({ topic, sim, blueprint }) {
  const codeSandbox = sim.codeSandbox || {
    language: 'python',
    code: [
      `# Demonstration algorithm for ${topic}`,
      `def solve_problem(items, target):`,
      `    left, right = 0, len(items) - 1`,
      `    while left <= right:`,
      `        mid = (left + right) // 2`,
      `        if items[mid] == target:`,
      `            return mid`,
      `        elif items[mid] < target:`,
      `            left = mid + 1`,
      `        else:`,
      `            right = mid - 1`,
      `    return -1`
    ],
    executionTrace: [
      { line: 2, active: `left, right = 0, len(items) - 1`, variables: { left: 0, right: 7, target: 42 }, note: "Initialize bounds" },
      { line: 3, active: `while left <= right:`, variables: { condition: "0 <= 7 (True)" }, note: "Boundary check holds" },
      { line: 4, active: `mid = (left + right) // 2`, variables: { mid: 3, valueAtMid: 30 }, note: "Compute midpoint index" },
      { line: 7, active: `elif items[mid] < target:`, variables: { check: "30 < 42 (True)" }, note: "Target in upper partition" },
      { line: 8, active: `left = mid + 1`, variables: { left: 4, right: 7 }, note: "Narrow search window to right half" },
      { line: 4, active: `mid = (4 + 7) // 2 = 5`, variables: { mid: 5, valueAtMid: 42 }, note: "New midpoint match found!" }
    ]
  };

  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const lines = Array.isArray(codeSandbox.code) ? codeSandbox.code : [];
  const traces = Array.isArray(codeSandbox.executionTrace) && codeSandbox.executionTrace.length > 0
    ? codeSandbox.executionTrace
    : [{ line: 0, active: lines[0] || '', variables: { status: 'Running' }, note: 'Execution started' }];

  const currentTrace = traces[stepIdx] || traces[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
            Code & Memory Stepper • {codeSandbox.language || 'Code'}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {sim.title || `${topic}: Interactive Code Stepper`}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            {sim.description || `Trace code execution line by line, inspect variable mutations in memory, and observe runtime state.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStepIdx(prev => Math.max(0, prev - 1))}
            disabled={stepIdx === 0}
            className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 cursor-pointer"
          >
            Prev Step
          </button>
          <button
            onClick={() => setStepIdx(prev => Math.min(traces.length - 1, prev + 1))}
            disabled={stepIdx === traces.length - 1}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 cursor-pointer shadow-sm"
          >
            Next Step ({stepIdx + 1}/{traces.length})
          </button>
          <button
            onClick={() => setStepIdx(0)}
            className="p-2 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Code Canvas Viewport */}
        <div className="bg-gray-950 rounded-2xl border border-gray-800 shadow-xl overflow-hidden font-mono text-xs">
          <div className="bg-gray-900/80 px-4 py-3 border-b border-gray-800 flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4 text-sky-400" /> main.{codeSandbox.language === 'python' ? 'py' : 'js'}
            </span>
            <span className="text-[11px] text-gray-500">Step {stepIdx + 1} of {traces.length}</span>
          </div>

          <div className="p-4 space-y-1 overflow-x-auto text-gray-300">
            {lines.map((lineText, lIdx) => {
              const isHighlight = currentTrace.line === lIdx;
              return (
                <div
                  key={lIdx}
                  className={`flex items-center gap-4 px-3 py-1 rounded transition-colors ${
                    isHighlight
                      ? 'bg-sky-950/80 border-l-2 border-sky-400 text-sky-200 font-bold'
                      : 'hover:bg-gray-900/40 text-gray-400'
                  }`}
                >
                  <span className="w-6 text-gray-600 select-none text-right shrink-0">{lIdx + 1}</span>
                  <pre className="whitespace-pre">{lineText}</pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Memory State & Variable Watcher */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Variable Inspector</span>
            </div>

            <div className="space-y-2">
              {currentTrace.variables && Object.entries(currentTrace.variables).map(([k, v]) => (
                <div key={k} className="p-2.5 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{k}</span>
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{String(v)}</span>
                </div>
              ))}
            </div>

            {currentTrace.note && (
              <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-900 dark:text-sky-300">
                <strong>Execution Note:</strong> {currentTrace.note}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. MATHEMATICAL & FUNCTION PLOT SIMULATOR (Mathematics)
// ============================================================================
function MathPlotSimulator({ topic, sim, blueprint }) {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);

  // Computed curve coordinates
  const points = useMemo(() => {
    const pts = [];
    for (let x = -5; x <= 5; x += 0.2) {
      const y = a * Math.sin(b * x);
      pts.push({ x, y });
    }
    return pts;
  }, [a, b]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
            Mathematical Function Explorer
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {sim.title || `${topic}: Interactive Mathematical Function`}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            Adjust algebraic coefficients to observe dynamic curve transformations, derivatives, and periodicity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Sliders className="w-4 h-4 text-violet-600" />
            <span>Coefficients</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Amplitude ($a$)</span>
                <span className="font-mono text-violet-600 font-bold">{a}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={a}
                onChange={(e) => setA(parseFloat(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Frequency ($b$)</span>
                <span className="font-mono text-violet-600 font-bold">{b}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={b}
                onChange={(e) => setB(parseFloat(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-mono text-violet-900 dark:text-violet-300">
            f(x) = {a} · sin({b}x)
          </div>
        </div>

        {/* Dynamic SVG Plot Canvas */}
        <div className="aspect-[16/10] bg-gray-950 rounded-2xl border border-gray-800 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:28px_28px] opacity-30"></div>

          <svg className="w-full h-full relative z-10" viewBox="-6 -6 12 12">
            {/* Axes */}
            <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#4b5563" strokeWidth="0.1" />
            <line x1="0" y1="-5.5" x2="0" y2="5.5" stroke="#4b5563" strokeWidth="0.1" />

            {/* Plotted curve */}
            <path
              d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${-p.y}`).join(' ')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="0.25"
            />
          </svg>

          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs text-gray-300 flex justify-between">
            <span>Period: <strong>{(2 * Math.PI / b).toFixed(2)}</strong></span>
            <span>Max Amplitude: <strong>{a}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. PHYSICS & PARAMETER DYNAMIC ENGINE (Science / Multi-variable Models)
// ============================================================================
function PhysicsParameterSimulator({ topic, sim, category, blueprint }) {
  const controls = useMemo(() => {
    if (Array.isArray(sim.controls) && sim.controls.length > 0) return sim.controls;
    return [
      { id: 'intensity', label: 'Primary Factor', min: 1, max: 100, step: 1, default: 50, unit: '%', description: `Key operational input for ${topic}` },
      { id: 'rate', label: 'Rate of Interaction', min: 0.1, max: 5, step: 0.1, default: 1.5, unit: 'x', description: `Velocity or interaction frequency` },
      { id: 'scale', label: 'Domain Capacity', min: 10, max: 500, step: 10, default: 200, unit: 'units', description: `System capacity or particle density` }
    ];
  }, [sim.controls, topic]);

  const [paramValues, setParamValues] = useState(() => {
    const initial = {};
    controls.forEach((ctrl, i) => {
      initial[ctrl.id || `param_${i}`] = ctrl.default !== undefined ? Number(ctrl.default) : 50;
    });
    return initial;
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStage, setActiveStage] = useState(0);

  const handleParamChange = (id, val) => {
    setParamValues((prev) => ({ ...prev, [id]: Number(val) }));
  };

  const handleReset = () => {
    const reset = {};
    controls.forEach((ctrl, i) => {
      reset[ctrl.id || `param_${i}`] = ctrl.default !== undefined ? Number(ctrl.default) : 50;
    });
    setParamValues(reset);
    setActiveStage(0);
  };

  const activityIndex = useMemo(() => {
    const vals = Object.values(paramValues);
    if (!vals.length) return 1;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.max(0.2, Math.min(3.0, (avg / 50)));
  }, [paramValues]);

  const stages = sim.stages && sim.stages.length > 0 ? sim.stages : [
    { title: 'Baseline State', description: `Initial conditions and baseline energy for ${topic}.` },
    { title: 'Intermediate Reaction', description: `Dynamic steady-state equilibrium as inputs increase.` },
    { title: 'Peak Saturation', description: `Boundary conditions or maximum capacity.` }
  ];

  const metrics = sim.metrics && sim.metrics.length > 0 ? sim.metrics : [
    { label: 'System Response', formula: 'Output = f(inputs)', effect: 'Scales with parameter adjustments' },
    { label: 'Dynamic Efficiency', formula: 'η = (Work / Input) × 100%', effect: 'Reflects relative energy utilization' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {category} • Universal Simulator
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {sim.title || `Interactive Simulation: ${topic}`}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
            {sim.description || `Explore governing mechanics and real-time parameter dynamics of ${topic}.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-md cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            title="Reset to defaults"
            className="p-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">
        {/* Dynamic Controls Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Interactive Parameters</span>
            </div>

            <div className="space-y-4">
              {controls.map((ctrl, idx) => {
                const ctrlId = ctrl.id || `param_${idx}`;
                const val = paramValues[ctrlId] !== undefined ? paramValues[ctrlId] : ctrl.default;

                return (
                  <div key={ctrlId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">{ctrl.label}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                        {val} {ctrl.unit || ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min ?? 1}
                      max={ctrl.max ?? 100}
                      step={ctrl.step ?? 1}
                      value={val}
                      onChange={(e) => handleParamChange(ctrlId, e.target.value)}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    {ctrl.description && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                        {ctrl.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Governing Metrics Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Governing Relationships</span>
            </div>

            <div className="space-y-3">
              {metrics.map((metric, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-950/60 rounded-xl border border-gray-200/60 dark:border-gray-800/60">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs block mb-1">{metric.label}</span>
                  <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-white dark:bg-gray-900 p-1.5 rounded border border-gray-200 dark:border-gray-800">
                    {metric.formula}
                  </div>
                  {metric.effect && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      {metric.effect}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Visualizer Canvas */}
        <div className="space-y-6">
          <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 text-white select-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:32px_32px] opacity-25"></div>

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
              <motion.div
                animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                transition={{ repeat: Infinity, duration: Math.max(2, 12 / activityIndex), ease: "linear" }}
                className="relative flex items-center justify-center"
              >
                <div 
                  className="rounded-full border border-dashed border-indigo-400/40"
                  style={{
                    width: `${Math.min(280, 160 * activityIndex)}px`,
                    height: `${Math.min(280, 160 * activityIndex)}px`,
                    transition: 'all 0.3s ease'
                  }}
                />

                <motion.div
                  animate={isPlaying ? { rotate: -360 } : { rotate: 0 }}
                  transition={{ repeat: Infinity, duration: Math.max(3, 16 / activityIndex), ease: "linear" }}
                  className="absolute rounded-full border border-emerald-400/30"
                  style={{
                    width: `${Math.min(220, 120 * activityIndex)}px`,
                    height: `${Math.min(220, 120 * activityIndex)}px`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_12px_#34d399]" />
                </motion.div>

                <motion.div
                  animate={isPlaying ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-[0_0_35px_rgba(99,102,241,0.6)] flex flex-col items-center justify-center p-2 text-center"
                >
                  <Sparkles className="w-5 h-5 text-indigo-100 mb-0.5 animate-pulse" />
                  <span className="text-[10px] font-bold text-white tracking-wider uppercase leading-tight line-clamp-1">
                    {topic}
                  </span>
                </motion.div>

                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-400 rounded-full shadow-[0_0_12px_#818cf8]" />
              </motion.div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-gray-400'}`}></span>
                  <span className="text-gray-300 font-medium">
                    {isPlaying ? 'Simulation Running' : 'Simulation Paused'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <span>Activity Index: <strong className="text-white font-mono">{activityIndex.toFixed(2)}x</strong></span>
                  <span>State: <strong className="text-indigo-300 font-semibold">{stages[activeStage]?.title || 'Active'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive State Progression Steps */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>System State Progression</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stages.map((stage, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStage(i)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    activeStage === i
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-950/40 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Phase {i + 1}
                    </span>
                    {activeStage === i && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                  <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-white">
                    {stage.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {stage.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
