'use client';

import React, { useState, useEffect } from 'react';

export const FocusModeButton: React.FC<{
  onToggleFocus: (isFocus: boolean) => void;
  isFocus: boolean;
}> = ({ onToggleFocus, isFocus }) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    } else if (secondsLeft === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          onToggleFocus(!isFocus);
          setShowPomodoro(!isFocus);
        }}
        className={`
          inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[16px]
          border-[2.5px] border-[var(--border-clay)] font-black text-xs uppercase tracking-wider
          shadow-[var(--shadow-clay)] transition-all cursor-pointer select-none
          ${isFocus ? 'bg-[var(--accent-clay)] text-[#1A1A1A]' : 'bg-[var(--surface-clay)] text-[var(--text-clay)]'}
          hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[var(--shadow-clay-hover)]
          active:translate-x-[1px] active:translate-y-[1px]
        `}
        title="Toggle Distraction-Free Focus Mode & Pomodoro"
      >
        <span>🎯</span>
        <span className="hidden sm:inline">{isFocus ? 'Exit Focus' : 'Focus Mode'}</span>
        {isFocus && <span className="font-mono text-xs font-bold">({formatTime(secondsLeft)})</span>}
      </button>

      {/* Floating Pomodoro Controls when in Focus Mode */}
      {isFocus && showPomodoro && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl border-[3px] border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[6px_6px_0px_var(--border-clay)] flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-[10px] font-extrabold uppercase text-[var(--muted-clay)]">Pomodoro Sprint</p>
            <p className="text-lg font-mono font-black text-[var(--text-clay)]">{formatTime(secondsLeft)}</p>
          </div>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className="px-3 py-1 text-xs font-bold rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--primary-clay)] text-white shadow-[2px_2px_0px_var(--border-clay)]"
          >
            {timerRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => {
              setSecondsLeft(25 * 60);
              setTimerRunning(false);
            }}
            className="px-2 py-1 text-xs font-bold rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)]"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
