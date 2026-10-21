'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { SquircleShape, MiniPlanetShape, ClayPillDecoration } from '@/components/ui/ClayShapes';

export default function LandingPage() {
  const router = useRouter();
  const [demoActive, setDemoActive] = useState(false);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-x-hidden">
      {/* ════════════════════════════════════════════════════════════════
          1. HERO SECTION (Gumroad + Linear Bold Marketing Feel)
          ════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Floating Decorative 3D Clay Shapes */}
        <div className="absolute top-6 left-2 sm:left-12 pointer-events-none hidden md:block animate-bounce duration-1000">
          <SquircleShape size={72} rotation={-14} color="var(--accent-clay)" />
        </div>
        <div className="absolute top-16 right-4 sm:right-16 pointer-events-none hidden md:block">
          <MiniPlanetShape size={80} color="var(--primary-clay)" ringColor="var(--border-clay)" />
        </div>

        <div className="text-center max-w-4xl mx-auto space-y-8 relative z-10">
          {/* Massive Headline (72-96px) */}
          <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-black tracking-tight text-[var(--text-clay)] leading-[1.02]">
            Learn anything.{' '}
            <span className="underline decoration-[var(--primary-clay)] decoration-[8px] sm:decoration-[12px] underline-offset-8">
              Actually understand it.
            </span>
          </h1>

          {/* Subheadline (20px) */}
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--muted-clay)] max-w-2xl mx-auto leading-relaxed">
            Your AI study companion that doesn’t just summarize — it{' '}
            <strong className="text-[var(--text-clay)]">teaches</strong>,{' '}
            <strong className="text-[var(--text-clay)]">tests</strong>, and{' '}
            <strong className="text-[var(--text-clay)]">talks back</strong>.
          </p>

          {/* Side-by-side Clay CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <ClayButton
              size="xl"
              variant="primary"
              href="/dashboard"
              className="w-full sm:w-auto shadow-[6px_6px_0px_var(--border-clay)] hover:shadow-[8px_8px_0px_var(--border-clay)] text-lg px-9 py-4 font-black"
            >
              Start Learning Free →
            </ClayButton>

            <ClayButton
              size="xl"
              variant="secondary"
              href="/search"
              className="w-full sm:w-auto text-lg px-8 py-4 font-black"
            >
              🔍 Search Any Topic →
            </ClayButton>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-black text-[var(--text-clay)] uppercase tracking-wider">
            <span>✓ No Credit Card Required</span>
            <span>✓ 4 Clay Themes</span>
            <span>✓ 7 Learning Engines</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          3. FEATURE SHOWCASE — BENTO GRID (Apple/Linear Style)
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <ClayBadge variant="accent" size="md">
            7 Pedagogical Engines
          </ClayBadge>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-clay)] tracking-tight">
            One Topic. 7 Ways to Master It.
          </h2>
          <p className="text-sm sm:text-base font-bold text-[var(--muted-clay)]">
            Every subject synthesized into un-summarized deep notes, simulations, and Socratic dialogues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* 1. BIG CARD: Deep Research Notes (Span 8) */}
          <ClayCard
            tilt
            padding="lg"
            className="md:col-span-8 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <ClayBadge variant="primary" size="sm">01 • Deep Notes Engine</ClayBadge>
                <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">18px Scholarly Type</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-clay)]">
                Un-Summarized Research Chapters
              </h3>
              <p className="text-sm font-medium text-[var(--muted-clay)] max-w-xl">
                1200+ words per section with historical context, mathematical derivations, and highlight-to-ask Socratic bubbles.
              </p>
            </div>

            {/* Mock Textbook Preview */}
            <div className="p-5 rounded-[22px] border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] space-y-3 shadow-[3px_3px_0px_var(--border-clay)]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--primary-clay)]">
                <span>§ 1.1 Axiomatic Derivations & First Principles</span>
              </div>
              <p className="text-sm font-serif italic text-[var(--text-clay)]">
                "Every topic is unpacked from first principles into rigorous, un-summarized mathematical derivations, mechanisms, and historical disputes."
              </p>
              <div className="inline-flex gap-2 text-[10px] font-black uppercase">
                <span className="px-2 py-0.5 rounded border border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A]">
                  Floating Action Bubble
                </span>
                <span className="px-2 py-0.5 rounded border border-[var(--border-clay)] bg-white text-[var(--text-clay)]">
                  Reflection Hooks
                </span>
              </div>
            </div>

            <ClayButton size="sm" variant="secondary" href="/search" className="self-start">
              Explore Deep Notes →
            </ClayButton>
          </ClayCard>

          {/* 2. TALL CARD: Quiz & Mastery (Span 4) */}
          <ClayCard
            tilt
            padding="lg"
            className="md:col-span-4 space-y-6 flex flex-col justify-between bg-[var(--surface-clay)]"
          >
            <div className="space-y-3">
              <ClayBadge variant="accent" size="sm">02 • Anti-Trap Quiz</ClayBadge>
              <h3 className="text-2xl font-black text-[var(--text-clay)]">
                Feynman Trap Buster
              </h3>
              <p className="text-xs font-bold text-[var(--muted-clay)]">
                Questions engineered to expose cognitive blindspots, not surface trivia.
              </p>
            </div>

            <div className="p-4 rounded-[20px] border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] space-y-2 text-xs font-bold">
              <span className="text-[#D90429] font-black">Trap Exposed:</span>
              <p className="text-[var(--text-clay)]">
                "Detecting subtle misconceptions and false assumptions before test day."
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#B5EAD7] text-[#1A2F0D] border border-[#1A2F0D] text-[10px]">
                Confetti on Mastery 🎉
              </span>
            </div>

            <ClayButton size="sm" variant="primary" href="/search">
              Take Practice Quiz →
            </ClayButton>
          </ClayCard>

          {/* 3. WIDE CARD: Interactive Simulators (Span 7) */}
          <ClayCard
            tilt
            padding="lg"
            className="md:col-span-7 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <ClayBadge variant="secondary" size="sm">03 • Live Simulator</ClayBadge>
              <h3 className="text-2xl font-black text-[var(--text-clay)]">
                Functional Parameter Sliders
              </h3>
              <p className="text-xs font-medium text-[var(--muted-clay)]">
                Real-time physics and logic canvases where you adjust sliders to hit challenge targets.
              </p>
            </div>

            <div className="p-4 rounded-[20px] border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[var(--muted-clay)]">Interactive Variable θ</span>
                <p className="font-mono text-sm font-black text-[var(--primary-clay)]">Dynamic State Equilibrium</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[var(--accent-clay)] text-[#1A1A1A] border border-[var(--border-clay)] font-black text-xs">
                Target Verified!
              </span>
            </div>

            <ClayButton size="sm" variant="secondary" href="/search">
              Launch Simulator →
            </ClayButton>
          </ClayCard>

          {/* 4. SQUARE: Socratic AI Tutor (Span 5) */}
          <ClayCard
            tilt
            padding="lg"
            className="md:col-span-5 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <ClayBadge variant="primary" size="sm">04 • Socratic Tutor</ClayBadge>
              <h3 className="text-2xl font-black text-[var(--text-clay)]">
                AI That Talks Back
              </h3>
              <p className="text-xs font-medium text-[var(--muted-clay)]">
                Asks counter-questions to test your reasoning rather than handing out answers.
              </p>
            </div>

            <div className="p-3.5 rounded-[18px] border-[2px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] text-xs font-bold leading-snug">
              "What boundary condition must hold for this theorem to remain valid in an open system?"
            </div>

            <ClayButton size="sm" variant="secondary" href="/search">
              Start Socratic Q&A →
            </ClayButton>
          </ClayCard>

          {/* 5. SQUARE: Audio Lessons (Span 4) */}
          <ClayCard
            tilt
            padding="lg"
            className="md:col-span-4 space-y-4 flex flex-col justify-between"
          >
            <ClayBadge variant="accent" size="sm">05 • Audio Masterclass</ClayBadge>
            <h4 className="text-xl font-black text-[var(--text-clay)]">
              Conversational Narration
            </h4>
            <div className="h-14 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] flex items-center justify-center gap-1">
              {[12, 28, 44, 20, 36, 16, 40, 24].map((h, i) => (
                <div key={i} style={{ height: `${h}px` }} className="w-1.5 rounded-full bg-[var(--primary-clay)]" />
              ))}
            </div>
            <ClayButton size="sm" variant="secondary" href="/search">
              Listen (14 min) →
            </ClayButton>
          </ClayCard>

          {/* 6. WIDE: Presentation Mode (Span 4) */}
          <ClayCard
            tilt
            padding="lg"
            className="md:col-span-4 space-y-4 flex flex-col justify-between"
          >
            <ClayBadge variant="secondary" size="sm">06 • Slides Deck</ClayBadge>
            <h4 className="text-xl font-black text-[var(--text-clay)]">
              16:9 Lecture Slides
            </h4>
            <p className="text-xs font-bold text-[var(--muted-clay)]">
              3 bullets max, speaker notes toggle, and keyboard arrow controls.
            </p>
            <ClayButton size="sm" variant="secondary" href="/search">
              View Slide Deck →
            </ClayButton>
          </ClayCard>

          {/* 7. SQUARE: Practice Solver (Span 4) */}
          <ClayCard
            tilt
            padding="lg"
            className="md:col-span-4 space-y-4 flex flex-col justify-between"
          >
            <ClayBadge variant="primary" size="sm">07 • Practice Solver</ClayBadge>
            <h4 className="text-xl font-black text-[var(--text-clay)]">
              Step-by-Step Solver
            </h4>
            <p className="text-xs font-bold text-[var(--muted-clay)]">
              Unlock step 2 only after proving step 1 with numerical feedback.
            </p>
            <ClayButton size="sm" variant="primary" href="/search">
              Solve Problem →
            </ClayButton>
          </ClayCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          4. COMPARISON SECTION (NeuraGlow vs Generic AI Chatbots)
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="text-center space-y-2">
          <ClayBadge variant="accent" size="sm">Side-by-Side</ClayBadge>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-clay)]">
            Generic AI Chatbots vs NeuraGlow
          </h2>
        </div>

        <ClayCard padding="none" className="overflow-hidden shadow-[8px_8px_0px_var(--border-clay)] border-[3px]">
          <div className="grid grid-cols-12 p-4 sm:p-6 bg-[var(--bg-clay)] border-b-[2.5px] border-[var(--border-clay)] font-black text-xs sm:text-sm uppercase tracking-wider">
            <span className="col-span-6 sm:col-span-5 text-[var(--text-clay)]">Learning Dimension</span>
            <span className="col-span-3 sm:col-span-3 text-[var(--muted-clay)] text-center">Generic Chatbots</span>
            <span className="col-span-3 sm:col-span-4 text-[var(--primary-clay)] text-right sm:text-center">NeuraGlow</span>
          </div>

          <div className="divide-y-[2px] divide-[var(--border-clay)]">
            {[
              { dim: 'Depth of Explanation', chat: '300-word shallow summary', ng: 'Choice of 50k, 15k, or 5k words with full rigor' },
              { dim: 'Active Practice', chat: 'Passive copy-pasting', ng: '100–200 categorized questions & step-by-step solver' },
              { dim: 'Visual Understanding', chat: 'Static text only', ng: 'PhET-style real-time parameter simulators' },
              { dim: 'Quick Revision', chat: 'Re-reading long chat walls', ng: 'Spaced repetition flashcards & offline downloads' },
              { dim: 'Questioning Depth', chat: 'Agrees with user mistakes', ng: 'Socratic tutor probes cognitive traps' },
              { dim: 'Study Memory', chat: 'Lost in chat scroll', ng: 'Saved in offline library with download exports' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 p-4 sm:p-5 items-center text-xs sm:text-sm font-bold">
                <span className="col-span-6 sm:col-span-5 text-[var(--text-clay)]">{row.dim}</span>
                <span className="col-span-3 sm:col-span-3 text-center text-[#D90429] flex items-center justify-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#FFE5E5] border border-[#D90429] text-[10px] hidden sm:inline">
                    ✕
                  </span>
                  <span className="hidden md:inline">{row.chat}</span>
                  <span className="md:hidden">✕</span>
                </span>
                <span className="col-span-3 sm:col-span-4 text-right sm:text-center text-[#1A2F0D] flex items-center justify-end sm:justify-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#B5EAD7] border border-[#1A2F0D] text-[10px] hidden sm:inline">
                    ✓
                  </span>
                  <span className="hidden md:inline">{row.ng}</span>
                  <span className="md:hidden">✓</span>
                </span>
              </div>
            ))}
          </div>
        </ClayCard>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          6. PEDAGOGICAL DEPTH MODES (50K / 15K / 5K WORDS)
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center space-y-2">
          <ClayBadge variant="secondary" size="sm">Choose Your Depth</ClayBadge>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-clay)]">
            Tailor Any Topic to Your Exact Learning Needs
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[var(--muted-clay)] max-w-xl mx-auto">
            No shallow summaries. Control whether you want an exhaustive 50,000-word academic treatise, an in-depth 15,000-word textbook, or a crisp 5,000-word speed review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Card 1: Crisp / Shortly */}
          <ClayCard padding="lg" className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <ClayBadge variant="default" size="sm">⚡ Fast Mastery</ClayBadge>
              <h3 className="text-2xl font-black text-[var(--text-clay)]">Crisp / Shortly</h3>
              <p className="text-3xl font-black text-[var(--text-clay)]">~5,000 <span className="text-xs text-[var(--muted-clay)] font-bold">words</span></p>
              <p className="text-xs font-medium text-[var(--muted-clay)]">
                High-density executive briefing. Perfect for quick exam revision, foundational axioms, and key formula lookups.
              </p>
              <ul className="space-y-2 text-xs font-bold text-[var(--text-clay)]">
                <li>✓ Core definitions & foundational laws</li>
                <li>✓ High-yield formula cheat sheets</li>
                <li>✓ Essential practice questions</li>
                <li>✓ 15-minute rapid recall mode</li>
              </ul>
            </div>
            <ClayButton size="md" variant="secondary" href="/search" className="w-full">
              Explore Crisp Mode →
            </ClayButton>
          </ClayCard>

          {/* Card 2: Detailed Core (Middle Card with Rotated Sticker) */}
          <div className="relative">
            <div className="absolute -top-3.5 right-6 z-20">
              <span className="inline-block px-3.5 py-1 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] font-black text-[11px] uppercase tracking-wider shadow-[2px_2px_0px_var(--border-clay)] rotate-3">
                ⭐ Most Versatile
              </span>
            </div>
            <ClayCard padding="lg" className="space-y-6 flex flex-col justify-between border-[3.5px] border-[var(--primary-clay)] shadow-[8px_8px_0px_var(--border-clay)] bg-[var(--surface-clay)]">
              <div className="space-y-4">
                <ClayBadge variant="primary" size="sm">📖 Standard Curriculum</ClayBadge>
                <h3 className="text-2xl font-black text-[var(--text-clay)]">In-Depth Core</h3>
                <p className="text-3xl font-black text-[var(--primary-clay)]">~15,000 <span className="text-xs text-[var(--muted-clay)] font-bold">words</span></p>
                <p className="text-xs font-medium text-[var(--muted-clay)]">
                  Complete rigorous semester textbook depth. Covers all derivations, mechanisms, worked examples, and step-by-step problem sets.
                </p>
                <ul className="space-y-2 text-xs font-bold text-[var(--text-clay)]">
                  <li>✓ 4 comprehensive un-summarized chapters</li>
                  <li>✓ Worked numerical & analytical proofs</li>
                  <li>✓ Up to 100+ practice questions</li>
                  <li>✓ Synchronized audio lecture & slides</li>
                </ul>
              </div>
              <ClayButton size="lg" variant="primary" href="/search" className="w-full">
                Study In-Depth →
              </ClayButton>
            </ClayCard>
          </div>

          {/* Card 3: Detailed Comprehensive Treatise */}
          <ClayCard padding="lg" className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <ClayBadge variant="secondary" size="sm">🔬 Complete Treatise</ClayBadge>
              <h3 className="text-2xl font-black text-[var(--text-clay)]">Detailed Treatise</h3>
              <p className="text-3xl font-black text-[var(--text-clay)]">~50,000 <span className="text-xs text-[var(--muted-clay)] font-bold">words</span></p>
              <p className="text-xs font-medium text-[var(--muted-clay)]">
                Exhaustive multi-part academic masterwork. Full historical disputes, advanced mathematical derivations, and boundary edge cases.
              </p>
              <ul className="space-y-2 text-xs font-bold text-[var(--text-clay)]">
                <li>✓ Multi-part master textbook coverage</li>
                <li>✓ 150–200 categorized questions bank</li>
                <li>✓ 50+ spaced repetition flashcards</li>
                <li>✓ 1-click offline study guide download</li>
              </ul>
            </div>
            <ClayButton size="md" variant="secondary" href="/search" className="w-full">
              Read 50k Word Treatise →
            </ClayButton>
          </ClayCard>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          7. FINAL GIANT CTA SECTION
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8">
        <ClayCard
          padding="xl"
          className="text-center space-y-8 bg-[var(--primary-clay)] text-white border-[3px] border-[var(--border-clay)] shadow-[10px_10px_0px_var(--border-clay)]"
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-5xl block animate-pulse">🚀</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to actually learn something today?
            </h2>
            <p className="text-sm sm:text-base font-bold text-white/90">
              Type any topic—from quantum computing to Roman history—and watch 7 pedagogical engines come alive in seconds.
            </p>
          </div>

          <ClayButton
            size="xl"
            variant="accent"
            href="/dashboard"
            className="text-lg px-10 py-4.5 rounded-full font-black text-[#1A1A1A] shadow-[6px_6px_0px_#1A1A1A] hover:shadow-[8px_8px_0px_#1A1A1A]"
          >
            Launch Your First Topic Free →
          </ClayButton>
        </ClayCard>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          8. MINIMAL 3-COLUMN FOOTER
          ════════════════════════════════════════════════════════════════ */}
      <footer className="border-t-[2.5px] border-[var(--border-clay)] pt-12 max-w-7xl mx-auto px-4 sm:px-8 text-xs font-bold text-[var(--muted-clay)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
          <div className="space-y-2">
            <span className="font-black text-base text-[var(--text-clay)]">NeuraGlow</span>
            <p className="max-w-xs">
              The universal study companion built with Claymorphism & Soft Brutalism. No generic summaries.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-black uppercase text-[var(--text-clay)] tracking-wider">Quick Navigation</span>
            <div className="flex flex-col space-y-1">
              <Link href="/dashboard" className="hover:text-[var(--primary-clay)]">Learning Dashboard</Link>
              <Link href="/search" className="hover:text-[var(--primary-clay)]">Universal Search</Link>
              <Link href="/library" className="hover:text-[var(--primary-clay)]">My Study Library</Link>
              <Link href="/progress" className="hover:text-[var(--primary-clay)]">Analytics & Streak</Link>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-black uppercase text-[var(--text-clay)] tracking-wider">Design Architecture</span>
            <p>Designed with SF Pro typography, 4 tactile clay themes, and tactile physics.</p>
            <p className="pt-2 italic text-[var(--text-clay)]">~ Handcrafted for curious minds.</p>
          </div>
        </div>

        <div className="py-6 border-t border-[var(--border-clay)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <span>© 2026 NeuraGlow Inc. All rights reserved. Zero external tracking.</span>
          <span>Press ⌘K anytime for Universal Command Search</span>
        </div>
      </footer>
    </div>
  );
}
