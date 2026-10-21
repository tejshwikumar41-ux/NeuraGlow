'use client';

import React, { useState, useEffect } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';

export const QuickNoteWidget: React.FC<{ activeTopic?: string }> = ({ activeTopic = 'General Study Notes' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState<Array<{ id: string; text: string; time: string; topic: string }>>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('neuraglow_quick_notes');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setSavedNotes(parsed);
        }
      } catch (e) {
        console.warn('Could not load quick notes', e);
      }
    }
  }, []);

  const handleSave = () => {
    if (!noteText.trim()) return;
    const newNote = { id: Date.now().toString(), text: noteText, time: 'Just now', topic: activeTopic };
    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    setNoteText('');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('neuraglow_quick_notes', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist quick notes', e);
      }
    }
  };

  const handleDelete = (id: string) => {
    const updated = savedNotes.filter(n => n.id !== id);
    setSavedNotes(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('neuraglow_quick_notes', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist notes deletion', e);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Pencil Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full border-[3px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] shadow-[var(--shadow-clay)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[var(--shadow-clay-hover)] active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center text-2xl font-black cursor-pointer select-none"
          title="Quick Scratchpad Note (Captures insights instantly)"
        >
          ✏️
        </button>
      )}

      {/* Sticky Note Panel */}
      {isOpen && (
        <ClayCard
          padding="md"
          className="w-80 sm:w-96 shadow-[8px_8px_0px_var(--border-clay)] bg-[var(--surface-clay)] border-[3px] border-[var(--border-clay)] text-[var(--text-clay)] space-y-3.5"
        >
          <div className="flex items-center justify-between pb-2.5 border-b-[2px] border-[var(--border-clay)]">
            <div className="flex items-center gap-2">
              <span className="text-lg">📌</span>
              <span className="font-black text-xs uppercase tracking-wider text-[var(--text-clay)]">
                Scratchpad • {activeTopic}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold px-2 py-0.5 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] hover:bg-[var(--accent-clay)] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Jot down a quick thought, formula, or concept..."
            className="w-full h-24 p-3 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] placeholder:text-[var(--muted-clay)] text-xs font-semibold resize-none outline-none focus:ring-2 focus:ring-[var(--primary-clay)]"
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[var(--muted-clay)] font-bold">
              💾 Auto-saves to study notes
            </span>
            <ClayButton size="sm" onClick={handleSave} disabled={!noteText.trim()}>
              Save Note
            </ClayButton>
          </div>

          {/* Recent scratch notes */}
          {savedNotes.length > 0 && (
            <div className="pt-2 border-t-[2px] border-[var(--border-clay)] space-y-2 max-h-40 overflow-y-auto pr-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-clay)] block">
                Saved Quick Notes ({savedNotes.length})
              </span>
              {savedNotes.map((n) => (
                <div
                  key={n.id}
                  className="p-2.5 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] text-[11px] space-y-1.5 shadow-[2px_2px_0px_var(--border-clay)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-[var(--text-clay)] leading-relaxed">{n.text}</p>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-[10px] font-bold text-[var(--muted-clay)] hover:text-red-500 cursor-pointer"
                      title="Delete note"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-[var(--muted-clay)] border-t border-[var(--border-clay)]/20 pt-1">
                    <span className="truncate max-w-[180px]">{n.topic}</span>
                    <span>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ClayCard>
      )}
    </div>
  );
};
