'use client'

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  Home, 
  User, 
  Settings, 
  FolderBookmark, 
  History, 
  LogOut, 
  Sparkles, 
  MessageSquare,
  Moon,
  Sun,
  ChevronDown,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import ThemeToggle from "@/components/ThemeToggle"

export function Topbar({ onMenuClick }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const profileRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getPageTitle = (path) => {
    if (path.startsWith("/dashboard")) return "Dashboard Overview"
    if (path.startsWith("/visualize")) return "Visualize Workspace"
    if (path.startsWith("/history")) return "Learning History"
    if (path.startsWith("/library")) return "My Library & Notes"
    if (path.startsWith("/tutor")) return "Socratic AI Tutor"
    if (path.startsWith("/settings")) return "Account Settings"
    return "NeuraGlow Workspace"
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/visualize?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-xs">
      {/* Left controls: 3-line button, Home button, Page title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 3-Line Hamburger Menu Button (Top-left corner) */}
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Home Button */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 font-semibold text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 px-2.5 h-9 rounded-xl"
            title="Go to Dashboard Home"
          >
            <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>

        {/* Page Title */}
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden xs:block" />
        <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-sm flex-1 mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, slides, or simulations... (Enter)"
            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </form>

      {/* Right controls: New Topic CTA, Notifications, Functional Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          onClick={() => router.push("/visualize")}
          size="sm"
          className="hidden sm:inline-flex bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Topic</span>
        </Button>

        {/* PIP Theme & Wallpaper Selector */}
        <ThemeToggle />

        {/* Notifications Button */}
        <button 
          onClick={() => setHasUnread(false)}
          className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse" />
          )}
        </button>

        {/* Top-Right Profile Icon (Functional Interactive Dropdown) */}
        <div className="relative pl-1 sm:pl-2 border-l border-gray-200 dark:border-gray-800" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer outline-none group"
            title="User Profile & Settings"
          >
            <Avatar fallback="TK" className="w-8 h-8 ring-2 ring-indigo-600/30 group-hover:ring-indigo-600 transition-all" />
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? "rotate-180 text-indigo-600" : ""}`} />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              {/* User Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <Avatar fallback="U" className="w-10 h-10 ring-2 ring-indigo-600/40" />
                <div className="truncate">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">My Account</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Manage Preferences</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Learner
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Account & Profile
                </Link>

                <Link
                  href="/library"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <FolderBookmark className="w-4 h-4 text-gray-400" />
                  Saved Library & Decks
                </Link>

                <Link
                  href="/history"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <History className="w-4 h-4 text-gray-400" />
                  Learning History
                </Link>

                <Link
                  href="/tutor"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  Socratic AI Tutor
                </Link>
              </div>

              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

              {/* Quick Theme Toggle inside dropdown */}
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                  Dark Theme
                </span>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                >
                  {theme === "dark" ? "On" : "Off"}
                </button>
              </div>

              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsProfileOpen(false)
                  router.push("/login")
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
