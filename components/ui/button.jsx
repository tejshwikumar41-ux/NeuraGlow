import React from "react"
import { cn } from "@/lib/utils"

export const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-xl select-none"

    const variants = {
      default:
        "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-sm",
      secondary:
        "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
      outline:
        "border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white",
      ghost:
        "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] shadow-sm",
      link: "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline p-0 h-auto font-normal",
    }

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs rounded-lg",
      lg: "h-12 px-6 text-base rounded-2xl",
      icon: "h-10 w-10 p-0 flex items-center justify-center",
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
