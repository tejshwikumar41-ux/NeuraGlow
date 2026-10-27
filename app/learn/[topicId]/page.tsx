'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { ChunkyBrainIcon } from '@/components/ui/ClayIcons';

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
  const resolvedParams = use(params as Promise<{ topicId: string }>);
  const topicId = resolvedParams?.topicId || 'laws-of-motion';

  const [activeEngine, setActiveEngine] = useState<EngineType>(initialEngine);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chapter structured data from Supabase
  const [chapterData, setChapterData] = useState<any>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Load chapter data dynamically from database
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    const loadChapter = async () => {
      try {
        let chapterIdToFetch: string | number | null = null;

        // If topicId is numeric (direct ID)
        if (/^\d+$/.test(topicId)) {
          chapterIdToFetch = topicId;
        } else {
          // Search chapter by title / query
          const searchQuery = topicId.replace(/-/g, ' ').trim();
          const searchRes = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const searchJson = await searchRes.json();

          if (searchJson.chapters && searchJson.chapters.length > 0) {
            chapterIdToFetch = searchJson.chapters[0].id;
          } else {
            // Try fetching all chapters as fallback
            const fallbackRes = await fetch('/api/search');
            const fallbackJson = await fallbackRes.json();
            if (fallbackJson.chapters && fallbackJson.chapters.length > 0) {
              chapterIdToFetch = fallbackJson.chapters[0].id;
            }
          }
        }

        if (!chapterIdToFetch) {
          if (isMounted) {
            setErrorMsg(`No textbook module found for "${topicId.replace(/-/g, ' ')}".`);
            setLoading(false);
          }
          return;
        }

        // Fetch deep chapter data (sections, concepts, formulas, examples, questions, scripts, slides, socratic)
        const chapterRes = await fetch(`/api/chapter/${chapterIdToFetch}`);
        if (!chapterRes.ok) {
          throw new Error(`Failed to load chapter (Status: ${chapterRes.status})`);
        }

        const chapterJson = await chapterRes.json();
        if (isMounted) {
          setChapterData(chapterJson);
          setCurrentSectionIndex(0);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error loading textbook chapter:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'Failed to load chapter data.');
          setLoading(false);
        }
      }
    };

    loadChapter();

    return () => {
      isMounted = false;
    };
  }, [topicId]);

  const engines = [
    { id: 'notes', name: 'Deep Notes', icon: '📖', desc: 'Formatted section notes & formulas' },
    { id: 'questions', name: 'Question Bank', icon: '📚', desc: '150+ unique questions' },
    { id: 'flashcards', name: 'Flashcards', icon: '🃏', desc: 'Real concepts & definitions' },
    { id: 'slides', name: 'Presentation', icon: '🎞️', desc: '16:9 lecture slides' },
    { id: 'practice', name: 'Practice Solver', icon: '🔧', desc: 'Step-by-step worked examples' },
    { id: 'quiz', name: 'Adaptive Quiz', icon: '❓', desc: 'Interactive self-testing' },
    { id: 'audio', name: 'Audio Lesson', icon: '🎧', desc: 'Conversational audio teacher' },
    { id: 'simulator', name: 'Live Simulator', icon: '⚡', desc: 'Real formula sliders' },
    { id: 'tutor', name: 'Socratic Tutor', icon: '💬', desc: 'Depth 1-5 guided dialogue' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-clay)] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl border-[3px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] flex items-center justify-center shadow-[4px_4px_0px_var(--border-clay)] animate-spin">
          <ChunkyBrainIcon size={36} />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-[var(--text-clay)]">
            Loading Real Textbook Content from Supabase...
          </h2>
          <p className="text-xs font-bold text-[var(--muted-clay)]">
            Fetching structured sections, equations, worked examples, and question bank...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !chapterData || !chapterData.sections || chapterData.sections.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-clay)] p-6 sm:p-12 max-w-4xl mx-auto space-y-6">
        <ClayCard padding="lg" className="text-center space-y-4 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)]">
          <span className="text-5xl">📚</span>
          <h2 className="text-2xl font-black text-[var(--text-clay)]">
            Textbook Module Unavailable
          </h2>
          <p className="text-sm font-bold text-[var(--muted-clay)] max-w-md mx-auto">
            {errorMsg || 'We could not find any processed textbook sections for this topic in Supabase.'}
          </p>
          <div className="pt-2">
            <ClayButton size="md" variant="primary" href="/search">
              ← Search Other Chapters
            </ClayButton>
          </div>
        </ClayCard>
      </div>
    );
  }

  const { chapter, sections, all_questions } = chapterData;
  const currentSection = sections[currentSectionIndex] || sections[0];

  // Render individual engine views based on real database tables
  const renderEngineView = () => {
    switch (activeEngine) {
      case 'notes':
        return <NotesView section={currentSection} />;
      case 'questions':
        return <QuestionBankView questions={all_questions || []} />;
      case 'flashcards':
        return <FlashcardsView concepts={currentSection.concepts || []} allConcepts={sections.flatMap((s: any) => s.concepts || [])} />;
      case 'slides':
        return <PresentationView slides={currentSection.slides || []} sectionTitle={currentSection.section_title} />;
      case 'practice':
        return <SolverView examples={currentSection.examples || []} allExamples={sections.flatMap((s: any) => s.examples || [])} />;
      case 'quiz':
        return (
          <QuizView
            questions={all_questions?.filter((q: any) => q.section_id === currentSection.id) || []}
            allQuestions={all_questions || []}
          />
        );
      case 'audio':
        return <AudioView script={currentSection.audio_script} sectionTitle={currentSection.section_title} />;
      case 'simulator':
        return (
          <SimulatorView
            formulas={currentSection.formulas || []}
            allFormulas={sections.flatMap((s: any) => s.formulas || [])}
          />
        );
      case 'tutor':
        return (
          <SocraticTutorView
            chapterTitle={chapter?.chapter_title || ''}
            sectionTitle={currentSection.section_title}
            contentMarkdown={currentSection.content_markdown || ''}
            concepts={currentSection.concepts || []}
            formulas={currentSection.formulas || []}
          />
        );
      default:
        return <NotesView section={currentSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-clay)] p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Banner & Section Selector */}
      <ClayCard padding="md" className="space-y-4 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <ClayBadge variant="primary" size="sm">{chapter.subject || 'Physics'}</ClayBadge>
              <ClayBadge variant="accent" size="sm">{chapter.source || 'NCERT Class 11'}</ClayBadge>
              <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
                📖 {sections.length} Sections
              </span>
              <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
                📚 {all_questions?.length || 0} Questions
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-clay)] tracking-tight">
              {chapter.chapter_title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ClayButton size="sm" variant="secondary" href="/search">
              🔍 Search
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

        {/* Section Navigation Tabs */}
        <div className="pt-2 border-t border-[var(--border-clay)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)]">
              Jump to Section:
            </span>
            <span className="text-xs font-bold text-[var(--text-clay)]">
              Section {currentSectionIndex + 1} of {sections.length}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {sections.map((sec: any, idx: number) => {
              const isSelected = idx === currentSectionIndex;
              return (
                <button
                  key={sec.id || idx}
                  onClick={() => setCurrentSectionIndex(idx)}
                  className={`
                    px-3.5 py-1.5 rounded-[14px] text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border-[2px]
                    ${
                      isSelected
                        ? 'bg-[var(--primary-clay)] text-white border-[var(--border-clay)] shadow-[2px_2px_0px_var(--border-clay)]'
                        : 'bg-[var(--surface-clay)] text-[var(--text-clay)] border-[var(--border-clay)]/40 hover:border-[var(--border-clay)]'
                    }
                  `}
                >
                  <span className="font-mono mr-1.5 opacity-80">{sec.section_number}</span>
                  {sec.section_title.length > 25 ? `${sec.section_title.slice(0, 25)}...` : sec.section_title}
                </button>
              );
            })}
          </div>
        </div>
      </ClayCard>

      {/* 2. Main Two-Column Learning Hub */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column (250px): 9 Learning Engines Navigation */}
        <nav className="w-full lg:w-[260px] shrink-0 space-y-2 select-none">
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
        <main className="flex-1 min-w-0 w-full">
          {renderEngineView()}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 1. NOTES VIEW (Markdown + KaTeX + Formulas)
// ─────────────────────────────────────────────
function NotesView({ section }: { section: any }) {
  if (!section) return <div>No section data.</div>;

  return (
    <ClayCard padding="lg" className="space-y-6 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)]">
      <div className="space-y-2 pb-4 border-b border-[var(--border-clay)]">
        <div className="flex flex-wrap items-center gap-2">
          <ClayBadge variant="primary" size="sm">{section.section_number}</ClayBadge>
          <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
            ⏱️ {Math.max(5, Math.round((section.word_count || 1000) / 180))} mins read • {section.word_count || 0} words
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-clay)]">
          {section.section_title}
        </h2>
        {section.summary && (
          <p className="text-sm font-bold text-[var(--muted-clay)] italic">
            Summary: {section.summary}
          </p>
        )}
      </div>

      {/* Render Full Markdown Body */}
      <div className="prose prose-base sm:prose-lg max-w-none text-[var(--text-clay)] leading-relaxed selection:bg-[var(--primary-clay)] selection:text-white">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {section.content_markdown || ''}
        </ReactMarkdown>
      </div>

      {/* Extracted Core Formulas */}
      {section.formulas && section.formulas.length > 0 && (
        <div className="p-5 rounded-[22px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] space-y-3 shadow-[3px_3px_0px_var(--border-clay)] mt-8">
          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)] block">
            Core Mathematical Equations in this Section
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.formulas.map((f: any, idx: number) => (
              <div
                key={f.id || idx}
                className="p-3.5 rounded-xl border border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] shadow-[2px_2px_0px_var(--border-clay)] font-mono text-sm"
              >
                <div className="font-bold text-base">{f.formula_plain}</div>
                {f.description && <div className="text-xs text-[var(--muted-clay)] mt-1">{f.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </ClayCard>
  );
}

// ─────────────────────────────────────────────
// 2. QUESTION BANK VIEW (150+ Questions)
// ─────────────────────────────────────────────
function QuestionBankView({ questions }: { questions: any[] }) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDiff, setFilterDiff] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = questions.filter((q) => {
    if (filterType !== 'all' && q.question_type !== filterType) return false;
    if (filterDiff !== 'all' && q.difficulty !== filterDiff) return false;
    if (search.trim()) {
      const matchText = q.question_text?.toLowerCase().includes(search.toLowerCase());
      const matchExpl = q.explanation?.toLowerCase().includes(search.toLowerCase());
      if (!matchText && !matchExpl) return false;
    }
    return true;
  });

  return (
    <ClayCard padding="lg" className="space-y-6 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-clay)]">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-clay)]">
            Question Bank ({questions.length} Unique Questions)
          </h2>
          <p className="text-xs font-bold text-[var(--muted-clay)]">
            Directly derived from the NCERT textbook sections. Showing {filtered.length} matching.
          </p>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter questions..."
          className="h-10 px-4 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--primary-clay)]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-[var(--muted-clay)]">Type:</span>
        {['all', 'mcq', 'fill_blank', 'true_false'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold capitalize cursor-pointer border ${
              filterType === type
                ? 'bg-[var(--primary-clay)] text-white border-[var(--border-clay)]'
                : 'bg-[var(--surface-clay)] text-[var(--text-clay)] border-[var(--border-clay)]/50'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}

        <span className="text-[11px] font-bold text-[var(--muted-clay)] ml-4">Difficulty:</span>
        {['all', 'easy', 'medium', 'hard'].map((diff) => (
          <button
            key={diff}
            onClick={() => setFilterDiff(diff)}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold capitalize cursor-pointer border ${
              filterDiff === diff
                ? 'bg-[var(--accent-clay)] text-[#1A1A1A] border-[var(--border-clay)]'
                : 'bg-[var(--surface-clay)] text-[var(--text-clay)] border-[var(--border-clay)]/50'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.map((q: any, i: number) => (
          <div
            key={q.id || i}
            className="p-5 rounded-2xl border-[2px] border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[3px_3px_0px_var(--border-clay)] space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-black text-sm text-[var(--text-clay)]">
                Q{i + 1}. {q.question_text}
              </span>
              <ClayBadge size="sm" variant={q.difficulty === 'hard' ? 'primary' : q.difficulty === 'medium' ? 'accent' : 'default'}>
                {q.difficulty}
              </ClayBadge>
            </div>

            {/* MCQ Options */}
            {q.options && Array.isArray(q.options) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {q.options.map((opt: string, idx: number) => {
                  const isCorrect = opt === q.correct_answer;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs font-bold ${
                        isCorrect
                          ? 'border-green-600 bg-green-500/10 text-green-700 font-black'
                          : 'border-[var(--border-clay)]/40 bg-[var(--bg-clay)] text-[var(--text-clay)]'
                      }`}
                    >
                      <span className="font-mono mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {opt} {isCorrect && '✓ (Correct)'}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Answer & Explanation Accordion */}
            <details className="mt-2 text-xs text-[var(--muted-clay)]">
              <summary className="cursor-pointer font-bold text-[var(--primary-clay)] hover:underline select-none">
                💡 View Textbook Explanation & Citation
              </summary>
              <div className="mt-2 p-3 rounded-xl bg-[var(--bg-clay)] border border-[var(--border-clay)] space-y-1">
                <p className="font-extrabold text-[var(--text-clay)]">
                  Answer: {q.correct_answer}
                </p>
                <p>{q.explanation}</p>
                {q.source_text && (
                  <p className="italic text-[10px] text-[var(--muted-clay)]">
                    Source text: &quot;{q.source_text}&quot;
                  </p>
                )}
              </div>
            </details>
          </div>
        ))}
      </div>
    </ClayCard>
  );
}

// ─────────────────────────────────────────────
// 3. FLASHCARDS VIEW (Real Concepts)
// ─────────────────────────────────────────────
function FlashcardsView({ concepts, allConcepts }: { concepts: any[]; allConcepts: any[] }) {
  const activeConcepts = concepts && concepts.length > 0 ? concepts : allConcepts;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!activeConcepts || activeConcepts.length === 0) {
    return (
      <ClayCard padding="lg" className="text-center p-8 border-[3px] border-[var(--border-clay)]">
        <p className="text-base font-bold text-[var(--muted-clay)]">
          No concepts extracted for this section. Switch to another section to explore flashcards.
        </p>
      </ClayCard>
    );
  }

  const current = activeConcepts[currentIndex] || activeConcepts[0];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % activeConcepts.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + activeConcepts.length) % activeConcepts.length);
  };

  return (
    <ClayCard padding="lg" className="space-y-6 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)] max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase text-[var(--muted-clay)]">
          Flashcard {currentIndex + 1} of {activeConcepts.length}
        </span>
        <ClayBadge size="sm" variant="accent">
          {flipped ? 'Definition Side' : 'Term Side'}
        </ClayBadge>
      </div>

      {/* 3D Flip Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="min-h-[260px] p-8 rounded-[24px] border-[3px] border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[5px_5px_0px_var(--border-clay)] flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all hover:scale-[1.01]"
      >
        {!flipped ? (
          <div className="space-y-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)]">
              Term (Click to Reveal Definition)
            </span>
            <h3 className="text-3xl font-black text-[var(--text-clay)]">
              {current.term}
            </h3>
            <p className="text-xs font-bold text-[var(--muted-clay)]">
              🔄 Tap card to flip
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-green-600">
              Definition & Context
            </span>
            <p className="text-base font-bold text-[var(--text-clay)] leading-relaxed">
              {current.definition}
            </p>
            {current.context && (
              <p className="text-xs italic text-[var(--muted-clay)] border-t border-[var(--border-clay)] pt-2">
                &quot;{current.context}&quot;
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <ClayButton size="sm" variant="secondary" onClick={handlePrev}>
          ← Previous
        </ClayButton>
        <button
          onClick={() => setFlipped(!flipped)}
          className="text-xs font-black uppercase text-[var(--primary-clay)] hover:underline"
        >
          Flip Card
        </button>
        <ClayButton size="sm" variant="primary" onClick={handleNext}>
          Next Card →
        </ClayButton>
      </div>
    </ClayCard>
  );
}

// ─────────────────────────────────────────────
// 4. PRESENTATION VIEW (16:9 Slides)
// ─────────────────────────────────────────────
function PresentationView({ slides, sectionTitle }: { slides: any[]; sectionTitle: string }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!slides || slides.length === 0) {
    return (
      <ClayCard padding="lg" className="text-center p-8 border-[3px] border-[var(--border-clay)]">
        <p className="text-base font-bold text-[var(--muted-clay)]">
          No lecture slides generated for this section.
        </p>
      </ClayCard>
    );
  }

  const slide = slides[currentSlideIndex] || slides[0];

  return (
    <ClayCard padding="none" className="border-[3px] border-[var(--border-clay)] shadow-[8px_8px_0px_var(--border-clay)] overflow-hidden">
      {/* 16:9 Presentation Canvas */}
      <div className="aspect-video bg-[var(--surface-clay)] p-6 sm:p-12 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <ClayBadge variant="primary" size="sm">
              Slide {currentSlideIndex + 1} / {slides.length}
            </ClayBadge>
            <span className="text-xs font-bold text-[var(--muted-clay)] uppercase">
              {sectionTitle}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-clay)] tracking-tight">
            {slide.title}
          </h2>
        </div>

        {/* Bullets */}
        <div className="my-auto space-y-4">
          {slide.bullet_points &&
            slide.bullet_points.map((b: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-base sm:text-xl font-bold text-[var(--text-clay)]">
                <span className="text-[var(--primary-clay)] font-black text-2xl leading-none">•</span>
                <span>{b}</span>
              </div>
            ))}
        </div>

        {/* Slide Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-clay)]">
          <ClayButton
            size="sm"
            variant="secondary"
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
            disabled={currentSlideIndex === 0}
          >
            ← Previous Slide
          </ClayButton>

          <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
            Use buttons to navigate
          </span>

          <ClayButton
            size="sm"
            variant="primary"
            onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
            disabled={currentSlideIndex === slides.length - 1}
          >
            Next Slide →
          </ClayButton>
        </div>
      </div>
    </ClayCard>
  );
}

// ─────────────────────────────────────────────
// 5. PRACTICE SOLVER VIEW (Worked Examples)
// ─────────────────────────────────────────────
function SolverView({ examples, allExamples }: { examples: any[]; allExamples: any[] }) {
  const activeExamples = examples && examples.length > 0 ? examples : allExamples;

  if (!activeExamples || activeExamples.length === 0) {
    return (
      <ClayCard padding="lg" className="text-center p-8 border-[3px] border-[var(--border-clay)]">
        <p className="text-base font-bold text-[var(--muted-clay)]">
          No worked numerical examples detected in this section.
        </p>
      </ClayCard>
    );
  }

  return (
    <div className="space-y-6">
      {activeExamples.map((ex: any, idx: number) => (
        <ClayCard key={ex.id || idx} padding="lg" className="space-y-5 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-clay)]">
            <h3 className="text-xl font-black text-[var(--text-clay)]">
              📘 Example {ex.example_number || idx + 1}
            </h3>
            <ClayBadge variant="accent" size="sm">Worked Problem</ClayBadge>
          </div>

          <div className="p-4 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)]">
            <span className="text-[10px] font-black uppercase text-[var(--muted-clay)] block mb-1">
              Problem Statement:
            </span>
            <p className="text-sm font-bold text-[var(--text-clay)] leading-relaxed">
              {ex.problem_statement}
            </p>
          </div>

          {/* Solution Steps */}
          {ex.solution_steps && ex.solution_steps.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--text-clay)]">
                Step-by-Step Derivation & Solution:
              </span>
              <div className="space-y-2">
                {ex.solution_steps.map((st: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="p-3.5 rounded-xl border border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[2px_2px_0px_var(--border-clay)] space-y-1 text-xs"
                  >
                    <span className="font-extrabold text-[var(--primary-clay)]">
                      Step {st.step || sIdx + 1}:
                    </span>
                    <p className="font-medium text-[var(--text-clay)]">{st.description}</p>
                    {st.equation && <p className="font-mono text-sm font-bold">{st.equation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Answer */}
          {ex.final_answer && (
            <div className="p-4 rounded-xl border-2 border-green-600 bg-green-500/10 text-green-800 text-sm font-black shadow-[3px_3px_0px_var(--border-clay)]">
              🎯 Verified Final Answer: {ex.final_answer}
            </div>
          )}
        </ClayCard>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// 6. ADAPTIVE QUIZ VIEW (Interactive Engine)
// ─────────────────────────────────────────────
function QuizView({ questions, allQuestions }: { questions: any[]; allQuestions: any[] }) {
  const quizPool = questions.length >= 5 ? questions : allQuestions;
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!quizPool || quizPool.length === 0) {
    return (
      <ClayCard padding="lg" className="text-center p-8 border-[3px] border-[var(--border-clay)]">
        <p className="text-base font-bold text-[var(--muted-clay)]">
          No questions available for quiz mode yet.
        </p>
      </ClayCard>
    );
  }

  const q = quizPool[currentQIndex];

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);
    if (opt === q.correct_answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex + 1 < Math.min(10, quizPool.length)) {
      setCurrentQIndex((i) => i + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    return (
      <ClayCard padding="lg" className="text-center space-y-5 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)] max-w-lg mx-auto">
        <span className="text-5xl">🏆</span>
        <h2 className="text-2xl font-black text-[var(--text-clay)]">Quiz Complete!</h2>
        <p className="text-sm font-bold text-[var(--muted-clay)]">
          Your score: {score} out of {Math.min(10, quizPool.length)} correct (
          {Math.round((score / Math.min(10, quizPool.length)) * 100)}%)
        </p>
        <ClayButton size="md" variant="primary" onClick={handleRestart}>
          🔄 Retake Quiz
        </ClayButton>
      </ClayCard>
    );
  }

  return (
    <ClayCard padding="lg" className="space-y-6 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)] max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-clay)]">
        <span className="text-xs font-mono font-bold text-[var(--muted-clay)]">
          Question {currentQIndex + 1} of {Math.min(10, quizPool.length)}
        </span>
        <ClayBadge size="sm" variant="primary">
          Score: {score}
        </ClayBadge>
      </div>

      <h3 className="text-lg sm:text-xl font-black text-[var(--text-clay)]">
        {q.question_text}
      </h3>

      {/* Options */}
      <div className="space-y-2.5">
        {(q.options || ['True', 'False']).map((opt: string, idx: number) => {
          let btnStyle = 'border-[var(--border-clay)] bg-[var(--surface-clay)] hover:bg-[var(--bg-clay)]';
          if (isAnswered) {
            if (opt === q.correct_answer) {
              btnStyle = 'border-green-600 bg-green-500/20 text-green-800 font-black';
            } else if (opt === selectedOpt) {
              btnStyle = 'border-red-600 bg-red-500/20 text-red-800 font-bold';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-xl border-[2px] text-left text-sm font-bold transition-all shadow-[2px_2px_0px_var(--border-clay)] cursor-pointer ${btnStyle}`}
            >
              <span className="font-mono mr-2">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] text-xs text-[var(--text-clay)]">
            <span className="font-bold">Explanation:</span> {q.explanation}
          </div>
          <ClayButton size="md" variant="primary" onClick={handleNext} className="w-full">
            Continue →
          </ClayButton>
        </div>
      )}
    </ClayCard>
  );
}

// ─────────────────────────────────────────────
// 7. AUDIO LESSON VIEW (SpeechSynthesis)
// ─────────────────────────────────────────────
function AudioView({ script, sectionTitle }: { script: any; sectionTitle: string }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!script?.script_text || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(script.script_text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    }
  };

  if (!script?.script_text) {
    return (
      <ClayCard padding="lg" className="text-center p-8 border-[3px] border-[var(--border-clay)]">
        <p className="text-base font-bold text-[var(--muted-clay)]">
          No conversational audio script generated for this section yet.
        </p>
      </ClayCard>
    );
  }

  return (
    <ClayCard padding="lg" className="space-y-6 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)]">
      <div className="space-y-2 pb-4 border-b border-[var(--border-clay)]">
        <ClayBadge variant="primary" size="sm">Audio Companion</ClayBadge>
        <h2 className="text-2xl font-black text-[var(--text-clay)]">
          🎧 Audio Walkthrough: {sectionTitle}
        </h2>
        <p className="text-xs font-bold text-[var(--muted-clay)]">
          Estimated lesson duration: ~{Math.round((script.estimated_duration_sec || 120) / 60)} minutes
        </p>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center gap-3">
        {!playing ? (
          <ClayButton size="md" variant="primary" onClick={handlePlay}>
            ▶️ Play Lesson ({script.estimated_duration_sec || 120}s)
          </ClayButton>
        ) : (
          <ClayButton size="md" variant="primary" onClick={handleStop} className="bg-red-500 hover:bg-red-600 text-white">
            ⏹️ Stop Audio
          </ClayButton>
        )}
      </div>

      {/* Conversational Script Preview */}
      <div className="p-5 rounded-2xl border-[2px] border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)] max-h-96 overflow-y-auto space-y-2">
        <span className="text-[11px] font-black uppercase text-[var(--muted-clay)] block">
          Conversational Lecture Transcript:
        </span>
        <p className="text-sm font-bold text-[var(--text-clay)] leading-relaxed whitespace-pre-wrap">
          {script.script_text}
        </p>
      </div>
    </ClayCard>
  );
}

// ─────────────────────────────────────────────
// 8. LIVE SIMULATOR VIEW (Formula Sliders)
// ─────────────────────────────────────────────
function SimulatorView({ formulas, allFormulas }: { formulas: any[]; allFormulas: any[] }) {
  const activeFormulas = formulas.length > 0 ? formulas : allFormulas;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sliderVals, setSliderVals] = useState<Record<string, number>>({});

  if (!activeFormulas || activeFormulas.length === 0) {
    return (
      <ClayCard padding="lg" className="text-center p-8 border-[3px] border-[var(--border-clay)]">
        <p className="text-base font-bold text-[var(--muted-clay)]">
          No equations detected in this section to simulate.
        </p>
      </ClayCard>
    );
  }

  const formula = activeFormulas[selectedIdx] || activeFormulas[0];
  const variables = formula.variables && Array.isArray(formula.variables) ? formula.variables : [];

  return (
    <ClayCard padding="lg" className="space-y-6 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)] max-w-2xl mx-auto">
      <div className="space-y-2 pb-4 border-b border-[var(--border-clay)]">
        <ClayBadge variant="primary" size="sm">Interactive Physics Simulator</ClayBadge>
        <h2 className="text-2xl font-black text-[var(--text-clay)]">
          ⚡ Equation Parameter Slider
        </h2>
      </div>

      {/* Select Formula */}
      <div className="space-y-1">
        <label className="text-xs font-black uppercase text-[var(--muted-clay)]">
          Choose Equation to Simulate:
        </label>
        <select
          value={selectedIdx}
          onChange={(e) => {
            setSelectedIdx(+e.target.value);
            setSliderVals({});
          }}
          className="w-full h-12 px-4 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-sm font-black text-[var(--text-clay)] outline-none"
        >
          {activeFormulas.map((f: any, i: number) => (
            <option key={f.id || i} value={i}>
              {f.formula_plain}
            </option>
          ))}
        </select>
      </div>

      {/* Big Formula Display */}
      <div className="p-6 rounded-2xl border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-center shadow-[3px_3px_0px_var(--border-clay)]">
        <span className="text-3xl font-black font-mono text-[var(--primary-clay)]">
          {formula.formula_plain}
        </span>
      </div>

      {/* Variable Sliders */}
      <div className="space-y-4">
        {variables.map((v: any, idx: number) => {
          const val = sliderVals[v.symbol] ?? 10;
          return (
            <div key={idx} className="space-y-1 p-3 rounded-xl border border-[var(--border-clay)] bg-[var(--surface-clay)]">
              <div className="flex items-center justify-between text-xs font-black text-[var(--text-clay)]">
                <span>
                  Variable {v.symbol} ({v.name || 'Parameter'}):
                </span>
                <span className="font-mono text-sm px-2 py-0.5 rounded bg-[var(--primary-clay)] text-white">
                  {val}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={val}
                onChange={(e) => setSliderVals({ ...sliderVals, [v.symbol]: +e.target.value })}
                className="w-full accent-[var(--primary-clay)] cursor-pointer"
              />
            </div>
          );
        })}
      </div>
    </ClayCard>
  );
}

// ─────────────────────────────────────────────
// 9. SOCRATIC TUTOR VIEW (Multi-LLM 2-Way Socratic AI Chat)
// ─────────────────────────────────────────────
interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export function SocraticTutorView({
  chapterTitle,
  sectionTitle,
  contentMarkdown,
  concepts = [],
  formulas = []
}: {
  chapterTitle: string;
  sectionTitle: string;
  contentMarkdown: string;
  concepts: any[];
  formulas: any[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial Socratic AI greeting
  useEffect(() => {
    const firstConcept = concepts.find(c => c.term && c.term.toUpperCase() !== 'INTRODUCTION');
    const openingQuestion = firstConcept 
      ? `To start off: What is your understanding of **${firstConcept.term}** based on this chapter?`
      : `To start off: In your own words, what is the fundamental physical law described in **${sectionTitle}**?`;

    setMessages([
      {
        id: 'init-1',
        sender: 'ai',
        text: `👋 **Greetings! I am your 2-Way Socratic Physics AI Tutor.**\n\nWe are studying **${chapterTitle} — ${sectionTitle}** directly from your textbook PDF.\n\nLet's test and build your understanding:\n\n🤔 **${openingQuestion}**`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [sectionTitle, chapterTitle, concepts]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customText) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle,
          sectionTitle,
          sectionContent: contentMarkdown,
          concepts,
          formulas,
          messages: updatedMessages.map(m => ({ sender: m.sender, text: m.text })),
          userInput: textToSend
        })
      });

      const data = await res.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || "Let's review the textbook section again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "⚠️ Connection error. Please check your internet or API keys.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[680px] bg-[#FAF8F5] border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Header */}
      <div className="bg-[#FF6B4A] border-b-4 border-black p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            🤖
          </div>
          <div>
            <h3 className="font-black text-white text-lg uppercase tracking-wide">Socratic AI Tutor</h3>
            <p className="text-xs font-bold text-black/80">{sectionTitle} • Grounded in PDF</p>
          </div>
        </div>
        <div className="bg-black text-white font-black text-xs px-3 py-1 rounded-full uppercase border border-white">
          Multi-LLM Active
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F4F1EA]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              msg.sender === 'user' ? 'bg-[#4D96FF] text-white rounded-br-none' : 'bg-white text-black rounded-bl-none'
            }`}>
              <div className="flex items-center justify-between gap-4 mb-1 border-b border-black/10 pb-1 text-[11px] opacity-80 font-black uppercase">
                <span>{msg.sender === 'user' ? 'You (Student)' : 'Socratic AI'}</span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>
              <div className="text-sm font-medium leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-black p-3 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs font-bold flex items-center gap-2">
              <span>Socratic AI is analyzing PDF content</span>
              <span className="animate-pulse font-black text-base">•••</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="bg-[#EFECE6] border-t-2 border-black p-2 flex gap-2 overflow-x-auto">
        <button onClick={() => handleSend("Give me a hint!")} className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300">
          💡 Need a hint
        </button>
        <button onClick={() => handleSend("Ask me a Socratic question")} className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-300">
          ❓ Next Question
        </button>
        <button onClick={() => handleSend("Explain this simply using the textbook")} className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-300">
          📘 Simplify Concept
        </button>
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="bg-white border-t-4 border-black p-3 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer or ask any physics question..."
          className="flex-1 px-4 py-3 bg-[#F4F1EA] border-2 border-black rounded-xl font-bold text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-6 py-3 bg-[#FF6B4A] text-white border-2 border-black rounded-xl font-black text-sm uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
