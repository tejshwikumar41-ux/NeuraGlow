'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, Code, Lightbulb, Check, Compass, Sparkles, Loader2 } from 'lucide-react';
import { safeText } from '@/lib/utils/safeRender';
import { useLearningStore } from '@/store/useLearningStore';

export default function KnowledgeMapEngine({ data }) {
  const openDeepDive = useLearningStore((state) => state.openDeepDive);
  const storeTopic = useLearningStore((state) => state.topic);
  const fullData = useLearningStore((state) => state.fullData);

  const cleanTopic = safeText(data?.cleanTopic || fullData?.cleanTopic || storeTopic || '');
  const [kMap, setKMap] = useState(() => (data?.knowledgeMap || data?.map || null));
  const [loading, setLoading] = useState(false);
  const [activeBranchIndex, setActiveBranchIndex] = useState(0);

  useEffect(() => {
    if (data?.knowledgeMap?.branches?.length || data?.map?.branches?.length) {
      setKMap(data.knowledgeMap || data.map);
      setActiveBranchIndex(0);
      setLoading(false);
    } else if (cleanTopic) {
      fetchKnowledgeMap();
    } else {
      setKMap(null);
      setLoading(false);
    }
  }, [cleanTopic]);

  const fetchKnowledgeMap = async () => {
    if (!cleanTopic) return;
    setLoading(true);
    setKMap(null);
    try {
      const res = await fetch('/api/engine/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          category: data?.category || fullData?.category || 'GENERAL',
          difficulty: data?.difficulty || fullData?.difficulty || 'beginner',
        }),
      });
      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        setKMap(resJson.data);
        setActiveBranchIndex(0);
      } else {
        setKMap(null);
      }
    } catch (err) {
      console.error('Failed to fetch dedicated knowledge map:', err);
      setKMap(null);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">ConceptMapper Agent Structuring Knowledge Tree...</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Building 40/60 split concept hierarchy, subtopic breakdowns, and memory hooks.</p>
      </div>
    );
  }

  const rootTitle = safeText(kMap?.root?.label || kMap?.coreConcept || kMap?.root) || 'Core Concept';
  const branches = kMap?.branches || [];

  if (!branches || branches.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        No knowledge map available. <button onClick={fetchKnowledgeMap} className="text-indigo-600 underline font-bold cursor-pointer">Retry</button>
      </div>
    );
  }

  const activeBranch = branches[activeBranchIndex] || branches[0] || {};
  const activeBranchName = safeText(activeBranch.label || activeBranch.name || activeBranch.title);

  const handleDeepDiveNode = () => {
    openDeepDive({
      engine: 'knowledge_map',
      itemType: 'node',
      itemTitle: activeBranchName,
      itemContent: safeText(activeBranch.explanation || activeBranch.example),
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 rounded-full border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-wider">
              Structured Knowledge Map
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {branches.length} Key Subtopics
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {rootTitle}
          </h2>
        </div>
      </div>

      {/* 2-Column Concept Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Concept Tree List */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">
            Subtopics & Architecture
          </h3>

          <div className="space-y-1.5">
            {branches.map((branch, idx) => {
              const isActive = idx === activeBranchIndex;
              const branchName = safeText(branch.label || branch.name || branch.title) || `Subtopic ${idx + 1}`;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveBranchIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-semibold'
                      : 'bg-gray-50 dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-sm truncate">{branchName}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Breakdown Card */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBranchIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                    Subtopic Breakdown
                  </span>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {activeBranchName}
                  </h3>
                </div>

                <button
                  onClick={handleDeepDiveNode}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Learn this concept
                </button>
              </div>

              {/* Detailed Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Core Explanation
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  {safeText(activeBranch.explanation) || safeText(activeBranch.details) || 'Detailed subtopic information.'}
                </p>
              </div>

              {/* Sub-children / Details */}
              {activeBranch.children && Array.isArray(activeBranch.children) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Key Features & Properties
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeBranch.children.map((child, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 flex items-start gap-2 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">{safeText(child.label || child.name)}</span>
                          <span className="text-gray-500 dark:text-gray-400">{safeText(child.explanation)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Code */}
              {(activeBranch.example || activeBranch.exampleCode) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Concrete Example
                  </h4>
                  <div className="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800 shadow-inner">
                    <pre className="whitespace-pre-wrap">
                      {safeText(activeBranch.example || activeBranch.exampleCode)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Memory Hook */}
              {activeBranch.memoryHook && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-start gap-3 text-amber-950 dark:text-amber-200">
                  <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Memory Hook ("How to Remember")
                    </h5>
                    <p className="text-sm font-medium leading-relaxed mt-0.5">
                      {safeText(activeBranch.memoryHook)}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
