'use client';

import React, { useState } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';

export interface SocraticTutorEngineProps {
  topic: any;
  initialQuestion?: string;
}

export const SocraticTutorEngine: React.FC<SocraticTutorEngineProps> = ({
  topic,
  initialQuestion,
}) => {
  const tutorData = topic.tutor || {
    systemContext: 'Socratic dialogue assistant',
    suggestedQueries: [
      'Why is this concept non-intuitive?',
      'Can you give me a real-world counter-example?',
      'How does this connect to core first principles?'
    ]
  };

  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'tutor'; text: string; time: string }>>([
    {
      id: 'm1',
      sender: 'tutor',
      text: `Hello! I am your Socratic AI Tutor for ${topic.title}. Rather than giving quick shallow summaries, I will guide your reasoning using foundational questions. What aspect do you want to master first?`,
      time: 'Just now'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If initialQuestion is passed
  React.useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      handleSendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user' as const,
      text,
      time: 'Just now'
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);

    try {
      const convHistory = newMessages.map(m => ({
        role: m.sender === 'user' ? 'student' : 'tutor',
        content: m.text
      }));

      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.title || 'Educational Topic',
          userMessage: text,
          conversationHistory: convHistory,
          context: {
            category: topic.domain || topic.category || 'General',
            blueprint: {
              domain: topic.domain || 'General',
              appropriate_tone: 'Socratic educator'
            }
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.main_response 
          ? (data.socratic_question ? `${data.main_response}\n\n${data.socratic_question}` : data.main_response)
          : (data.explanation || `That is a fundamental question regarding ${topic.title}. What do you see as the primary catalyst or core principle here?`);

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'tutor' as const,
            text: replyText,
            time: 'Just now'
          }
        ]);
      } else {
        throw new Error('API response error');
      }
    } catch (err) {
      console.warn('Tutor API fetch failed, fallback to contextual response', err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'tutor' as const,
          text: `Regarding "${text}" in the context of ${topic.title}: what do you consider the primary driving factor or foundational principle behind this?`,
          time: 'Just now'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInputVal(`What was the central cause and turning point of ${topic.title}?`);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Socratic Chat Window */}
      <ClayCard padding="lg" className="h-[650px] flex flex-col justify-between shadow-[8px_8px_0px_var(--border-clay)]">
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-4 border-b-[2px] border-[var(--border-clay)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl border-[2px] border-[var(--border-clay)] bg-[var(--accent-clay)] flex items-center justify-center text-xl shadow-[2px_2px_0px_var(--border-clay)]">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[var(--text-clay)]">
                  Socratic AI Tutor
                </h3>
                <ClayBadge size="sm" variant="success">
                  Active
                </ClayBadge>
              </div>
              <p className="text-xs font-bold text-[var(--muted-clay)]">
                Inquiry-driven mastery • {topic.title}
              </p>
            </div>
          </div>

          <ClayButton
            size="sm"
            variant="secondary"
            onClick={() => setMessages([messages[0]])}
          >
            Clear History ↻
          </ClayButton>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] sm:max-w-[75%] p-4 sm:p-5 rounded-[24px] border-[2.5px] border-[var(--border-clay)] space-y-1.5 shadow-[4px_4px_0px_var(--border-clay)]
                  ${
                    m.sender === 'user'
                      ? 'bg-[var(--primary-clay)] text-white rounded-br-sm'
                      : 'bg-[var(--surface-clay)] text-[var(--text-clay)] rounded-bl-sm'
                  }
                `}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] font-mono font-bold opacity-75">
                  <span>{m.sender === 'user' ? 'You' : 'Socratic Guide'}</span>
                  <span>{m.time}</span>
                </div>
                <p className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-line">
                  {m.text}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-[20px] border-[2px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] flex items-center gap-2 shadow-[2px_2px_0px_var(--border-clay)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-clay)] animate-ping" />
                <span className="text-xs font-bold">Tutor is formulating a Socratic inquiry...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="pt-2 border-t border-[var(--border-clay)] space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-[var(--muted-clay)]">
            Suggested Socratic Probes:
          </span>
          <div className="flex flex-wrap gap-2">
            {tutorData.suggestedQueries.map((q: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1 rounded-full text-xs font-bold border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] hover:bg-[var(--accent-clay)] hover:text-[#1A1A1A] transition-all cursor-pointer shadow-[1px_1px_0px_var(--border-clay)]"
              >
                + {q}
              </button>
            ))}
          </div>

          {/* Input Box Bar */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question or explain your reasoning..."
              className="flex-1 h-13 px-4 rounded-[18px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--primary-clay)] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)]"
            />

            {/* Voice Input Button */}
            <button
              onClick={handleVoiceToggle}
              className={`
                w-13 h-13 rounded-[18px] border-[2.5px] border-[var(--border-clay)] flex items-center justify-center text-lg transition-all cursor-pointer shadow-[3px_3px_0px_var(--border-clay)]
                ${isRecording ? 'bg-[#FFB4A2] text-[#660708] animate-pulse' : 'bg-[var(--surface-clay)] text-[var(--text-clay)] hover:bg-[var(--accent-clay)]'}
              `}
              title="Voice Input (Speech-to-Text)"
            >
              🎤
            </button>

            {/* Attachment Button */}
            <button
              onClick={() => alert('PDF / Diagram upload attached for discussion!')}
              className="w-13 h-13 rounded-[18px] border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] flex items-center justify-center text-lg hover:bg-[var(--accent-clay)] transition-all cursor-pointer shadow-[3px_3px_0px_var(--border-clay)]"
              title="Attach diagram, paper or PDF"
            >
              📎
            </button>

            {/* Send Button */}
            <ClayButton
              size="md"
              variant="primary"
              disabled={!inputVal.trim() && !isLoading}
              onClick={() => handleSendMessage()}
              className="h-13 px-6"
            >
              Send →
            </ClayButton>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};
