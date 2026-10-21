'use client'

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Sparkles,
  History,
  FolderBookmark,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  PlusCircle,
  Home
} from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function Sidebar({ className, isCollapsed = false }) {
  const pathname = usePathname()
  const router = useRouter()

  const mainNavItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Visualize", href: "/visualize", icon: Sparkles },
    { name: "History", href: "/history", icon: History },
    { name: "Library", href: "/library", icon: FolderBookmark },
    { name: "AI Tutor", href: "/tutor", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between h-screen sticky top-0 z-30 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Top Header */}
      <div className="p-4 flex flex-col space-y-5">
        <Link href="/dashboard" className="flex items-center gap-3 group px-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
            N
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-extrabold text-base text-gray-900 dark:text-white leading-none tracking-tight truncate">
                NeuraGlow
              </h1>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mt-1">
                Visual Workspace
              </span>
            </div>
          )}
        </Link>

        {/* Quick New Topic CTA */}
        <Link
          href="/visualize"
          className={cn(
            "flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-all shadow-xs shadow-indigo-600/30 active:scale-[0.98]",
            isCollapsed ? "px-2" : "px-4"
          )}
          title="New Topic Workspace"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>New Topic</span>}
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-2">
              Main Menu
            </p>
          )}
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  "flex items-center rounded-xl text-xs font-semibold transition-all group",
                  isCollapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!isCollapsed && isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom User Controls */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Theme</span>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-gray-800/60">
              <Link href="/settings" className="flex items-center gap-2.5 truncate group">
                <Avatar fallback="TK" className="shrink-0" />
                <div className="truncate max-w-[100px]">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600">
                    Tejshwi Kumar
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Pro Learner</p>
                </div>
              </Link>

              <button
                onClick={() => router.push("/login")}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-1">
            <Link href="/settings" title="Tejshwi Kumar (Settings)">
              <Avatar fallback="TK" className="w-8 h-8" />
            </Link>
            <button
              onClick={() => router.push("/login")}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
