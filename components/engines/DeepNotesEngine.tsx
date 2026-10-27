'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { RichContentRenderer } from '@/components/ui/RichContentRenderer';

export type DepthMode = 'detailed' | 'core' | 'crisp';

export interface DeepNotesEngineProps {
  topic: any;
  onAskTutor?: (question: string) => void;
}

export const DeepNotesEngine: React.FC<DeepNotesEngineProps> = ({ topic, onAskTutor }) => {
  const [depthMode, setDepthMode] = useState<DepthMode>('detailed');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);

  // Determine chapters based on selected depth mode
  const rawNotes = topic.notes || {};
  let chapters: any[] = [];
  if (typeof rawNotes === 'string') {
    chapters = [{
      title: topic.title || 'Official Textbook Content',
      estimatedReadTime: '45 mins',
      wordCount: rawNotes.split(/\s+/).length,
      content: rawNotes,
      formulas: topic.formulas || []
    }];
  } else if (rawNotes[depthMode]?.chapters && rawNotes[depthMode].chapters.length > 0) {
    chapters = rawNotes[depthMode].chapters;
  } else if (rawNotes.chapters && rawNotes.chapters.length > 0) {
    chapters = rawNotes.chapters;
  } else if (rawNotes.content) {
    chapters = [{
      title: topic.title || 'Official Textbook Content',
      estimatedReadTime: '45 mins',
      wordCount: typeof rawNotes.content === 'string' ? rawNotes.content.split(/\s+/).length : 5000,
      content: rawNotes.content,
      formulas: topic.formulas || []
    }];
  }

  // Floating text selection state
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentChapter = chapters[activeChapterIndex] || chapters[0] || {
    title: 'Foundational Treatise',
    estimatedReadTime: '45 mins',
    wordCount: 8000,
    content: 'Comprehensive curriculum is loading...'
  };

  // Reset chapter index on depth switch
  const handleDepthSwitch = (mode: DepthMode) => {
    setDepthMode(mode);
    setActiveChapterIndex(0);
    setReadingProgress(0);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  };

  // Track scroll reading progress
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const total = el.scrollHeight - el.clientHeight;
      if (total > 0) {
        const current = el.scrollTop;
        setReadingProgress(Math.min(100, Math.round((current / total) * 100)));
      }
    };

    const node = contentRef.current;
    if (node) node.addEventListener('scroll', handleScroll);
    return () => {
      if (node) node.removeEventListener('scroll', handleScroll);
    };
  }, [activeChapterIndex, depthMode]);

  // Floating selection listener
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectedText('');
        setSelectionPosition(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length >= 4) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setSelectionPosition({
          x: Math.max(16, rect.left + rect.width / 2 - 120),
          y: Math.max(16, rect.top - 54),
        });
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleActionBubble = (action: string) => {
    if (onAskTutor) {
      onAskTutor(`[${action}] Regarding "${selectedText}": can you explain this with deeper intuition?`);
    } else {
      alert(`${action}: "${selectedText}"`);
    }
    setSelectedText('');
    setSelectionPosition(null);
  };

  const depthStats = {
    detailed: { label: 'Detailed Treatise', wordTarget: '~50,000 words', desc: 'Exhaustive multi-chapter treatise with full rigor, proofs & historical context', icon: '🔬' },
    core: { label: 'In-Depth Core', wordTarget: '~15,000 words', desc: 'Standard semester textbook with core derivations and step-by-step problem sets', icon: '📖' },
    crisp: { label: 'Crisp / Shortly', wordTarget: '~5,000 words', desc: 'High-density executive essentials, formula cheat-sheets & rapid exam revision', icon: '⚡' },
  }[depthMode];

  return (
    <div className="space-y-6 relative">
      {/* 1. PEDAGOGICAL DEPTH SELECTOR CONTROL BAR */}
      <ClayCard padding="md" className="space-y-3 bg-[var(--surface-clay)] border-[3px] border-[var(--border-clay)] shadow-[5px_5px_0px_var(--border-clay)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-[2px] border-[var(--border-clay)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎛️</span>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-clay)]">
                Pedagogical Depth Mode
              </span>
              <p className="text-[11px] font-bold text-[var(--muted-clay)]">
                {depthStats.desc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black px-3 py-1 rounded-full border border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A]">
              Target: {depthStats.wordTarget}
            </span>
          </div>
        </div>

        {/* 3 Chunky Depth Mode Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'detailed', title: 'Detailed Treatise', target: '~50,000 Words', icon: '🔬' },
            { id: 'core', title: 'In-Depth Core', target: '~15,000 Words', icon: '📖' },
            { id: 'crisp', title: 'Crisp / Shortly', target: '~5,000 Words', icon: '⚡' },
          ].map((mode) => {
            const isSelected = depthMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleDepthSwitch(mode.id as DepthMode)}
                className={`
                  p-3 rounded-2xl border-[2.5px] transition-all cursor-pointer text-left flex items-center justify-between
                  ${
                    isSelected
                      ? 'border-[var(--border-clay)] bg-[var(--primary-clay)] text-white shadow-[4px_4px_0px_var(--border-clay)] -translate-y-0.5'
                      : 'border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] hover:bg-[var(--surface-clay)]'
                  }
                `}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-black text-xs">
                    <span>{mode.icon}</span>
                    <span>{mode.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold block ${isSelected ? 'text-white/80' : 'text-[var(--muted-clay)]'}`}>
                    {mode.target}
                  </span>
                </div>
                {isSelected && <span className="text-sm font-black text-white">✓</span>}
              </button>
            );
          })}
        </div>
      </ClayCard>

      {/* Reading Progress Bar Fixed At Top */}
      <div className="w-full h-3 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
        <div
          className="h-full bg-[var(--primary-clay)] transition-all duration-200"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left Side Chapter Outline Navigation */}
        <aside className="space-y-3">
          <ClayCard padding="sm" className="space-y-2 border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[4px_4px_0px_var(--border-clay)]">
            <div className="px-3 py-2 border-b-[2px] border-[var(--border-clay)] flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)]">
                {depthStats.label} Outline
              </span>
              <ClayBadge size="sm" variant="accent">
                {chapters.length} Ch
              </ClayBadge>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {chapters.map((ch: any, i: number) => {
                const isActive = i === activeChapterIndex;
                return (
                  <button
                    key={ch.id || i}
                    onClick={() => {
                      setActiveChapterIndex(i);
                      setReadingProgress(0);
                      if (contentRef.current) contentRef.current.scrollTop = 0;
                    }}
                    className={`
                      w-full text-left p-3 rounded-[16px] border-[2px] font-bold text-xs transition-all cursor-pointer flex items-start gap-2.5
                      ${
                        isActive
                          ? 'border-[var(--border-clay)] bg-[var(--primary-clay)] text-white shadow-[3px_3px_0px_var(--border-clay)] translate-x-1'
                          : 'border-transparent text-[var(--text-clay)] hover:border-[var(--border-clay)] hover:bg-[var(--bg-clay)]'
                      }
                    `}
                  >
                    <span className="font-mono text-xs opacity-75 shrink-0">0{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="truncate leading-tight">{ch.title}</p>
                      <p className={`text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'text-[var(--muted-clay)]'}`}>
                        {ch.readTime || ch.estimatedReadTime || '30 mins'} {ch.wordCount ? `• ${ch.wordCount} words` : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ClayCard>
        </aside>

        {/* Center Main Reading Pane */}
        <main
          ref={contentRef}
          className="max-h-[850px] overflow-y-auto space-y-6 pr-2"
        >
          <ClayCard padding="lg" className="space-y-6 bg-[var(--surface-clay)] border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)]">
            {/* Chapter Header */}
            <div className="pb-4 border-b-[2px] border-[var(--border-clay)] space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <ClayBadge variant="primary" size="sm">
                  Chapter {activeChapterIndex + 1}
                </ClayBadge>
                <ClayBadge variant="default" size="sm">
                  {depthStats.label}
                </ClayBadge>
                <span className="text-xs font-bold text-[var(--muted-clay)] font-mono">
                  {currentChapter.readTime || currentChapter.estimatedReadTime || '35 mins'} • {currentChapter.wordCount ? `${currentChapter.wordCount.toLocaleString()} words` : 'Full Length'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-clay)]">
                {currentChapter.title}
              </h2>
            </div>

            {/* Scholarly Body Text (18px, 1.75 line-height) with KaTeX Mathematical Typography */}
            <div className="selection:bg-[var(--primary-clay)] selection:text-white">
              <RichContentRenderer content={currentChapter.content} />
            </div>

            {/* Key Mathematical & Theoretical Formulas (Only rendered if formulas actually exist) */}
            {(() => {
              const validFormulas = (currentChapter.formulas || currentChapter.keyFormulas || [])
                .filter((f: any) => typeof f === 'string' && f.trim().length > 0);
              if (validFormulas.length === 0) return null;

              return (
                <div className="p-5 rounded-[22px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] space-y-3 shadow-[3px_3px_0px_var(--border-clay)]">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)] block">
                    Core Mathematical Axioms & Principles
                  </span>
                  <div className="space-y-2.5">
                    {validFormulas.map((f: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] shadow-[2px_2px_0px_var(--border-clay)] overflow-x-auto text-sm"
                      >
                        <RichContentRenderer content={f.includes('$') ? f : `$$${f}$$`} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Inline Reflection Prompt in Highlighted Box */}
            {currentChapter.reflectionPrompt && (
              <div className="p-6 rounded-[24px] border-[2.5px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] space-y-3 shadow-[4px_4px_0px_var(--border-clay)]">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤔</span>
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    Active Reflection Challenge
                  </h4>
                </div>
                <p className="text-sm font-bold leading-relaxed">
                  {currentChapter.reflectionPrompt}
                </p>
                <ClayButton
                  size="sm"
                  variant="secondary"
                  onClick={() => onAskTutor && onAskTutor(`Help me think through this reflection prompt: "${currentChapter.reflectionPrompt}"`)}
                >
                  Discuss with AI Tutor →
                </ClayButton>
              </div>
            )}

            {/* Go Deeper Footer Actions */}
            <div className="pt-6 border-t-[2px] border-[var(--border-clay)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-bold text-[var(--muted-clay)]">
                Finished reading this chapter?
              </span>

              <div className="flex items-center gap-3">
                {activeChapterIndex > 0 && (
                  <ClayButton
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveChapterIndex((prev) => prev - 1)}
                  >
                    ← Previous Chapter
                  </ClayButton>
                )}
                {activeChapterIndex < chapters.length - 1 ? (
                  <ClayButton
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveChapterIndex((prev) => prev + 1)}
                  >
                    Next Chapter →
                  </ClayButton>
                ) : (
                  <ClayButton
                    size="sm"
                    variant="primary"
                    onClick={() => onAskTutor && onAskTutor(`I finished reading the ${depthStats.label} notes on ${topic.title}. Can you quiz my conceptual understanding?`)}
                  >
                    Test Knowledge with AI Tutor →
                  </ClayButton>
                )}
              </div>
            </div>
          </ClayCard>
        </main>
      </div>

      {/* Floating Action Bubble on Text Selection */}
      {selectedText && selectionPosition && (
        <div
          style={{
            position: 'fixed',
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
          }}
          className="z-50 flex items-center gap-1.5 p-1.5 rounded-[18px] border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] shadow-[5px_5px_0px_var(--border-clay)] animate-in fade-in zoom-in-95 duration-150"
        >
          {['Explain', 'Simplify', 'Example', 'Ask AI'].map((action) => (
            <button
              key={action}
              onClick={() => handleActionBubble(action)}
              className="px-2.5 py-1 rounded-[12px] text-xs font-extrabold border border-[var(--border-clay)] bg-[var(--bg-clay)] hover:bg-[var(--accent-clay)] hover:text-[#1A1A1A] transition-all cursor-pointer shadow-[1px_1px_0px_var(--border-clay)]"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
