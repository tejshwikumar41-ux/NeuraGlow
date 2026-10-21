'use client';

import React from 'react';

export interface ClayBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const ClayBadge: React.FC<ClayBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3.5 py-1 text-xs',
    lg: 'px-4.5 py-1.5 text-sm',
  }[size];

  const variantClasses = {
    default:
      'bg-[var(--surface-clay)] text-[var(--text-clay)] border-[var(--border-clay)]',
    primary:
      'bg-[var(--primary-clay)] text-white border-[var(--border-clay)]',
    accent:
      'bg-[var(--accent-clay)] text-[#1A1A1A] border-[var(--border-clay)]',
    secondary:
      'bg-[var(--secondary-clay)] text-white border-[var(--border-clay)]',
    success:
      'bg-[#B5EAD7] text-[#1A2F0D] border-[#1A2F0D] shadow-[2px_2px_0px_#1A2F0D]',
    danger:
      'bg-[#FFB4A2] text-[#660708] border-[#660708] shadow-[2px_2px_0px_#660708]',
    outline:
      'bg-transparent text-[var(--text-clay)] border-[var(--border-clay)] shadow-none',
  }[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider
        rounded-full border-[2px] shadow-[2px_2px_0px_var(--border-clay)] select-none
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
