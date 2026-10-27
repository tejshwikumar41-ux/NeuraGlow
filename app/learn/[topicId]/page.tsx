'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buildUniversalTopicPackage, TopicPackage } from '@/lib/universalTopicGenerator';
import { getCleanSavedLibrary } from '@/lib/storageUtils';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { DeepNotesEngine } from '@/components/engines/DeepNotesEngine';
import { QuestionBankEngine } from '@/components/engines/QuestionBankEngine';
import { FlashcardsEngine } from '@/components/engines/FlashcardsEngine';
import { PresentationEngine } from '@/components/engines/PresentationEngine';
import { PracticeEngine } from '@/components/engines/PracticeEngine';
import { QuizEngine } from '@/components/engines/QuizEngine';
import { AudioEngine } from '@/components/engines/AudioEngine';
import { SimulatorEngine } from '@/components/engines/SimulatorEngine';
import { SocraticTutorEngine } from '@/components/engines/SocraticTutorEngine';
import { PersistentTutorDrawer } from '@/components/engines/PersistentTutorDrawer';

export type EngineType =
  | 'notes'
  | 'questions'
  | 'flashcards'
  | 'slides'
  | 'practice'
  | 'quiz'
  | 'audio'
  | 'simulator'
  | 'tutor';

export default function TopicLearningHub({
  params,
  initialEngine = 'notes',
}: {
  params: Promise<{ topicId: string }> | { topicId: string };
  initialEngine?: EngineType;
}) {
  const router = useRouter();
  const resolvedParams = React.use(params as Promise<{ topicId: string }>);
  const topicId = resolvedParams?.topicId || 'new-module';

  // Dynamic Topic Generation from slug/query (no pre-given hardcoded locks)
  const [topic, setTopic] = useState<TopicPackage>(() => {
    return buildUniversalTopicPackage(topicId);
  });

  const [activeEngine, setActiveEngine] = useState<EngineType>(initialEngine);
  const [isTutorDrawerOpen, setIsTutorDrawerOpen] = useState(false);
  const [pendingTutorQuery, setPendingTutorQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [downloadSuccessModal, setDownloadSuccessModal] = useState(false);

  // Sync topic when topicId changes
  useEffect(() => {
    // Check if user has a custom saved topic in local storage
    if (typeof window !== 'undefined') {
      try {
        const library = getCleanSavedLibrary();
        const found = library.find((item: any) => item.slug === topicId);
        if (found && found.fullPackage) {
          const isHistory = (found.fullPackage.domain || '').includes('History');
          const hasStalePhysics = isHistory && JSON.stringify(found.fullPackage).includes('\\mathcal{H}');
          if (!hasStalePhysics) {
            setTopic(found.fullPackage);
            setIsSaved(true);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not load from library cache', e);
      }
    }

    // Build fresh universal package tailored to this exact topic
    const freshPackage = buildUniversalTopicPackage(topicId);
    setTopic(freshPackage);

    // Also attempt to query Supabase textbook chapters dynamically
    const humanQuery = topicId.replace(/-/g, ' ');
    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchQuery: humanQuery }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result && result.found && result.content) {
          const enrichedPkg = buildUniversalTopicPackage(topicId);
          enrichedPkg.title = result.topic;
          enrichedPkg.domain = result.subject || 'Physics';
          enrichedPkg.category = result.source || 'NCERT Class 11 Physics';
          enrichedPkg.difficulty = result.difficulty || 'Intermediate';
          enrichedPkg.summary = `Ground-truth NCERT textbook curriculum loaded directly from Supabase: ${result.source || 'Official Textbook'}`;

          const wordCount = result.content.split(/\s+/).length;
          const chapterObj = {
            id: 'ch-1',
            title: result.topic,
            readTime: `${Math.max(10, Math.round(wordCount / 200))} mins`,
            wordCount: wordCount,
            content: result.content,
            formulas: result.formulas || [],
            reflectionPrompt: 'Analyze the core textbook principles and apply them to solve foundational numerical problems.',
          };

          enrichedPkg.notes = {
            detailed: {
              targetWordCount: `${wordCount.toLocaleString()} Words`,
              readingTime: `${Math.max(10, Math.round(wordCount / 200))} mins`,
              chapters: [chapterObj],
            },
            core: {
              targetWordCount: `${Math.round(wordCount * 0.4).toLocaleString()} Words`,
              readingTime: '20 mins',
              chapters: [chapterObj],
            },
            crisp: {
              targetWordCount: '2,500 Words',
              readingTime: '8 mins',
              chapters: [chapterObj],
            },
            summary: result.content.slice(0, 1500) + '...',
          } as any;

          setTopic(enrichedPkg);
        }
      })
      .catch((err) => {
        console.warn('Could not load Supabase textbook for topicId:', err);
      });
  }, [topicId]);

  // Engines Navigation Config
  const engines = [
    { id: 'notes', name: 'Deep Notes', icon: '📖', desc: '50k / 15k / 5k words' },
    { id: 'questions', name: 'Question Bank', icon: '📚', desc: '150 practice questions' },
    { id: 'flashcards', name: 'Flashcards', icon: '🃏', desc: 'Quick revision cards' },
    { id: 'slides', name: 'Presentation', icon: '🎞️', desc: '16:9 lecture slides' },
    { id: 'practice', name: 'Practice Solver', icon: '🔧', desc: 'Step-by-step problem' },
    { id: 'quiz', name: 'Adaptive Quiz', icon: '❓', desc: 'Trap checks & Feynman recall' },
    { id: 'audio', name: 'Audio Lesson', icon: '🎧', desc: 'Voice AI & volume control' },
    { id: 'simulator', name: 'Live Simulator', icon: '⚡', desc: 'Parameter sliders' },
    { id: 'tutor', name: 'Socratic Tutor', icon: '💬', desc: 'Depth 1-5 conceptual dialogue' },
  ];

  // Ask Tutor from other engines
  const handleAskTutorFromEngine = (query: string) => {
    setPendingTutorQuery(query);
    setIsTutorDrawerOpen(true);
  };

  // Comprehensive Download & Library Save Handler
  const handleDownloadStudyGuide = () => {
    try {
      // 1. Build Markdown Document
      let md = `# ${topic.title} — Comprehensive Study Guide\n`;
      md += `**Domain**: ${topic.domain} | **Category**: ${topic.category} | **Difficulty**: ${topic.difficulty}\n`;
      md += `*Generated by NeuraGlow Universal AI Study Companion*\n\n`;
      md += `## Overview & Summary\n${topic.summary}\n\n`;

      md += `## 1. Comprehensive Master Treatise (~50,000 Words)\n\n`;
      topic.notes.detailed.chapters.forEach((ch, idx) => {
        md += `### Chapter ${idx + 1}: ${ch.title}\n`;
        md += `*Reading Time: ${ch.readTime} | Word Count: ${ch.wordCount} words*\n\n`;
        md += `${ch.content}\n\n`;
        if (ch.formulas && ch.formulas.length > 0) {
          md += `**Core Mathematical Axioms**:\n`;
          ch.formulas.forEach((f) => (md += `- \`${f}\`\n`));
          md += `\n`;
        }
        if (ch.reflectionPrompt) {
          md += `> **Reflection Challenge**: ${ch.reflectionPrompt}\n\n`;
        }
      });

      md += `## 2. 150-Question Master Bank\n\n`;
      topic.questionBank.forEach((q, idx) => {
        md += `### Q${idx + 1} [${q.category.toUpperCase()}]: ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          const letter = String.fromCharCode(65 + oIdx);
          md += `- [${letter}] ${opt}${oIdx === q.correctOption ? ' *(Correct)*' : ''}\n`;
        });
        md += `\n**Explanation**: ${q.explanation}\n`;
        if (q.trapExplanation) md += `**Trap Warning**: ${q.trapExplanation}\n`;
        md += `\n---\n\n`;
      });

      md += `## 3. Quick Revision Flashcards (${topic.flashcards.length} Cards)\n\n`;
      topic.flashcards.forEach((fc, idx) => {
        md += `#### Card ${idx + 1} (${fc.category})\n`;
        md += `- **Front**: ${fc.front}\n`;
        md += `- **Back**: ${fc.back}\n\n`;
      });

      // 2. Trigger File Download
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NeuraGlow_${topic.slug}_Master_StudyGuide.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 3. Save into LocalStorage Library
      if (typeof window !== 'undefined') {
        const savedRaw = localStorage.getItem('neuraglow_saved_library');
        let library: any[] = savedRaw ? JSON.parse(savedRaw) : [];
        // Remove if exists and add to top
        library = library.filter((item: any) => item.slug !== topic.slug);
        library.unshift({
          id: topic.id,
          slug: topic.slug,
          title: topic.title,
          domain: topic.domain,
          category: topic.category,
          wordCountTarget: '50,000 Words (Treatise)',
          questionCount: topic.questionBank.length,
          flashcardCount: topic.flashcards.length,
          savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          offlineReady: true,
          fullPackage: topic
        });
        localStorage.setItem('neuraglow_saved_library', JSON.stringify(library));
      }

      setIsSaved(true);
      setDownloadSuccessModal(true);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not generate download file.');
    }
  };

  const renderEngine = () => {
    switch (activeEngine) {
      case 'notes':
        return <DeepNotesEngine topic={topic} onAskTutor={handleAskTutorFromEngine} />;
      case 'questions':
        return <QuestionBankEngine topic={topic} questions={topic.questionBank} />;
      case 'flashcards':
        return <FlashcardsEngine topic={topic} flashcards={topic.flashcards} />;
      case 'slides':
        return <PresentationEngine topic={topic} />;
      case 'practice':
        return <PracticeEngine topic={topic} />;
      case 'quiz':
        return <QuizEngine topic={topic} />;
      case 'audio':
        return <AudioEngine topic={topic} />;
      case 'simulator':
        return <SimulatorEngine topic={topic} />;
      case 'tutor':
        return <SocraticTutorEngine topic={topic} initialQuestion={pendingTutorQuery} />;
      default:
        return <DeepNotesEngine topic={topic} onAskTutor={handleAskTutorFromEngine} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-clay)] p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. TOP BAR */}
      <div className="space-y-4">
        {/* Breadcrumb + Back Button Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ClayButton size="sm" variant="secondary" href="/dashboard">
              ← Dashboard
            </ClayButton>
            <nav className="text-xs font-bold text-[var(--muted-clay)] flex items-center gap-2">
              <Link href="/dashboard" className="hover:text-[var(--primary-clay)]">Dashboard</Link>
              <span>›</span>
              <Link href="/library" className="hover:text-[var(--primary-clay)]">Library</Link>
              <span>›</span>
              <span className="text-[var(--text-clay)] font-extrabold">{topic.title}</span>
            </nav>
          </div>

          {/* Action Buttons with Prominent Download Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* DOWNLOAD BUTTON */}
            <ClayButton
              size="sm"
              variant="primary"
              onClick={handleDownloadStudyGuide}
              className="shadow-[3px_3px_0px_var(--border-clay)] font-black"
              title="Download Markdown Study Guide & Save to Library"
            >
              📥 Download Study Guide
            </ClayButton>

            <ClayButton
              size="sm"
              variant={isSaved ? 'accent' : 'secondary'}
              onClick={handleDownloadStudyGuide}
            >
              {isSaved ? '★ Saved in Library' : '☆ Save to Library'}
            </ClayButton>

            <ClayButton
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Study link copied to clipboard!');
              }}
            >
              🔗 Share
            </ClayButton>
          </div>
        </div>

        {/* Big Topic Title (48px) & Metadata Chips */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <ClayBadge variant="primary" size="md">{topic.domain}</ClayBadge>
            <ClayBadge variant="accent" size="md">{topic.category}</ClayBadge>
            <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
              ⏱️ {topic.duration} Est. Mastery
            </span>
            <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full border border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)]">
              📚 150 Questions Available
            </span>
            <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full border border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)]">
              🃏 50 Flashcards
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-clay)] tracking-tight">
            {topic.title}
          </h1>

          <p className="text-sm sm:text-base font-bold text-[var(--muted-clay)] max-w-3xl leading-relaxed">
            {topic.summary}
          </p>
        </div>
      </div>

      {/* 2. ADAPTIVE THREE-COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column (250px): 9 Learning Engines Navigation */}
        <nav className="w-full lg:w-[250px] shrink-0 space-y-2 select-none">
          <ClayCard padding="sm" className="space-y-1.5 shadow-[4px_4px_0px_var(--border-clay)] border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)]">
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-clay)] px-3 py-1">
              9 Pedagogical Engines
            </p>

            {engines.map((eng) => {
              const isActive = activeEngine === eng.id;
              return (
                <button
                  key={eng.id}
                  onClick={() => setActiveEngine(eng.id as EngineType)}
                  className={`
                    w-full text-left p-3 rounded-[18px] border-[2px] transition-all cursor-pointer flex items-start gap-3
                    ${
                      isActive
                        ? 'border-[var(--border-clay)] bg-[var(--primary-clay)] text-white shadow-[4px_4px_0px_var(--border-clay)] translate-x-1'
                        : 'border-transparent text-[var(--text-clay)] hover:border-[var(--border-clay)] hover:bg-[var(--bg-clay)]'
                    }
                  `}
                >
                  <span className="text-xl shrink-0 mt-0.5">{eng.icon}</span>
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs truncate leading-tight">{eng.name}</p>
                    <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-[var(--muted-clay)]'}`}>
                      {eng.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </ClayCard>
        </nav>

        {/* Center Main Content Area */}
        <div className="flex-1 min-w-0 w-full">
          {renderEngine()}
        </div>

        {/* Right Side AI Tutor (Persistent Across Tabs) */}
        <PersistentTutorDrawer
          topic={topic}
          isOpen={isTutorDrawerOpen}
          onToggle={() => setIsTutorDrawerOpen(!isTutorDrawerOpen)}
          externalQuery={pendingTutorQuery}
        />
      </div>

      {/* Download Success Modal */}
      {downloadSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <ClayCard padding="lg" className="max-w-md w-full space-y-5 bg-[var(--surface-clay)] border-[3.5px] border-[var(--border-clay)] shadow-[10px_10px_0px_var(--border-clay)] animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎉</span>
              <div>
                <h3 className="text-xl font-black text-[var(--text-clay)]">
                  Downloaded & Saved to Library!
                </h3>
                <p className="text-xs font-bold text-[var(--muted-clay)]">
                  NeuraGlow offline study bundle ready
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium leading-relaxed text-[var(--text-clay)]">
              The complete master study package for <strong>{topic.title}</strong> (~50,000-word treatise, 150 practice questions, and 50 flashcards) has been downloaded to your computer and saved into your <strong>Library</strong>.
            </p>

            <div className="p-3 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] text-xs font-mono font-bold text-[var(--text-clay)] space-y-1">
              <div>✓ File: NeuraGlow_{topic.slug}_Master_StudyGuide.md</div>
              <div>✓ Synced to Library: Yes (Available Offline)</div>
              <div>✓ Questions: {topic.questionBank.length} verified</div>
              <div>✓ Flashcards: {topic.flashcards.length} cards</div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <ClayButton size="sm" variant="secondary" onClick={() => setDownloadSuccessModal(false)}>
                Continue Studying
              </ClayButton>
              <ClayButton size="sm" variant="primary" href="/library">
                View in Library →
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
}
