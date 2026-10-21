'use client'

import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { MobileNav } from "./MobileNav"

export function AppShell({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleToggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev)
    } else {
      setIsSidebarCollapsed((prev) => !prev)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-200">
      {/* Desktop Layout */}
      <div className="flex">
        <Sidebar className="hidden lg:flex" isCollapsed={isSidebarCollapsed} />

        {/* Mobile Slide-over Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <Sidebar className="relative z-10 w-64 h-full" isCollapsed={false} />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <Topbar onMenuClick={handleToggleMenu} />
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
