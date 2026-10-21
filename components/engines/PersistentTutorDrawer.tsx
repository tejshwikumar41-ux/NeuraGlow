'use client';

import React, { useState } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';

export interface PersistentTutorDrawerProps {
  topic: any;
  isOpen: boolean;
  onToggle: () => void;
  externalQuery?: string;
}

export const PersistentTutorDrawer: React.FC<PersistentTutorDrawerProps> = ({
  topic,
  isOpen,
  onToggle,
  externalQuery,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `I'm your persistent tutor for ${topic.title}. Highlight any text or ask questions anytime as you move through slides, notes, practice, or simulations!`
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Handle queries passed from DeepNotes floating bubble or other engines
  React.useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      handleSend(externalQuery);
    }
  }, [externalQuery]);

  const handleSend = (text?: string) => {
    const q = text || input;
    if (!q.trim() || isTyping) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = `Regarding "${q}": Notice how this ties directly into ${topic.domain} principles. What would happen if we removed the primary constraint?`;
      if (q.toLowerCase().includes('simplify') || q.toLowerCase().includes('explain')) {
        reply = `Think of it like this: rather than memorizing formulas, imagine the underlying flow of energy and state. Does that make the distinction clearer?`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 800);
  };

  const handleVoice = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        handleSend('Can you summarize the most common misconception here?');
      }, 2500);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-24 right-6 z-40 px-4 py-2.5 rounded-full border-[2.5px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] font-black text-xs uppercase tracking-wider shadow-[var(--shadow-clay)] hover:-translate-x-1 hover:shadow-[var(--shadow-clay-hover)] transition-all flex items-center gap-2 cursor-pointer select-none"
        title="Open Persistent Socratic AI Tutor"
      >
        <span>💬</span>
        <span>AI Tutor</span>
      </button>
    );
  }

  return (
    <aside className="w-[320px] shrink-0 h-[calc(100vh-140px)] sticky top-28 z-30 flex flex-col justify-between">
      <ClayCard padding="sm" className="h-full flex flex-col justify-between shadow-[6px_6px_0px_var(--border-clay)] bg-[var(--surface-clay)]">
        {/* Drawer Header */}
        <div className="p-3 border-b-[2px] border-[var(--border-clay)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <span className="font-black text-xs uppercase tracking-wider text-[var(--text-clay)]">
              AI Tutor Side-Chat
            </span>
          </div>
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-full border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] font-bold text-xs hover:bg-[var(--accent-clay)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`
                  p-3 rounded-[18px] border-[2px] border-[var(--border-clay)] text-xs font-bold leading-relaxed max-w-[90%] shadow-[2px_2px_0px_var(--border-clay)]
                  ${m.sender === 'user' ? 'bg-[var(--primary-clay)] text-white' : 'bg-[var(--bg-clay)] text-[var(--text-clay)]'}
                `}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="p-2.5 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[10px] font-bold text-[var(--muted-clay)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--primary-clay)] animate-ping" />
              <span>Thinking...</span>
            </div>
          )}
        </div>

        {/* Drawer Input */}
        <div className="p-3 border-t-[2px] border-[var(--border-clay)] space-y-2">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about this section..."
              className="flex-1 h-10 px-3 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-xs text-[var(--text-clay)] outline-none focus:ring-2 focus:ring-[var(--primary-clay)]"
            />
            <button
              onClick={handleVoice}
              className={`
                w-10 h-10 rounded-xl border-[2px] border-[var(--border-clay)] flex items-center justify-center text-sm cursor-pointer
                ${isRecording ? 'bg-[#FFB4A2] text-[#660708] animate-pulse' : 'bg-[var(--surface-clay)] hover:bg-[var(--accent-clay)]'}
              `}
              title="Voice input"
            >
              🎤
            </button>
            <ClayButton size="sm" variant="primary" onClick={() => handleSend()}>
              →
            </ClayButton>
          </div>
        </div>
      </ClayCard>
    </aside>
  );
};
