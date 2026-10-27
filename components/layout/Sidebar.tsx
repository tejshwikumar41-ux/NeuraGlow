'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClayBadge } from '@/components/ui/ClayBadge';
import { ThemeToggle } from './ThemeToggle';
import { createClient } from '@/lib/supabase/client';

export const Sidebar: React.FC<{
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}> = ({ isCollapsed = false, onToggleCollapse, className = '' }) => {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    }).catch(() => {});
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : 'My Account');
  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Socratic AI', href: '/tutor', icon: '🤖' },
    { name: 'Search Topics', href: '/search', icon: '🔍' },
    { name: 'My Library', href: '/library', icon: '📚' },
    { name: 'Progress & Stats', href: '/progress', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside
      className={`
        bg-[var(--surface-clay)] border-r-[2.5px] border-[var(--border-clay)]
        h-[calc(100vh-65px)] sticky top-[65px] flex flex-col justify-between p-4
        transition-all duration-300 ease-in-out shrink-0 select-none z-30
        ${isCollapsed ? 'w-20' : 'w-[280px]'}
        ${className}
      `}
    >
      <div className="space-y-6">
        {/* User Profile Card */}
        <div className="p-3.5 rounded-[22px] border-[2.5px] border-[var(--border-clay)] bg-[var(--bg-clay)] shadow-[3px_3px_0px_var(--border-clay)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-11 h-11 rounded-full border-[2.5px] border-[var(--border-clay)] object-cover shadow-[2px_2px_0px_var(--border-clay)] shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full border-[2.5px] border-[var(--border-clay)] bg-[var(--accent-clay)] text-[#1A1A1A] flex items-center justify-center font-black text-base shadow-[2px_2px_0px_var(--border-clay)] shrink-0">
                {avatarLetter}
              </div>
            )}
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-sm font-black text-[var(--text-clay)] truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-[var(--muted-clay)] font-bold truncate">
                  {user ? 'Active Learner' : 'Guest'}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <ClayBadge size="sm" variant="primary">
              Pro
            </ClayBadge>
          )}
        </div>

        {/* Navigation Items (56px tall each) */}
        <nav className="space-y-2">
          {!isCollapsed && (
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-clay)] px-3">
              Navigation
            </p>
          )}

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3.5 h-[56px] rounded-[18px] px-4 font-extrabold text-sm
                  border-[2px] transition-all duration-150 group
                  ${isCollapsed ? 'justify-center px-0' : 'justify-start'}
                  ${
                    isActive
                      ? 'border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] shadow-[3px_3px_0px_var(--border-clay)] border-l-[6px] border-l-[var(--primary-clay)]'
                      : 'border-transparent text-[var(--muted-clay)] hover:border-[var(--border-clay)] hover:bg-[var(--bg-clay)] hover:text-[var(--text-clay)]'
                  }
                `}
                title={item.name}
              >
                <span className="text-xl shrink-0 p-1 rounded-lg border border-transparent group-hover:border-[var(--border-clay)]">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="truncate tracking-tight">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="pt-4 border-t-[2px] border-[var(--border-clay)] space-y-3">
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-[var(--muted-clay)]">Theme:</span>
            <ThemeToggle />
          </div>
        ) : (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full py-2 rounded-xl border border-[var(--border-clay)] bg-[var(--bg-clay)] text-xs font-bold text-[var(--text-clay)] hover:bg-[var(--accent-clay)] transition-all cursor-pointer"
          >
            {isCollapsed ? '→' : '← Collapse Sidebar'}
          </button>
        )}
      </div>
    </aside>
  );
};
