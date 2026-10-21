'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Lightbulb, Trophy, 
  RotateCcw, ArrowRight, Sparkles, HelpCircle, 
  Check, Play 
} from 'lucide-react';
import { safeText } from '@/lib/utils/safeRender';

export default function StepByStepSolverWidget({ solver, topic }) {
  const steps = Array.isArray(solver?.interactive_steps) && solver.interactive_steps.length > 0
    ? solver.interactive_steps
    : [
        {
          step_index: 1,
          instruction: `Identify the primary governing principle for ${topic}.`,
          hint: `Consider the fundamental variables established in the chapter.`,
          expected_answer_type: 'multiple_choice',
          options: [`Core Driving Parameter`, `Random Noise`, `Secondary Artifact`, `Static Variable`],
          correct_answer: 0,
          explanation_on_success: `Exact! Establishing the primary parameter enables exact modeling for step 2.`,
          explanation_on_failure: `Secondary artifacts do not determine baseline system dynamics.`
        }
      ];

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [stepFeedback, setStepFeedback] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStep = steps[activeStepIdx] || steps[0];
  const isLastStep = activeStepIdx === steps.length - 1;

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [activeStepIdx]: optIdx }));
  };

  const handleSubmitStep = () => {
    const selected = selectedAnswers[activeStepIdx];
    if (selected === undefined || selected === '') return;

    let isCorrect = false;
    const target = currentStep.correct_answer;

    if (typeof selected === 'number' && typeof target === 'number' && currentStep.options?.length > 0) {
      isCorrect = selected === target;
    } else {
      const numUser = parseFloat(selected);
      const numTarget = parseFloat(target);
      if (!isNaN(numUser) && !isNaN(numTarget)) {
        isCorrect = Math.abs(numUser - numTarget) <= Math.max(0.1, Math.abs(numTarget) * 0.05);
      } else {
        isCorrect = String(selected).trim().toLowerCase() === String(target).trim().toLowerCase();
      }
    }

    setStepFeedback(prev => ({
      ...prev,
      [activeStepIdx]: {
        isCorrect,
        explanation: isCorrect ? currentStep.explanation_on_success : currentStep.explanation_on_failure
      }
    }));

    if (isCorrect && isLastStep) {
      setIsCompleted(true);
    }
  };

  const handleNextStep = () => {
    if (activeStepIdx < steps.length - 1) {
      setActiveStepIdx(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handleReset = () => {
    setActiveStepIdx(0);
    setSelectedAnswers({});
    setStepFeedback({});
    setShowHint(false);
    setIsCompleted(false);
  };

  const currentFeedback = stepFeedback[activeStepIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Problem Header Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-7 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Active-Execution Problem Solver
          </span>
          <span className="text-xs text-gray-500 font-mono">
            Step {activeStepIdx + 1} of {steps.length}
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {solver?.scenario_title || `Applied Problem: ${topic}`}
        </h2>

        <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
          {solver?.problem_statement}
        </div>
      </div>

      {/* Interactive Step Card */}
      {!isCompleted ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-md space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((activeStepIdx + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Step {currentStep.step_index || activeStepIdx + 1}
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
              {currentStep.instruction}
            </h3>
          </div>

          {/* Options or Direct Numeric/Text Input */}
          {Array.isArray(currentStep.options) && currentStep.options.length > 0 ? (
            <div className="space-y-3">
              {currentStep.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[activeStepIdx] === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg border border-current flex items-center justify-center text-xs font-bold shrink-0 opacity-80">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Enter your numerical calculation or answer:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedAnswers[activeStepIdx] ?? ''}
                  onChange={(e) => setSelectedAnswers(prev => ({ ...prev, [activeStepIdx]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitStep()}
                  placeholder="e.g. 5, 25.0, or your calculated value..."
                  className="flex-1 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* Hint */}
          {currentStep.hint && (
            <div>
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Need a hint for this step?
                </button>
              ) : (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>Hint:</strong> {currentStep.hint}
                </div>
              )}
            </div>
          )}

          {/* Feedback Block */}
          {currentFeedback && (
            <div
              className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                currentFeedback.isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                {currentFeedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step Solved Successfully
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" /> Thinking Error Detected
                  </>
                )}
              </div>
              <p>{currentFeedback.explanation}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            {!currentFeedback?.isCorrect ? (
              <button
                onClick={handleSubmitStep}
                disabled={selectedAnswers[activeStepIdx] === undefined}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer shadow-md"
              >
                Submit Step Answer
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                Unlock Next Step <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-10 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">
            Problem Mastered Step-by-Step!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            You successfully derived and executed every stage of this realistic scenario for <strong>{topic}</strong>.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" /> Solve Again
          </button>
        </div>
      )}
    </div>
  );
}
