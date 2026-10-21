'use client';

import React, { useState, useEffect } from 'react';
import { ClayCard } from '@/components/ui/ClayCard';
import { ClayButton } from '@/components/ui/ClayButton';
import { ClayInput } from '@/components/ui/ClayInput';
import { ClaySwitch } from '@/components/ui/ClaySwitch';
import { ClaySlider } from '@/components/ui/ClaySlider';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { useClayTheme, THEMES, ThemeName } from '@/components/layout/ThemeContext';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { theme, setTheme } = useClayTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'learning' | 'notifications' | 'privacy'>('appearance');

  // Dynamic user profile state (connected to Supabase Auth)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    const supabase = createClient();
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
          setEmail(user.email || '');
          setAvatarUrl(user.user_metadata?.avatar_url || '');
        }
      } catch (err) {
        // Fallback gracefully if not logged in
      }
    }
    loadUser();
  }, []);

  // Switches
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [voiceAssistance, setVoiceAssistance] = useState(false);
  const [explanationDepth, setExplanationDepth] = useState('Rigorous & Un-Summarized');

  const tabs = [
    { id: 'appearance', label: '🎨 Appearance & Themes' },
    { id: 'profile', label: '👤 Profile & Bio' },
    { id: 'learning', label: '🧠 Learning Prefs' },
    { id: 'notifications', label: '🔔 Notifications' },
    { id: 'privacy', label: '🔒 Privacy & Data' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-clay)] p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-[2.5px] border-[var(--border-clay)]">
        <div>
          <ClayBadge variant="primary" size="md">Account Center</ClayBadge>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-clay)] tracking-tight mt-1">
            Preferences & Settings
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[var(--muted-clay)]">
            Configure your tactile study themes, font scale, and Socratic depth.
          </p>
        </div>

        <ClayButton size="sm" variant="secondary" href="/dashboard">
          ← Dashboard
        </ClayButton>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-[2px] border-[var(--border-clay)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              px-4 py-2.5 rounded-[16px] border-[2px] font-black text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap
              ${
                activeTab === tab.id
                  ? 'border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] shadow-[3px_3px_0px_var(--border-clay)] -translate-y-0.5'
                  : 'border-transparent text-[var(--muted-clay)] hover:border-[var(--border-clay)] hover:bg-[var(--surface-clay)] hover:text-[var(--text-clay)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. APPEARANCE TAB (4 Clickable Theme Cards + Font Slider) */}
      {activeTab === 'appearance' && (
        <ClayCard padding="lg" className="space-y-8 shadow-[6px_6px_0px_var(--border-clay)]">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[var(--text-clay)]">
              Tactile Clay Themes
            </h3>
            <p className="text-xs font-bold text-[var(--muted-clay)]">
              Click any theme card to switch the entire app with smooth 300ms transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {THEMES.map((th) => {
              const isSelected = theme === th.id;
              return (
                <div
                  key={th.id}
                  onClick={() => setTheme(th.id as ThemeName)}
                  style={{ backgroundColor: th.bg, borderColor: th.border }}
                  className={`
                    p-5 rounded-[24px] border-[3px] shadow-[4px_4px_0px_var(--border-clay)] cursor-pointer transition-all space-y-3 relative
                    ${isSelected ? 'ring-4 ring-[var(--accent-clay)] scale-[1.02]' : 'hover:-translate-y-1'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base" style={{ color: th.primary }}>
                      {th.name}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white border border-[var(--border-clay)] text-[#1A1A1A]">
                        Active ✓
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold opacity-80" style={{ color: th.secondary }}>
                    {th.tagline}
                  </p>

                  {/* Swatches */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="w-5 h-5 rounded-full border border-black" style={{ backgroundColor: th.primary }} title="Primary" />
                    <span className="w-5 h-5 rounded-full border border-black" style={{ backgroundColor: th.secondary }} title="Secondary" />
                    <span className="w-5 h-5 rounded-full border border-black" style={{ backgroundColor: th.accent }} title="Accent" />
                    <span className="w-5 h-5 rounded-full border border-black" style={{ backgroundColor: th.surface }} title="Surface" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Font Size Slider */}
          <div className="pt-6 border-t-[2px] border-[var(--border-clay)] max-w-md">
            <ClaySlider
              label="Reading Body Font Size"
              value={fontSize}
              min={14}
              max={24}
              step={1}
              unit="px"
              onChange={setFontSize}
            />
            <p className="text-xs text-[var(--muted-clay)] font-bold mt-2">
              Preview: <span style={{ fontSize: `${fontSize}px` }} className="font-serif">The quick brown fox jumps over the lazy dog.</span>
            </p>
          </div>
        </ClayCard>
      )}

      {/* 2. PROFILE TAB */}
      {activeTab === 'profile' && (
        <ClayCard padding="lg" className="space-y-6 shadow-[6px_6px_0px_var(--border-clay)] max-w-2xl">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-[3px] border-[var(--border-clay)] object-cover shadow-[3px_3px_0px_var(--border-clay)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-[3px] border-[var(--border-clay)] bg-[var(--accent-clay)] flex items-center justify-center font-black text-2xl shadow-[3px_3px_0px_var(--border-clay)]">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <ClayButton size="sm" variant="secondary" onClick={() => alert('Avatar upload modal opened')}>
                Upload New Avatar
              </ClayButton>
              <p className="text-[11px] font-bold text-[var(--muted-clay)] mt-1">PNG, JPG or SVG up to 5MB</p>
            </div>
          </div>

          <ClayInput label="Full Name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
          <ClayInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase text-[var(--text-clay)]">Bio & Interests</label>
            <textarea
              value={bio}
              placeholder="Tell us about yourself and your learning goals..."
              onChange={(e) => setBio(e.target.value)}
              className="w-full h-24 p-3.5 rounded-[18px] border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] font-medium text-sm outline-none focus:ring-3 focus:ring-[var(--accent-clay)] resize-none"
            />
          </div>

          <ClayButton size="md" variant="primary" onClick={() => alert('Profile changes saved successfully!')}>
            Save Changes →
          </ClayButton>
        </ClayCard>
      )}

      {/* 3. LEARNING PREFERENCES TAB */}
      {activeTab === 'learning' && (
        <ClayCard padding="lg" className="space-y-6 shadow-[6px_6px_0px_var(--border-clay)] max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[var(--text-clay)]">Curriculum Preferences</h3>
            <p className="text-xs font-bold text-[var(--muted-clay)]">Customize Socratic rigor and voice synthesis speeds.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase text-[var(--text-clay)]">Default Explanation Depth</label>
              <select
                value={explanationDepth}
                onChange={(e) => setExplanationDepth(e.target.value)}
                className="w-full h-12 px-4 rounded-[16px] border-[2.5px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--text-clay)] font-bold text-sm outline-none"
              >
                <option value="Detailed (~50,000 words)">Detailed Treatise (~50,000 words with full rigor & proofs)</option>
                <option value="Standard (~15,000 words)">In-Depth Core (~15,000 words semester textbook depth)</option>
                <option value="Crisp (~5,000 words)">Crisp / Shortly (~5,000 words rapid exam revision)</option>
              </select>
            </div>

            <ClaySwitch
              label="Voice Output in AI Tutor"
              description="Read Socratic probes aloud using conversational voice synthesis."
              checked={voiceAssistance}
              onChange={setVoiceAssistance}
            />
          </div>

          <ClayButton size="md" variant="primary" onClick={() => alert('Learning preferences updated!')}>
            Save Preferences →
          </ClayButton>
        </ClayCard>
      )}

      {/* 4. NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <ClayCard padding="lg" className="space-y-6 shadow-[6px_6px_0px_var(--border-clay)] max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[var(--text-clay)]">Notification Controls</h3>
            <p className="text-xs font-bold text-[var(--muted-clay)]">Stay accountable to your daily study streak.</p>
          </div>

          <div className="space-y-5 pt-2">
            <ClaySwitch
              label="Daily Study Reminder"
              description="Get a gentle prompt at 9:00 AM to maintain your momentum."
              checked={dailyReminder}
              onChange={setDailyReminder}
            />

            <ClaySwitch
              label="Streak Milestone Alerts"
              description="Celebrate when reaching 7, 14, 30, and 100 days of consistent learning."
              checked={streakAlerts}
              onChange={setStreakAlerts}
            />
          </div>
        </ClayCard>
      )}

      {/* 5. PRIVACY & DATA TAB */}
      {activeTab === 'privacy' && (
        <ClayCard padding="lg" className="space-y-6 shadow-[6px_6px_0px_var(--border-clay)] max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[var(--text-clay)]">Data Ownership & Privacy</h3>
            <p className="text-xs font-bold text-[var(--muted-clay)]">NeuraGlow never sells your study history or prompts.</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-[20px] border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] space-y-2">
              <h4 className="font-black text-sm text-[var(--text-clay)]">Export Your Data</h4>
              <p className="text-xs text-[var(--muted-clay)] font-bold">Download all your notes, quiz logs, and transcripts in JSON format.</p>
              <ClayButton size="sm" variant="secondary" onClick={() => alert('Data export initiated. Downloading archive...')}>
                Export All Data (JSON)
              </ClayButton>
            </div>

            <div className="p-4 rounded-[20px] border-[2px] border-[#E63946] bg-[#FFE5E5] space-y-2">
              <h4 className="font-black text-sm text-[#D90429]">Danger Zone</h4>
              <p className="text-xs font-bold text-[#660708]">Permanently delete your account and erase all study streaks.</p>
              <ClayButton size="sm" variant="danger" onClick={() => confirm('Are you sure you want to permanently delete your NeuraGlow account?')}>
                Delete Account
              </ClayButton>
            </div>
          </div>
        </ClayCard>
      )}
    </div>
  );
}
