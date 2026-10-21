'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Palette, Sun, Moon, Sparkles, Image, Check, 
  X, Layers, Monitor, Compass, BookOpen 
} from 'lucide-react';

export const THEMES = [
  {
    id: 'light',
    name: 'Minimal Studio',
    category: 'Core',
    description: 'Clean high-contrast light mode for focused daytime study.',
    accent: '#4f46e5',
    bg: '#f9fafb',
    surface: '#ffffff',
    border: '#e5e7eb',
    type: 'color'
  },
  {
    id: 'dark',
    name: 'Obsidian Dark',
    category: 'Core',
    description: 'Deep sleek dark mode for nocturnal focus.',
    accent: '#6366f1',
    bg: '#030712',
    surface: '#111827',
    border: '#1f2937',
    type: 'color'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'Vibrant',
    description: 'Electric violet, neon cyan and deep purple glows.',
    accent: '#a855f7',
    bg: '#0d091a',
    surface: '#161129',
    border: '#312356',
    type: 'color'
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    category: 'Vibrant',
    description: 'Sub-zero arctic slate, glacial blues and cool grays.',
    accent: '#88c0d0',
    bg: '#242933',
    surface: '#2e3440',
    border: '#434c5e',
    type: 'color'
  },
  {
    id: 'sepia',
    name: 'Academic Parchment',
    category: 'Archival',
    description: 'Warm vintage textbook paper, sepia ink and brass highlights.',
    accent: '#b45309',
    bg: '#fbf6ec',
    surface: '#f4ecdc',
    border: '#e3d3ba',
    type: 'color'
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    category: 'Vibrant',
    description: 'Forest dark greens and bioluminescent mint accents.',
    accent: '#10b981',
    bg: '#051a14',
    surface: '#0b2820',
    border: '#134e3f',
    type: 'color'
  },
  {
    id: 'photo-aurora',
    name: 'PIP Aurora Lights',
    category: 'Photo Wallpaper',
    description: 'Picture-in-picture atmospheric northern lights with frosted glass.',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=400&auto=format&fit=crop',
    type: 'photo'
  },
  {
    id: 'photo-cosmos',
    name: 'PIP Deep Cosmos',
    category: 'Photo Wallpaper',
    description: 'Deep celestial nebula with dark violet glassmorphic panels.',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=400&auto=format&fit=crop',
    type: 'photo'
  },
  {
    id: 'photo-library',
    name: 'PIP Classic Library',
    category: 'Photo Wallpaper',
    description: 'Classic antique wooden bookshelves with warm ambient glass.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=400&auto=format&fit=crop',
    type: 'photo'
  }
];

export default function ThemeSelectorModal() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!mounted) return null;

  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-all cursor-pointer shadow-xs"
        title="Choose Theme & Photo Wallpapers"
      >
        <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="hidden sm:inline">{currentThemeObj.name.split(' ')[0]}</span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          ref={modalRef}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-5 z-50 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Workspace Themes & PIP</h3>
                <p className="text-[10px] text-gray-500">Select studio color palette or photo wallpaper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {THEMES.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                  }}
                  className={`relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/30 dark:bg-indigo-950/20'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/60 dark:bg-gray-950/40'
                  }`}
                >
                  {/* Preview Thumbnail */}
                  {t.type === 'photo' ? (
                    <div className="h-14 w-full rounded-xl overflow-hidden mb-2 relative">
                      <img
                        src={t.imageUrl}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                      <span className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                        PIP
                      </span>
                    </div>
                  ) : (
                    <div 
                      className="h-10 w-full rounded-xl mb-2 flex items-center justify-between px-3 border shadow-inner"
                      style={{ backgroundColor: t.bg, borderColor: t.border }}
                    >
                      <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: t.accent }} />
                      <div className="w-12 h-2 rounded-full opacity-60" style={{ backgroundColor: t.accent }} />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900 dark:text-white truncate block">
                      {t.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-gray-500 block truncate mt-0.5">
                    {t.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
            <span>Themes apply instantly across all pages</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 capitalize">{currentThemeObj.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
