"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, MessageSquare, Send, Sparkles, User, 
  HelpCircle, Lightbulb, RefreshCw, CheckCircle2, ArrowRight
} from "lucide-react";

export default function LearnEngine({ topic = "Topic", data = {} }) {
  const [activeTab, setActiveTab] = useState("explanation");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: "initial-greeting",
      sender: "ai",
      text: `Hello! I am your NeuraGlow AI Tutor for **${topic}**. I can provide detailed explanations or answer any cross-question you have. Ask me anything!`,
      ts: Date.now()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleAskQuestion = async (customQuestion) => {
    const q = (customQuestion || question).trim();
    if (!q || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      ts: Date.now()
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          question: q,
          history: updatedHistory.slice(-6)
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to get response from AI Tutor.");
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: json.answer,
        ts: Date.now()
      };

      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat Error:", err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: `⚠️ **Error**: ${err.message || "Unable to process your question. Please try again."}`,
        ts: Date.now()
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const PRESET_QUESTIONS = [
    "Explain this with a real-world analogy",
    "What are the most common mistakes people make?",
    "How does this topic apply in practical real life?",
    "Test my understanding with a practice question"
  ];

  const summaryText = data?.summary || `${topic} is a fundamental concept requiring clear structural understanding and application.`;

  return (
    <div className="w-full space-y-8">
      
      {/* ── TOP NAVIGATION TABS ── */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <button
          onClick={() => setActiveTab("explanation")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            activeTab === "explanation"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Detailed Explanation</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            activeTab === "chat"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Cross-Question & Ask AI</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════
          TAB 1: DETAILED EXPLANATION & DEEP DIVE
      ════════════════════════════════════════════════ */}
      {activeTab === "explanation" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Summary Banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Core Summary & Essence</span>
            </div>
            <p className="text-lg font-medium text-indigo-950 leading-relaxed">
              {summaryText}
            </p>
          </div>

          {/* Deep Breakdown Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Core Mechanics */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 text-indigo-600">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-bold">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">1. Foundational Mechanism</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                At its core, <strong>{topic}</strong> relies on structured principles that define how components interact under specific conditions. Understanding the underlying variables allows you to predict behavior accurately.
              </p>
            </div>

            {/* Box 2: Real-World Analogy */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 text-indigo-600">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">2. Simple Analogy</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Think of <strong>{topic}</strong> like a well-orchestrated traffic system: individual units move according to rules to maintain overall equilibrium and optimize output without bottlenecking.
              </p>
            </div>

            {/* Box 3: Practical Impact */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 text-indigo-600">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">3. Practical Application</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Engineers and researchers utilize <strong>{topic}</strong> to design efficient technology, solve complex mathematical puzzles, and optimize real-world workflows across modern industries.
              </p>
            </div>

            {/* Box 4: Common Misconceptions */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 text-indigo-600">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">4. Key Insights</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                A common pitfall is oversimplifying cause-and-effect relationships. Always verify boundary conditions and environmental factors when analyzing <strong>{topic}</strong>.
              </p>
            </div>

          </div>

          {/* Prompt to Cross-Question */}
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-gray-900">Have a specific question or doubt?</h4>
              <p className="text-sm text-gray-600 mt-0.5">Ask our Groq-powered AI Tutor to clear your doubts instantly.</p>
            </div>
            <button
              onClick={() => setActiveTab("chat")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <span>Ask a Cross-Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 2: INTERACTIVE Q&A & CROSS-QUESTIONING CHAT
      ════════════════════════════════════════════════ */}
      {activeTab === "chat" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Preset Questions Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Suggested Cross-Questions:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUESTIONS.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(pq)}
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium px-3.5 py-2 rounded-xl border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {pq}
                </button>
              ))}
            </div>
          </div>

          {/* CHAT MESSAGES FEED */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 min-h-[380px] max-h-[520px] overflow-y-auto space-y-4">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-900 text-white"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                </div>

                {/* Message Box */}
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-white border border-gray-200 text-gray-900 shadow-xs rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs p-4 flex items-center gap-3 text-sm text-gray-600 shadow-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>NeuraGlow AI Tutor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="flex items-center gap-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleAskQuestion()}
              disabled={loading}
              placeholder={`Ask any cross-question about ${topic}...`}
              className="flex-1 h-14 bg-white border border-gray-300 rounded-2xl px-5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
            />
            <button
              onClick={() => handleAskQuestion()}
              disabled={loading || !question.trim()}
              className="h-14 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Ask AI</span>
            </button>
          </div>

        </motion.div>
      )}

    </div>
  );
}
