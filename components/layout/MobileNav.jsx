'use client'

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Sparkles, History, FolderBookmark, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()

  const items = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Visualize", href: "/visualize", icon: Sparkles },
    { name: "History", href: "/history", icon: History },
    { name: "Library", href: "/library", icon: FolderBookmark },
    { name: "Tutor", href: "/tutor", icon: MessageSquare },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-4 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition-colors",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
