'use client';

import React, { useState, useMemo } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { RichContentRenderer } from '@/components/ui/RichContentRenderer';
import { QuestionItem } from '@/lib/universalTopicGenerator';

export interface QuestionBankEngineProps {
  topic: any;
  questions?: QuestionItem[];
}

export const QuestionBankEngine: React.FC<QuestionBankEngineProps> = ({ topic, questions: propQuestions }) => {
  const allQuestions: QuestionItem[] = propQuestions || topic.questionBank || [];

  const [activeCategory, setActiveCategory] = useState<'all' | 'conceptual' | 'analytical' | 'application' | 'trap'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const pageSize = 10;

  // Filter questions by category and search
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchCat = activeCategory === 'all' || q.category === activeCategory;
      const matchSearch = !searchQuery || q.question.toLowerCase().includes(searchQuery.toLowerCase()) || q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allQuestions, activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const displayedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleHint = (questionId: string) => {
    setRevealedHints((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Stats
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = Object.entries(userAnswers).filter(([qId, ans]) => {
    const q = allQuestions.find((item) => item.id === qId);
    return q && q.correctOption === ans;
  }).length;
  const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Overview Card */}
      <ClayCard padding="lg" className="space-y-6 shadow-[6px_6px_0px_var(--border-clay)] bg-[var(--surface-clay)] border-[3px] border-[var(--border-clay)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-[2px] border-[var(--border-clay)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClayBadge variant="primary" size="sm">
                📚 150-Question Master Bank
              </ClayBadge>
              <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full border border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A]">
                {allQuestions.length} Questions
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-clay)]">
              Comprehensive Practice & Verification
            </h2>
          </div>

          {/* Realtime Score Readout */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-center">
              <span className="text-[10px] font-black uppercase text-[var(--muted-clay)] block">Score</span>
              <span className="font-mono text-lg font-black text-[var(--primary-clay)]">
                {correctCount} / {answeredCount} ({scorePercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: `All (${allQuestions.length})` },
              { id: 'conceptual', label: 'Conceptual (40)' },
              { id: 'analytical', label: 'Analytical (40)' },
              { id: 'application', label: 'Application (40)' },
              { id: 'trap', label: 'Traps (30)' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setCurrentPage(1);
                }}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-extrabold border-[2px] border-[var(--border-clay)] whitespace-nowrap transition-all cursor-pointer
                  ${
                    activeCategory === cat.id
                      ? 'bg-[var(--primary-clay)] text-white shadow-[2px_2px_0px_var(--border-clay)] scale-105'
                      : 'bg-[var(--bg-clay)] text-[var(--text-clay)] hover:bg-[var(--surface-clay)]'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="sm:w-64">
            <input
              type="text"
              placeholder="Search 150 questions..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] placeholder:text-[var(--muted-clay)] text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--primary-clay)]"
            />
          </div>
        </div>
      </ClayCard>

      {/* Questions List (Paginated, 10 per page) */}
      <div className="space-y-6">
        {displayedQuestions.map((q, qIndex) => {
          const globalNum = (currentPage - 1) * pageSize + qIndex + 1;
          const selectedOption = userAnswers[q.id];
          const hasAnswered = selectedOption !== undefined;
          const isCorrect = selectedOption === q.correctOption;
          const isHintRevealed = revealedHints[q.id];

          return (
            <ClayCard
              key={q.id}
              padding="lg"
              className={`space-y-5 border-[3px] border-[var(--border-clay)] shadow-[6px_6px_0px_var(--border-clay)] transition-all ${
                hasAnswered
                  ? isCorrect
                    ? 'ring-2 ring-emerald-500 bg-emerald-50/20'
                    : 'ring-2 ring-red-500 bg-red-50/20'
                  : 'bg-[var(--surface-clay)]'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[var(--border-clay)]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)]">
                    Q{globalNum} of {filteredQuestions.length}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A]">
                    {q.category}
                  </span>
                </div>

                {q.hint && (
                  <button
                    onClick={() => toggleHint(q.id)}
                    className="text-xs font-bold text-[var(--muted-clay)] hover:text-[var(--primary-clay)] cursor-pointer"
                  >
                    {isHintRevealed ? 'Hide Hint 💡' : 'Show Hint 💡'}
                  </button>
                )}
              </div>

              {/* Hint Box */}
              {isHintRevealed && q.hint && (
                <div className="p-3 rounded-xl border-[2px] border-amber-400 bg-amber-50 text-amber-900 text-xs font-bold animate-fadeIn">
                  💡 Hint: {q.hint}
                </div>
              )}

              {/* Question Body */}
              <div className="text-base sm:text-lg font-black text-[var(--text-clay)] leading-relaxed">
                <RichContentRenderer content={q.question} />
              </div>

              {/* Options Grid */}
              <div className="space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isOptionCorrect = optIdx === q.correctOption;

                  let optionStyles = 'border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] hover:bg-[var(--surface-clay)]';

                  if (hasAnswered) {
                    if (isOptionCorrect) {
                      optionStyles = 'border-[2.5px] border-emerald-600 bg-emerald-100 text-emerald-950 font-black shadow-[2px_2px_0px_#065F46]';
                    } else if (isSelected && !isOptionCorrect) {
                      optionStyles = 'border-[2.5px] border-red-600 bg-red-100 text-red-950 font-black shadow-[2px_2px_0px_#991B1B]';
                    } else {
                      optionStyles = 'border-[1.5px] border-[var(--border-clay)]/30 opacity-60 bg-[var(--bg-clay)] text-[var(--muted-clay)]';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`
                        w-full text-left p-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-start gap-3
                        ${optionStyles}
                      `}
                    >
                      <span className="w-6 h-6 rounded-lg border border-[var(--border-clay)] flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5 bg-[var(--surface-clay)] text-[var(--text-clay)]">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <div className="flex-1 leading-relaxed">
                        <RichContentRenderer content={opt} />
                      </div>
                      {hasAnswered && isOptionCorrect && <span className="text-emerald-700 font-black shrink-0">✓ Correct</span>}
                      {hasAnswered && isSelected && !isOptionCorrect && <span className="text-red-700 font-black shrink-0">✕ Incorrect</span>}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation upon Answer */}
              {hasAnswered && (
                <div className="pt-3 border-t-[2px] border-[var(--border-clay)] space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[var(--text-clay)]">
                      {isCorrect ? '🎉 Correct Explanation:' : '💡 Detailed Solution:'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium leading-relaxed text-[var(--text-clay)]">
                    <RichContentRenderer content={q.explanation} />
                  </div>
                  {q.trapExplanation && (
                    <div className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-900 text-xs font-bold mt-2">
                      ⚠️ <RichContentRenderer content={q.trapExplanation} className="inline" />
                    </div>
                  )}
                </div>
              )}
            </ClayCard>
          );
        })}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <ClayCard padding="md" className="flex items-center justify-between border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[4px_4px_0px_var(--border-clay)]">
          <ClayButton
            size="sm"
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ← Previous Page
          </ClayButton>

          <span className="text-xs font-mono font-black text-[var(--text-clay)]">
            Page {currentPage} of {totalPages}
          </span>

          <ClayButton
            size="sm"
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next Page →
          </ClayButton>
        </ClayCard>
      )}
    </div>
  );
};
