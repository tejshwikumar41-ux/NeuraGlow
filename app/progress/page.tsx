'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';

import { getCleanSavedLibrary } from '@/lib/storageUtils';

export default function ProgressPage() {
  const [savedLibrary, setSavedLibrary] = useState<any[]>([]);

  useEffect(() => {
    const loadLibrary = () => {
      const cleaned = getCleanSavedLibrary();
      setSavedLibrary(cleaned);
    };

    loadLibrary();
    window.addEventListener('storage', loadLibrary);
    return () => window.removeEventListener('storage', loadLibrary);
  }, []);

  const hasActivity = savedLibrary.length > 0;
  const userGrade = hasActivity ? 'A' : '—';
  const streakDays = hasActivity ? 1 : 0;

  // Group topics by domain for subject breakdown
  const domainCounts: Record<string, number> = {};
  savedLibrary.forEach((t) => {
    const d = t.domain || 'General';
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  });

  const subjectBreakdown = Object.entries(domainCounts).map(([subject, count], i) => {
    const percent = Math.round((count / savedLibrary.length) * 100);
    const colors = ['var(--primary-clay)', 'var(--secondary-clay)', 'var(--accent-clay)', '#E63946'];
    return {
      subject,
      hours: +(count * 0.8).toFixed(1),
      percent,
      color: colors[i % colors.length],
    };
  });

  // 28-day activity heatmap data
  const heatmapDays = Array.from({ length: 28 }).map((_, i) => {
    // If activity exists, light up today (day 28)
    const intensity = hasActivity && i === 27 ? 3 : 0;
    return { day: i + 1, intensity };
  });

  const milestones = [
    { id: 'm1', name: 'First Topic Explored', desc: 'Synthesized your first master curriculum', icon: '🌱', unlocked: hasActivity },
    { id: 'm2', name: 'Library Collector', desc: 'Saved 3+ modules to personal study deck', icon: '📚', unlocked: savedLibrary.length >= 3 },
    { id: 'm3', name: 'Quiz Master', desc: 'Scored 100% on Feynman adaptive questions', icon: '🎯', unlocked: false },
    { id: 'm4', name: 'Deep Scholar', desc: 'Completed a 50,000-word academic treatise', icon: '📖', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-clay)] p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
      {/* Header with Weekly Report Card Grade */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-[2.5px] border-[var(--border-clay)]">
        <div>
          <ClayBadge variant="primary" size="md">
            Learning Analytics
          </ClayBadge>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-clay)] tracking-tight mt-1">
            Mastery & Progress Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[var(--muted-clay)]">
            Quantitative analysis of your study consistency, quiz accuracy, and domain mastery.
          </p>
        </div>

        {/* Weekly Report Card Badge */}
        <div className="flex items-center gap-4 p-4 rounded-[24px] border-[3px] border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[6px_6px_0px_var(--border-clay)]">
          <div className="w-14 h-14 rounded-2xl border-[2.5px] border-[var(--border-clay)] bg-[var(--accent-clay)] flex items-center justify-center text-3xl font-black shadow-[2px_2px_0px_var(--border-clay)]">
            {userGrade}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-clay)] block">
              Study Status
            </span>
            <p className="text-sm font-black text-[var(--text-clay)]">
              {hasActivity ? 'Active Scholar' : 'Blank Slate'}
            </p>
            <p className="text-[11px] font-bold text-[var(--primary-clay)]">
              {hasActivity ? `${savedLibrary.length} Curricula Explored 🔥` : 'Ready to Start First Topic 🌱'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Chunky Activity Heatmap Calendar */}
      <ClayCard padding="lg" className="space-y-4 shadow-[6px_6px_0px_var(--border-clay)]">
        <div className="flex items-center justify-between pb-2 border-b-[2px] border-[var(--border-clay)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h3 className="text-lg font-black text-[var(--text-clay)]">
              Daily Study Consistency Heatmap (Last 4 Weeks)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--primary-clay)]">
            Active Streak: {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2.5 sm:gap-3.5 pt-2">
          {heatmapDays.map((d) => {
            const colors = [
              'bg-[var(--bg-clay)] border-dashed text-[var(--muted-clay)]',
              'bg-[var(--accent-clay)]/40',
              'bg-[var(--accent-clay)]',
              'bg-[var(--primary-clay)] text-white shadow-[2px_2px_0px_var(--border-clay)]',
            ];
            return (
              <div
                key={d.day}
                className={`
                  aspect-square rounded-[14px] sm:rounded-[18px] border-[2px] border-[var(--border-clay)] flex items-center justify-center font-mono font-black text-xs sm:text-sm select-none transition-transform hover:scale-110 cursor-pointer
                  ${colors[d.intensity]}
                `}
                title={`Day ${d.day}: ${d.intensity > 0 ? 'Active study session' : 'Rest day'}`}
              >
                {d.day}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted-clay)] pt-2 border-t border-[var(--border-clay)]">
          <span>Rest</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)]" />
            <span className="w-3.5 h-3.5 rounded-md border border-[var(--border-clay)] bg-[var(--accent-clay)]/40" />
            <span className="w-3.5 h-3.5 rounded-md border border-[var(--border-clay)] bg-[var(--accent-clay)]" />
            <span className="w-3.5 h-3.5 rounded-md border border-[var(--border-clay)] bg-[var(--primary-clay)]" />
          </div>
          <span>Deep study</span>
        </div>
      </ClayCard>

      {/* 2. Charts Grid: Topics Mastered & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chunky Bar Chart: Topics Mastered Over Time (Span 7) */}
        <ClayCard padding="lg" className="lg:col-span-7 space-y-6 shadow-[6px_6px_0px_var(--border-clay)]">
          <div className="flex items-center justify-between pb-2 border-b-[2px] border-[var(--border-clay)]">
            <h3 className="text-lg font-black text-[var(--text-clay)]">
              Curricula in Library
            </h3>
            <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">Total: {savedLibrary.length}</span>
          </div>

          {savedLibrary.length > 0 ? (
            <div className="h-48 flex items-end justify-center gap-6 pt-6 px-4">
              <div className="flex flex-col items-center gap-2 h-full justify-end w-32">
                <span className="font-mono text-sm font-black text-[var(--text-clay)]">{savedLibrary.length} Modules</span>
                <div
                  style={{ height: '80%' }}
                  className="w-full rounded-[14px] border-[2.5px] border-[var(--border-clay)] bg-[var(--primary-clay)] shadow-[3px_3px_0px_var(--border-clay)]"
                />
                <span className="text-xs font-bold text-[var(--muted-clay)]">Current Library</span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 space-y-2">
              <p className="text-sm font-black text-[var(--text-clay)]">0 Modules Explored</p>
              <p className="text-xs font-bold text-[var(--muted-clay)]">
                Search any topic to add your first curriculum to your study library.
              </p>
              <ClayButton size="sm" variant="primary" href="/search">
                Explore Topic →
              </ClayButton>
            </div>
          )}
        </ClayCard>

        {/* Chunky Donut Chart: Subject Breakdown (Span 5) */}
        <ClayCard padding="lg" className="lg:col-span-5 space-y-6 shadow-[6px_6px_0px_var(--border-clay)]">
          <div className="flex items-center justify-between pb-2 border-b-[2px] border-[var(--border-clay)]">
            <h3 className="text-lg font-black text-[var(--text-clay)]">
              Time Spent by Subject
            </h3>
            <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
              {hasActivity ? `${(savedLibrary.length * 0.8).toFixed(1)}h Total` : '0h Total'}
            </span>
          </div>

          {subjectBreakdown.length > 0 ? (
            <div className="space-y-4">
              {subjectBreakdown.map((sub, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[var(--text-clay)]">
                    <span>{sub.subject}</span>
                    <span className="font-mono">{sub.hours} hrs ({sub.percent}%)</span>
                  </div>
                  <div className="w-full h-4 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                    <div
                      style={{ width: `${sub.percent}%`, backgroundColor: sub.color }}
                      className="h-full border-r border-[var(--border-clay)] transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <span className="text-3xl block">📊</span>
              <p className="text-xs font-bold text-[var(--muted-clay)]">
                No domain breakdown yet. Study records will populate automatically.
              </p>
            </div>
          )}
        </ClayCard>
      </div>

      {/* 3. Milestones Unlocked (Chunky Badge Grid) */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-clay)] tracking-tight">
          Milestones & Trophies
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m) => (
            <ClayCard
              key={m.id}
              padding="md"
              className={`space-y-2.5 shadow-[4px_4px_0px_var(--border-clay)] ${
                m.unlocked ? 'bg-[var(--surface-clay)]' : 'opacity-50 border-dashed'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] shadow-[2px_2px_0px_var(--border-clay)]">
                  {m.icon}
                </span>
                <ClayBadge size="sm" variant={m.unlocked ? 'success' : 'default'}>
                  {m.unlocked ? 'Unlocked' : 'Locked'}
                </ClayBadge>
              </div>

              <div>
                <h4 className="font-black text-sm text-[var(--text-clay)]">{m.name}</h4>
                <p className="text-xs font-medium text-[var(--muted-clay)]">{m.desc}</p>
              </div>
            </ClayCard>
          ))}
        </div>
      </section>
    </div>
  );
}
