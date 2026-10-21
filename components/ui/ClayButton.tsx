'use client';

import React from 'react';
import Link from 'next/link';

export interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'surface' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-[14px]',
    md: 'px-5 py-2.5 text-sm rounded-[18px]',
    lg: 'px-7 py-3.5 text-base rounded-[22px]',
    xl: 'px-9 py-4 text-lg rounded-[26px]',
  }[size];

  // Variant styling
  const variantClasses = {
    primary:
      'bg-[var(--primary-clay)] text-white hover:bg-[var(--primary-clay)] active:bg-[var(--primary-clay)]',
    secondary:
      'bg-[var(--surface-clay)] text-[var(--text-clay)] hover:bg-[var(--bg-clay)] active:bg-[var(--bg-clay)]',
    accent:
      'bg-[var(--accent-clay)] text-[#1A1A1A] hover:opacity-95',
    surface:
      'bg-[var(--surface-clay)] text-[var(--text-clay)] border-dashed',
    ghost:
      'bg-transparent text-[var(--text-clay)] border-transparent shadow-none hover:bg-[var(--surface-clay)] hover:shadow-[3px_3px_0px_var(--border-clay)] hover:border-[var(--border-clay)]',
    danger:
      'bg-[#E63946] text-white',
  }[variant];

  const baseClasses = `
    inline-flex items-center justify-center font-bold tracking-tight select-none cursor-pointer
    border-[2.5px] border-[var(--border-clay)] shadow-[var(--shadow-clay)]
    transition-all duration-150 ease-out
    hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[var(--shadow-clay-hover)]
    active:translate-x-[2px] active:translate-y-[2px] active:shadow-[var(--shadow-clay-pressed)]
    disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed
    ${sizeClasses}
    ${variantClasses}
    ${className}
  `.trim();

  const content = (
    <>
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : icon && iconPosition === 'left' ? (
        <span className="shrink-0 mr-2">{icon}</span>
      ) : null}

      <span>{children}</span>

      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0 ml-2">{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button disabled={disabled || loading} className={baseClasses} {...props}>
      {content}
    </button>
  );
};
