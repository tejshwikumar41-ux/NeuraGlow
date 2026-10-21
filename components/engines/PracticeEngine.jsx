'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb, Trophy, RotateCcw, ChevronRight, ChevronLeft, Award, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { safeText } from '@/lib/utils/safeRender';
import { useLearningStore } from '@/store/useLearningStore';

export default function PracticeEngine({ data, quiz, topic }) {
  const openDeepDive = useLearningStore((state) => state.openDeepDive);
  const storeTopic = useLearningStore((state) => state.topic);
  const fullData = useLearningStore((state) => state.fullData);

  const cleanTopic = safeText(topic || data?.cleanTopic || fullData?.cleanTopic || storeTopic || '');
  const initialQuiz = Array.isArray(quiz) && quiz.length > 0 ? quiz : Array.isArray(data?.quiz) && data.quiz.length > 0 ? data.quiz : Array.isArray(data?.practice) && data.practice.length > 0 ? data.practice : [];
  const [questions, setQuestions] = useState(initialQuiz);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showHints, setShowHints] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (Array.isArray(quiz) && quiz.length > 0) {
      setQuestions(quiz);
      setCurrentIndex(0);
      setLoading(false);
    } else if (Array.isArray(data?.quiz) && data.quiz.length > 0) {
      setQuestions(data.quiz);
      setCurrentIndex(0);
      setLoading(false);
    } else if (Array.isArray(data?.practice) && data.practice.length > 0) {
      setQuestions(data.practice);
      setCurrentIndex(0);
      setLoading(false);
    } else if (cleanTopic) {
      fetchQuiz();
    } else {
      setQuestions([]);
      setLoading(false);
    }
  }, [cleanTopic, quiz, data]);


  const fetchQuiz = async () => {
    if (!cleanTopic) return;
    setLoading(true);
    setQuestions([]);
    try {
      const res = await fetch('/api/engine/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          category: data?.category || fullData?.category || 'GENERAL',
          difficulty: data?.difficulty || fullData?.difficulty || 'beginner',
        }),
      });
      const resJson = await res.json();
      if (resJson.success && Array.isArray(resJson.data?.questions) && resJson.data.questions.length > 0) {
        setQuestions(resJson.data.questions);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setQuizSubmitted(false);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error('Failed to fetch dedicated quiz:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">QuizMaster Agent Creating Practice Set...</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">Crafting multi-type practice questions with immediate explanations and hints.</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        No practice questions available. <button onClick={fetchQuiz} className="text-indigo-600 underline font-bold cursor-pointer">Retry</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const qTitle = safeText(currentQ.question);

  const handleSelectOption = (questionIndex, optionText) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionText,
    }));
  };

  const toggleHint = (questionIndex) => {
    setShowHints((prev) => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  };

  const totalQuestions = questions.length;
  const correctCount = questions.reduce((acc, q, idx) => {
    const selected = selectedAnswers[idx];
    const isCorrect = selected === q.correctAnswer || selected === q.options?.[q.correctAnswer];
    return isCorrect ? acc + 1 : acc;
  }, 0);

  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  const handleDeepDiveQuestion = (type) => {
    openDeepDive({
      engine: 'practice',
      itemType: 'question',
      itemTitle: `Question ${currentIndex + 1}: ${qTitle}`,
      itemContent: safeText(currentQ.explanation || currentQ.hint || currentQ.question),
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header & Score Tracker */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 rounded-full border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-wider">
              Practice & Self-Check
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            Topic Mastery Quiz
          </h2>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 p-3 px-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your Score</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white">
              {correctCount} / {totalQuestions} ({scorePercentage}%)
            </div>
          </div>
          {Object.keys(selectedAnswers).length > 0 && (
            <button
              onClick={() => { setSelectedAnswers({}); setShowHints({}); setQuizSubmitted(false); setCurrentIndex(0); }}
              className="ml-2 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              title="Restart Quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-md space-y-6">
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 rounded-md border border-indigo-100 dark:border-indigo-900/50 inline-block">
            {safeText(currentQ.type) || 'multiple_choice'}
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
            {qTitle}
          </h3>
        </div>

        {currentQ.code && (
          <div className="bg-gray-900 dark:bg-black text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800">
            <pre className="whitespace-pre-wrap">{safeText(currentQ.code)}</pre>
          </div>
        )}

        <div className="space-y-3">
          {currentQ.options?.map((option, optIdx) => {
            const optionText = safeText(option);
            const selectedVal = selectedAnswers[currentIndex];
            const isSelected = selectedVal === optionText || selectedVal === optIdx;
            const isCorrect = optionText === safeText(currentQ.correctAnswer) || optIdx === currentQ.correctAnswer;

            let btnStyle = 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200';

            if (selectedVal !== undefined) {
              if (isSelected) {
                btnStyle = isCorrect
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm font-semibold'
                  : 'bg-rose-600 border-rose-600 text-white shadow-sm font-semibold';
              } else if (isCorrect) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-bold';
              }
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(currentIndex, optionText)}
                className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg border border-current flex items-center justify-center text-xs font-bold shrink-0 opacity-80">
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span>{optionText}</span>
                </div>

                {selectedVal !== undefined && isSelected && (
                  <div>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Hint Reveal */}
        {currentQ.hint && (
          <div>
            {!showHints[currentIndex] ? (
              <button
                onClick={() => toggleHint(currentIndex)}
                className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-900/50 transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" /> Need a Hint?
              </button>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold uppercase tracking-wider block text-amber-950 dark:text-amber-100">Hint</span>
                <p className="font-medium leading-relaxed">{safeText(currentQ.hint)}</p>
              </div>
            )}
          </div>
        )}

        {/* Instant Explanation Feedback + Deep Dive Actions */}
        {selectedAnswers[currentIndex] !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border text-xs bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50 text-indigo-950 dark:text-indigo-200 space-y-3"
          >
            <div>
              <span className="font-bold uppercase tracking-wider block text-indigo-900 dark:text-indigo-100">Explanation & Core Insight</span>
              <p className="font-medium leading-relaxed mt-1">{safeText(currentQ.explanation)}</p>
            </div>

            {currentQ.wrongChoiceExplanations && Object.keys(currentQ.wrongChoiceExplanations).length > 0 && (
              <div className="pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50 space-y-1">
                <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">Distractor Analysis:</span>
                {Object.entries(currentQ.wrongChoiceExplanations).map(([optKey, exp]) => (
                  <p key={optKey} className="text-[11px] text-gray-700 dark:text-gray-300">
                    • <strong className="text-rose-600 dark:text-rose-400">Option {optKey}:</strong> {exp}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-indigo-200/60 dark:border-indigo-800/60">
              <button
                onClick={() => handleDeepDiveQuestion('why')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" /> Why was this correct/incorrect?
              </button>
              <button
                onClick={() => handleDeepDiveQuestion('teach_again')}
                className="px-3 py-1.5 bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" /> Teach me this concept again
              </button>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              Next Question <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setQuizSubmitted(true)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" /> Complete Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
