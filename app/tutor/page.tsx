'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayBadge } from '@/components/ui/ClayBadge';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  mode?: string;
}

interface ChapterOption {
  id: number;
  chapter_title: string;
  subject?: string;
}

export default function IndependentTutorPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 **Greetings! I am your Independent Socratic AI Assistant.**\n\nI am not restricted to shallow summaries or fixed textbook sections. You can explore **any topic across Physics, Science, Mathematics, and STEM**—from classical mechanics and relativity to quantum theory, calculus, or exam problems.\n\nChoose an inquiry mode above, or pick one of the exploration starters below to begin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<'socratic' | 'explain' | 'solver' | 'challenge'>('socratic');
  const [chapters, setChapters] = useState<ChapterOption[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('universal');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Fetch available chapters from Supabase via /api/search
  useEffect(() => {
    async function loadChapters() {
      try {
        const res = await fetch('/api/search?q=');
        if (res.ok) {
          const data = await res.json();
          setChapters(data.chapters || []);
        }
      } catch (err) {
        console.warn('Could not prefetch chapters:', err);
      }
    }
    loadChapters();
  }, []);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!customPrompt) setInput('');
    setIsTyping(true);

    try {
      // Find chapter details if a specific chapter is selected
      const chosenChapter = chapters.find(c => c.id.toString() === selectedChapter);

      const res = await fetch('/api/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle: chosenChapter?.chapter_title || '',
          sectionTitle: chosenChapter ? `Topics in ${chosenChapter.chapter_title}` : '',
          messages: nextMessages.map(m => ({ sender: m.sender, text: m.text })),
          userInput: textToSend,
          mode: activeMode
        })
      });

      const data = await res.json();
      const aiReply = data.reply || "I am reflecting on your question. Let's examine the first principles together.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "⚠️ Connection error. Please check your internet connection or API settings.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Start a fresh Socratic session?')) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `🔄 **New Socratic Dialogue Started!**\n\nWhat concept, equation, or thought experiment would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterPrompts = [
    {
      title: 'Celestial Gravity',
      icon: '🚀',
      prompt: 'Why doesn\'t the Moon crash into Earth if Gravity constantly pulls it toward Earth\'s center?'
    },
    {
      title: 'Mass-Energy Equivalence',
      icon: '⚡',
      prompt: 'Explain where the tremendous energy in E = mc² actually comes from using first principles and an intuitive analogy.'
    },
    {
      title: 'Action-Reaction Paradox',
      icon: '🎯',
      prompt: 'If Newton\'s 3rd Law states every force has an equal and opposite reaction, why don\'t opposing forces just cancel out and prevent motion?'
    },
    {
      title: 'Work-Energy Theorem',
      icon: '📐',
      prompt: 'Derive the Work-Energy Theorem step-by-step starting from F = ma and show why kinetic energy depends on v² instead of v.'
    }
  ];

  return (
    <div className="flex bg-[var(--bg-clay)] min-h-[calc(100vh-65px)]">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Socratic Assistant Workspace */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col max-w-6xl mx-auto w-full min-w-0 space-y-4">
        
        {/* Top Control Header */}
        <ClayCard padding="md" className="border-[3px] border-[var(--border-clay)] shadow-[4px_4px_0px_var(--border-clay)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & AI Identity */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A] border-2 border-black flex items-center justify-center text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shrink-0">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[var(--text-clay)] tracking-tight">
                    Socratic AI Assistant
                  </h1>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#4D96FF] text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    Autonomous
                  </span>
                </div>
                <p className="text-xs font-bold text-[var(--muted-clay)]">
                  Independent 2-Way Socratic Reasoning • Multi-LLM Accelerated
                </p>
              </div>
            </div>

            {/* Mode & Topic Selectors */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Optional Focus Chapter */}
              <div className="flex items-center gap-1.5 bg-[var(--bg-clay)] border-2 border-[var(--border-clay)] rounded-xl px-2.5 py-1 text-xs font-bold shadow-[2px_2px_0px_var(--border-clay)]">
                <span className="text-sm">📖</span>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="bg-transparent text-[var(--text-clay)] font-extrabold outline-none cursor-pointer text-xs"
                >
                  <option value="universal">🌐 Universal Science</option>
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id.toString()}>
                      {ch.chapter_title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Chat Button */}
              <button
                onClick={handleClearChat}
                className="px-3 py-1.5 rounded-xl border-2 border-[var(--border-clay)] bg-[var(--surface-clay)] hover:bg-[#FFE5E5] text-[var(--text-clay)] font-black text-xs transition-colors shadow-[2px_2px_0px_var(--border-clay)] active:translate-y-0.5 cursor-pointer"
                title="Start a new conversation"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Persona / Mode Switcher Pills */}
          <div className="pt-3 mt-3 border-t border-[var(--border-clay)] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)] mr-1">
                Mode:
              </span>
              {[
                { id: 'socratic', label: '🧠 Socratic Inquiry', desc: 'Discovers truth through questions' },
                { id: 'explain', label: '💡 Deep Intuition', desc: 'Rich first-principles analogies' },
                { id: 'solver', label: '📝 Step-by-Step Solver', desc: 'Mathematical derivation & equations' },
                { id: 'challenge', label: '⚡ Conceptual Challenge', desc: 'Thought experiments & paradoxes' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold border-[2px] transition-all cursor-pointer whitespace-nowrap ${
                    activeMode === m.id
                      ? 'bg-[var(--primary-clay)] text-white border-[var(--border-clay)] shadow-[2px_2px_0px_var(--border-clay)]'
                      : 'bg-[var(--surface-clay)] text-[var(--text-clay)] border-[var(--border-clay)]/60 hover:border-[var(--border-clay)]'
                  }`}
                  title={m.desc}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Provider status badge */}
            <div className="text-[11px] font-mono font-bold text-[var(--muted-clay)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Groq ⚡ Llama-3.3 • Gemini • OpenAI Active</span>
            </div>
          </div>
        </ClayCard>

        {/* Chat Conversation Body */}
        <div className="flex-1 min-h-[460px] bg-[#FAF8F5] border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
          
          {/* Scrollable Message Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#F4F1EA]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] p-5 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    msg.sender === 'user'
                      ? 'bg-[#4D96FF] text-white rounded-br-none'
                      : 'bg-white text-black rounded-bl-none'
                  }`}
                >
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-black/10 text-[11px] font-black uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span>{msg.sender === 'user' ? '👤 Scholar (You)' : '🤖 Socratic Assistant'}</span>
                      {msg.mode && (
                        <span className="px-1.5 py-0.2 rounded bg-black/10 text-[9px] font-mono">
                          {msg.mode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono opacity-70 text-[10px]">{msg.timestamp}</span>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="opacity-60 hover:opacity-100 transition-opacity text-[10px] lowercase font-mono cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? '✓ copied' : 'copy'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content with Markdown & LaTeX */}
                  <div className="text-sm font-medium leading-relaxed prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Prompt Starter Cards (Shown when message history is fresh) */}
            {messages.length === 1 && (
              <div className="pt-2 pb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--muted-clay)] block mb-3">
                  💡 Or start instantly with an inquiry:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {starterPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.prompt)}
                      className="p-4 bg-white border-2 border-black rounded-xl text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:bg-yellow-50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl group-hover:scale-110 transition-transform">{p.icon}</span>
                        <span className="font-black text-xs uppercase tracking-wide text-black">
                          {p.title}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-black/80 line-clamp-2">
                        {p.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Animated Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-black p-3.5 rounded-2xl rounded-bl-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B4A] animate-ping"></div>
                  <span className="font-bold text-xs">Socratic AI is formulating conceptual reasoning</span>
                  <span className="animate-pulse font-black text-lg">•••</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="bg-[#EFECE6] border-t-2 border-black p-2.5 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/60 shrink-0">
              Quick Sparks:
            </span>
            <button
              onClick={() => handleSend("Can you give me a Socratic hint to think about this differently?")}
              className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold whitespace-nowrap hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              💡 Need a hint
            </button>
            <button
              onClick={() => handleSend("Pose a challenging Socratic puzzle or paradox for me to solve.")}
              className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold whitespace-nowrap hover:bg-green-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              ❓ Next Socratic Puzzle
            </button>
            <button
              onClick={() => handleSend("Explain this in ultra-simple terms with an intuitive everyday analogy.")}
              className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold whitespace-nowrap hover:bg-blue-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              📘 Intuitive Analogy
            </button>
            <button
              onClick={() => handleSend("Show the rigorous mathematical derivation for this step-by-step.")}
              className="px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold whitespace-nowrap hover:bg-purple-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              🔬 Derive Step-by-Step
            </button>
          </div>

          {/* Interactive Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="bg-white border-t-4 border-black p-3.5 flex gap-3 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything in Physics, Math, or Science (e.g. Why is light invariant?)..."
              disabled={isTyping}
              className="flex-1 px-4 py-3 bg-[#F4F1EA] border-2 border-black rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.08)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-[#FF6B4A] text-white border-2 border-black rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#ff552e] active:translate-y-0.5 disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer shrink-0"
            >
              {isTyping ? 'Thinking...' : 'Inquire ➔'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
