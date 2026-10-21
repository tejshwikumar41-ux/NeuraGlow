'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, Sparkles, X, Send, HelpCircle, 
  Lightbulb, Loader2, ArrowRight, CornerDownRight 
} from 'lucide-react';

export default function MarginSocraticBubble({
  mainTopic,
  chapterSectionName,
  highlightedText,
  surroundingParagraph,
  onClose,
}) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleAsk = async (customPrompt) => {
    const q = customPrompt || question || 'Explain simpler';
    setLoading(true);

    try {
      const res = await fetch('/api/tutor/inline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mainTopic,
          chapterSectionName,
          surroundingParagraph,
          highlightedText,
          userQuestion: q,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('Inline Socratic query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-900/80 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Margin Socratic Tutor</h4>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[200px]">
              {mainTopic} • {chapterSectionName || 'Chapter Margin'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Highlighted Snippet Banner */}
      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block mb-1">
          Highlighted Sentence
        </span>
        <p className="text-xs text-gray-800 dark:text-gray-200 italic line-clamp-3 leading-relaxed">
          "{highlightedText}"
        </p>
      </div>

      {/* Answer Area */}
      {response && (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          <div className="p-3.5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200/80 dark:border-gray-800 space-y-2">
            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              {response.inline_explanation}
            </p>

            {response.deeper_analogy && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Micro-Analogy:</strong> {response.deeper_analogy}</span>
              </div>
            )}
          </div>

          {response.socratic_counter_question && (
            <div className="p-3 bg-indigo-100/60 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-indigo-600" /> Socratic Check
              </span>
              <p className="font-semibold text-xs leading-relaxed">{response.socratic_counter_question}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Prompts or Input */}
      {!response && !loading && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleAsk('Explain simpler with an intuitive analogy')}
            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 dark:text-gray-300 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Explain Simpler
          </button>
          <button
            onClick={() => handleAsk('Why is this specific point true? Give concrete proof')}
            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 dark:text-gray-300 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Why is this true?
          </button>
          <button
            onClick={() => handleAsk('Give a counter-example or edge case for this statement')}
            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 dark:text-gray-300 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Give an Edge Case
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-indigo-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Socratic Tutor analyzing highlighted context...</span>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask about this sentence..."
          className="flex-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
