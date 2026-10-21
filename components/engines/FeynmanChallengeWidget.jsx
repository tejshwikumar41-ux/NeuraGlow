'use client';

import React, { useState } from 'react';
import { 
  Award, Sparkles, CheckCircle2, XCircle, AlertTriangle, 
  Send, Loader2, BookOpen, RotateCcw, Brain, Check 
} from 'lucide-react';
import { safeText } from '@/lib/utils/safeRender';

export default function FeynmanChallengeWidget({ feynman, topic }) {
  const appliedQuestions = Array.isArray(feynman?.applied_questions) && feynman.applied_questions.length > 0
    ? feynman.applied_questions
    : [
        {
          question_id: 'q1',
          question_type: 'conceptual_mcq',
          scenario: `A practitioner encounters ${topic} under non-standard conditions where typical surface rules seem inverted.`,
          options: {
            A: `The core governing law adapts to preserve fundamental conservation.`,
            B: `The entire system immediately collapses into random noise.`,
            C: `Variables invert unpredictably without physical causality.`,
            D: `Surface symptoms override the foundational rules.`
          },
          correct_option: 'A',
          detailed_breakdown: {
            why_correct: 'Fundamental conservation principles hold across boundary conditions.',
            why_B_is_a_trap: 'Catastrophic collapse is a common misconception that ignores negative feedback loops.',
            why_C_is_a_trap: 'Causality is preserved under all valid physical models.',
            why_D_is_a_trap: 'Focusing on surface symptoms is a classic trap.'
          }
        }
      ];

  const feynmanChallenge = feynman?.feynman_challenge || {
    prompt: `Explain ${topic} to a 10-year-old without using technical jargon.`,
    key_points_student_must_mention: [
      'What the core idea does',
      'Why it matters in the real world',
      'A simple everyday comparison'
    ],
    grading_rubric: 'Evaluate clarity, intuitive analogies, absence of jargon, and conceptual correctness.'
  };

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [feynmanText, setFeynmanText] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState(null);

  const handleSelectOption = (qId, optionKey) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  const handleGradeFeynman = async () => {
    if (!feynmanText.trim() || isGrading) return;
    setIsGrading(true);

    try {
      const res = await fetch('/api/engine/feynman/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          prompt: feynmanChallenge.prompt,
          studentExplanation: feynmanText,
          keyPoints: feynmanChallenge.key_points_student_must_mention,
          gradingRubric: feynmanChallenge.grading_rubric,
        }),
      });

      const data = await res.json();
      setGradeResult(data);
    } catch (err) {
      console.error('Feynman grading error:', err);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Feynman Active Recall Assessment
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {feynman?.quiz_title || `Mastery Verification: ${topic}`}
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Anti-Time-Pass Testing: Applied scenario questions with cognitive trap breakdowns, followed by an open-ended "Explain-it-back" Feynman challenge.
        </p>
      </div>

      {/* Part 1: Conceptual Scenario MCQs with Trap Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 px-1">
          <span>Part 1: Applied Scenario Checks & Trap Analysis</span>
        </div>

        {appliedQuestions.map((q, idx) => {
          const selected = selectedAnswers[q.question_id || idx];
          const isSubmitted = selected !== undefined;
          const isCorrect = selected === q.correct_option;

          return (
            <div
              key={q.question_id || idx}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-7 shadow-sm space-y-5"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  Scenario {idx + 1}
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                  {q.scenario}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {Object.entries(q.options || {}).map(([optKey, optText]) => {
                  const isSelected = selected === optKey;
                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectOption(q.question_id || idx, optKey)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? isCorrect
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                            : 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg border border-current flex items-center justify-center font-bold text-xs shrink-0">
                          {optKey}
                        </span>
                        <span>{optText}</span>
                      </div>
                      {isSelected && (
                        isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Trap Breakdown & Rationale */}
              {isSubmitted && q.detailed_breakdown && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-xs space-y-2 animate-in fade-in">
                  <div className="font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Cognitive Breakdown
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    <strong>Why {q.correct_option} is Correct:</strong> {q.detailed_breakdown.why_correct}
                  </p>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
                    <span className="font-bold text-gray-500 text-[11px] uppercase tracking-wider">Common Misconception Traps:</span>
                    {q.detailed_breakdown.why_B_is_a_trap && (
                      <p className="text-gray-600 dark:text-gray-400">
                        • <strong className="text-rose-600">Trap B:</strong> {q.detailed_breakdown.why_B_is_a_trap}
                      </p>
                    )}
                    {q.detailed_breakdown.why_C_is_a_trap && (
                      <p className="text-gray-600 dark:text-gray-400">
                        • <strong className="text-rose-600">Trap C:</strong> {q.detailed_breakdown.why_C_is_a_trap}
                      </p>
                    )}
                    {q.detailed_breakdown.why_D_is_a_trap && (
                      <p className="text-gray-600 dark:text-gray-400">
                        • <strong className="text-rose-600">Trap D:</strong> {q.detailed_breakdown.why_D_is_a_trap}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Part 2: Open-Ended Feynman Technique Challenge */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-md space-y-5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Part 2: The Feynman "Explain-It-Back" Test
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
            {feynmanChallenge.prompt}
          </h3>
          <p className="text-xs text-gray-500">
            If you can't explain it simply without jargon, you don't truly understand it yet.
          </p>
        </div>

        {Array.isArray(feynmanChallenge.key_points_student_must_mention) && (
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <strong>Key Insights You Must Cover:</strong>
            <ul className="list-disc pl-4 space-y-0.5 mt-1">
              {feynmanChallenge.key_points_student_must_mention.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Written Response Textarea */}
        <div className="space-y-3">
          <textarea
            rows={5}
            value={feynmanText}
            onChange={(e) => setFeynmanText(e.target.value)}
            placeholder="Type your intuitive explanation here as if talking to a curious 10-year-old..."
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-600 leading-relaxed font-normal"
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-gray-400">
              {feynmanText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <button
              onClick={handleGradeFeynman}
              disabled={!feynmanText.trim() || isGrading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Reasoning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Feynman Explanation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Grade Results Block */}
        {gradeResult && (
          <div className="p-6 rounded-2xl border bg-gray-50 dark:bg-gray-950 border-indigo-200 dark:border-indigo-900/60 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <span className="text-xs text-gray-500 font-semibold uppercase">Feynman Verdict</span>
                <h4 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {gradeResult.mastery_verdict}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Mastery Score</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  {gradeResult.scoreOutOf10}/10
                </span>
              </div>
            </div>

            {gradeResult.constructive_critique && (
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Feedback:</strong> {gradeResult.constructive_critique}
              </p>
            )}

            {Array.isArray(gradeResult.points_covered) && gradeResult.points_covered.length > 0 && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Well Explained:
                </span>
                <p className="text-gray-600 dark:text-gray-400 pl-4">{gradeResult.points_covered.join(', ')}</p>
              </div>
            )}

            {Array.isArray(gradeResult.points_missed) && gradeResult.points_missed.length > 0 && (
              <div className="text-xs space-y-1">
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Missing or Jargon-Heavy:
                </span>
                <p className="text-gray-600 dark:text-gray-400 pl-4">{gradeResult.points_missed.join(', ')}</p>
              </div>
            )}

            {gradeResult.improved_feynman_sentence && (
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                <strong>How a Master Teacher Explains It:</strong>
                <p className="italic leading-relaxed mt-0.5">"{gradeResult.improved_feynman_sentence}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
