'use client';

import React from 'react';
import { useClayTheme, THEMES } from './ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, cycleTheme, currentThemeObj } = useClayTheme();

  const getThemeEmoji = () => {
    switch (theme) {
      case 'cream':
        return '🏺';
      case 'midnight':
        return '🌙';
      case 'mono':
        return '🎯';
      case 'botanical':
        return '🌿';
      default:
        return '🎨';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={`
        relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[16px]
        border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)]
        text-[var(--text-clay)] shadow-[var(--shadow-clay)]
        font-black text-xs uppercase tracking-wider select-none cursor-pointer
        hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[var(--shadow-clay-hover)]
        active:translate-x-[2px] active:translate-y-[2px] active:shadow-[var(--shadow-clay-pressed)]
        transition-all duration-150 ease-out
        ${className}
      `}
      title={`Current Theme: ${currentThemeObj.name} (Click to cycle themes)`}
    >
      <span className="text-sm">{getThemeEmoji()}</span>
      <span className="hidden sm:inline font-bold">{currentThemeObj.name}</span>
      <span className="w-2.5 h-2.5 rounded-full border border-[var(--border-clay)]" style={{ backgroundColor: currentThemeObj.primary }} />
    </button>
  );
};
