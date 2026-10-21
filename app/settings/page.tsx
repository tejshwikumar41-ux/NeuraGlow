'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [user, setUser] = useState(null)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarBroken, setAvatarBroken] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Load the REAL logged-in user's data
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/') // Not logged in: send home
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      // Saved profile first, then Google account data, then empty
      setFullName(profile?.full_name ?? user.user_metadata?.full_name ?? '')
      setBio(profile?.bio ?? '')
      setAvatarUrl(profile?.avatar_url ?? user.user_metadata?.avatar_url ?? '')
      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  // Save changes to Supabase
  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage(null)

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)
    setMessage(
      error
        ? { type: 'error', text: 'Could not save: ' + error.message }
        : { type: 'success', text: 'Profile saved!' }
    )
  }

  const initials =
    (fullName || user?.email || '?')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-8 space-y-4">
        <div className="h-24 w-24 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-28 bg-slate-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-[6px_6px_0_0_#000] space-y-6">

        {/* Avatar */}
        <div className="flex items-center gap-4">
          {avatarUrl && !avatarBroken ? (
            <img
              src={avatarUrl}
              alt={fullName || 'Profile photo'}
              referrerPolicy="no-referrer"
              onError={() => setAvatarBroken(true)}
              className="w-20 h-20 rounded-full border-2 border-black object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-black bg-[#FF4D00] flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
          )}
          <p className="text-sm text-slate-600">
            Your photo comes from your Google account.
          </p>
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            className="w-full border-2 border-black rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF4D00]"
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Email Address</label>
          <input
            type="email"
            value={user?.email ?? ''}
            readOnly
            className="w-full border-2 border-black rounded-xl px-4 py-3 bg-slate-100 text-slate-600 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">Managed by your Google account</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold uppercase mb-2">Bio & Interests</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us what you love learning about..."
            rows={4}
            maxLength={300}
            className="w-full border-2 border-black rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-[#FF4D00]"
          />
          <p className="text-xs text-slate-500 text-right">{bio.length}/300</p>
        </div>

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white font-bold px-6 py-3 rounded-full hover:opacity-80 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Changes →'}
          </button>
          {message && (
            <span className={message.type === 'error' ? 'text-red-600 text-sm' : 'text-green-700 text-sm'}>
              {message.text}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
