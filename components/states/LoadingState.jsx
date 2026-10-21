import React from "react"
import { Loader2 } from "lucide-react"

export function LoadingState({
  title = "Orchestrating Learning Experience...",
  description = "Specialized AI agents are building slides, interactive simulations, and quizzes.",
}) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4 max-w-lg mx-auto my-8 shadow-xs">
      <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  )
}
