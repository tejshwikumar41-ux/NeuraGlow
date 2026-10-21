'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, AlertTriangle, Lightbulb, 
  ExternalLink, Bookmark, CheckCircle2, ChevronRight, 
  HelpCircle, MessageSquare, Loader2, ArrowRight 
} from 'lucide-react';
import { safeText } from '@/lib/utils/safeRender';
import MarginSocraticBubble from './MarginSocraticBubble';

export default function DeepGuideEngine({ data, notes, research, topic, blueprint, chapters = {}, activeSubtopicId: initialSubtopicId }) {
  const cleanTopic = safeText(topic || data?.cleanTopic || '');
  const domain = blueprint?.domain || data?.category || 'General Academic';
  const analogyDomain = blueprint?.target_audience_analogy_domain || (blueprint?.best_analogies_from && blueprint.best_analogies_from[0]) || 'Everyday life';

  const subtopics = Array.isArray(blueprint?.core_subtopics) && blueprint.core_subtopics.length > 0
    ? blueprint.core_subtopics
    : [
        { id: 'subtopic_1', title: `Foundations of ${cleanTopic}`, objective: 'Master core principles', estimated_reading_minutes: 15 },
        { id: 'subtopic_2', title: `Mechanisms & Key Dynamics`, objective: 'Operational laws and evidence', estimated_reading_minutes: 20 },
        { id: 'subtopic_3', title: `Advanced Synthesis & Pitfalls`, objective: 'Complex applications', estimated_reading_minutes: 20 },
      ];

  const [activeSubtopicId, setActiveSubtopicId] = useState(initialSubtopicId || subtopics[0]?.id || 'subtopic_1');
  const [loadedChapters, setLoadedChapters] = useState(chapters || {});
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Text selection & Margin bubble state
  const [highlightedText, setHighlightedText] = useState('');
  const [surroundingParagraph, setSurroundingParagraph] = useState('');
  const [isMarginOpen, setIsMarginOpen] = useState(false);
  const [floatingPillPos, setFloatingPillPos] = useState(null);

  // Switch or fetch subtopic chapter on demand
  const handleSelectSubtopic = async (subtopic) => {
    setActiveSubtopicId(subtopic.id);
    setFloatingPillPos(null);

    if (loadedChapters[subtopic.id]) return;

    setLoadingChapter(true);
    try {
      const res = await fetch('/api/generate/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtopicTitle: subtopic.title,
          subtopicId: subtopic.id,
          mainTopic: cleanTopic,
          domain,
          analogyDomain,
        }),
      });

      const chapterData = await res.json();
      if (chapterData && !chapterData.error) {
        setLoadedChapters(prev => ({ ...prev, [subtopic.id]: chapterData }));
      }
    } catch (err) {
      console.error('Failed to load subtopic chapter:', err);
    } finally {
      setLoadingChapter(false);
    }
  };

  // Text highlight listener anywhere on the page
  const handleMouseUp = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    const text = selection?.toString()?.trim();

    if (text && text.length >= 6) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const parentP = selection.anchorNode?.parentElement?.closest('p')?.textContent || '';

      setHighlightedText(text);
      setSurroundingParagraph(parentP);
      setFloatingPillPos({
        top: Math.max(10, rect.top + window.scrollY - 44),
        left: Math.max(10, rect.left + window.scrollX + rect.width / 2 - 80),
      });
    } else {
      setFloatingPillPos(null);
    }
  };

  const activeSubtopic = subtopics.find(s => s.id === activeSubtopicId) || subtopics[0];
  const activeChapter = loadedChapters[activeSubtopicId] || loadedChapters['subtopic_1'] || null;

  return (
    <div onMouseUp={handleMouseUp} className="max-w-5xl mx-auto space-y-8 relative">
      {/* Floating Pill on Highlight */}
      {floatingPillPos && !isMarginOpen && (
        <button
          onClick={() => {
            setIsMarginOpen(true);
            setFloatingPillPos(null);
          }}
          style={{ top: `${floatingPillPos.top}px`, left: `${floatingPillPos.left}px` }}
          className="absolute z-50 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Socratic AI</span>
        </button>
      )}

      {/* Margin Socratic Bubble */}
      {isMarginOpen && (
        <MarginSocraticBubble
          mainTopic={cleanTopic}
          chapterSectionName={activeSubtopic?.title}
          highlightedText={highlightedText}
          surroundingParagraph={surroundingParagraph}
          onClose={() => setIsMarginOpen(false)}
        />
      )}

      {/* Chapter Overview & Subtopic Tabs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {domain} • Deep-Dive Textbook
            </span>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> ~{activeSubtopic?.estimated_reading_minutes || 15} min read
            </span>
          </div>

          <span className="text-xs text-gray-400 italic">
            Tip: Highlight any sentence to cross-question Socratic AI
          </span>
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {activeChapter?.chapter_title || activeSubtopic?.title || cleanTopic}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Objective: <strong className="text-gray-900 dark:text-white">{activeSubtopic?.objective}</strong>
          </p>
        </div>

        {/* Subtopic Navigation Tabs */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Core Curriculum Subtopics:
          </span>
          <div className="flex flex-wrap gap-2">
            {subtopics.map((sub, i) => {
              const isActive = sub.id === activeSubtopicId;
              const isLoaded = !!loadedChapters[sub.id];
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubtopic(sub)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-black/20 text-current flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span>{sub.title}</span>
                  {isLoaded && !isActive && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Chapter State */}
      {loadingChapter ? (
        <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            Writing Deep Chapter for "{activeSubtopic.title}"...
          </h4>
          <p className="text-xs text-gray-500 max-w-sm">
            Synthesizing un-summarized textbook derivations, numerical examples, and inline reflection questions.
          </p>
        </div>
      ) : activeChapter ? (
        <div className="space-y-8">
          {/* Intuitive Breakdown with Analogy Box */}
          {activeChapter.intuitive_breakdown && (
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-3xl p-7 text-amber-950 dark:text-amber-200 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Intuitive Breakdown ({analogyDomain} Analogy)
              </div>
              <p className="text-sm md:text-base leading-relaxed font-normal">
                {activeChapter.intuitive_breakdown}
              </p>
            </div>
          )}

          {/* Exhaustive Formal Explanation */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed font-normal space-y-4">
              {activeChapter.formal_explanation?.split('\n\n').map((paragraph, pIdx) => {
                // Inline Reflection Hook syntax: [REFLECTION: Ask yourself: <question>]
                if (paragraph.includes('[REFLECTION:')) {
                  const cleaned = paragraph.replace(/\[REFLECTION:\s*Ask yourself:\s*/i, '').replace(/\]$/, '');
                  return (
                    <div
                      key={pIdx}
                      className="p-4 my-6 bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600 rounded-r-2xl text-xs md:text-sm text-indigo-950 dark:text-indigo-200 space-y-1 font-medium"
                    >
                      <span className="uppercase text-[10px] font-bold text-indigo-700 dark:text-indigo-400 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Inline Reflection Hook
                      </span>
                      <p>{cleaned}</p>
                    </div>
                  );
                }

                if (paragraph.startsWith('# ')) {
                  return <h2 key={pIdx} className="text-2xl font-black text-gray-900 dark:text-white pt-4">{paragraph.replace('# ', '')}</h2>;
                }
                if (paragraph.startsWith('## ')) {
                  return <h3 key={pIdx} className="text-xl font-bold text-gray-900 dark:text-white pt-3">{paragraph.replace('## ', '')}</h3>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h4 key={pIdx} className="text-lg font-bold text-indigo-600 dark:text-indigo-400 pt-2">{paragraph.replace('### ', '')}</h4>;
                }

                return (
                  <p key={pIdx} className="text-sm md:text-base leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Concrete Worked Example */}
          {activeChapter.concrete_worked_example && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Concrete Worked Scenario
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Problem Statement:
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {activeChapter.concrete_worked_example.problem_statement}
                </p>
              </div>

              {Array.isArray(activeChapter.concrete_worked_example.given_data) && (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-gray-500 uppercase tracking-wider">Given Parameters:</span>
                  <ul className="list-disc pl-5 space-y-0.5 text-gray-700 dark:text-gray-300">
                    {activeChapter.concrete_worked_example.given_data.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step by step solution */}
              {Array.isArray(activeChapter.concrete_worked_example.step_by_step_solution) && (
                <div className="space-y-4 pt-2">
                  <span className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider block">
                    Step-by-Step Derivation & Solution:
                  </span>
                  <div className="space-y-3">
                    {activeChapter.concrete_worked_example.step_by_step_solution.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {step.step_number || sIdx + 1}
                          </span>
                          <span className="font-bold text-xs text-gray-900 dark:text-white">{step.action}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 pl-7">{step.reasoning}</p>
                        {step.math_or_code && (
                          <div className="ml-7 p-2.5 bg-gray-900 text-gray-100 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800">
                            {step.math_or_code}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeChapter.concrete_worked_example.final_takeaway && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed font-semibold">
                  <strong>Final Takeaway:</strong> {activeChapter.concrete_worked_example.final_takeaway}
                </div>
              )}
            </div>
          )}

          {/* Pitfalls to Avoid */}
          {Array.isArray(activeChapter.pitfalls_to_avoid) && activeChapter.pitfalls_to_avoid.length > 0 && (
            <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-3xl p-7 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Critical Traps & Pitfalls to Avoid
              </div>
              <ul className="space-y-1.5 text-xs text-rose-950 dark:text-rose-200 pl-4 list-disc">
                {activeChapter.pitfalls_to_avoid.map((pitfall, pIdx) => (
                  <li key={pIdx}>{pitfall}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
