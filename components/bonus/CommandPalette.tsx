'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChunkyModal } from '@/components/ui/ChunkyModal';
import { ClayBadge } from '@/components/ui/ClayBadge';

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Pages' | 'Topics' | 'Actions';
  href?: string;
  action?: () => void;
  icon: string;
}

import { getCleanSavedLibrary } from '@/lib/storageUtils';

export const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [savedLibrary, setSavedLibrary] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const cleaned = getCleanSavedLibrary();
      setSavedLibrary(cleaned);
    }
  }, [isOpen]);

  const baseActions: ActionItem[] = [
    { id: 'p1', title: 'Home (Landing)', subtitle: 'Go to NeuraGlow landing page', category: 'Pages', href: '/', icon: '🏠' },
    { id: 'p2', title: 'Dashboard', subtitle: 'View learning streak and active modules', category: 'Pages', href: '/dashboard', icon: '📊' },
    { id: 'p3', title: 'Universal Topic Search', subtitle: 'Search any concept or curriculum', category: 'Pages', href: '/search', icon: '🔍' },
    { id: 'p4', title: 'My Library', subtitle: 'Saved study decks and history', category: 'Pages', href: '/library', icon: '📚' },
    { id: 'p5', title: 'Progress & Analytics', subtitle: 'Heatmap, quiz stats, and grade', category: 'Pages', href: '/progress', icon: '📈' },
    { id: 'p6', title: 'Account & Settings', subtitle: 'Themes, preferences, and shortcuts', category: 'Pages', href: '/settings', icon: '⚙️' },
  ];

  // Dynamic user topics from their real saved library
  const topicActions: ActionItem[] = savedLibrary.map((item, idx) => ({
    id: `saved-topic-${idx}`,
    title: item.title,
    subtitle: `${item.domain || 'Curriculum'} • Saved in library`,
    category: 'Topics',
    href: `/learn/${item.slug}`,
    icon: '📖',
  }));

  // Dynamic search prompt action if user types
  const searchAction: ActionItem[] = query.trim()
    ? [
        {
          id: 'action-search',
          title: `Synthesize "${query.trim()}"`,
          subtitle: 'Generate un-summarized 50k/15k/5k words, 150 questions, flashcards',
          category: 'Actions',
          href: `/search?q=${encodeURIComponent(query.trim())}`,
          icon: '✨',
        },
      ]
    : [];

  const actions: ActionItem[] = [...searchAction, ...baseActions, ...topicActions];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: ActionItem) => {
    onClose();
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  return (
    <ChunkyModal isOpen={isOpen} onClose={onClose} title="Command Palette" maxWidth="lg">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a page, topic, or command... (e.g. 'Quantum', 'Library')"
            autoFocus
            className="w-full h-14 pl-4 pr-12 rounded-2xl border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] text-base font-bold placeholder:text-[var(--muted-clay)] outline-none shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] focus:border-[var(--primary-clay)] focus:ring-3 focus:ring-[var(--accent-clay)]"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold px-2 py-1 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-[var(--muted-clay)] space-y-2">
              <span className="text-3xl block">🧐</span>
              <p className="font-bold text-sm">No commands matched "{query}"</p>
              <p className="text-xs">Try searching "Dashboard", "Quantum", or "Notes"</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    p-3 rounded-[18px] border-[2px] transition-all cursor-pointer flex items-center justify-between
                    ${
                      isSelected
                        ? 'border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] translate-x-1 shadow-[3px_3px_0px_var(--border-clay)]'
                        : 'border-transparent hover:border-[var(--border-clay)] hover:bg-[var(--bg-clay)] text-[var(--text-clay)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0 p-1 rounded-lg border border-[var(--border-clay)] bg-white shadow-[1px_1px_0px_var(--border-clay)]">
                      {item.icon}
                    </span>
                    <div className="truncate">
                      <p className="font-extrabold text-sm truncate">{item.title}</p>
                      <p className="text-xs opacity-80 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <ClayBadge size="sm" variant={item.category === 'Topics' ? 'primary' : 'default'}>
                    {item.category}
                  </ClayBadge>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="pt-3 border-t-[2px] border-[var(--border-clay)] flex items-center justify-between text-[11px] font-bold text-[var(--muted-clay)]">
          <span>Navigate with ↑ ↓ keys</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </ChunkyModal>
  );
};
