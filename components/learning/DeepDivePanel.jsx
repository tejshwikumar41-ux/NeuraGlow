'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2, Bot, User, HelpCircle, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useLearningStore } from '@/store/useLearningStore';
import { safeText } from '@/lib/utils/safeRender';

export default function DeepDivePanel() {
  const {
    topic,
    deepDiveOpen,
    deepDiveContext,
    closeDeepDive,
    chatHistory,
    addChatMessage,
  } = useLearningStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (deepDiveOpen && deepDiveContext && chatHistory.length === 0) {
      triggerDeepDiveAction('explain_more');
    }
  }, [deepDiveOpen, deepDiveContext]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const triggerDeepDiveAction = async (actionType, customQuestion = '') => {
    if (!deepDiveContext || loading) return;

    setLoading(true);
    const userQuery = customQuestion || (actionType === 'custom' ? input : actionType);
    
    if (customQuestion || actionType === 'custom') {
      addChatMessage('user', userQuery);
      setInput('');
    }

    try {
      const res = await fetch('/api/deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          engine: deepDiveContext.engine,
          itemTitle: safeText(deepDiveContext.itemTitle),
          itemContent: safeText(deepDiveContext.itemContent),
          action: actionType,
          question: customQuestion || (actionType === 'custom' ? userQuery : ''),
          history: chatHistory,
        }),
      });

      const data = await res.json();

      if (data.answer) {
        addChatMessage(
          'assistant',
          data.answer,
          data.followUpQuestion,
          data.nextSuggestions
        );
      }
    } catch (err) {
      console.error('DeepDive request error:', err);
      addChatMessage(
        'assistant',
        'Sorry, I encountered an issue connecting to the AI tutor. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!deepDiveOpen || !deepDiveContext) return null;

  const quickActions = [
    { label: 'Explain simpler', action: 'simpler' },
    { label: 'Real-life example', action: 'example' },
    { label: 'Why it matters', action: 'why_matters' },
    { label: 'Quiz me', action: 'quiz' },
    { label: 'Common mistakes', action: 'mistakes' },
    { label: 'Teach with analogy', action: 'analogy' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDeepDive}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col z-10 border-l border-gray-200 dark:border-gray-800"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-950">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 rounded-md border border-indigo-200 dark:border-indigo-800">
                  {deepDiveContext.engine || 'Deep Dive'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px]">
                  • {safeText(deepDiveContext.itemTitle)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Continuous Concept Tutor
              </h2>
            </div>

            <button
              onClick={closeDeepDive}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context Item Chip */}
          <div className="px-5 py-3 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Deep diving into:</span>
              <p className="line-clamp-2 text-indigo-900 dark:text-indigo-300 mt-0.5">
                {safeText(deepDiveContext.itemContent || deepDiveContext.itemTitle)}
              </p>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-gray-700'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                      : 'bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{safeText(msg.content)}</p>

                  {/* Socratic Counter-Question */}
                  {msg.counterQuestion && (
                    <div className="bg-indigo-100/70 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 p-3 rounded-xl text-indigo-950 dark:text-indigo-200 font-semibold space-y-1 mt-2">
                      <span className="uppercase text-[9px] font-bold text-indigo-700 dark:text-indigo-300 tracking-wider flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Tutor's Counter-Check
                      </span>
                      <p>{safeText(msg.counterQuestion)}</p>
                    </div>
                  )}

                  {/* Next Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => triggerDeepDiveAction('custom', sug)}
                          disabled={loading}
                          className="text-[11px] font-medium bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 p-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Tutor is explaining concept...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Action Chips & Input Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickActions.map((qa, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerDeepDiveAction(qa.action)}
                  disabled={loading}
                  className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {qa.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) triggerDeepDiveAction('custom');
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about this concept..."
                disabled={loading}
                className="flex-1 bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
