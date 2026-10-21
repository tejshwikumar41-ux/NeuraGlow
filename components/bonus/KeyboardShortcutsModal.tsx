'use client';

import React from 'react';
import { ChunkyModal } from '@/components/ui/ChunkyModal';

export const KeyboardShortcutsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'Cmd/Ctrl + K', desc: 'Universal command palette and search' },
    { key: 'Esc', desc: 'Go back / close active modal or drawer' },
    { key: '?', desc: 'Open this keyboard shortcuts cheat-sheet' },
    { key: 'T', desc: 'Cycle across the 4 clay themes' },
    { key: 'F', desc: 'Toggle Distraction-Free Focus Mode' },
    { key: '1 - 7', desc: 'Switch learning engine tabs in /learn/:id' },
    { key: '← / →', desc: 'Navigate slides in Presentation mode' },
    { key: 'Space', desc: 'Play / Pause audio lecture and simulators' },
  ];

  return (
    <ChunkyModal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth="md">
      <div className="space-y-4">
        <p className="text-xs text-[var(--muted-clay)] font-bold">
          Navigate NeuraGlow like a pro with single-key shortcuts:
        </p>

        <div className="space-y-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--surface-clay)]"
            >
              <span className="text-xs font-bold text-[var(--text-clay)]">{sc.desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-black rounded-lg border-[2px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] shadow-[2px_2px_0px_var(--border-clay)]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </ChunkyModal>
  );
};
