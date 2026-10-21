import React from "react"
import { cn } from "@/lib/utils"

export function SkeletonCard({ className }) {
  return (
    <div className={cn("p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 animate-pulse shadow-xs", className)}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-4/6" />
      </div>
    </div>
  )
}
