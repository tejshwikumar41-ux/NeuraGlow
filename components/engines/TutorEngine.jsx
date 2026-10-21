'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, HelpCircle, ArrowUpRight, Zap } from 'lucide-react';
import { safeText } from '@/lib/utils/safeRender';
import { useLearningStore } from '@/store/useLearningStore';

export default function TutorEngine({ data, topic = 'Topic', summary, blueprint, userLevel = 'beginner' }) {
  const storeTopic = useLearningStore((state) => state.topic);
  const activeEngine = useLearningStore((state) => state.activeEngine);
  const fullData = useLearningStore((state) => state.fullData);

  const currentTopic = safeText(topic || data?.cleanTopic || storeTopic) || 'Topic';
  const activeBlueprint = blueprint || fullData?.blueprint || {};

  const [currentDepth, setCurrentDepth] = useState(1);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: summary
        ? `Hello! I am your AI Socratic Tutor for **${currentTopic}**.\n\n${summary}\n\nI won't just lecture you — I'll ask probing questions to help you truly master this concept.`
        : `Hello! I am your AI Socratic Tutor for **${currentTopic}**. Ask me any question or test your knowledge!`,
      counterQuestion: `To begin our inquiry: what do you currently understand to be the primary cause or core principle behind ${currentTopic}?`,
      followUps: ['Give me an intuitive analogy', 'Go one level deeper into mechanisms', 'Quiz my understanding'],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          userMessage: query,
          conversationHistory: messages,
          currentDepth,
          context: {
            activeEngine,
            blueprint: activeBlueprint,
            category: fullData?.category || activeBlueprint.domain || 'GENERAL',
          },
        }),
      });

      const resData = await response.json();
      const content = resData.explanation || resData.main_response || resData.answer;
      const counterQuestion = resData.counterQuestion || resData.socratic_question;
      const depthUsed = resData.depth_level_used || currentDepth;

      if (content) {
        setCurrentDepth(depthUsed);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: safeText(content),
            counterQuestion: safeText(counterQuestion),
            followUps: Array.isArray(resData.suggested_follow_ups) ? resData.suggested_follow_ups : [],
            depth: depthUsed,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "That's an interesting perspective. Could you clarify what specific dynamic you are considering?",
            counterQuestion: `How does that relate directly to the core mechanism of ${currentTopic}?`,
          },
        ]);
      }
    } catch (err) {
      console.error('Tutor API error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I had a momentary hiccup connecting to the pedagogical engine. Could you please send your question once more?',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    `Give me a real-world concrete analogy`,
    `Push me deeper into the advanced nuances`,
    `Challenge me with a tough scenario question`,
    `Summarize the key takeaways so far`,
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto h-[700px]">
      {/* Header with Depth Meter */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Universal Socratic Tutor</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Dialectic Inquiry on <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentTopic}</span>
            </p>
          </div>
        </div>

        {/* Cognitive Depth Indicator */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Inquiry Depth:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <span
                key={lvl}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  lvl <= currentDepth
                    ? 'bg-indigo-600 shadow-sm scale-110'
                    : 'bg-gray-200 dark:bg-gray-800'
                }`}
                title={`Level ${lvl} Depth`}
              />
            ))}
          </div>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">Level {currentDepth}/5</span>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm overflow-y-auto space-y-5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-5 text-sm leading-relaxed space-y-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                  : 'bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{safeText(msg.content)}</p>

              {msg.counterQuestion && (
                <div className="bg-indigo-100/60 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 p-3.5 rounded-xl text-indigo-950 dark:text-indigo-200 font-semibold text-xs space-y-1 mt-2">
                  <span className="uppercase text-[10px] font-bold text-indigo-700 dark:text-indigo-300 tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Socratic Probing Question
                  </span>
                  <p className="text-xs leading-relaxed">{safeText(msg.counterQuestion)}</p>
                </div>
              )}

              {/* Clickable Follow-up Suggestions */}
              {Array.isArray(msg.followUps) && msg.followUps.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {msg.followUps.map((fu, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => handleSend(fu)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>{fu}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-gray-500 text-xs italic p-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Tutor is formulating a Socratic response at depth {currentDepth}...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Starters */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-400 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2.5 rounded-2xl shadow-sm flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Engage Socratic Tutor on ${currentTopic}...`}
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
