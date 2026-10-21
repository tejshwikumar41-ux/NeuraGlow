'use client';

import React, { useState } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';

export interface PracticeEngineProps {
  topic: any;
}

export const PracticeEngine: React.FC<PracticeEngineProps> = ({ topic }) => {
  const practiceData = topic.practice || {
    title: 'Applied Practical Problem',
    scenario: 'Analyze the given scenario and execute the calculation step by step.',
    steps: []
  };

  const steps = practiceData.steps || [];
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [step: number]: number }>({});
  const [submittedSteps, setSubmittedSteps] = useState<{ [step: number]: boolean }>({});
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const currentStep = steps[activeStepIdx] || steps[0];
  const isCurrentSubmitted = submittedSteps[activeStepIdx];
  const isCorrect = selectedAnswers[activeStepIdx] === currentStep?.correctOption;

  const handleSelect = (optIdx: number) => {
    if (isCurrentSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [activeStepIdx]: optIdx }));
  };

  const handleSubmit = () => {
    if (selectedAnswers[activeStepIdx] === undefined) return;
    setSubmittedSteps(prev => ({ ...prev, [activeStepIdx]: true }));

    if (selectedAnswers[activeStepIdx] === currentStep.correctOption) {
      if (activeStepIdx === steps.length - 1) {
        setIsCompleted(true);
      }
    }
  };

  const handleNext = () => {
    if (activeStepIdx < steps.length - 1) {
      setActiveStepIdx(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handleReset = () => {
    setActiveStepIdx(0);
    setSelectedAnswers({});
    setSubmittedSteps({});
    setShowHint(false);
    setIsCompleted(false);
    setShowSolution(false);
  };

  return (
    <div className="space-y-6">
      {/* Problem Header Card */}
      <ClayCard padding="lg" className="space-y-4 shadow-[6px_6px_0px_var(--border-clay)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-[2px] border-[var(--border-clay)]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary-clay)]">
                Active-Execution Step Solver
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-clay)]">
                {practiceData.title}
              </h2>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--muted-clay)] mr-1">Steps:</span>
            {steps.map((_: any, idx: number) => {
              const isDone = submittedSteps[idx] && selectedAnswers[idx] === steps[idx].correctOption;
              const isCurrent = idx === activeStepIdx;
              return (
                <div
                  key={idx}
                  className={`
                    w-7 h-7 rounded-full border-[2px] border-[var(--border-clay)] flex items-center justify-center font-black text-xs transition-all
                    ${
                      isDone
                        ? 'bg-[#B5EAD7] text-[#1A2F0D] shadow-[1px_1px_0px_var(--border-clay)]'
                        : isCurrent
                        ? 'bg-[var(--accent-clay)] text-[#1A1A1A] scale-110 shadow-[2px_2px_0px_var(--border-clay)]'
                        : 'bg-[var(--bg-clay)] text-[var(--muted-clay)]'
                    }
                  `}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Problem Scenario */}
        <div className="p-4 rounded-[20px] border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-sm sm:text-base font-medium text-[var(--text-clay)] leading-relaxed">
          {practiceData.scenario}
        </div>
      </ClayCard>

      {/* Active Step Solver Card */}
      {!isCompleted ? (
        <ClayCard padding="lg" className="space-y-6 shadow-[6px_6px_0px_var(--border-clay)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-[var(--primary-clay)] uppercase">
                Step 0{activeStepIdx + 1} of 0{steps.length}
              </span>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-extrabold text-[var(--secondary-clay)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                💡 {showHint ? 'Hide Hint' : 'Need a Hint?'}
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[var(--text-clay)]">
              {currentStep.instruction}
            </h3>
          </div>

          {/* Hint Badge Box */}
          {showHint && (
            <div className="p-4 rounded-[18px] border-[2px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] text-xs font-bold leading-relaxed shadow-[3px_3px_0px_var(--border-clay)] animate-in fade-in">
              💡 <strong>Hint:</strong> {currentStep.hint}
            </div>
          )}

          {/* Clickable Options Cards */}
          <div className="space-y-3">
            {currentStep.options.map((opt: string, optIdx: number) => {
              const isSelected = selectedAnswers[activeStepIdx] === optIdx;
              const isSubmitted = isCurrentSubmitted;
              const isOptCorrect = optIdx === currentStep.correctOption;

              let cardStyle = 'border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)]';
              if (isSelected && !isSubmitted) {
                cardStyle = 'border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] shadow-[4px_4px_0px_var(--border-clay)] -translate-y-0.5';
              } else if (isSubmitted) {
                if (isOptCorrect) {
                  cardStyle = 'border-[#1A2F0D] bg-[#B5EAD7] text-[#1A2F0D] font-black shadow-[3px_3px_0px_#1A2F0D]';
                } else if (isSelected) {
                  cardStyle = 'border-[#660708] bg-[#FFB4A2] text-[#660708] shadow-[3px_3px_0px_#660708]';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(optIdx)}
                  disabled={isCurrentSubmitted}
                  className={`
                    w-full p-4 rounded-[20px] border-[2.5px] text-left text-sm font-bold transition-all cursor-pointer flex items-center justify-between
                    ${cardStyle}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg border-[2px] border-current flex items-center justify-center text-xs font-black shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <span>👉</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback Block */}
          {isCurrentSubmitted && (
            <div
              className={`
                p-5 rounded-[22px] border-[2.5px] text-xs sm:text-sm font-bold leading-relaxed space-y-1.5 shadow-[4px_4px_0px_var(--border-clay)]
                ${
                  isCorrect
                    ? 'border-[#1A2F0D] bg-[#B5EAD7] text-[#1A2F0D]'
                    : 'border-[#660708] bg-[#FFB4A2] text-[#660708]'
                }
              `}
            >
              <div className="flex items-center gap-2 text-sm font-black uppercase">
                {isCorrect ? '✅ Step Solved Correctly!' : '❌ Calculation Error Detected'}
              </div>
              <p>{currentStep.explanation}</p>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t-[2px] border-[var(--border-clay)] flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <ClayButton size="sm" variant="secondary" onClick={handleReset}>
                Reset
              </ClayButton>
              <ClayButton
                size="sm"
                variant="ghost"
                onClick={() => setShowSolution(!showSolution)}
              >
                {showSolution ? 'Hide Solution' : 'Show Solution'}
              </ClayButton>
            </div>

            {!isCurrentSubmitted ? (
              <ClayButton
                size="md"
                variant="primary"
                disabled={selectedAnswers[activeStepIdx] === undefined}
                onClick={handleSubmit}
              >
                Verify Step Answer →
              </ClayButton>
            ) : isCorrect ? (
              <ClayButton size="md" variant="primary" onClick={handleNext}>
                {activeStepIdx === steps.length - 1 ? 'Finish Problem' : 'Next Step →'}
              </ClayButton>
            ) : (
              <ClayButton
                size="md"
                variant="accent"
                onClick={() => {
                  setSubmittedSteps(prev => ({ ...prev, [activeStepIdx]: false }));
                }}
              >
                Try Again ↻
              </ClayButton>
            )}
          </div>

          {showSolution && (
            <div className="p-4 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] text-xs text-[var(--text-clay)] space-y-1 font-mono">
              <p className="font-bold">Correct Solution:</p>
              <p>Option: {String.fromCharCode(65 + currentStep.correctOption)} - {currentStep.options[currentStep.correctOption]}</p>
              <p>{currentStep.explanation}</p>
            </div>
          )}
        </ClayCard>
      ) : (
        /* Problem Complete Celebration Card */
        <ClayCard padding="xl" className="text-center space-y-5 bg-[#B5EAD7] text-[#1A2F0D] border-[#1A2F0D]">
          <span className="text-6xl block">🏆</span>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black">
              Problem Mastered & Solved!
            </h3>
            <p className="text-sm font-bold">
              You executed every discrete phase with full theoretical precision.
            </p>
          </div>
          <ClayButton size="lg" variant="primary" onClick={handleReset}>
            Solve Another Variant ↻
          </ClayButton>
        </ClayCard>
      )}
    </div>
  );
};
