'use client';

import React, { useState, useEffect } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';

export interface PresentationEngineProps {
  topic: any;
}

export const PresentationEngine: React.FC<PresentationEngineProps> = ({ topic }) => {
  const slides = topic.slides || [];
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isPresenterMode, setIsPresenterMode] = useState(false);

  const currentSlide = slides[currentSlideIndex] || slides[0] || {
    slideNumber: 1,
    title: topic.title,
    bullets: ['Foundations of the concept', 'Theoretical frameworks', 'Applied cases'],
    speakerNotes: 'Welcome to this presentation.',
    visualType: 'concept-diagram'
  };

  // Keyboard navigation (← →)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && isPresenterMode) {
        setIsPresenterMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isPresenterMode]);

  return (
    <div className={`space-y-6 ${isPresenterMode ? 'fixed inset-0 z-50 bg-[var(--bg-clay)] p-6 sm:p-12 overflow-y-auto' : ''}`}>
      {/* Top Slide Control Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClayBadge variant="primary" size="md">
            Slide {currentSlideIndex + 1} of {slides.length}
          </ClayBadge>
          <span className="text-xs font-bold text-[var(--muted-clay)] hidden sm:inline">
            Use ← → arrow keys to navigate
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <ClayButton
            size="sm"
            variant={showSpeakerNotes ? 'accent' : 'secondary'}
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
          >
            🎙️ {showSpeakerNotes ? 'Hide Speaker Notes' : 'Speaker Notes'}
          </ClayButton>

          <ClayButton
            size="sm"
            variant="primary"
            onClick={() => setIsPresenterMode(!isPresenterMode)}
          >
            {isPresenterMode ? 'Exit Fullscreen' : '⛶ Presenter Mode'}
          </ClayButton>
        </div>
      </div>

      {/* Main 16:9 Presentation Slide Canvas */}
      <ClayCard
        padding="xl"
        className="aspect-[16/9] min-h-[420px] sm:min-h-[500px] flex flex-col justify-between shadow-[8px_8px_0px_var(--border-clay)] border-[3px]"
      >
        {/* Slide Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[var(--primary-clay)] uppercase tracking-widest">
              {topic.title} • Module 0{currentSlideIndex + 1}
            </span>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full border border-[var(--border-clay)] bg-[#E63946]" />
              <span className="w-3 h-3 rounded-full border border-[var(--border-clay)] bg-[var(--accent-clay)]" />
              <span className="w-3 h-3 rounded-full border border-[var(--border-clay)] bg-[#B5EAD7]" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-clay)] pt-2 leading-tight">
            {currentSlide.title}
          </h2>
        </div>

        {/* Slide Content: Bullets & Visual Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-6">
          <div className="md:col-span-7 space-y-4">
            <ul className="space-y-3.5">
              {currentSlide.bullets.map((b: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 text-base sm:text-lg font-bold text-[var(--text-clay)] leading-snug"
                >
                  <span className="w-7 h-7 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-[1px_1px_0px_var(--border-clay)]">
                    {idx + 1}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-5 flex items-center justify-center">
            <div className="w-full h-48 sm:h-56 rounded-[24px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] p-6 shadow-[4px_4px_0px_var(--border-clay)] flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-4xl sm:text-5xl">📐</span>
              <p className="font-extrabold text-xs uppercase tracking-wider text-[var(--primary-clay)]">
                {currentSlide.visualType}
              </p>
              <p className="text-[11px] font-bold text-[var(--muted-clay)]">
                Universal Pedagogical Visual Blueprint
              </p>
            </div>
          </div>
        </div>

        {/* Slide Footer Navigation */}
        <div className="pt-4 border-t-[2px] border-[var(--border-clay)] flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
            Slide {currentSlideIndex + 1} / {slides.length}
          </span>

          <div className="flex items-center gap-2">
            <ClayButton
              size="sm"
              variant="secondary"
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
            >
              ← Prev
            </ClayButton>
            <ClayButton
              size="sm"
              variant="primary"
              disabled={currentSlideIndex === slides.length - 1}
              onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
            >
              Next →
            </ClayButton>
          </div>
        </div>
      </ClayCard>

      {/* Speaker Notes Drawer */}
      {showSpeakerNotes && (
        <ClayCard padding="md" className="border-dashed bg-[var(--bg-clay)] space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎙️</span>
            <span className="text-xs font-black uppercase tracking-wider text-[var(--text-clay)]">
              Professor Speaker Notes
            </span>
          </div>
          <p className="text-sm font-medium text-[var(--text-clay)] leading-relaxed italic">
            "{currentSlide.speakerNotes}"
          </p>
        </ClayCard>
      )}

      {/* Slide Thumbnails Carousel Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
        {slides.map((s: any, idx: number) => {
          const isSelected = idx === currentSlideIndex;
          return (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`
                shrink-0 w-36 h-20 rounded-[18px] border-[2px] p-2.5 text-left transition-all cursor-pointer flex flex-col justify-between
                ${
                  isSelected
                    ? 'border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] shadow-[4px_4px_0px_var(--border-clay)] -translate-y-1'
                    : 'border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] shadow-[2px_2px_0px_var(--border-clay)] hover:-translate-y-0.5'
                }
              `}
            >
              <span className="text-[10px] font-mono font-extrabold uppercase opacity-80">
                0{idx + 1}
              </span>
              <p className="text-[11px] font-extrabold truncate leading-tight">
                {s.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
