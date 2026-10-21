'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';

export interface QuizEngineProps {
  topic: any;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ topic }) => {
  const quizData = topic.quiz || {
    questions: [],
    feynmanPrompt: 'Explain this topic in simple terms.',
    rubricPoints: []
  };

  const questions = quizData.questions || [];
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Timer states
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(60);

  const currentQ = questions[currentQIndex] || questions[0];
  const isCorrect = selectedOption === currentQ?.correctOption;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && !isFinished && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0 && !isSubmitted) {
      setIsSubmitted(true);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, isFinished, seconds, isSubmitted]);

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitQuestion = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);

    if (selectedOption === currentQ.correctOption) {
      setScore(s => s + 1);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(q => q + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setSeconds(60);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setSeconds(60);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Bar: Question Counter + Timer toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClayBadge variant="primary" size="md">
            Question {currentQIndex + 1} of {questions.length}
          </ClayBadge>
          <span className="text-xs font-bold text-[var(--muted-clay)]">
            Score: {score}/{questions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isTimerActive && (
            <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-xl border-2 border-[var(--border-clay)] ${seconds < 10 ? 'bg-[#FFB4A2] text-[#660708]' : 'bg-[var(--surface-clay)] text-[var(--text-clay)]'}`}>
              ⏱️ 00:{seconds < 10 ? `0${seconds}` : seconds}
            </span>
          )}

          <button
            onClick={() => setIsTimerActive(!isTimerActive)}
            className="text-xs font-extrabold text-[var(--muted-clay)] hover:text-[var(--text-clay)] underline cursor-pointer"
          >
            {isTimerActive ? 'Disable Timer' : '⏱️ Enable Timer'}
          </button>
        </div>
      </div>

      {/* Question Progress Bar */}
      <div className="w-full h-3 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
        <div
          className="h-full bg-[var(--primary-clay)] transition-all duration-300"
          style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {!isFinished ? (
        /* Question Card */
        <ClayCard padding="xl" className="space-y-6 shadow-[8px_8px_0px_var(--border-clay)]">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary-clay)]">
              Conceptual Misconception Trap Buster
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-clay)] leading-snug">
              {currentQ.scenario}
            </h2>
          </div>

          {/* Clickable MCQ Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt: string, optIdx: number) => {
              const isSelected = selectedOption === optIdx;
              const isOptCorrect = optIdx === currentQ.correctOption;

              let style = 'border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)]';
              if (isSelected && !isSubmitted) {
                style = 'border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] shadow-[4px_4px_0px_var(--border-clay)] -translate-y-0.5';
              } else if (isSubmitted) {
                if (isOptCorrect) {
                  style = 'border-[#1A2F0D] bg-[#B5EAD7] text-[#1A2F0D] font-black shadow-[3px_3px_0px_#1A2F0D]';
                } else if (isSelected) {
                  style = 'border-[#660708] bg-[#FFB4A2] text-[#660708] shadow-[3px_3px_0px_#660708]';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isSubmitted}
                  className={`
                    w-full p-4 sm:p-5 rounded-[22px] border-[2.5px] text-left text-sm sm:text-base font-bold transition-all cursor-pointer flex items-center justify-between
                    ${style}
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-xl border-[2px] border-current flex items-center justify-center text-xs font-black shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <span className="text-lg">🎯</span>}
                </button>
              );
            })}
          </div>

          {/* Feedback Block with Trap Breakdown */}
          {isSubmitted && (
            <div
              className={`
                p-5 rounded-[24px] border-[2.5px] text-xs sm:text-sm font-bold leading-relaxed space-y-2 shadow-[4px_4px_0px_var(--border-clay)] animate-in fade-in
                ${
                  isCorrect
                    ? 'border-[#1A2F0D] bg-[#B5EAD7] text-[#1A2F0D]'
                    : 'border-[#660708] bg-[#FFB4A2] text-[#660708]'
                }
              `}
            >
              <div className="flex items-center gap-2 font-black uppercase text-sm">
                {isCorrect ? '🎉 Aced It! Correct Principle' : '⚠️ Misconception Trap Tripped'}
              </div>
              <p>{currentQ.trapExplanation}</p>
            </div>
          )}

          {/* Bottom Action Button */}
          <div className="pt-4 border-t-[2px] border-[var(--border-clay)] flex justify-end">
            {!isSubmitted ? (
              <ClayButton
                size="lg"
                variant="primary"
                disabled={selectedOption === null}
                onClick={handleSubmitQuestion}
              >
                Submit Answer →
              </ClayButton>
            ) : (
              <ClayButton size="lg" variant="primary" onClick={handleNextQuestion}>
                {currentQIndex === questions.length - 1 ? 'View Final Results 🏆' : 'Next Question →'}
              </ClayButton>
            )}
          </div>
        </ClayCard>
      ) : (
        /* Final Score Page with Chunky Medal Illustration */
        <ClayCard padding="xl" className="text-center space-y-6 shadow-[8px_8px_0px_var(--border-clay)]">
          <div className="w-24 h-24 mx-auto rounded-full border-[3px] border-[var(--border-clay)] bg-[var(--accent-clay)] flex items-center justify-center text-5xl shadow-[4px_4px_0px_var(--border-clay)] animate-bounce">
            🥇
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-clay)]">
              Quiz Completed!
            </h2>
            <p className="text-base font-bold text-[var(--muted-clay)]">
              You scored <span className="text-[var(--primary-clay)] text-xl">{score}</span> out of{' '}
              <span className="text-[var(--text-clay)] text-xl">{questions.length}</span> ({Math.round((score / questions.length) * 100)}%)
            </p>
          </div>

          {/* Feynman Challenge Prompt */}
          {quizData.feynmanPrompt && (
            <div className="p-6 rounded-[24px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-left space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--primary-clay)] block">
                Bonus Feynman Mastery Challenge
              </span>
              <p className="text-sm font-bold text-[var(--text-clay)]">
                "{quizData.feynmanPrompt}"
              </p>
              <div className="text-xs text-[var(--muted-clay)] space-y-1">
                <p className="font-extrabold text-[var(--text-clay)]">Key Points to Mention:</p>
                {quizData.rubricPoints?.map((p: string, i: number) => (
                  <p key={i}>• {p}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <ClayButton size="lg" variant="secondary" onClick={handleRestart}>
              Retake Quiz ↻
            </ClayButton>
            <ClayButton size="lg" variant="primary" href="/dashboard">
              Back to Dashboard →
            </ClayButton>
          </div>
        </ClayCard>
      )}
    </div>
  );
};
