'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { buildUniversalTopicPackage } from '@/lib/universalTopicGenerator';
import { getCleanSavedLibrary, clearAllSavedLibrary } from '@/lib/storageUtils';

export default function LibraryPage() {
  const [filter, setFilter] = useState<'all' | 'downloaded' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'az' | 'questions'>('recent');
  const [libraryTopics, setLibraryTopics] = useState<any[]>([]);

  // Load from localStorage on mount — purges legacy mock topics automatically
  useEffect(() => {
    const loadLibrary = () => {
      const cleaned = getCleanSavedLibrary();
      setLibraryTopics(cleaned);
    };

    loadLibrary();
    window.addEventListener('storage', loadLibrary);
    return () => window.removeEventListener('storage', loadLibrary);
  }, []);

  // Clear entire library
  const handleClearLibrary = () => {
    clearAllSavedLibrary();
    setLibraryTopics([]);
  };

  // Remove topic from library
  const handleRemove = (slug: string) => {
    const updated = libraryTopics.filter((t) => t.slug !== slug);
    setLibraryTopics(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('neuraglow_saved_library', JSON.stringify(updated));
    }
  };

  // Re-download study guide file
  const handleExportFile = (item: any) => {
    try {
      const pkg = item.fullPackage || buildUniversalTopicPackage(item.slug);
      let md = `# ${pkg.title} — Comprehensive Study Guide\n`;
      md += `**Domain**: ${pkg.domain} | **Category**: ${pkg.category}\n\n`;
      md += `## Overview\n${pkg.summary}\n\n`;
      md += `## 1. Notes & Curricula\n`;
      pkg.notes.detailed.chapters.forEach((ch: any, idx: number) => {
        md += `### Chapter ${idx + 1}: ${ch.title}\n${ch.content}\n\n`;
      });
      md += `## 2. 150-Question Bank\n`;
      pkg.questionBank.forEach((q: any, idx: number) => {
        md += `### Q${idx + 1}: ${q.question}\nExplanation: ${q.explanation}\n\n`;
      });
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NeuraGlow_${pkg.slug}_StudyGuide.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('Error exporting study guide.');
    }
  };

  // Filter logic
  const filteredTopics = libraryTopics.filter((t) => {
    if (filter === 'downloaded') return t.offlineReady;
    if (filter === 'in-progress') return (t.progress || 0) > 0 && (t.progress || 0) < 90;
    if (filter === 'completed') return (t.progress || 0) >= 90;
    return true;
  });

  // Sort logic
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    if (sortBy === 'questions') return (b.questionCount || 0) - (a.questionCount || 0);
    return 0; // recent
  });

  return (
    <div className="min-h-screen bg-[var(--bg-clay)] p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Library Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClayBadge variant="primary" size="md">
              Study Sanctuary
            </ClayBadge>
            <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full border border-[var(--border-clay)] bg-emerald-100 text-emerald-950">
              Offline Storage Enabled
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-clay)] tracking-tight mt-1">
            My Study Library & Downloads
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[var(--muted-clay)]">
            {sortedTopics.length} Downloaded study guides, question banks, and flashcard decks
          </p>
        </div>

        <div className="flex items-center gap-3">
          {libraryTopics.length > 0 && (
            <button
              onClick={handleClearLibrary}
              className="px-3.5 py-2 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] hover:bg-red-100 hover:text-red-700 font-extrabold text-xs text-[var(--muted-clay)] transition-all cursor-pointer shadow-[2px_2px_0px_var(--border-clay)]"
            >
              Clear All (Make Blank)
            </button>
          )}
          <ClayButton size="sm" variant="secondary" href="/dashboard">
            ← Dashboard
          </ClayButton>
          <ClayButton size="sm" variant="primary" href="/search">
            + Synthesize New Topic
          </ClayButton>
        </div>
      </div>

      {/* Filter Chips & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[24px] border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] shadow-[4px_4px_0px_var(--border-clay)]">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All Curricula (${libraryTopics.length})` },
            { id: 'downloaded', label: '📥 Downloaded & Offline' },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'completed', label: 'Mastered' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`
                px-3.5 py-1.5 rounded-full border-[2px] font-black text-xs transition-all cursor-pointer
                ${
                  filter === f.id
                    ? 'border-[var(--border-clay)] bg-[var(--primary-clay)] text-white shadow-[2px_2px_0px_var(--border-clay)]'
                    : 'border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] hover:bg-[var(--accent-clay)] hover:text-[#1A1A1A]'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--muted-clay)]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-xs font-extrabold text-[var(--text-clay)] outline-none shadow-[2px_2px_0px_var(--border-clay)] cursor-pointer"
          >
            <option value="recent">Recently Downloaded</option>
            <option value="az">A to Z</option>
            <option value="questions">Most Questions</option>
          </select>
        </div>
      </div>

      {/* Topic Cards Grid */}
      {sortedTopics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTopics.map((topic) => (
            <ClayCard
              key={topic.slug}
              padding="lg"
              className="space-y-4 shadow-[6px_6px_0px_var(--border-clay)] border-[3px] border-[var(--border-clay)] bg-[var(--surface-clay)] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_var(--border-clay)] transition-all"
            >
              <div className="space-y-3">
                {/* Top Badge & Domain */}
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] flex items-center justify-center text-xl shadow-[2px_2px_0px_var(--border-clay)]">
                    {topic.domain?.includes('Physics') ? '⚛️' : topic.domain?.includes('History') ? '⚔️' : topic.domain?.includes('Biology') ? '🧬' : '💻'}
                  </span>
                  <div className="flex gap-1.5 items-center">
                    <ClayBadge size="sm" variant="primary">{topic.domain}</ClayBadge>
                    {topic.offlineReady && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-800 bg-emerald-100 text-emerald-950">
                        Offline Ready ✓
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-[var(--text-clay)] leading-tight">
                    {topic.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A]">
                      {topic.wordCountTarget || '50,000 Words'}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)]">
                      📚 {topic.questionCount || 150} Questions
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)]">
                      🃏 {topic.flashcardCount || 50} Cards
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress and Saved Date */}
              <div className="space-y-2 pt-3 border-t-[2px] border-[var(--border-clay)]">
                <div className="flex justify-between text-xs font-mono font-bold text-[var(--muted-clay)]">
                  <span>Saved: {topic.savedAt || 'Recently'}</span>
                  <span className="text-[var(--primary-clay)] font-black">{topic.progress || 80}%</span>
                </div>
                <div className="w-full h-3 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
                  <div
                    className="h-full bg-[var(--primary-clay)] transition-all duration-300"
                    style={{ width: `${topic.progress || 80}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <ClayButton
                  size="md"
                  variant="primary"
                  href={`/learn/${topic.slug}`}
                  className="w-full justify-between font-black"
                >
                  <span>Open Study Hub</span>
                  <span>→</span>
                </ClayButton>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportFile(topic)}
                    className="flex-1 py-1.5 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] hover:bg-[var(--accent-clay)] hover:text-[#1A1A1A] text-[11px] font-black text-[var(--text-clay)] transition-colors cursor-pointer"
                  >
                    📥 Re-Download MD
                  </button>
                  <button
                    onClick={() => handleRemove(topic.slug)}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] hover:bg-red-100 hover:text-red-700 text-[11px] font-black text-[var(--muted-clay)] transition-colors cursor-pointer"
                    title="Remove from library"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </ClayCard>
          ))}
        </div>
      ) : (
        /* Empty State */
        <ClayCard padding="xl" className="text-center space-y-5 max-w-lg mx-auto py-16 bg-[var(--surface-clay)] border-[3px] border-[var(--border-clay)]">
          <span className="text-6xl block">📦</span>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[var(--text-clay)]">
              No study guides in this filter yet!
            </h3>
            <p className="text-sm font-bold text-[var(--muted-clay)]">
              Search for any concept and click <strong>Download Study Guide</strong> to save it to your library offline.
            </p>
          </div>
          <ClayButton size="lg" variant="primary" href="/search">
            Synthesize a Topic Now →
          </ClayButton>
        </ClayCard>
      )}
    </div>
  );
}
