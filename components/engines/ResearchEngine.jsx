"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles, CheckCircle2, AlertTriangle, Lightbulb, Compass } from "lucide-react";

export default function ResearchEngine({ data = {}, topic = "Topic" }) {
  // Normalize research input (object or fallback text)
  const research = typeof data === "object" && data !== null ? data : {};

  const introduction = research.introduction || `${topic} is a foundational subject requiring clear structural understanding and practical application.`;
  const coreExplanation = research.coreExplanation || `Understanding ${topic} involves studying how its core variables and principles interact under different conditions.`;
  const applications = Array.isArray(research.realWorldApplications) ? research.realWorldApplications : [
    `Industry implementation of ${topic}`,
    `Everyday practical integration`,
    `Next-generation technological development`
  ];
  const misconceptions = Array.isArray(research.commonMisconceptions) ? research.commonMisconceptions : [
    `Common myth: Over-simplifying ${topic} leads to incorrect assumptions.`,
    `Misunderstanding: Thinking ${topic} operates in isolation without environmental variables.`
  ];
  const expertTips = Array.isArray(research.expertTips) ? research.expertTips : [
    `Master foundational principles before moving to advanced configurations.`,
    `Practice with real-world examples to reinforce memory.`,
    `Focus on cause-and-effect relationships during review.`
  ];
  const furtherLearning = Array.isArray(research.furtherLearning) ? research.furtherLearning : [
    `Explore advanced applications of ${topic}`,
    `Build a practical project or experiment testing these principles`
  ];

  return (
    <div className="w-full space-y-10">
      
      {/* Article Header Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 md:p-10 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Deep Research Article & Expert Guide</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          {topic}: Comprehensive Deep Dive
        </h2>
        <p className="text-base text-gray-600 font-medium leading-relaxed">
          Rigorous, plain-language breakdown designed for 100% technical accuracy and immediate clarity.
        </p>
      </div>

      {/* Structured Article Layout */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-xs space-y-12">
        
        {/* Section 1: Introduction */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">1. Introduction</h3>
          </div>
          <div className="text-gray-700 text-base leading-relaxed space-y-4 pl-2 md:pl-13 font-normal">
            {typeof introduction === "string" ? (
              introduction.split("\n\n").map((p, idx) => (
                <p key={idx} className="leading-relaxed">{p}</p>
              ))
            ) : (
              <p>{String(introduction)}</p>
            )}
          </div>
        </motion.section>

        {/* Section 2: Core Explanation */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">2. Core Explanation & Mechanics</h3>
          </div>
          <div className="text-gray-700 text-base leading-relaxed space-y-4 pl-2 md:pl-13 font-normal">
            {typeof coreExplanation === "string" ? (
              coreExplanation.split("\n\n").map((p, idx) => (
                <p key={idx} className="leading-relaxed">{p}</p>
              ))
            ) : (
              <p>{String(coreExplanation)}</p>
            )}
          </div>
        </motion.section>

        {/* Section 3: Real-World Applications */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-6 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">3. Real-World Applications</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:pl-13">
            {applications.map((app, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 space-y-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  0{idx + 1}
                </span>
                <p className="text-sm font-semibold text-gray-800 leading-snug">
                  {app}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Section 4: Common Misconceptions */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">4. Common Misconceptions & Pitfalls</h3>
          </div>

          <div className="space-y-3 md:pl-13">
            {misconceptions.map((misc, idx) => (
              <div key={idx} className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-4">
                <span className="text-lg shrink-0 mt-0.5">❌ / ✅</span>
                <p className="text-sm text-amber-950 font-medium leading-relaxed">
                  {misc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Section 5: Expert Tips */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-6 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">5. Expert Tips & Actionable Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:pl-13">
            {expertTips.map((tip, idx) => (
              <div key={idx} className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  <span>PRO TIP 0{idx + 1}</span>
                </div>
                <p className="text-sm text-indigo-950 font-medium leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Section 6: Further Learning */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">6. Further Learning & Next Steps</h3>
          </div>

          <div className="space-y-3 md:pl-13">
            {furtherLearning.map((item, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3 text-sm font-semibold text-gray-800">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.section>

      </div>

    </div>
  );
}
