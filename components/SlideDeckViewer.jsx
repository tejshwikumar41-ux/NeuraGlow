"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, RotateCcw, Maximize2, Minimize2,
  Sparkles, Layers
} from "lucide-react";

export default function SlideDeckViewer({ slides = [], topic = "Topic" }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalize slides format (array of objects or array of strings)
  const normalizedSlides = Array.isArray(slides) && slides.length > 0
    ? slides.map((s, idx) => {
        if (typeof s === "object" && s !== null) {
          return {
            slideNumber: s.slideNumber || idx + 1,
            title: s.title || `Slide ${idx + 1}`,
            subtitle: s.subtitle || `Key Breakdown ${idx + 1}`,
            bullets: Array.isArray(s.bullets) ? s.bullets : [String(s.bullets || "")],
            keyTakeaway: s.keyTakeaway || `Essential takeaway for slide ${idx + 1}.`,
          };
        }
        // Legacy string format handler
        const text = String(s);
        const lines = text.split("\n").filter(Boolean);
        return {
          slideNumber: idx + 1,
          title: (lines[0] || `Slide ${idx + 1}`).replace(/^(Slide \d+:?|\d+\s*[-—:])\s*/i, ""),
          subtitle: `Part 0${idx + 1} — ${topic}`,
          bullets: lines.length > 1 ? lines.slice(1) : ["Key analytical breakdown & details."],
          keyTakeaway: `Key takeaway for slide ${idx + 1} of ${topic}.`,
        };
      })
    : [
        {
          slideNumber: 1,
          title: topic.toUpperCase(),
          subtitle: "Overview & Foundation",
          bullets: ["Core concept overview", "Key mechanisms", "Primary applications"],
          keyTakeaway: "Fundamental baseline for understanding the topic.",
        },
      ];

  const totalSlides = normalizedSlides.length;
  const currentSlide = normalizedSlides[currentSlideIndex] || normalizedSlides[0];

  // Navigation handlers
  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      setCurrentSlideIndex(0); // Restart on last slide
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlideIndex, totalSlides]);

  const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;

  return (
    <div className={`w-full transition-all duration-300 ${isFullscreen ? "fixed inset-0 z-[300] bg-black p-4 md:p-8 flex items-center justify-center" : ""}`}>

      {/* 16:9 SLIDE DECK CARD CONTAINER */}
      <div
        className="w-full max-w-4xl mx-auto aspect-[16/9] min-h-[380px] md:min-h-[460px] bg-neutral-950 border border-neutral-800 rounded-2xl p-6 md:p-8 relative shadow-2xl overflow-hidden flex flex-col justify-between font-mono"
        style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}
      >
        {/* Subtle Background Star Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }} />

        {/* ── SLIDE HEADER ── */}
        <div className="flex items-center justify-between z-10 border-b border-neutral-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#EA1010] shadow-[0_0_8px_#EA1010] animate-pulse" />
            <span className="font-mono text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase text-neutral-300">
              SLIDE // {String(currentSlideIndex + 1).padStart(2, "0")} OF {String(totalSlides).padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline font-mono text-[10px] tracking-wider uppercase text-neutral-500">
              {topic}
            </span>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-2.5 py-1 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all flex items-center gap-1.5 text-[10px] uppercase font-mono"
              title="Present Mode"
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              <span className="hidden md:inline">{isFullscreen ? "EXIT" : "PRESENT MODE"}</span>
            </button>
          </div>
        </div>

        {/* ── SLIDE BODY (ANIMATED CONTENT) ── */}
        <div className="my-auto py-2 z-10 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-4"
            >
              {/* Subtitle */}
              <p className="text-[#EA1010] text-[10px] md:text-xs font-mono font-bold uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                <Layers size={12} /> {currentSlide.subtitle}
              </p>

              {/* Slide Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight font-ndot leading-none">
                {currentSlide.title}
              </h2>

              {/* Bullet Points */}
              <ul className="space-y-2.5 pt-1 font-mono text-xs sm:text-sm md:text-base text-neutral-300">
                {currentSlide.bullets.map((bullet, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA1010] mt-2 shrink-0" />
                    <span>{bullet.replace(/^[-*•]\s*/, "")}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Key Takeaway Highlight Box */}
              {currentSlide.keyTakeaway && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-neutral-900/90 border-l-2 border-[#EA1010] p-3 md:p-3.5 rounded-r-lg text-xs md:text-sm text-neutral-300 font-mono mt-4 flex items-start gap-2.5"
                >
                  <Sparkles size={14} className="text-[#EA1010] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#EA1010] uppercase mr-2 tracking-wider">TAKEAWAY:</span>
                    <span>{currentSlide.keyTakeaway}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── SLIDE NAVIGATION CONTROLS (BOTTOM BAR) ── */}
        <div className="z-10 space-y-3 pt-2 border-t border-neutral-800/80">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#EA1010]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="px-3 md:px-4 py-2 rounded-lg border border-neutral-800 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-neutral-600 hover:enabled:text-white text-neutral-400"
            >
              <ChevronLeft size={14} />
              <span>PREV</span>
            </button>

            {/* Slide Pill Dots */}
            <div className="flex items-center gap-1.5">
              {normalizedSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold transition-all ${
                    idx === currentSlideIndex
                      ? "bg-[#EA1010] text-white shadow-[0_0_10px_rgba(234,16,16,0.5)]"
                      : "bg-neutral-900 text-neutral-500 hover:text-neutral-300 border border-neutral-800"
                  }`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>

            {/* Next / Restart Button */}
            <button
              onClick={handleNext}
              className="px-3 md:px-4 py-2 rounded-lg border border-neutral-800 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all hover:border-neutral-600 hover:text-white text-neutral-200 bg-neutral-900"
            >
              {currentSlideIndex === totalSlides - 1 ? (
                <>
                  <span>RESTART</span>
                  <RotateCcw size={14} className="text-[#EA1010]" />
                </>
              ) : (
                <>
                  <span>NEXT</span>
                  <ChevronRight size={14} className="text-[#EA1010]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
