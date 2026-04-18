import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bfd1ff',
          300: '#93b0ff',
          400: '#6085ff',
          500: '#3a5cff',
          600: '#2540f5',
          700: '#1d30d9',
          800: '#1c2ba8',
          900: '#1d2b83',
          950: '#131a4d',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f7f8fa',
          border: '#e5e7eb',
        },
        ink: {
          DEFAULT: '#0b1020',
          soft: '#1f2937',
          muted: '#4b5563',
          faint: '#9ca3af',
        },
        status: {
          new: '#2563eb',
          incomplete: '#f59e0b',
          contacted: '#7c3aed',
          quoted: '#0ea5e9',
          booked: '#10b981',
          closed_lost: '#64748b',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)',
        pop: '0 10px 30px rgba(16,24,40,0.10), 0 2px 6px rgba(16,24,40,0.06)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.2rem',
      },
    },
  },
  plugins: [],
};

export default config;
