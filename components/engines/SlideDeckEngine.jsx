'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Maximize2, HelpCircle } from 'lucide-react';

export default function SlideDeckEngine({ slides = [], topic }) {
  const [current, setCurrent] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    setCurrent(0);
    setShowQuiz(false);
  }, [topic, slides]);

  if (!slides || slides.length === 0) {
    return <div className="p-8 text-center text-gray-500">No slide content available.</div>;
  }

  const slide = slides[current] || slides[0];
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    slide.visualPrompt || topic + ' scientific diagram white background'
  )}?width=800&height=600&nologo=true&enhance=true&model=flux`;

  return (
    <div className="space-y-6">
      {/* Slide Canvas Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg min-h-[460px] flex flex-col justify-between relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left Content */}
            <div className="space-y-4">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                SLIDE {current + 1} OF {slides.length}
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{slide.subtitle}</p>
              )}

              <ul className="space-y-3 pt-2">
                {slide.bullets?.map((b, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {slide.detailedExplanation && (
                <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                  {slide.detailedExplanation}
                </div>
              )}
            </div>

            {/* Right Visual Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
              <img
                src={imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Slide Toolbar */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium disabled:opacity-30 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === current ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrent((c) => Math.min(slides.length - 1, c + 1))}
            disabled={current === slides.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold disabled:opacity-30 cursor-pointer hover:bg-indigo-700"
          >
            Next Slide <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
