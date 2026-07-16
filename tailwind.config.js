/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── Primary teal scale (đồng bộ qlda-ddcn-ht) ───
        primary: {
          DEFAULT: 'rgb(var(--color-primary-500) / <alpha-value>)',
          light: 'rgb(var(--color-primary-400) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-700) / <alpha-value>)',
          subtle: 'rgb(var(--color-primary-100) / <alpha-value>)',
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        // ─── Accent đỏ cờ ───
        accent: {
          DEFAULT: '#AE1E23',
          light: '#D42A30',
          dark: '#8B181C',
          bg: '#fde3e3',
          50: '#fef2f2',
          100: '#fde3e3',
        },
        gold: {
          DEFAULT: '#D4A017',
          dark: '#B8860B',
          200: '#F0D68A',
          300: '#E4C45A',
          400: '#D4A843',
        },
        success: '#10b981',
        warning: {
          DEFAULT: '#f59e0b',
          200: '#fde68a',
          400: '#fbbf24',
        },
        danger: '#ef4444',
        info: '#3b82f6',
        // ─── Theme-aware surfaces (Nature — nền cát ấm) ───
        page: 'var(--bg-app)',
        surface: 'var(--bg-surface)',
        subtle: 'var(--bg-subtle)',
        muted: 'var(--bg-muted)',
        elevated: 'var(--bg-elevated)',
        border: {
          DEFAULT: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
        },
        ink: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        dropdown: 'var(--shadow-dropdown)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
