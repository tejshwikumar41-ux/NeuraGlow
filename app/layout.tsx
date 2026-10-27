import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeContext';
import { ClientShell } from '@/components/layout/ClientShell';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'NeuraGlow — Learn Anything. Actually Understand It.',
  description: 'Design-forward AI universal study companion. Claymorphism + Soft Brutalism. 7 learning engines, un-summarized depth, interactive practice, and Socratic tutoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="cream" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      </head>
      <body>
        <ThemeProvider>
          <ClientShell>
            {children}
          </ClientShell>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: '!border-[2.5px] !border-[var(--border-clay)] !bg-[var(--surface-clay)] !text-[var(--text-clay)] !rounded-[20px] !shadow-[4px_4px_0px_var(--border-clay)] !font-bold !text-xs',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
