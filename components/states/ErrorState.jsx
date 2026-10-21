import React from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an issue loading this module. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-4 max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/50 shadow-xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200">{title}</h3>
        <p className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed">{description}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  )
}
