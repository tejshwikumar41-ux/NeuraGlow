'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, UserCheck, Sparkles, SkipForward, SkipBack, MessageSquare, Loader2 } from 'lucide-react';
import { safeText } from '@/lib/utils/safeRender';
import { useLearningStore } from '@/store/useLearningStore';

export default function AudioLessonEngine({ data, audio, topic }) {
  const openDeepDive = useLearningStore((state) => state.openDeepDive);
  const storeTopic = useLearningStore((state) => state.topic);
  const fullData = useLearningStore((state) => state.fullData);

  const cleanTopic = safeText(topic || data?.cleanTopic || fullData?.cleanTopic || storeTopic || '');
  const initialAudio = audio || data?.audioLesson || data?.audio || null;
  const [audioData, setAudioData] = useState(initialAudio);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [rate, setRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);

  const synthRef = useRef(null);

  useEffect(() => {
    if (audio?.paragraphs?.length || audio?.scriptParagraphs?.length) {
      setAudioData(audio);
      setActiveParagraphIndex(0);
      setLoading(false);
    } else if (data?.audioLesson?.scriptParagraphs?.length || data?.audio?.scriptParagraphs?.length) {
      setAudioData(data.audioLesson || data.audio);
      setActiveParagraphIndex(0);
      setLoading(false);
    } else if (cleanTopic) {
      fetchAudio();
    } else {
      setAudioData(null);
      setLoading(false);
    }
  }, [cleanTopic, audio, data]);


  const fetchAudio = async () => {
    if (!cleanTopic) return;
    setLoading(true);
    setAudioData(null);
    try {
      const res = await fetch('/api/engine/audio', {
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
        setAudioData(resJson.data);
        setActiveParagraphIndex(0);
      } else {
        setAudioData(null);
      }
    } catch (err) {
      console.error('Failed to fetch dedicated audio:', err);
      setAudioData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = synthRef.current.getVoices();
        if (voices.length > 0) {
          setAvailableVoices(voices);
        }
      };

      updateVoices();
      synthRef.current.onvoiceschanged = updateVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">AudioLesson Agent Scripting Podcast Experience...</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Writing multi-paragraph narration script, key takeaways, and voice checkpoints.</p>
      </div>
    );
  }

  const transcript = audioData?.scriptParagraphs || audioData?.paragraphs || audioData?.transcript || [];
  const title = safeText(audioData?.title || cleanTopic || topic) || 'Audio Lesson';

  if (!transcript || transcript.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        No audio transcript available. <button onClick={fetchAudio} className="text-indigo-600 underline font-bold cursor-pointer">Retry</button>
      </div>
    );
  }

  const speakParagraph = (index) => {
    if (!synthRef.current || index < 0 || index >= transcript.length) {
      setIsPlaying(false);
      return;
    }

    synthRef.current.cancel();

    const item = transcript[index];
    const textToSpeak = typeof item === 'string' ? item : safeText(item.text || item.content);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;

    if (availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }

    utterance.onend = () => {
      if (index < transcript.length - 1) {
        setActiveParagraphIndex(index + 1);
        speakParagraph(index + 1);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        speakParagraph(activeParagraphIndex);
      }
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setActiveParagraphIndex(0);
  };

  const handleDeepDiveParagraph = (textStr) => {
    openDeepDive({
      engine: 'audio',
      itemType: 'paragraph',
      itemTitle: `Audio Section ${activeParagraphIndex + 1}`,
      itemContent: safeText(textStr),
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Player Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Volume2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-mono font-semibold text-indigo-300 uppercase tracking-wider">
                Interactive Audio Lesson
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">{title}</h2>
            </div>
          </div>

          {availableVoices.length > 0 && (
            <div className="flex items-center gap-2 bg-white/10 p-2 px-3 rounded-xl border border-white/10">
              <UserCheck className="w-4 h-4 text-indigo-300 shrink-0" />
              <select
                value={selectedVoiceIndex}
                onChange={(e) => {
                  setSelectedVoiceIndex(Number(e.target.value));
                  if (isPlaying) speakParagraph(activeParagraphIndex);
                }}
                className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {availableVoices.map((v, idx) => (
                  <option key={idx} value={idx} className="bg-gray-900 text-white">
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const prevIdx = Math.max(0, activeParagraphIndex - 1);
                setActiveParagraphIndex(prevIdx);
                if (isPlaying) speakParagraph(prevIdx);
              }}
              disabled={activeParagraphIndex === 0}
              className="p-2.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-30 cursor-pointer"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/40 transition-all transform hover:scale-105 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              {isPlaying ? 'Pause Audio' : 'Start Podcast'}
            </button>

            <button
              onClick={handleStop}
              className="p-2.5 text-rose-300 hover:text-rose-100 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <Square className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                const nextIdx = Math.min(transcript.length - 1, activeParagraphIndex + 1);
                setActiveParagraphIndex(nextIdx);
                if (isPlaying) speakParagraph(nextIdx);
              }}
              disabled={activeParagraphIndex === transcript.length - 1}
              className="p-2.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-30 cursor-pointer"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-xl border border-white/10">
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setRate(s);
                  if (isPlaying) speakParagraph(activeParagraphIndex);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  rate === s ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-200 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-indigo-300 font-medium">
            <span>Section {activeParagraphIndex + 1} of {transcript.length}</span>
            <span>{Math.round(((activeParagraphIndex + 1) / transcript.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-400 h-full transition-all duration-300"
              style={{ width: `${((activeParagraphIndex + 1) / transcript.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Synchronized Transcript View */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Interactive Lesson Transcript
        </h3>

        <div className="space-y-3">
          {transcript.map((item, idx) => {
            const isCurrent = idx === activeParagraphIndex;
            const speaker = typeof item === 'object' ? safeText(item.speaker) : 'Narrator';
            const text = typeof item === 'object' ? safeText(item.text || item.content) : safeText(item);

            return (
              <div
                key={idx}
                className={`group p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-gray-50 dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCurrent ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {speaker || 'Narrator'}
                  </span>

                  <button
                    onClick={() => {
                      setActiveParagraphIndex(idx);
                      handleDeepDiveParagraph(text);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Explain this part
                  </button>
                </div>
                <p
                  onClick={() => {
                    setActiveParagraphIndex(idx);
                    speakParagraph(idx);
                  }}
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
