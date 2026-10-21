'use client';

import React from 'react';

export interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tilt?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'accent' | 'secondary' | 'surface';
}

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  tilt = false,
  padding = 'lg',
  variant = 'default',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  }[padding];

  const variantClasses = {
    default: 'bg-[var(--surface-clay)] text-[var(--text-clay)]',
    accent: 'bg-[var(--accent-clay)] text-[#1A1A1A]',
    secondary: 'bg-[var(--secondary-clay)] text-white',
    surface: 'bg-[var(--bg-clay)] text-[var(--text-clay)]',
  }[variant];

  return (
    <div
      className={`
        relative rounded-[28px] border-[2.5px] border-[var(--border-clay)]
        shadow-[var(--shadow-clay)] transition-all duration-200 ease-out
        ${tilt ? 'hover:-translate-y-1 hover:-rotate-[0.5deg] hover:shadow-[var(--shadow-clay-hover)]' : ''}
        ${paddingClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
