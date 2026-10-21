'use client';

import React from 'react';

export interface ClaySliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const ClaySlider: React.FC<ClaySliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-extrabold uppercase tracking-tight text-[var(--text-clay)]">
          {label}
        </span>
        <span className="font-mono font-bold px-2 py-0.5 rounded-lg border-[2px] border-[var(--border-clay)] bg-[var(--surface-clay)] text-[var(--primary-clay)] shadow-[2px_2px_0px_var(--border-clay)]">
          {value}
          {unit}
        </span>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 bg-[var(--bg-clay)] border-[2px] border-[var(--border-clay)] rounded-full appearance-none cursor-pointer accent-[var(--primary-clay)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]"
        />
      </div>

      <div className="flex justify-between text-[10px] font-mono font-bold text-[var(--muted-clay)]">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};
