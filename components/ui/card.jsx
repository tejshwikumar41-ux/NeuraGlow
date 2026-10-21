import React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn("text-lg font-bold text-gray-900 dark:text-white leading-tight", className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-xs text-gray-500 dark:text-gray-400 font-medium", className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn("flex items-center p-6 pt-0 border-t border-gray-100 dark:border-gray-800/60 mt-4", className)} {...props}>
      {children}
    </div>
  )
}
