"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, User, RefreshCw, MessageSquare } from "lucide-react";

export default function TutorChat({ topic = "Topic" }) {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: "initial-greeting",
      sender: "ai",
      text: `Hello! I am your NeuraGlow AI Tutor for **${topic}**. What would you like to clarify or ask about today?`,
      ts: Date.now()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

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
      const res = await fetch("/api/tutor", {
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
      console.error("Tutor Chat Error:", err);
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

  return (
    <div className="w-full space-y-6">
      
      {/* Header Badge */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">NeuraGlow AI Tutor — {topic}</h4>
            <p className="text-xs text-indigo-700 font-medium">Ask any follow-up question or test your understanding</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
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

      {/* Chat Messages Container */}
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

            {/* Bubble */}
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
              <span>AI Tutor is formulating response...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleAskQuestion()}
          disabled={loading}
          placeholder={`Ask any question about ${topic}...`}
          className="flex-1 h-14 bg-white border border-gray-300 rounded-2xl px-5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
        />
        <button
          onClick={() => handleAskQuestion()}
          disabled={loading || !question.trim()}
          className="h-14 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Ask Tutor</span>
        </button>
      </div>

    </div>
  );
}
