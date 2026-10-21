/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="midnight"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: 'var(--bg-clay)',
          surface: 'var(--surface-clay)',
          primary: 'var(--primary-clay)',
          secondary: 'var(--secondary-clay)',
          accent: 'var(--accent-clay)',
          text: 'var(--text-clay)',
          muted: 'var(--muted-clay)',
          border: 'var(--border-clay)',
        },
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        clay: 'var(--shadow-clay)',
        'clay-hover': 'var(--shadow-clay-hover)',
        'clay-pressed': 'var(--shadow-clay-pressed)',
        'clay-soft': 'var(--shadow-clay-soft)',
      },
      borderRadius: {
        clay: '24px',
        'clay-sm': '16px',
        'clay-lg': '32px',
        'clay-full': '9999px',
      },
      borderWidth: {
        clay: '2.5px',
        'clay-thick': '3.5px',
      },
    },
  },
  plugins: [],
};
