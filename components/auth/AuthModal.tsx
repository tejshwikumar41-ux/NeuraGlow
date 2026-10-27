'use client';

import React, { useState } from 'react';
import { ChunkyModal } from '@/components/ui/ChunkyModal';
import { ClayInput } from '@/components/ui/ClayInput';
import { ClayButton } from '@/components/ui/ClayButton';
import { createClient } from '@/lib/supabase/client';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrors({});
  }, [initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (mode === 'signup') {
      if (!name.trim()) {
        newErrors.name = 'Full name is required';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!agreeTerms) {
        newErrors.terms = 'You must agree to the Terms of Service';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    }, 1000);
  };

  return (
    <ChunkyModal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
      <div className="space-y-6">
        {/* Tab Toggle at Top of Modal */}
        <div className="p-1.5 rounded-[22px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] grid grid-cols-2 gap-1.5 shadow-[3px_3px_0px_var(--border-clay)]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrors({});
            }}
            className={`
              py-2.5 rounded-[16px] font-black text-sm tracking-tight transition-all cursor-pointer
              ${
                mode === 'login'
                  ? 'bg-[var(--surface-clay)] text-[var(--text-clay)] border-[2px] border-[var(--border-clay)] shadow-[2px_2px_0px_var(--border-clay)]'
                  : 'text-[var(--muted-clay)] hover:text-[var(--text-clay)]'
              }
            `}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrors({});
            }}
            className={`
              py-2.5 rounded-[16px] font-black text-sm tracking-tight transition-all cursor-pointer
              ${
                mode === 'signup'
                  ? 'bg-[var(--surface-clay)] text-[var(--text-clay)] border-[2px] border-[var(--border-clay)] shadow-[2px_2px_0px_var(--border-clay)]'
                  : 'text-[var(--muted-clay)] hover:text-[var(--text-clay)]'
              }
            `}
          >
            Sign Up
          </button>
        </div>

        {/* Modal Headline */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-[var(--text-clay)] tracking-tight">
            {mode === 'login' ? 'Welcome Back 👋' : 'Create Your Account 🚀'}
          </h2>
          <p className="text-xs text-[var(--muted-clay)] font-bold">
            {mode === 'login'
              ? 'Access your saved study decks, notes, and streak.'
              : 'Join curious minds and independent thinkers worldwide.'}
          </p>
        </div>

        {/* Chunky OAuth Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={async () => {
              setIsLoading(true);
              try {
                const supabase = createClient();
                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${origin}/auth/callback?next=/dashboard`,
                  },
                });
              } catch (e) {
                console.error(e);
                setIsLoading(false);
              }
            }}
            className="w-full h-13 rounded-[18px] border-[2px] border-[var(--border-clay)] bg-white text-[#1A1A1A] font-extrabold text-sm shadow-[3px_3px_0px_var(--border-clay)] flex items-center justify-center gap-3 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_var(--border-clay)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  onClose();
                }, 800);
              }}
              className="h-12 rounded-[18px] border-[2px] border-[var(--border-clay)] bg-[#000000] text-white font-extrabold text-xs shadow-[3px_3px_0px_var(--border-clay)] flex items-center justify-center gap-2 hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <span></span>
              <span>Apple</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  onClose();
                }, 800);
              }}
              className="h-12 rounded-[18px] border-[2px] border-[var(--border-clay)] bg-[#24292E] text-white font-extrabold text-xs shadow-[3px_3px_0px_var(--border-clay)] flex items-center justify-center gap-2 hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <span>🐙</span>
              <span>GitHub</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t-[2px] border-[var(--border-clay)]" />
          <span className="absolute bg-[var(--surface-clay)] px-3 text-[10px] font-black uppercase tracking-wider text-[var(--muted-clay)]">
            or with email
          </span>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <ClayInput
              label="Full Name"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
          )}

          <ClayInput
            label="Email Address"
            type="email"
            placeholder="learner@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <ClayInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          {mode === 'signup' && (
            <ClayInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />
          )}

          {/* Checkboxes */}
          <div className="flex items-center justify-between text-xs font-bold pt-1">
            {mode === 'login' ? (
              <>
                <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-clay)]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-[var(--border-clay)] accent-[var(--primary-clay)]"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to ' + (email || 'your email')); }} className="text-[var(--primary-clay)] hover:underline">
                  Forgot password?
                </a>
              </>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-clay)]">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-[var(--border-clay)] accent-[var(--primary-clay)]"
                />
                <span>I accept the Terms of Service & Privacy Policy</span>
              </label>
            )}
          </div>

          {errors.terms && (
            <p className="text-xs font-bold text-[#D90429]">{errors.terms}</p>
          )}

          {/* Submit Button */}
          <ClayButton
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            {mode === 'login' ? 'Sign In to Workspace →' : 'Create Free Account →'}
          </ClayButton>
        </form>
      </div>
    </ChunkyModal>
  );
};
