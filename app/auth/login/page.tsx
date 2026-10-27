'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NeuraGlowLogo } from '@/components/ui/ClayIcons';
import { ClayBadge } from '@/components/ui/ClayBadge';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('next') || '/dashboard';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        router.replace(returnTo);
      }
    }).catch(() => {});
  }, [router, returnTo]);

  // Handle Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${origin}/auth/callback?next=${encodeURIComponent(returnTo)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google Sign-In Error:', error);
        setErrorMessage(error.message || 'Could not initiate Google sign in.');
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      console.error('Unexpected Google Sign-In Error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during Google sign in.');
      setIsGoogleLoading(false);
    }
  };

  // Handle Email & Password Sign In / Sign Up
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsEmailLoading(true);
    const supabase = createClient();

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setIsEmailLoading(false);
          return;
        }

        router.replace(returnTo);
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim() || email.split('@')[0],
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsEmailLoading(false);
          return;
        }

        setSuccessMessage('Account created! Check your email to confirm, or continue to your dashboard.');
        setTimeout(() => {
          router.replace(returnTo);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-clay)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-[#FF6B4A] selection:text-white">
      
      {/* Decorative Clay Badges in Background */}
      <div className="hidden lg:block absolute top-12 left-12 rotate-[-6deg] opacity-70 pointer-events-none">
        <span className="px-4 py-2 rounded-2xl bg-[#4D96FF] text-white border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          ⚛️ 1,750+ Questions
        </span>
      </div>
      <div className="hidden lg:block absolute bottom-16 right-16 rotate-[4deg] opacity-70 pointer-events-none">
        <span className="px-4 py-2 rounded-2xl bg-[#FFE600] text-black border-2 border-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          🤖 Socratic 2-Way AI
        </span>
      </div>

      {/* Top Navbar Brand Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-4">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <NeuraGlowLogo size={36} className="group-hover:rotate-6 transition-transform" />
          <div>
            <span className="font-black text-lg tracking-tight text-[var(--text-clay)] leading-none block">
              NeuraGlow
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--primary-clay)]">
              Universal Study
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-black text-[var(--muted-clay)] hover:text-[var(--text-clay)] transition-colors px-3 py-1 rounded-xl border border-[var(--border-clay)] bg-[var(--surface-clay)]"
        >
          ← Back Home
        </Link>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="p-6 sm:p-8 rounded-[28px] border-[3.5px] border-black bg-[var(--surface-clay)] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <div className="inline-block mb-1">
              <ClayBadge variant="primary" size="sm">
                {mode === 'login' ? 'Scholar Portal' : 'Join the Learning Journey'}
              </ClayBadge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-clay)] tracking-tight">
              {mode === 'login' ? 'Sign in to NeuraGlow' : 'Create Your Free Account'}
            </h1>
            <p className="text-xs font-bold text-[var(--muted-clay)] leading-relaxed">
              {mode === 'login'
                ? 'Save your notes, sync question progress, and unlock unlimited Socratic AI tutoring.'
                : 'Free forever. Zero pre-written summaries. Real conceptual mastery.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="p-1 rounded-[18px] border-[2px] border-black bg-[var(--bg-clay)] grid grid-cols-2 gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-black tracking-tight transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-[var(--muted-clay)] hover:text-[var(--text-clay)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-black tracking-tight transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-[var(--muted-clay)] hover:text-[var(--text-clay)]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl border-2 border-black bg-[#FFE5E5] text-[#D90429] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-start gap-2">
              <span className="text-base shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl border-2 border-black bg-[#E6F4EA] text-[#137333] text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-start gap-2">
              <span className="text-base shrink-0">✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Primary Action: High-Fidelity Google Sign-In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isEmailLoading}
              className="w-full h-14 rounded-[20px] border-[3px] border-black bg-white hover:bg-slate-50 text-black font-black text-sm sm:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-3.5 cursor-pointer disabled:opacity-60 select-none group"
            >
              {isGoogleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Google...</span>
                </div>
              ) : (
                <>
                  {/* Official Google 4-Color Icon */}
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="w-full border-t-2 border-black/15"></div>
            <span className="absolute bg-[var(--surface-clay)] px-3 text-[10px] font-black uppercase tracking-wider text-[var(--muted-clay)]">
              or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-clay)]">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Richard Feynman"
                  className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[var(--bg-clay)] text-[var(--text-clay)] text-sm font-bold placeholder:text-[var(--muted-clay)] outline-none focus:ring-2 focus:ring-black shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.06)]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-clay)]">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scholar@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[var(--bg-clay)] text-[var(--text-clay)] text-sm font-bold placeholder:text-[var(--muted-clay)] outline-none focus:ring-2 focus:ring-black shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.06)]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-clay)]">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert(`If an account exists for ${email || 'your email'}, a password reset link has been dispatched.`)}
                    className="text-[11px] font-bold text-[var(--primary-clay)] hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-black bg-[var(--bg-clay)] text-[var(--text-clay)] text-sm font-bold placeholder:text-[var(--muted-clay)] outline-none focus:ring-2 focus:ring-black shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.06)]"
              />
            </div>

            <button
              type="submit"
              disabled={isEmailLoading || isGoogleLoading}
              className="w-full h-13 rounded-xl border-[2.5px] border-black bg-[#FF6B4A] hover:bg-[#ff552e] text-white font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isEmailLoading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Continue with Email ➔' : 'Create Free Account ➔')}
            </button>
          </form>

          {/* Guest Explore Option */}
          <div className="pt-2 border-t border-black/10 text-center">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[var(--muted-clay)] hover:text-black transition-colors"
            >
              Or continue as guest for now →
            </Link>
          </div>

        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[11px] font-bold text-[var(--muted-clay)]">
          <span className="flex items-center gap-1">🔒 Supabase Auth</span>
          <span>•</span>
          <span className="flex items-center gap-1">⚡ Cloud Sync</span>
          <span>•</span>
          <span className="flex items-center gap-1">🎓 100% Free Tier</span>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-md w-full mx-auto text-center pt-4 text-[10px] font-mono text-[var(--muted-clay)]">
        NeuraGlow Learning System © {new Date().getFullYear()}
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-clay)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
