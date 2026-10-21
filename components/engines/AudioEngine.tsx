'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayBadge } from '@/components/ui/ClayBadge';

export interface AudioEngineProps {
  topic: any;
}

export const AudioEngine: React.FC<AudioEngineProps> = ({ topic }) => {
  const audioData = topic?.audio || {
    title: 'Comprehensive Audio Masterclass',
    duration: '14:20',
    chapters: [],
    transcript: []
  };

  const transcript = (audioData.transcript && audioData.transcript.length > 0)
    ? audioData.transcript
    : [
        { time: '00:05', speaker: 'Lead Instructor', text: `Welcome to this comprehensive masterclass on ${topic?.title || 'this topic'}.` },
        { time: '00:25', speaker: 'AI Co-Host', text: topic?.summary || 'Let us explore the core fundamental principles and experimental breakthroughs.' },
        { time: '00:50', speaker: 'Lead Instructor', text: 'Listen closely as we unpack the critical equations and historical discoveries step by step.' }
      ];

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTranscriptIndex, setActiveTranscriptIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const activeIndexRef = useRef(activeTranscriptIndex);
  activeIndexRef.current = activeTranscriptIndex;
  const speedRef = useRef(playbackSpeed);
  speedRef.current = playbackSpeed;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // Sound chime for instant feedback
  const playTactileChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // AudioContext fallback
    }
  }, []);

  // Initialize Speech Synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak a specific sentence by transcript index
  const speakSentence = useCallback(
    (index: number) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      const synth = window.speechSynthesis;
      synth.cancel(); // Stop any pending utterance

      if (index >= transcript.length) {
        setIsPlaying(false);
        setActiveTranscriptIndex(0);
        return;
      }

      const item = transcript[index];
      if (!item) return;

      const utterance = new SpeechSynthesisUtterance(item.text);
      utteranceRef.current = utterance;

      // Rate and volume
      utterance.rate = speedRef.current;
      utterance.volume = isMutedRef.current ? 0 : Math.max(0, Math.min(1, volumeRef.current / 100));

      // Voice selection based on speaker role
      const isFemaleSpeaker = /sarah|claire|sophie|female|woman|anna|mary/i.test(item.speaker);
      const engVoices = voices.filter((v) => v.lang.startsWith('en'));

      if (engVoices.length > 0) {
        if (isFemaleSpeaker) {
          const femaleVoice = engVoices.find((v) => /female|zira|samantha|karen|victoria/i.test(v.name));
          if (femaleVoice) utterance.voice = femaleVoice;
          utterance.pitch = 1.15;
        } else {
          const maleVoice = engVoices.find((v) => /david|male|george|daniel|guy/i.test(v.name));
          if (maleVoice) utterance.voice = maleVoice;
          utterance.pitch = 0.92;
        }
      } else {
        utterance.pitch = isFemaleSpeaker ? 1.15 : 0.92;
      }

      // On end of current sentence, advance to the next
      utterance.onend = () => {
        if (isPlayingRef.current) {
          const nextIndex = index + 1;
          if (nextIndex < transcript.length) {
            setActiveTranscriptIndex(nextIndex);
            speakSentence(nextIndex);
          } else {
            setIsPlaying(false);
            setActiveTranscriptIndex(0);
          }
        }
      };

      utterance.onerror = (e) => {
        // Ignore user cancellation errors
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech synthesis error:', e);
        }
      };

      synth.speak(utterance);
    },
    [transcript, voices]
  );

  // Play / Pause toggle
  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsPlaying(true);
      playTactileChime();
      speakSentence(activeTranscriptIndex);
    }
  };

  // Speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      speakSentence(activeTranscriptIndex);
    }
  };

  // Volume slider change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
    // Update live volume on current utterance if speaking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && utteranceRef.current) {
      utteranceRef.current.volume = newVol / 100;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && utteranceRef.current) {
      utteranceRef.current.volume = !isMuted ? 0 : volume / 100;
    }
  };

  // Jump to specific sentence
  const handleJumpToSentence = (index: number) => {
    setActiveTranscriptIndex(index);
    if (isPlaying) {
      speakSentence(index);
    } else {
      setIsPlaying(true);
      playTactileChime();
      speakSentence(index);
    }
  };

  // Skip -10s (previous sentence) / +10s (next sentence)
  const handleSkip = (direction: 'prev' | 'next') => {
    let target = direction === 'prev' ? activeTranscriptIndex - 1 : activeTranscriptIndex + 1;
    if (target < 0) target = 0;
    if (target >= transcript.length) target = transcript.length - 1;
    setActiveTranscriptIndex(target);
    if (isPlaying) {
      speakSentence(target);
    }
  };

  // Calculate percentage progress through transcript
  const progressPercent = transcript.length > 0
    ? Math.round(((activeTranscriptIndex + 1) / transcript.length) * 100)
    : 0;

  const currentSpeaker = transcript[activeTranscriptIndex]?.speaker || 'Narrator';
  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Audio Player Main Stage */}
      <ClayCard padding="xl" className="space-y-8 shadow-[8px_8px_0px_var(--border-clay)] bg-[var(--surface-clay)] border-[3px] border-[var(--border-clay)]">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-[2px] border-[var(--border-clay)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClayBadge variant="primary" size="sm">
                🎙️ Voice AI Lecture
              </ClayBadge>
              {isPlaying && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] text-[10px] font-black uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Speaking: {currentSpeaker}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-clay)]">
              {audioData.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs sm:text-sm font-black px-3 py-1 rounded-lg border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)]">
              Duration: {audioData.duration}
            </span>
          </div>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="p-6 sm:p-8 rounded-[28px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] flex items-center justify-center gap-1 sm:gap-2 h-40 overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)]">
          {Array.from({ length: 32 }).map((_, i) => {
            const isSpeakingActive = isPlaying && !isMuted;
            const waveHeight = isSpeakingActive
              ? Math.sin(i * 0.45 + activeTranscriptIndex * 1.5) * 0.45 + 0.55
              : 0.18;
            const barHeight = Math.max(12, Math.round(waveHeight * 105));
            return (
              <div
                key={i}
                style={{ height: `${barHeight}px` }}
                className={`
                  w-1.5 sm:w-2.5 rounded-full border border-[var(--border-clay)] transition-all duration-150
                  ${
                    isSpeakingActive
                      ? i % 2 === 0
                        ? 'bg-[var(--primary-clay)]'
                        : 'bg-[var(--accent-clay)]'
                      : 'bg-[var(--muted-clay)]/30'
                  }
                `}
              />
            );
          })}
        </div>

        {/* Playback Controls & Chunky Volume Bar */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Main Controls Row */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Rewind */}
            <button
              onClick={() => handleSkip('prev')}
              className="w-14 h-14 rounded-full border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] flex items-center justify-center text-lg font-black shadow-[3px_3px_0px_var(--border-clay)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer select-none"
              title="Previous statement"
            >
              ⏮
            </button>

            {/* Massive Chunky 120px Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[3.5px] border-[var(--border-clay)] bg-[var(--primary-clay)] text-white flex items-center justify-center text-4xl sm:text-5xl font-black shadow-[var(--shadow-clay)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[var(--shadow-clay-hover)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[var(--shadow-clay-pressed)] transition-all cursor-pointer select-none"
              title={isPlaying ? 'Pause Lesson' : 'Play Voice Lecture'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Forward */}
            <button
              onClick={() => handleSkip('next')}
              className="w-14 h-14 rounded-full border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] flex items-center justify-center text-lg font-black shadow-[3px_3px_0px_var(--border-clay)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer select-none"
              title="Next statement"
            >
              ⏭
            </button>
          </div>

          {/* Interactive Volume Bar & Speed Controls Row */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)]">
            {/* VOLUME CONTROL BAR */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-xl border-[2px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] flex items-center justify-center text-lg font-bold shadow-[2px_2px_0px_var(--border-clay)] hover:bg-[var(--accent-clay)] hover:text-[#1A1A1A] transition-all cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? '🔇' : volume < 35 ? '🔈' : volume < 70 ? '🔉' : '🔊'}
              </button>

              <div className="flex items-center gap-2.5 flex-1 sm:w-44">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none bg-[var(--surface-clay)] border-[2px] border-[var(--border-clay)] cursor-pointer accent-[var(--primary-clay)] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, var(--primary-clay) 0%, var(--primary-clay) ${isMuted ? 0 : volume}%, var(--surface-clay) ${isMuted ? 0 : volume}%, var(--surface-clay) 100%)`
                  }}
                  title={`Volume: ${isMuted ? 0 : volume}%`}
                />
                <span className="font-mono text-xs font-black min-w-[42px] text-[var(--text-clay)] text-right">
                  {isMuted ? '0%' : `${volume}%`}
                </span>
              </div>
            </div>

            {/* Speed Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-[var(--muted-clay)] mr-1">Speed:</span>
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-black border-[2px] border-[var(--border-clay)] transition-all cursor-pointer
                    ${
                      playbackSpeed === s
                        ? 'bg-[var(--accent-clay)] text-[#1A1A1A] shadow-[2px_2px_0px_var(--border-clay)] scale-105'
                        : 'bg-[var(--surface-clay)] text-[var(--text-clay)] hover:bg-[var(--bg-clay)]'
                    }
                  `}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-[var(--muted-clay)]">
            <span>
              Section {activeTranscriptIndex + 1} of {transcript.length}
            </span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-3.5 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
            <div
              className="h-full bg-[var(--primary-clay)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {!speechSupported && (
          <div className="p-3 rounded-xl border border-amber-500 bg-amber-50 text-amber-800 text-xs font-medium">
            ⚠️ Web Speech narration is not supported in this specific browser. Audio visualizer is running in simulation mode.
          </div>
        )}
      </ClayCard>

      {/* Synchronized Transcript Stage */}
      <ClayCard padding="lg" className="space-y-4 shadow-[6px_6px_0px_var(--border-clay)] bg-[var(--surface-clay)] border-[3px] border-[var(--border-clay)]">
        <div className="flex items-center justify-between pb-3 border-b-[2px] border-[var(--border-clay)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="text-lg font-black text-[var(--text-clay)]">
              Interactive Synchronized Transcript
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md border border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)]">
            Click any line to speak
          </span>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
          {transcript.map((item: any, idx: number) => {
            const isCurrent = idx === activeTranscriptIndex;
            return (
              <div
                key={idx}
                onClick={() => handleJumpToSentence(idx)}
                className={`
                  p-3.5 rounded-[18px] border-[2.5px] transition-all cursor-pointer select-none
                  ${
                    isCurrent
                      ? 'border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] shadow-[4px_4px_0px_var(--border-clay)] scale-[1.01]'
                      : 'border-[var(--border-clay)]/30 bg-[var(--bg-clay)] text-[var(--text-clay)] hover:border-[var(--border-clay)]'
                  }
                `}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <div className="flex items-center gap-2 font-black">
                    <span>{item.speaker}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-[var(--border-clay)] bg-white text-[#1A1A1A]">
                      Now Speaking 🔊
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold leading-relaxed">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </ClayCard>
    </div>
  );
};
