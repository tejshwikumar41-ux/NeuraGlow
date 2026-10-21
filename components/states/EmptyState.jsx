import React from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyState({
  icon: Icon = Sparkles,
  title = "No items found",
  description = "Get started by generating your first learning topic or searching for concepts.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <Button onClick={onAction} size="sm" className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export default EmptyState

