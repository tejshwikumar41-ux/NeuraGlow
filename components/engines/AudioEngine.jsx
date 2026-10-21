"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Headphones, Play, Pause, Square, Volume2, Sparkles } from "lucide-react";

export default function AudioEngine({ data = {}, topic = "Topic" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1.0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);

  const title = data?.title || `Mastering ${topic} Podcast`;
  const scriptText = data?.script || `Welcome to today's podcast breakdown on ${topic}. We explore the foundational mechanics, core principles, and key takeaways for this topic.`;

  const paragraphs = typeof scriptText === "string" 
    ? scriptText.split("\n\n").filter(Boolean) 
    : [String(scriptText)];

  // Populate browser voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoice) {
        // Prefer female English voices (Google, Zira, Samantha, etc.)
        const femaleOrEn = availableVoices.find(v => 
          v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Google") || v.name.includes("Zira") || v.name.includes("Samantha"))
        ) || availableVoices.find(v => v.lang.startsWith("en")) || availableVoices[0];
        
        setSelectedVoice(femaleOrEn ? femaleOrEn.name : "");
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakParagraph = (index) => {
    if (!("speechSynthesis" in window) || index >= paragraphs.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentParagraphIndex(0);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentParagraphIndex(index);

    const utterance = new SpeechSynthesisUtterance(paragraphs[index].replace(/\\n/g, " "));
    utterance.rate = rate;

    if (selectedVoice) {
      const voiceObj = voices.find(v => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onend = () => {
      if (index + 1 < paragraphs.length) {
        speakParagraph(index + 1);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentParagraphIndex(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }
    speakParagraph(0);
  };

  const handlePause = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraphIndex(0);
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Podcast Player Card */}
      <div className="bg-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col space-y-6">
        
        {/* Header row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Headphones className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>PODCAST MODE // VOICE NARRATION</span>
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold">{title}</h3>
              
              {isPlaying && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    {[0.4, 0.9, 0.5, 1, 0.6, 0.8].map((s, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, 22, 8] }}
                        transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                        className="w-1.5 bg-white rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-indigo-100 font-semibold ml-2">
                    Speaking Paragraph {currentParagraphIndex + 1} of {paragraphs.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Large Play/Pause/Stop Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {isPlaying ? (
              <button
                onClick={handlePause}
                className="w-14 h-14 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                title="Pause"
              >
                <Pause className="w-6 h-6 fill-current" />
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="w-14 h-14 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 flex items-center justify-center shadow-lg transition-all cursor-pointer relative"
                title="Play"
              >
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </button>
            )}

            {(isPlaying || isPaused) && (
              <button
                onClick={handleStop}
                className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Stop"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Voice Selector & Speed Controls Bar */}
        <div className="pt-4 border-t border-indigo-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Voice selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Volume2 className="w-4 h-4 text-indigo-200 shrink-0" />
            <span className="font-semibold text-indigo-100 shrink-0">Voice:</span>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-indigo-700 border border-indigo-500 text-white rounded-xl px-3 py-1.5 text-xs font-medium outline-none cursor-pointer w-full sm:w-64 truncate"
            >
              {voices.map((v, i) => (
                <option key={i} value={v.name} className="bg-gray-900 text-white">
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-indigo-100 mr-1">Speed:</span>
            {[0.75, 1.0, 1.25, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setRate(spd)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  rate === spd
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "bg-indigo-700/80 text-indigo-200 hover:bg-indigo-700"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

        </div>

      </div>

      {!speechSupported && (
        <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 font-medium">
          Note: Text-to-speech audio playback is not supported by your browser, but you can read the transcript below.
        </p>
      )}

      {/* Transcript Card with Paragraph Highlights */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Podcast Transcript
          </h4>
          <span className="text-xs font-semibold text-indigo-600">
            {paragraphs.length} Paragraphs
          </span>
        </div>

        <div className="space-y-4">
          {paragraphs.map((p, i) => {
            const isCurrent = isPlaying && currentParagraphIndex === i;
            return (
              <div
                key={i}
                onClick={() => speakParagraph(i)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold shadow-xs border-l-6 border-l-indigo-600"
                    : "bg-white border-gray-200/80 text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${isCurrent ? "text-indigo-600" : "text-gray-400"}`}>
                    PARAGRAPH 0{i + 1}
                  </span>
                  {isCurrent && <span className="text-xs text-indigo-600 font-bold animate-pulse">● PLAYING NOW</span>}
                </div>
                <p className="text-base leading-relaxed">
                  {p.replace(/\\n/g, " ")}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
