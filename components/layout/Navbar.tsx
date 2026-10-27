'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NeuraGlowLogo } from '@/components/ui/ClayIcons';
import { ClayButton } from '@/components/ui/ClayButton';
import { ThemeToggle } from './ThemeToggle';
import { FocusModeButton } from '../bonus/FocusModeButton';
import AuthButton from '@/components/ui/AuthButton';

export const Navbar: React.FC<{
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
  onToggleFocus: (isFocus: boolean) => void;
  isFocus: boolean;
}> = ({
  onOpenAuthModal,
  onToggleFocus,
  isFocus,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  const isHome = pathname === '/';

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  // Generate breadcrumb pieces
  const getBreadcrumbs = () => {
    if (pathname === '/') return [];
    const segments = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', href: '/' }];
    let currentPath = '';

    segments.forEach((seg, i) => {
      currentPath += `/${seg}`;
      const formatted = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
      crumbs.push({ label: formatted, href: currentPath });
    });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (isFocus) {
    return (
      <header className="fixed top-4 right-6 z-40">
        <FocusModeButton onToggleFocus={onToggleFocus} isFocus={isFocus} />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface-clay)] border-b-[2.5px] border-[var(--border-clay)] px-4 sm:px-8 py-3 transition-colors duration-200 shadow-[0_4px_0px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Side: Back button + Logo + Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {!isHome && (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] font-black text-xs hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer shadow-[2px_2px_0px_var(--border-clay)] shrink-0"
              title="Go back (Esc)"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <NeuraGlowLogo size={38} className="group-hover:rotate-6 transition-transform" />
            <div className="hidden xs:block">
              <span className="font-black text-lg tracking-tight text-[var(--text-clay)] block leading-none">
                NeuraGlow
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--primary-clay)]">
                Universal Study
              </span>
            </div>
          </Link>

          {/* Breadcrumb Trail */}
          {!isHome && breadcrumbs.length > 1 && (
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[var(--muted-clay)] truncate pl-2 border-l-2 border-[var(--border-clay)]">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.href}>
                    {idx > 0 && <span className="opacity-40">›</span>}
                    {isLast ? (
                      <span className="text-[var(--text-clay)] truncate max-w-[140px]">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link href={crumb.href} className="hover:text-[var(--primary-clay)] truncate">
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Side: Offline Badge, Nav Links, Theme Switcher, Auth buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isOnline && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-[#FFE5E5] text-[#D90429] border-2 border-[#D90429]">
              ● Offline Mode
            </span>
          )}

          {/* Navigation links for marketing / hub */}
          <div className="hidden xl:flex items-center gap-5 text-xs font-black uppercase tracking-wider text-[var(--text-clay)]">
            <Link href="/dashboard" className="hover:text-[var(--primary-clay)] transition-colors">
              Dashboard
            </Link>
            <Link href="/tutor" className="hover:text-[var(--primary-clay)] transition-colors flex items-center gap-1">
              <span>🤖</span>
              <span>Socratic AI</span>
            </Link>
            <Link href="/search" className="hover:text-[var(--primary-clay)] transition-colors">
              Explore
            </Link>
            <Link href="/library" className="hover:text-[var(--primary-clay)] transition-colors">
              Library
            </Link>
            <Link href="/progress" className="hover:text-[var(--primary-clay)] transition-colors">
              Progress
            </Link>
          </div>

          {/* Focus Mode & Theme Switcher */}
          <FocusModeButton onToggleFocus={onToggleFocus} isFocus={isFocus} />
          <ThemeToggle />

          {/* Supabase Authentication Button */}
          <div className="flex items-center pl-1 sm:pl-2 border-l-[2px] border-[var(--border-clay)]">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
};
