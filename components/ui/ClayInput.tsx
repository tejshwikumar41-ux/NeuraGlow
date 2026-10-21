'use client';

import React from 'react';

export interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const ClayInput: React.FC<ClayInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-bold tracking-tight text-[var(--text-clay)] uppercase"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-4 text-[var(--muted-clay)] pointer-events-none z-10">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          className={`
            w-full h-[56px] text-base md:text-lg font-medium
            bg-[var(--surface-clay)] text-[var(--text-clay)]
            border-[2.5px] border-[var(--border-clay)] rounded-[18px]
            ${leftIcon ? 'pl-12' : 'pl-5'} ${rightIcon ? 'pr-12' : 'pr-5'}
            shadow-[inset_2px_2px_5px_rgba(0,0,0,0.06)]
            placeholder:text-[var(--muted-clay)]
            focus:outline-none focus:border-[var(--primary-clay)]
            focus:ring-3 focus:ring-[var(--accent-clay)]
            transition-all duration-150
            ${error ? 'border-[#E63946] focus:border-[#E63946]' : ''}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-4 text-[var(--muted-clay)] z-10">
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFE5E5] text-[#D90429] border-2 border-[#D90429] shadow-[2px_2px_0px_#D90429]">
          <span>⚠ {error}</span>
        </div>
      ) : helperText ? (
        <p className="text-xs text-[var(--muted-clay)] font-medium pl-1">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
