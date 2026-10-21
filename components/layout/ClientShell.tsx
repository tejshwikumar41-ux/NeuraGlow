'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { QuickNoteWidget } from '@/components/bonus/QuickNoteWidget';
import { AuthModal } from '@/components/auth/AuthModal';

export const ClientShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login',
  });
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Global Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 'f' -> Toggle focus mode
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (e.key.toLowerCase() === 'f' && !isInput && !(e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Navbar
        onOpenAuthModal={(mode) => setAuthModalState({ isOpen: true, mode })}
        onToggleFocus={setIsFocusMode}
        isFocus={isFocusMode}
      />

      <main className="min-h-[calc(100vh-65px)]">{children}</main>

      {/* Global Bonus Widgets */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
      />
      <QuickNoteWidget />
    </>
  );
};
