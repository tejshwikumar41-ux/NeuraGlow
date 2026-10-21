'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeName = 'cream' | 'midnight' | 'mono' | 'botanical';

export interface ThemeInfo {
  id: ThemeName;
  name: string;
  tagline: string;
  bg: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
}

export const THEMES: ThemeInfo[] = [
  {
    id: 'cream',
    name: 'Cream Clay',
    tagline: 'Warm & Inviting (Default)',
    bg: '#F5F1EB',
    surface: '#FFFFFF',
    primary: '#FF6B35',
    secondary: '#2D4A3E',
    accent: '#F4D35E',
    border: '#1A1A1A',
  },
  {
    id: 'midnight',
    name: 'Midnight Clay',
    tagline: 'Sophisticated Dark Mode',
    bg: '#1C1B1F',
    surface: '#2A2830',
    primary: '#FFB4A2',
    secondary: '#B5EAD7',
    accent: '#FFD6A5',
    border: '#F5F1EB',
  },
  {
    id: 'mono',
    name: 'Mono Precision',
    tagline: 'Minimalist Focus Mode',
    bg: '#FAFAF8',
    surface: '#FFFFFF',
    primary: '#000000',
    secondary: '#333333',
    accent: '#FF4500',
    border: '#000000',
  },
  {
    id: 'botanical',
    name: 'Botanical',
    tagline: 'Calm Nature Palette',
    bg: '#E8F0E6',
    surface: '#FFFFFF',
    primary: '#2D5016',
    secondary: '#8B4513',
    accent: '#FF8C42',
    border: '#2D5016',
  },
];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
  currentThemeObj: ThemeInfo;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'cream',
  setTheme: () => {},
  cycleTheme: () => {},
  currentThemeObj: THEMES[0],
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('cream');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('neuraglow-clay-theme') as ThemeName;
    if (saved && THEMES.some(t => t.id === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'cream');
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('neuraglow-clay-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const cycleTheme = () => {
    const currentIdx = THEMES.findIndex(t => t.id === theme);
    const nextIdx = (currentIdx + 1) % THEMES.length;
    setTheme(THEMES[nextIdx].id);
  };

  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, currentThemeObj }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useClayTheme = () => useContext(ThemeContext);
