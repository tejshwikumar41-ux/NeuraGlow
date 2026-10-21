import React from "react"
import { cn } from "@/lib/utils"

export function Avatar({ className, src, alt = "Avatar", fallback = "U", ...props }) {
  const [error, setError] = React.useState(false)

  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-indigo-600 text-white font-extrabold text-xs items-center justify-center border border-indigo-500/20 shadow-xs",
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span className="uppercase font-extrabold">{fallback}</span>
      )}
    </div>
  )
}
