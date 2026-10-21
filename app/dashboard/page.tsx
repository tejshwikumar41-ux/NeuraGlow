'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';

import { getCleanSavedLibrary, clearAllSavedLibrary } from '@/lib/storageUtils';

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [savedLibrary, setSavedLibrary] = useState<any[]>([]);

  const placeholders = [
    'Type ANY topic: Rotational Motion, French Revolution, React Fiber...',
    'Enter a physical theorem, historical event, or algorithm...',
    'Explore any academic topic on earth with zero pre-written fluff...',
    'What do you want to master today? Search anything...',
  ];

  // Load user saved topics from localStorage (purging legacy mock topics automatically)
  useEffect(() => {
    const loadLibrary = () => {
      const cleaned = getCleanSavedLibrary();
      setSavedLibrary(cleaned);
    };

    loadLibrary();
    window.addEventListener('storage', loadLibrary);
    return () => window.removeEventListener('storage', loadLibrary);
  }, []);

  // Cycling search placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [placeholders.length]);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const handleClearCanvas = () => {
    clearAllSavedLibrary();
    setSavedLibrary([]);
  };

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-[var(--bg-clay)]">
      {/* 280px Collapsible Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden md:flex"
      />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-10 overflow-x-hidden">
        {/* 1. Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-clay)] tracking-tight">
              {getGreeting()}, Scholar 👋
            </h1>
            <p className="text-sm font-bold text-[var(--muted-clay)] flex items-center gap-1.5">
              <span>Your study canvas is</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-clay)] text-[#1A1A1A] border border-[var(--border-clay)] font-black text-xs">
                {savedLibrary.length > 0 ? `${savedLibrary.length} Topics Active` : 'Blank & Ready'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ClayButton size="sm" variant="secondary" href="/library">
              📚 My Library ({savedLibrary.length})
            </ClayButton>
            <ClayButton size="sm" variant="primary" href="/search">
              + New Topic
            </ClayButton>
          </div>
        </div>

        {/* 2. Hero Search Bar (72px Tall, Chunky Border) */}
        <ClayCard padding="none" className="p-3 shadow-[8px_8px_0px_var(--border-clay)] border-[3px]">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full flex items-center">
              <span className="absolute left-5 text-2xl pointer-events-none select-none">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                className="w-full h-[72px] pl-16 pr-5 rounded-[20px] bg-[var(--bg-clay)] text-[var(--text-clay)] text-base sm:text-xl font-bold placeholder:text-[var(--muted-clay)] outline-none border-[2px] border-[var(--border-clay)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] focus:border-[var(--primary-clay)] focus:ring-4 focus:ring-[var(--accent-clay)]"
              />
            </div>
            <ClayButton
              type="submit"
              size="lg"
              variant="primary"
              className="h-[72px] px-8 rounded-[20px] font-black text-base w-full sm:w-auto shrink-0 shadow-[4px_4px_0px_var(--border-clay)]"
            >
              Master Topic →
            </ClayButton>
          </form>
        </ClayCard>

        {/* 3. Continue Learning Section (Blank State by default) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-clay)] tracking-tight">
              My Active Curricula
            </h2>
            {savedLibrary.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearCanvas}
                  className="text-xs font-black uppercase text-[#E63946] hover:underline cursor-pointer"
                  title="Remove all saved topics and reset to blank"
                >
                  Clear All (Make Blank)
                </button>
                <Link href="/library" className="text-xs font-black uppercase text-[var(--primary-clay)] hover:underline">
                  View All in Library →
                </Link>
              </div>
            )}
          </div>

          {savedLibrary.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedLibrary.map((item) => (
                <ClayCard
                  key={item.slug}
                  tilt
                  padding="md"
                  className="space-y-4 shadow-[6px_6px_0px_var(--border-clay)] border-[3px] border-[var(--border-clay)] bg-[var(--surface-clay)] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_var(--border-clay)] transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] flex items-center justify-center text-xl shadow-[2px_2px_0px_var(--border-clay)]">
                        📖
                      </span>
                      <ClayBadge size="sm" variant="default">
                        {item.domain || 'Curriculum'}
                      </ClayBadge>
                    </div>
                    <h3 className="font-black text-base sm:text-lg text-[var(--text-clay)] leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-clay)]">
                    <div className="flex justify-between text-xs font-mono font-bold text-[var(--muted-clay)]">
                      <span>Saved: {item.savedAt || 'Recently'}</span>
                      <span className="text-[var(--primary-clay)] font-black">{item.questionCount || 150} Questions</span>
                    </div>
                  </div>

                  <ClayButton
                    size="sm"
                    variant="primary"
                    href={`/learn/${item.slug}`}
                    className="w-full justify-between"
                  >
                    <span>Resume Study Hub</span>
                    <span>→</span>
                  </ClayButton>
                </ClayCard>
              ))}
            </div>
          ) : (
            /* Clean, Empty Blank State */
            <ClayCard padding="xl" className="text-center space-y-4 border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] py-12 shadow-[6px_6px_0px_var(--border-clay)]">
              <span className="text-5xl block animate-bounce">🌱</span>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-2xl font-black text-[var(--text-clay)]">
                  Your Study Canvas is Blank
                </h3>
                <p className="text-xs sm:text-sm font-bold text-[var(--muted-clay)] leading-relaxed">
                  No pre-written courses or generic templates. Type ANY concept in the search bar above to generate a comprehensive 50,000-word treatise, 150 practice questions, and flashcards.
                </p>
              </div>
              <ClayButton size="md" variant="primary" href="/search" className="font-black">
                Search Your First Topic →
              </ClayButton>
            </ClayCard>
          )}
        </section>

        {/* 4. This Week in Numbers (Realtime metrics) */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-clay)] tracking-tight">
            Study Analytics
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ClayCard padding="md" className="space-y-2 border-[2.5px] border-[var(--primary-clay)] shadow-[4px_4px_0px_var(--border-clay)] bg-[var(--surface-clay)]">
              <span className="text-2xl">📚</span>
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)]">Topics Explored</p>
              <p className="text-3xl font-black text-[var(--text-clay)]">{savedLibrary.length}</p>
            </ClayCard>

            <ClayCard padding="md" className="space-y-2 border-[2.5px] border-[var(--secondary-clay)] shadow-[4px_4px_0px_var(--border-clay)] bg-[var(--surface-clay)]">
              <span className="text-2xl">🎯</span>
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)]">Quizzes Aced</p>
              <p className="text-3xl font-black text-[var(--text-clay)]">0</p>
            </ClayCard>

            <ClayCard padding="md" className="space-y-2 border-[2.5px] border-[var(--accent-clay)] shadow-[4px_4px_0px_var(--border-clay)] bg-[var(--surface-clay)]">
              <span className="text-2xl">⏳</span>
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)]">Study Hours</p>
              <p className="text-3xl font-black text-[var(--text-clay)]">
                {savedLibrary.length > 0 ? (savedLibrary.length * 0.8).toFixed(1) : 0}h
              </p>
            </ClayCard>

            <ClayCard padding="md" className="space-y-2 border-[2.5px] border-[#E63946] shadow-[4px_4px_0px_var(--border-clay)] bg-[var(--surface-clay)]">
              <span className="text-2xl">🔥</span>
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)]">Streak Active</p>
              <p className="text-3xl font-black text-[var(--text-clay)]">
                {savedLibrary.length > 0 ? '1 Day' : 'Day 0'}
              </p>
            </ClayCard>
          </div>
        </section>
      </main>
    </div>
  );
}
