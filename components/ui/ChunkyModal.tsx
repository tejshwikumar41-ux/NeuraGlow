'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChunkyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ChunkyModal: React.FC<ChunkyModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
            {/* Dimmed backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.92, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`
                relative w-full ${widthClasses} max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)]
                flex flex-col text-left bg-[var(--surface-clay)] text-[var(--text-clay)]
                border-[3px] border-[var(--border-clay)] rounded-[32px] p-5 sm:p-7
                shadow-[8px_8px_0px_var(--border-clay)] z-10 my-auto
              `}
            >
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between pb-3 sm:pb-4 border-b-[2px] border-[var(--border-clay)] mb-4 sm:mb-6">
                {title ? (
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-clay)]">
                    {title}
                  </h3>
                ) : <div />}

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border-[2px] border-[var(--border-clay)] bg-[var(--bg-clay)] text-[var(--text-clay)] flex items-center justify-center font-black text-lg hover:bg-[var(--accent-clay)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer shadow-[2px_2px_0px_var(--border-clay)] shrink-0"
                  title="Close modal (Esc)"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="overflow-y-auto overscroll-contain flex-1 pr-1.5 sm:pr-2.5 space-y-4">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
