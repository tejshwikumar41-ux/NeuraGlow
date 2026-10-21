'use client';

import React, { useState } from 'react';
import { ChunkyModal } from '@/components/ui/ChunkyModal';
import { ClayInput } from '@/components/ui/ClayInput';
import { ClayButton } from '@/components/ui/ClayButton';

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
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                onClose();
              }, 800);
            }}
            className="w-full h-13 rounded-[18px] border-[2px] border-[var(--border-clay)] bg-white text-[#1A1A1A] font-extrabold text-sm shadow-[3px_3px_0px_var(--border-clay)] flex items-center justify-center gap-3 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_var(--border-clay)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
          >
            <span className="text-lg">🇬</span>
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
