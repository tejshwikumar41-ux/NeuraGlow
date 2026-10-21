'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { RichContentRenderer } from '@/components/ui/RichContentRenderer';
import { FlashcardItem } from '@/lib/universalTopicGenerator';

export interface FlashcardsEngineProps {
  topic: any;
  flashcards?: FlashcardItem[];
}

export const FlashcardsEngine: React.FC<FlashcardsEngineProps> = ({ topic, flashcards: propCards }) => {
  const cards: FlashcardItem[] = propCards || topic.flashcards || [
    {
      id: 'fc-1',
      category: 'Foundations',
      front: `What is the core definition of ${topic.title || 'this topic'}?`,
      back: `A fundamental principle in ${topic.domain || 'this field'} governing how states, forces, or dynamics evolve under invariant boundary conditions.`,
      difficulty: 'easy'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [reviewedCards, setReviewedCards] = useState<Record<string, 'again' | 'hard' | 'good' | 'easy'>>({});
  const [isShuffled, setIsShuffled] = useState(false);
  const [deck, setDeck] = useState<FlashcardItem[]>(cards);

  // Filter deck by category
  useEffect(() => {
    let filtered = cards;
    if (activeCategory !== 'all') {
      filtered = cards.filter((c) => c.category === activeCategory);
    }
    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeCategory, cards]);

  const currentCard = deck[currentIndex] || deck[0];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < deck.length - 1 ? prev + 1 : 0));
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : deck.length - 1));
  }, [deck.length]);

  const handleRateCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (currentCard) {
      setReviewedCards((prev) => ({ ...prev, [currentCard.id]: rating }));
    }
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffled(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCards({});
  };

  // Keyboard navigation: Space to flip, Arrows to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  const categories = ['all', ...Array.from(new Set(cards.map((c) => c.category)))];
  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);
  const reviewedCount = Object.keys(reviewedCards).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <ClayCard padding="md" className="space-y-4 shadow-[6px_6px_0px_var(--border-clay)] bg-[var(--surface-clay)] border-[3px] border-[var(--border-clay)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-[2px] border-[var(--border-clay)]">
          <div className="flex items-center gap-2">
            <ClayBadge variant="primary" size="sm">
              🃏 Quick Revision Flashcards
            </ClayBadge>
            <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full border border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A]">
              {deck.length} Flashcards Available
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ClayButton size="sm" variant="secondary" onClick={handleShuffle} title="Shuffle card order">
              🔀 {isShuffled ? 'Shuffled' : 'Shuffle'}
            </ClayButton>
            <ClayButton size="sm" variant="secondary" onClick={handleRestart} title="Reset deck progress">
              🔄 Reset
            </ClayButton>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-black uppercase text-[var(--muted-clay)] shrink-0">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-3 py-1 rounded-full text-xs font-bold border-[2px] border-[var(--border-clay)] capitalize shrink-0 transition-all cursor-pointer
                ${
                  activeCategory === cat
                    ? 'bg-[var(--primary-clay)] text-white shadow-[2px_2px_0px_var(--border-clay)] scale-105'
                    : 'bg-[var(--bg-clay)] text-[var(--text-clay)] hover:bg-[var(--surface-clay)]'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono font-bold text-[var(--muted-clay)]">
            <span>
              Card {currentIndex + 1} of {deck.length} ({reviewedCount} reviewed)
            </span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] overflow-hidden">
            <div
              className="h-full bg-[var(--primary-clay)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </ClayCard>

      {/* 3D Flip Card Container */}
      <div className="perspective-1000 min-h-[340px] select-none">
        <div
          onClick={handleFlip}
          className={`
            w-full min-h-[340px] rounded-[32px] border-[3.5px] border-[var(--border-clay)] p-6 sm:p-10
            shadow-[8px_8px_0px_var(--border-clay)] transition-all duration-300 cursor-pointer
            flex flex-col justify-between relative
            ${
              isFlipped
                ? 'bg-[var(--surface-clay)] text-[var(--text-clay)] ring-4 ring-[var(--accent-clay)]'
                : 'bg-[var(--bg-clay)] text-[var(--text-clay)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_var(--border-clay)]'
            }
          `}
        >
          {/* Card Meta Top Row */}
          <div className="flex items-center justify-between pb-3 border-b-[2px] border-[var(--border-clay)]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)]">
                {currentCard?.category}
              </span>
              <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
                #{currentIndex + 1}
              </span>
            </div>
            <span className="text-xs font-black uppercase text-[var(--primary-clay)] flex items-center gap-1">
              {isFlipped ? '💡 Back (Explanation)' : '❓ Front (Question)'}
            </span>
          </div>

          {/* Card Body Content */}
          <div className="py-6 sm:py-8 space-y-4">
            {!isFlipped ? (
              <div className="space-y-4 text-center sm:text-left">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-[var(--muted-clay)] block">
                  Prompt & Concept:
                </span>
                <div className="text-xl sm:text-2xl font-black text-[var(--text-clay)] leading-snug">
                  <RichContentRenderer content={currentCard?.front || ''} />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left animate-fadeIn">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-green-600 block">
                  Core Solution & Intuition:
                </span>
                <div className="text-base sm:text-lg font-semibold text-[var(--text-clay)] leading-relaxed">
                  <RichContentRenderer content={currentCard?.back || ''} />
                </div>
              </div>
            )}
          </div>

          {/* Card Footer Hint */}
          <div className="pt-3 border-t-[2px] border-[var(--border-clay)] flex items-center justify-between text-xs font-bold text-[var(--muted-clay)]">
            <span>Press Space or Click to Flip ↩️</span>
            <span>Use ← → to Navigate</span>
          </div>
        </div>
      </div>

      {/* Rating & Spaced Repetition Response Bar (Visible when flipped) */}
      {isFlipped && (
        <ClayCard padding="md" className="space-y-3 bg-[var(--surface-clay)] border-[2.5px] border-[var(--border-clay)] shadow-[4px_4px_0px_var(--border-clay)] animate-fadeIn">
          <p className="text-xs font-black uppercase text-[var(--text-clay)] text-center">
            How well did you know this card? (Spaced Repetition Feedback)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => handleRateCard('again')}
              className="p-2.5 rounded-xl border-[2px] border-[var(--border-clay)] bg-red-100 text-red-900 font-extrabold text-xs shadow-[2px_2px_0px_var(--border-clay)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              🔴 Again (1 min)
            </button>
            <button
              onClick={() => handleRateCard('hard')}
              className="p-2.5 rounded-xl border-[2px] border-[var(--border-clay)] bg-amber-100 text-amber-900 font-extrabold text-xs shadow-[2px_2px_0px_var(--border-clay)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              🟡 Hard (10 mins)
            </button>
            <button
              onClick={() => handleRateCard('good')}
              className="p-2.5 rounded-xl border-[2px] border-[var(--border-clay)] bg-emerald-100 text-emerald-900 font-extrabold text-xs shadow-[2px_2px_0px_var(--border-clay)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              🟢 Good (1 day)
            </button>
            <button
              onClick={() => handleRateCard('easy')}
              className="p-2.5 rounded-xl border-[2px] border-[var(--border-clay)] bg-blue-100 text-blue-900 font-extrabold text-xs shadow-[2px_2px_0px_var(--border-clay)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              ⭐ Easy (4 days)
            </button>
          </div>
        </ClayCard>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3">
        <ClayButton size="md" variant="secondary" onClick={handlePrev}>
          ← Previous Card
        </ClayButton>

        <ClayButton size="md" variant="accent" onClick={handleFlip}>
          {isFlipped ? 'Show Front ↩️' : 'Reveal Answer 💡'}
        </ClayButton>

        <ClayButton size="md" variant="primary" onClick={handleNext}>
          Next Card →
        </ClayButton>
      </div>
    </div>
  );
};
