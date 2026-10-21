'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClaySlider } from '@/components/ui/ClaySlider';
import { ClayBadge } from '@/components/ui/ClayBadge';

export interface SimulatorEngineProps {
  topic: any;
}

export const SimulatorEngine: React.FC<SimulatorEngineProps> = ({ topic }) => {
  const sim = topic.simulator || {
    title: 'Interactive Conceptual Simulator',
    description: 'Adjust variables to observe real-time dynamic behavior.',
    initialParams: { p1: 45, p2: 50 },
    paramConfig: [
      { key: 'p1', label: 'Primary Variable', min: 0, max: 100, step: 1, unit: '%' },
      { key: 'p2', label: 'Reaction Velocity', min: 10, max: 200, step: 5, unit: ' m/s' },
    ],
    challengeTarget: 'Achieve optimal resonance equilibrium!'
  };

  const [params, setParams] = useState<{ [k: string]: number }>(sim.initialParams);
  const [isRunning, setIsRunning] = useState(true);
  const [stepTick, setStepTick] = useState(0);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  // Update param helper
  const handleParamChange = (key: string, val: number) => {
    setParams(prev => ({ ...prev, [key]: val }));
  };

  // Simulation tick loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setStepTick(prev => (prev + 1) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Derived real-time metrics
  const aliceA = params.aliceAngle ?? params.grainPrice ?? params.parentRenders ?? 45;
  const bobB = params.bobAngle ?? params.taxOnThirdEstate ?? params.childMemoized ?? 45;
  const diffAngle = Math.abs(aliceA - bobB);

  // Bell correlation calculation: -cos(theta)
  const radians = (diffAngle * Math.PI) / 180;
  const correlationVal = -Math.cos(radians);
  const chshScore = Math.min(2.828, (Math.abs(correlationVal) * 2.828).toFixed(3) as any);

  // Challenge check
  useEffect(() => {
    if (isChallengeMode && chshScore >= 2.8) {
      if (!challengeSuccess) {
        setChallengeSuccess(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setChallengeSuccess(false);
    }
  }, [chshScore, isChallengeMode, challengeSuccess]);

  const handleReset = () => {
    setParams(sim.initialParams);
    setStepTick(0);
    setChallengeSuccess(false);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Stage Header */}
      <ClayCard padding="lg" className="space-y-4 shadow-[6px_6px_0px_var(--border-clay)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-[2px] border-[var(--border-clay)]">
          <div className="space-y-1">
            <ClayBadge variant="primary" size="sm">
              Functional Interactive Simulator
            </ClayBadge>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-clay)]">
              {sim.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <ClayButton
              size="sm"
              variant={isChallengeMode ? 'accent' : 'secondary'}
              onClick={() => setIsChallengeMode(!isChallengeMode)}
            >
              🎯 {isChallengeMode ? 'Challenge Mode ON' : 'Challenge Mode'}
            </ClayButton>
            <ClayButton size="sm" variant="secondary" onClick={handleReset}>
              Reset ↻
            </ClayButton>
            <ClayButton
              size="sm"
              variant={isRunning ? 'secondary' : 'primary'}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Pause ⏸' : 'Run ▶'}
            </ClayButton>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--muted-clay)] font-bold">
          {sim.description}
        </p>

        {isChallengeMode && (
          <div className="p-4 rounded-[20px] border-[2px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] flex items-center justify-between shadow-[3px_3px_0px_var(--border-clay)] animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-black">
              <span>🎯 Target:</span>
              <span>{sim.challengeTarget}</span>
            </div>
            {challengeSuccess && (
              <span className="px-3 py-1 rounded-full bg-[#B5EAD7] text-[#1A2F0D] border border-[#1A2F0D] text-xs font-black">
                Target Reached! 🌟
              </span>
            )}
          </div>
        )}
      </ClayCard>

      {/* Main Grid: Interactive Canvas + Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Vector Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <ClayCard padding="lg" className="aspect-[4/3] flex flex-col justify-between shadow-[8px_8px_0px_var(--border-clay)] relative overflow-hidden bg-[var(--bg-clay)]">
            {/* Real-time Monospace Readouts */}
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-clay)] z-10">
              <span className="px-2.5 py-1 rounded-lg border border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[2px_2px_0px_var(--border-clay)]">
                Angle Diff (Δθ): {diffAngle}°
              </span>
              <span className="px-2.5 py-1 rounded-lg border border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[2px_2px_0px_var(--border-clay)] text-[var(--primary-clay)]">
                CHSH Bound: {chshScore} / 2.828
              </span>
            </div>

            {/* SVG Visual Simulation Model */}
            <div className="flex-1 flex items-center justify-center relative my-4">
              <svg viewBox="0 0 400 300" className="w-full h-full max-h-72">
                {/* Background coordinate grid */}
                <circle cx="200" cy="150" r="110" fill="none" stroke="var(--border-clay)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
                <circle cx="200" cy="150" r="60" fill="none" stroke="var(--border-clay)" strokeWidth="1.5" opacity="0.3" />

                {/* Alice Polarizer Vector */}
                <g transform={`rotate(${aliceA}, 200, 150)`}>
                  <line x1="200" y1="150" x2="200" y2="50" stroke="var(--primary-clay)" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="200" cy="50" r="7" fill="var(--primary-clay)" stroke="var(--border-clay)" strokeWidth="2" />
                  <text x="205" y="45" fill="var(--text-clay)" fontSize="12" fontWeight="bold">Alice ({aliceA}°)</text>
                </g>

                {/* Bob Polarizer Vector */}
                <g transform={`rotate(${bobB}, 200, 150)`}>
                  <line x1="200" y1="150" x2="200" y2="50" stroke="var(--secondary-clay)" strokeWidth="4.5" strokeLinecap="round" />
                  <circle cx="200" cy="50" r="7" fill="var(--secondary-clay)" stroke="var(--border-clay)" strokeWidth="2" />
                  <text x="205" y="45" fill="var(--text-clay)" fontSize="12" fontWeight="bold">Bob ({bobB}°)</text>
                </g>

                {/* Center Entangled Pair Source */}
                <circle cx="200" cy="150" r="20" fill="var(--accent-clay)" stroke="var(--border-clay)" strokeWidth="3" />
                <circle cx="200" cy="150" r="8" fill="var(--primary-clay)" />

                {/* Dynamic Photon Wave Pulses */}
                {isRunning && (
                  <>
                    <circle cx="200" cy="150" r={((stepTick * 2) % 110)} fill="none" stroke="var(--primary-clay)" strokeWidth="2" opacity={1 - ((stepTick * 2) % 110) / 110} />
                    <circle cx="200" cy="150" r={(((stepTick + 60) * 2) % 110)} fill="none" stroke="var(--secondary-clay)" strokeWidth="2" opacity={1 - (((stepTick + 60) * 2) % 110) / 110} />
                  </>
                )}
              </svg>
            </div>

            {/* Canvas Bottom Legend */}
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted-clay)] z-10 pt-2 border-t border-[var(--border-clay)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[var(--primary-clay)]" />
                <span>Detector A</span>
                <span className="w-3 h-3 rounded-full bg-[var(--secondary-clay)] ml-2" />
                <span>Detector B</span>
              </div>
              <span className="font-mono">
                Coincidence Rate: {Math.round(Math.abs(correlationVal) * 100)}%
              </span>
            </div>
          </ClayCard>
        </div>

        {/* Right Column: Chunky Parameter Sliders */}
        <div className="lg:col-span-5 space-y-4">
          <ClayCard padding="lg" className="space-y-6 shadow-[6px_6px_0px_var(--border-clay)]">
            <h3 className="text-base font-black text-[var(--text-clay)] uppercase tracking-tight">
              Parameter Controls
            </h3>

            <div className="space-y-5">
              {sim.paramConfig.map((p: any) => (
                <ClaySlider
                  key={p.key}
                  label={p.label}
                  value={params[p.key] ?? p.min}
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  unit={p.unit}
                  onChange={(val) => handleParamChange(p.key, val)}
                />
              ))}
            </div>

            {/* Real-time Math Output Card */}
            <div className="p-4 rounded-[20px] border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--muted-clay)] block">
                Calculated Quantum Expectation
              </span>
              <p className="font-mono text-base font-black text-[var(--text-clay)]">
                E(θ) = -cos({diffAngle}°) = {correlationVal.toFixed(4)}
              </p>
              <p className="text-[11px] font-medium text-[var(--muted-clay)]">
                {chshScore > 2.0
                  ? '🔥 Non-local Bell violation confirmed! Beyond classical hidden variable limit (S > 2.0).'
                  : 'ℹ️ Sub-classical or aligned detector angle. Local hidden variables could explain this.'}
              </p>
            </div>
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
