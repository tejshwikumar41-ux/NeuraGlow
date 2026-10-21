'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, HelpCircle, FileText, Sparkles, Activity, Atom, Layers, Loader2, RotateCcw } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { safeText, safeList } from '@/lib/utils/safeRender';
import { useLearningStore } from '@/store/useLearningStore';

export default function PPTEngine({ data }) {
  const openDeepDive = useLearningStore((state) => state.openDeepDive);
  const storeTopic = useLearningStore((state) => state.topic);
  const fullData = useLearningStore((state) => state.fullData);

  const cleanTopic = safeText(data?.cleanTopic || fullData?.cleanTopic || storeTopic || '');
  const [slides, setSlides] = useState(() => (Array.isArray(data?.slides) && data.slides.length > 0 ? data.slides : []));
  const [loading, setLoading] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    if (Array.isArray(data?.slides) && data.slides.length > 0) {
      setSlides(data.slides);
      setCurrentSlideIndex(0);
      setLoading(false);
    } else if (cleanTopic) {
      fetchSlides();
    } else {
      setSlides([]);
      setLoading(false);
    }
  }, [cleanTopic]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
        setImgError(false);
        setImgLoading(true);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
        setImgError(false);
        setImgLoading(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const fetchSlides = async () => {
    if (!cleanTopic) return;
    setLoading(true);
    setSlides([]);
    try {
      const res = await fetch('/api/engine/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          category: data?.category || fullData?.category || 'GENERAL',
          subtopics: data?.subtopics || fullData?.subtopics || [],
          difficulty: data?.difficulty || fullData?.difficulty || 'beginner',
        }),
      });
      const resJson = await res.json();
      if (resJson.success && Array.isArray(resJson.data?.slides) && resJson.data.slides.length > 0) {
        setSlides(resJson.data.slides);
        setCurrentSlideIndex(0);
      } else {
        setSlides([]);
      }
    } catch (err) {
      console.error('Failed to fetch dedicated slides:', err);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          SlideMaster Agent Designing Deck for {cleanTopic || 'Topic'}...
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Crafting 5-6 fact-dense presentation slides, visual prompts, and speaker notes.
        </p>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
          No slide data available for {cleanTopic || 'this topic'}.
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click below to request the AI SlideMaster to generate a dedicated presentation deck.
        </p>
        <button
          onClick={fetchSlides}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Retry Slide Generation
        </button>
      </div>
    );
  }

  const slide = slides[currentSlideIndex] || slides[0];
  const slideTitle = safeText(slide.title);
  
  // Strictly derive image prompt from new slide title, visualPrompt, and active cleanTopic
  const visualPromptText = slide.visualPrompt
    ? `${slide.visualPrompt}`
    : `${slideTitle} ${cleanTopic} educational diagram, clean white background`;
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(visualPromptText + " clean white background")}?width=800&height=600&nologo=true&enhance=true`;

  const bulletsList = safeList(slide.bullets);
  const statNum = safeText(slide.statCallout?.number || slide.statNumber);
  const statLbl = safeText(slide.statCallout?.label || slide.statLabel || 'Impact Metric');

  const handleDeepDiveSlide = () => {
    openDeepDive({
      engine: 'slides',
      itemType: 'slide',
      itemTitle: `Slide ${currentSlideIndex + 1}: ${slideTitle}`,
      itemContent: safeText(slide.detailedExplanation || slide.subtitle || bulletsList.join('. ')),
    });
  };

  return (
    <div
      className={`flex flex-col gap-6 max-w-7xl mx-auto transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-gray-950 p-6 overflow-y-auto' : ''
      }`}
    >
      {/* Top Header Controls */}
      <div className="bg-white dark:bg-gray-900 p-4 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 rounded-full uppercase tracking-wider">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-md md:max-w-xl">
            {slideTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDeepDiveSlide}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask AI about this slide
          </button>

          {slide.speakerNotes && (
            <button
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border cursor-pointer ${
                showSpeakerNotes
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Speaker Notes
            </button>
          )}

          {slide.miniQuiz && (
            <button
              onClick={() => setShowQuestion(!showQuestion)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border cursor-pointer ${
                showQuestion
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-950/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Mini Quiz
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-800 cursor-pointer"
            title="Present Mode (Fullscreen)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 16:9 Presentation Canvas */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden relative min-h-[500px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="p-8 md:p-12 flex-1 flex flex-col justify-center space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Typography & Content */}
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {safeText(slide.subtitle || 'Core Principles')}
                  </span>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1">
                    {slideTitle}
                  </h3>
                </div>

                {/* Bullets */}
                <div className="space-y-2.5">
                  {bulletsList.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>

                {/* Code Snippet if present */}
                {slide.codeSnippet && (
                  <div className="rounded-xl overflow-hidden border border-gray-800 text-xs">
                    <SyntaxHighlighter language={slide.codeLanguage || 'python'} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem' }}>
                      {safeText(slide.codeSnippet)}
                    </SyntaxHighlighter>
                  </div>
                )}

                {/* Stat Callout if present */}
                {statNum && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-center gap-4">
                    <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{statNum}</div>
                    <div className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">{statLbl}</div>
                  </div>
                )}

                {/* Detailed Explanation Paragraph */}
                {slide.detailedExplanation && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed bg-gray-50 dark:bg-gray-950/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    {safeText(slide.detailedExplanation)}
                  </p>
                )}
              </div>

              {/* Right Column: High-Res AI Diagram / Styled Factual Card */}
              <div className="lg:col-span-6 h-80 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 relative group shadow-sm bg-gray-950">
                {!imgError && imageUrl ? (
                  <>
                    {imgLoading && (
                      <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center space-y-2 text-indigo-400 animate-pulse">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-semibold">Generating AI Textbook Diagram...</span>
                      </div>
                    )}
                    <img
                      src={imageUrl}
                      alt={slideTitle}
                      onLoad={() => setImgLoading(false)}
                      onError={() => {
                        setImgError(true);
                        setImgLoading(false);
                      }}
                      className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                        imgLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  </>
                ) : (
                  /* Factual Styled Technical Diagram Card Fallback */
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 flex flex-col justify-between text-white border border-indigo-900/50 relative overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-indigo-800/40">
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                        <Atom className="w-4 h-4 animate-spin-slow" /> Domain Concept Model
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {safeText(data?.category || fullData?.category || 'SCIENCE')}
                      </span>
                    </div>

                    <div className="my-auto space-y-3">
                      <h4 className="text-xl font-extrabold text-white tracking-tight">{slideTitle}</h4>
                      <div className="p-3.5 bg-indigo-900/40 rounded-xl border border-indigo-700/50 space-y-1 text-xs text-indigo-100">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block flex items-center gap-1">
                          <Activity className="w-3 h-3 text-indigo-400" /> Key Mechanism
                        </span>
                        <p className="line-clamp-3 font-medium leading-relaxed">
                          {bulletsList[0] || safeText(slide.detailedExplanation) || slideTitle}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-indigo-800/40 flex items-center justify-between text-[11px] text-indigo-300 font-mono">
                      <span>{cleanTopic || 'Core Concept'}</span>
                      <span>Verified Model</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Speaker Notes Overlay */}
        {showSpeakerNotes && slide.speakerNotes && (
          <div className="bg-amber-50 dark:bg-amber-950/50 border-t border-amber-200 dark:border-amber-900/50 p-4 px-8 flex items-start gap-3 text-amber-950 dark:text-amber-200">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Speaker Notes
              </h4>
              <p className="text-sm font-medium leading-relaxed mt-0.5">
                {safeText(slide.speakerNotes)}
              </p>
            </div>
          </div>
        )}

        {/* Mini Quiz Overlay */}
        {showQuestion && slide.miniQuiz && (
          <div className="bg-indigo-900 text-white border-t border-indigo-800 p-6 px-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Slide Check Quiz
              </span>
              <button onClick={() => setShowQuestion(false)} className="text-xs text-indigo-300 hover:text-white">Close</button>
            </div>

            <h4 className="text-sm font-bold">{safeText(slide.miniQuiz.question)}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {safeList(slide.miniQuiz.options).map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === slide.miniQuiz.correct;
                let btnStyle = 'bg-indigo-800/60 border-indigo-700 text-white';

                if (selectedOption !== null) {
                  if (isSelected) {
                    btnStyle = isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white';
                  } else if (isCorrect) {
                    btnStyle = 'bg-emerald-600/40 text-emerald-100';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4 px-8 flex items-center justify-between">
          <button
            onClick={() => { setCurrentSlideIndex((prev) => Math.max(0, prev - 1)); setImgError(false); setImgLoading(true); }}
            disabled={currentSlideIndex === 0}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300 rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Slide
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentSlideIndex(idx); setImgError(false); setImgLoading(true); }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-indigo-600 dark:bg-indigo-500'
                    : 'w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => { setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1)); setImgError(false); setImgLoading(true); }}
            disabled={currentSlideIndex === slides.length - 1}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-40 cursor-pointer"
          >
            Next Slide <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
