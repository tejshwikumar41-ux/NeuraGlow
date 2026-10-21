'use client';

import React from 'react';

// Custom Chunky Geometric Logo for NeuraGlow
export const NeuraGlowLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-[16px] border-[2.5px] border-[var(--border-clay)] bg-[var(--primary-clay)] text-white shadow-[3px_3px_0px_var(--border-clay)] flex items-center justify-center font-black text-xl select-none shrink-0 ${className}`}
    >
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L3 9V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V9L12 2Z"
          fill="currentColor"
          stroke="#1A1A1A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="14" r="3.5" fill="#F4D35E" stroke="#1A1A1A" strokeWidth="2" />
        <path d="M12 7V10.5" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// Chunky Brain Icon (custom SVG)
export const ChunkyBrainIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .77.19 1.5.54 2.14A4.5 4.5 0 0 0 4 13a4.5 4.5 0 0 0 3 4.24V19a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-1.76A4.5 4.5 0 0 0 20 13a4.5 4.5 0 0 0-1.54-4.36c.35-.64.54-1.37.54-2.14A4.5 4.5 0 0 0 14.5 2h-5z" />
    <path d="M12 4v16" />
    <path d="M8 8a2 2 0 0 1 4 0" />
    <path d="M12 14a2 2 0 0 1 4 0" />
  </svg>
);

// Chunky Book Icon
export const ChunkyBookIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
    <path d="M6 6h10" />
    <path d="M6 10h10" />
    <path d="M6 14h6" />
  </svg>
);

// Chunky Presentation Slide Icon
export const ChunkySlideIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="3" width="20" height="14" rx="3" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="m9 10 2 2 4-4" />
  </svg>
);

// Chunky Wrench / Solver Tool Icon
export const ChunkyWrenchIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

// Chunky Question / Quiz Icon
export const ChunkyQuizIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

// Chunky Headphones / Audio Icon
export const ChunkyAudioIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

// Chunky Lightning / Simulator Icon
export const ChunkySimulatorIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

// Chunky Socratic Speech Bubble
export const ChunkyTutorIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    <path d="M8 10h8" />
    <path d="M8 14h5" />
  </svg>
);
