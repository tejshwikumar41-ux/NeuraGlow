'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Lightbulb, AlertTriangle, BookOpen, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { safeText } from '@/lib/utils/safeRender';
import { useLearningStore } from '@/store/useLearningStore';

export default function StepsEngine({ data, steps, topic }) {
  const openDeepDive = useLearningStore((state) => state.openDeepDive);
  const storeTopic = useLearningStore((state) => state.topic);
  const fullData = useLearningStore((state) => state.fullData);

  const cleanTopic = safeText(topic || data?.cleanTopic || fullData?.cleanTopic || storeTopic || '');
  const initialSteps = Array.isArray(steps) && steps.length > 0 ? steps : Array.isArray(data?.steps) && data.steps.length > 0 ? data.steps : [];
  const [stepsList, setStepsList] = useState(initialSteps);
  const [loading, setLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (Array.isArray(steps) && steps.length > 0) {
      setStepsList(steps);
      setActiveStepIndex(0);
      setLoading(false);
    } else if (Array.isArray(data?.steps) && data.steps.length > 0) {
      setStepsList(data.steps);
      setActiveStepIndex(0);
      setLoading(false);
    } else if (cleanTopic) {
      fetchSteps();
    } else {
      setStepsList([]);
      setLoading(false);
    }
  }, [cleanTopic, steps, data]);


  const fetchSteps = async () => {
    if (!cleanTopic) return;
    setLoading(true);
    setStepsList([]);
    try {
      const res = await fetch('/api/engine/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          category: data?.category || fullData?.category || 'GENERAL',
          difficulty: data?.difficulty || fullData?.difficulty || 'beginner',
        }),
      });
      const resJson = await res.json();
      if (resJson.success && Array.isArray(resJson.data?.steps) && resJson.data.steps.length > 0) {
        setStepsList(resJson.data.steps);
        setActiveStepIndex(0);
      } else {
        setStepsList([]);
      }
    } catch (err) {
      console.error('Failed to fetch dedicated steps:', err);
      setStepsList([]);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">StepMaster Agent Generating Progressive Guide...</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Structuring sequential learning steps, analogies, memory hooks, and pitfall warnings.</p>
      </div>
    );
  }

  if (!stepsList || stepsList.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        No step-by-step guide available. <button onClick={fetchSteps} className="text-indigo-600 underline font-bold cursor-pointer">Retry</button>
      </div>
    );
  }

  const activeStep = stepsList[activeStepIndex] || stepsList[0];
  const stepTitle = safeText(activeStep.title || `Step ${activeStepIndex + 1}`);

  const handleDeepDiveStep = (actionType) => {
    openDeepDive({
      engine: 'steps',
      itemType: 'step',
      itemTitle: `Step ${activeStepIndex + 1}: ${stepTitle}`,
      itemContent: safeText(activeStep.explanation || activeStep.example),
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 rounded-full border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-wider">
              Sequential Learning Path
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Step {activeStepIndex + 1} of {stepsList.length}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            Step-by-Step Progressive Guide
          </h2>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {stepsList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === activeStepIndex
                  ? 'w-8 bg-indigo-600 dark:bg-indigo-500'
                  : 'w-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Step Card Viewport */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-md space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Step Number & Title + Deep Dive Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shrink-0 shadow-sm">
                  {activeStep.step || activeStepIndex + 1}
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Phase {activeStepIndex + 1}
                  </span>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {stepTitle}
                  </h3>
                </div>
              </div>

              {/* Step Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeepDiveStep('explain')}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Explain more
                </button>
                <button
                  onClick={() => handleDeepDiveStep('example')}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Example
                </button>
                <button
                  onClick={() => handleDeepDiveStep('quiz')}
                  className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Quiz me
                </button>
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Explanation
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                {safeText(activeStep.simpleExplanation || activeStep.explanation)}
              </p>
            </div>

            {/* Analogy */}
            {(activeStep.analogy) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Intuitive Analogy
                </h4>
                <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl text-amber-900 dark:text-amber-200 text-sm leading-relaxed">
                  {safeText(activeStep.analogy)}
                </div>
              </div>
            )}

            {/* Concrete Example / Formula */}
            {(activeStep.realExample || activeStep.example || activeStep.code) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Concrete Example & Mechanism
                </h4>
                <div className="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-gray-800 shadow-inner">
                  <pre className="whitespace-pre-wrap">
                    {safeText(activeStep.realExample || activeStep.example || activeStep.code)}
                  </pre>
                </div>
              </div>
            )}

            {/* Common Mistake & Memory Hook */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeStep.commonMistake && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-rose-950 dark:text-rose-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                      Common Pitfall
                    </h5>
                    <p className="text-xs font-medium leading-relaxed mt-0.5">
                      {safeText(activeStep.commonMistake)}
                    </p>
                  </div>
                </div>
              )}

              {(activeStep.memoryTrick || activeStep.memoryHook) && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl text-indigo-950 dark:text-indigo-200 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                      Memory Hook
                    </h5>
                    <p className="text-xs font-medium leading-relaxed mt-0.5">
                      {safeText(activeStep.memoryTrick || activeStep.memoryHook)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Step Navigation Controls */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeStepIndex === 0}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Step
          </button>

          <button
            onClick={() => setActiveStepIndex((prev) => Math.min(stepsList.length - 1, prev + 1))}
            disabled={activeStepIndex === stepsList.length - 1}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40 cursor-pointer"
          >
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
