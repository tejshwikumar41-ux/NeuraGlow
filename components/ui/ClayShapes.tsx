'use client';

import React from 'react';

export const SquircleShape: React.FC<{
  color?: string;
  size?: number;
  className?: string;
  rotation?: number;
}> = ({ color = 'var(--accent-clay)', size = 64, className = '', rotation = 12 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        transform: `rotate(${rotation}deg)`,
      }}
      className={`rounded-[24px] border-[3px] border-[var(--border-clay)] shadow-[4px_4px_0px_var(--border-clay)] transition-transform duration-300 hover:rotate-45 ${className}`}
    />
  );
};

export const MiniPlanetShape: React.FC<{
  color?: string;
  ringColor?: string;
  size?: number;
  className?: string;
}> = ({
  color = 'var(--primary-clay)',
  ringColor = 'var(--accent-clay)',
  size = 56,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center ${className}`}
    >
      <div
        style={{
          width: size * 0.75,
          height: size * 0.75,
          backgroundColor: color,
        }}
        className="rounded-full border-[2.5px] border-[var(--border-clay)] shadow-[3px_3px_0px_var(--border-clay)]"
      />
      <div
        style={{
          width: size,
          height: size * 0.35,
          borderColor: ringColor,
        }}
        className="absolute rounded-full border-[3px] border-[var(--border-clay)] rotate-[-25deg] pointer-events-none"
      />
    </div>
  );
};

export const ClayPillDecoration: React.FC<{
  label: string;
  color?: string;
  textColor?: string;
  className?: string;
}> = ({
  label,
  color = 'var(--secondary-clay)',
  textColor = '#FFFFFF',
  className = '',
}) => {
  return (
    <div
      style={{ backgroundColor: color, color: textColor }}
      className={`inline-flex items-center px-4 py-1.5 rounded-full border-[2px] border-[var(--border-clay)] shadow-[3px_3px_0px_var(--border-clay)] font-black text-xs uppercase tracking-wider ${className}`}
    >
      {label}
    </div>
  );
};
