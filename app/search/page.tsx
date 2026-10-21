'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { ChunkyBrainIcon } from '@/components/ui/ClayIcons';
import { buildUniversalTopicPackage } from '@/lib/universalTopicGenerator';

import { getCleanSavedLibrary } from '@/lib/storageUtils';

function SearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedTopics, setSavedTopics] = useState<any[]>([]);

  // Load user recents and saved topics from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawRecents = localStorage.getItem('neuraglow_recent_searches');
        if (rawRecents) {
          const parsed = JSON.parse(rawRecents);
          if (Array.isArray(parsed)) {
            const cleanRecents = parsed.filter(
              (r: string) => !['quantum entanglement', 'french revolution', 'react hooks', 'krebs cycle'].includes(r.toLowerCase().trim())
            );
            setRecentSearches(cleanRecents);
            localStorage.setItem('neuraglow_recent_searches', JSON.stringify(cleanRecents));
          }
        }
        const cleanedSaved = getCleanSavedLibrary();
        setSavedTopics(cleanedSaved);
      } catch (e) {
        console.warn('Could not read search cache', e);
      }
    }
  }, []);

  // Suggestions based on user's saved library
  const suggestions = query.trim()
    ? savedTopics.filter(t => t.title?.toLowerCase().includes(query.toLowerCase()) || t.domain?.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleExecuteSearch = (searchTopic?: string) => {
    const q = searchTopic || query;
    if (!q.trim()) return;

    setIsAnalyzing(true);
    setSelectedResult(null);

    // Save to recents in state and localStorage
    const updatedRecents = [q, ...recentSearches.filter(item => item.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    setRecentSearches(updatedRecents);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('neuraglow_recent_searches', JSON.stringify(updatedRecents));
      } catch (e) {
        console.warn('Could not save recents', e);
      }
    }

    setTimeout(() => {
      const cleanSlug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'topic';
      const universalPkg = buildUniversalTopicPackage(cleanSlug);
      setSelectedResult(universalPkg);
      setIsAnalyzing(false);
    }, 700);
  };

  const handleClearRecents = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neuraglow_recent_searches');
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleExecuteSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg-clay)] p-4 sm:p-12 max-w-4xl mx-auto space-y-10">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <ClayBadge variant="primary" size="md">
          Universal Knowledge Search
        </ClayBadge>
        <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-clay)] tracking-tight">
          Search Any Topic on Earth
        </h1>
        <p className="text-sm font-bold text-[var(--muted-clay)] max-w-lg mx-auto">
          Type any scientific concept, historical event, mathematical theorem, or technology framework.
        </p>
      </div>

      {/* Massive Search Input with Chunky Border */}
      <ClayCard padding="none" className="p-3 shadow-[8px_8px_0px_var(--border-clay)] border-[3px]">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full flex items-center">
            <span className="absolute left-5 text-2xl select-none">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch()}
              placeholder="e.g. Quantum entanglement, French revolution, React hooks..."
              autoFocus
              className="w-full h-16 sm:h-20 pl-16 pr-5 rounded-[20px] bg-[var(--bg-clay)] text-[var(--text-clay)] text-base sm:text-xl font-black placeholder:text-[var(--muted-clay)] outline-none border-[2px] border-[var(--border-clay)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] focus:border-[var(--primary-clay)] focus:ring-4 focus:ring-[var(--accent-clay)]"
            />
          </div>
          <ClayButton
            size="lg"
            variant="primary"
            onClick={() => handleExecuteSearch()}
            className="h-16 sm:h-20 px-8 rounded-[20px] font-black text-base w-full sm:w-auto shrink-0 shadow-[4px_4px_0px_var(--border-clay)]"
          >
            Analyze & Build →
          </ClayButton>
        </div>
      </ClayCard>

      {/* Instant Suggestions Dropdown if typing */}
      {suggestions.length > 0 && !isAnalyzing && (
        <ClayCard padding="sm" className="space-y-1 shadow-[4px_4px_0px_var(--border-clay)]">
          <span className="text-[10px] font-mono font-bold uppercase text-[var(--muted-clay)] px-3 py-1 block">
            Instant Topic Matches:
          </span>
          {suggestions.map((s) => (
            <div
              key={s.slug}
              onClick={() => handleExecuteSearch(s.title)}
              className="p-3 rounded-[16px] hover:bg-[var(--accent-clay)] hover:text-[#1A1A1A] transition-all cursor-pointer flex items-center justify-between border border-transparent hover:border-[var(--border-clay)]"
            >
              <span className="font-extrabold text-sm text-[var(--text-clay)]">{s.title}</span>
              <ClayBadge size="sm" variant="default">{s.domain}</ClayBadge>
            </div>
          ))}
        </ClayCard>
      )}

      {/* Recent Searches (from user history only) */}
      {recentSearches.length > 0 && (
        <div className="flex items-center justify-between text-xs font-bold text-[var(--muted-clay)] pt-2 border-t border-[var(--border-clay)]">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Recent:</span>
            {recentSearches.map((r, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(r);
                  handleExecuteSearch(r);
                }}
                className="hover:underline text-[var(--text-clay)] font-extrabold cursor-pointer"
              >
                {r}{i < recentSearches.length - 1 ? ',' : ''}
              </button>
            ))}
          </div>
          <button onClick={handleClearRecents} className="hover:underline text-[#E63946] font-extrabold cursor-pointer">
            Clear
          </button>
        </div>
      )}

      {/* Clean Zero-State Prompt when idle */}
      {!selectedResult && !isAnalyzing && (
        <ClayCard padding="lg" className="text-center space-y-2 border-[2px] border-dashed border-[var(--border-clay)] bg-[var(--surface-clay)]/50">
          <p className="text-sm font-extrabold text-[var(--text-clay)]">
            💡 Type any topic to synthesize a master curriculum
          </p>
          <p className="text-xs font-bold text-[var(--muted-clay)] max-w-md mx-auto">
            Try entering any subject you're studying — science, mathematics, history, literature, or programming.
          </p>
        </ClayCard>
      )}

      {/* Playful Loading Screen: Chunky Rotating Brain */}
      {isAnalyzing && (
        <div className="py-16 text-center space-y-4 animate-in fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl border-[3px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] flex items-center justify-center shadow-[4px_4px_0px_var(--border-clay)] animate-spin">
            <ChunkyBrainIcon size={44} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[var(--text-clay)]">
              Analyzing & Synthesizing "{query}"...
            </h3>
            <p className="text-xs font-bold text-[var(--muted-clay)]">
              Generating deep research notes, 16:9 slides, parameter simulators, and Feynman challenges...
            </p>
          </div>
        </div>
      )}

      {/* Results Topic Preview Card */}
      {selectedResult && !isAnalyzing && (
        <ClayCard padding="lg" className="space-y-6 shadow-[8px_8px_0px_var(--border-clay)] border-[3px] animate-in fade-in">
          <div className="space-y-2 pb-4 border-b-[2px] border-[var(--border-clay)]">
            <div className="flex items-center gap-2">
              <ClayBadge variant="primary" size="sm">{selectedResult.domain}</ClayBadge>
              <ClayBadge variant="accent" size="sm">{selectedResult.difficulty}</ClayBadge>
              <span className="text-xs font-bold text-[var(--muted-clay)]">⏱️ {selectedResult.duration}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-clay)]">
              {selectedResult.title}
            </h2>
          </div>

          <p className="text-base font-bold text-[var(--muted-clay)] leading-relaxed">
            {selectedResult.summary}
          </p>

          <div className="p-4 rounded-[20px] border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-black text-[var(--text-clay)]">
              ✓ Ready on all 7 Learning Engines
            </span>
            <div className="flex items-center gap-2.5">
              <ClayButton size="sm" variant="secondary" href={`/learn/${selectedResult.slug}/notes`}>
                Preview Notes
              </ClayButton>
              <ClayButton size="md" variant="primary" href={`/learn/${selectedResult.slug}`}>
                Start Learning Hub →
              </ClayButton>
            </div>
          </div>
        </ClayCard>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold">Loading Search...</div>}>
      <SearchComponent />
    </Suspense>
  );
}
