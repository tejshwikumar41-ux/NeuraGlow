'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogIn, LogOut } from 'lucide-react'

export default function AuthButton() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="User Avatar"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
          {user.user_metadata?.full_name || user.email}
        </span>
        <button
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleGoogleLogin}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm transition-colors cursor-pointer"
    >
      <LogIn className="w-4 h-4" />
      Sign in with Google
    </button>
  )
}
