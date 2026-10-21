'use client';

import React from 'react';

export interface ClaySwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const ClaySwitch: React.FC<ClaySwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
      {(label || description) && (
        <div className="space-y-0.5">
          {label && (
            <p className="text-sm font-bold text-[var(--text-clay)]">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[var(--muted-clay)]">{description}</p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full
          border-[2.5px] border-[var(--border-clay)] transition-colors duration-200 ease-in-out
          shadow-[2px_2px_0px_var(--border-clay)]
          ${checked ? 'bg-[var(--primary-clay)]' : 'bg-[var(--surface-clay)]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-6 w-6 transform rounded-full
            border-[2px] border-[var(--border-clay)] bg-white shadow-[1px_1px_0px_var(--border-clay)]
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-8 bg-[var(--accent-clay)]' : 'translate-x-0.5'}
          `}
        />
      </button>
    </label>
  );
};
