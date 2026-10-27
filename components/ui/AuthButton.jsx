'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LogIn, LogOut } from 'lucide-react'

export default function AuthButton() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (e) {
        console.warn('Auth check error:', e)
      } finally {
        setLoading(false)
      }
    }
    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return <div className="h-8 w-20 bg-[var(--bg-clay)] border-2 border-[var(--border-clay)] rounded-xl animate-pulse" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-2.5">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="User Avatar"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border-2 border-black object-cover shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#FF6B4A] text-white border-2 border-black flex items-center justify-center font-black text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs font-black text-[var(--text-clay)] hidden md:inline truncate max-w-[120px]">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
        <button
          onClick={handleLogout}
          className="p-1.5 text-[var(--muted-clay)] hover:text-red-600 hover:bg-[#FFE5E5] rounded-xl border border-transparent hover:border-black transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/auth/login"
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[16px] border-[2px] border-black bg-[#FF6B4A] hover:bg-[#ff552e] text-white font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
    >
      <LogIn className="w-3.5 h-3.5" />
      <span>Sign In</span>
    </Link>
  )
}
