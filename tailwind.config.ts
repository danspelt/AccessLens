import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accessible: {
          green: '#16a34a',
          'green-light': '#dcfce7',
          yellow: '#ca8a04',
          'yellow-light': '#fef9c3',
          red: '#dc2626',
          'red-light': '#fee2e2',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'inset-highlight': 'inset 0 1px 0 0 rgb(255 255 255 / 0.92)',
        'inset-well':
          'inset 0 3px 8px rgb(15 23 42 / 0.08), inset 0 -1px 0 rgb(255 255 255 / 0.7)',
        field:
          'inset 0 2px 5px rgb(15 23 42 / 0.08), 0 1px 0 0 rgb(255 255 255 / 0.98)',
        card:
          '0 1px 0 0 rgb(255 255 255 / 0.98) inset, 0 -1px 0 0 rgb(15 23 42 / 0.05) inset, 0 2px 0 0 rgb(203 213 225), 0 16px 32px -12px rgb(15 23 42 / 0.2), 0 6px 14px -6px rgb(15 23 42 / 0.12)',
        'card-hover':
          '0 1px 0 0 rgb(255 255 255 / 0.98) inset, 0 -1px 0 0 rgb(15 23 42 / 0.04) inset, 0 4px 0 0 rgb(186 230 253), 0 28px 50px -16px rgb(15 23 42 / 0.28), 0 12px 22px -8px rgb(14 165 233 / 0.18)',
        'nav-bar':
          '0 1px 0 0 rgb(255 255 255 / 0.98) inset, 0 3px 0 0 rgb(226 232 240), 0 18px 36px -12px rgb(15 23 42 / 0.2)',
        'btn-primary':
          '0 1px 0 0 rgb(255 255 255 / 0.32) inset, 0 4px 0 0 rgb(7 89 133), 0 12px 22px -6px rgb(2 132 199 / 0.5)',
        'btn-primary-active':
          '0 1px 0 0 rgb(255 255 255 / 0.18) inset, 0 1px 0 0 rgb(7 89 133), 0 4px 10px -3px rgb(2 132 199 / 0.35)',
        'btn-danger':
          '0 1px 0 0 rgb(255 255 255 / 0.28) inset, 0 4px 0 0 rgb(127 29 29), 0 12px 22px -6px rgb(220 38 38 / 0.45)',
        'btn-danger-active':
          '0 1px 0 0 rgb(255 255 255 / 0.16) inset, 0 1px 0 0 rgb(127 29 29), 0 4px 10px -3px rgb(220 38 38 / 0.3)',
        'btn-outline':
          '0 1px 0 0 rgb(255 255 255 / 0.95) inset, 0 3px 0 0 rgb(203 213 225), 0 10px 18px -8px rgb(15 23 42 / 0.16)',
        'btn-outline-active':
          '0 1px 0 0 rgb(255 255 255 / 0.9) inset, 0 1px 0 0 rgb(203 213 225), 0 3px 8px -3px rgb(15 23 42 / 0.1)',
        'btn-secondary':
          '0 1px 0 0 rgb(255 255 255 / 0.8) inset, 0 3px 0 0 rgb(203 213 225), 0 8px 14px -6px rgb(15 23 42 / 0.12)',
        'chip-icon':
          '0 1px 0 0 rgb(255 255 255 / 0.9) inset, 0 2px 0 0 rgb(203 213 225), 0 4px 8px -2px rgb(15 23 42 / 0.16)',
        orb:
          'inset 0 -5px 10px rgb(15 23 42 / 0.12), inset 0 3px 6px rgb(255 255 255 / 0.85), 0 10px 18px -6px rgb(15 23 42 / 0.22)',
        sheet:
          '0 1px 0 0 rgb(255 255 255 / 0.9) inset, 0 18px 50px -12px rgb(15 23 42 / 0.28), 0 8px 20px -8px rgb(15 23 42 / 0.12)',
        'nav-pill-active':
          '0 1px 0 0 rgb(255 255 255 / 0.95) inset, 0 2px 0 0 rgb(186 230 253), 0 6px 12px -4px rgb(14 165 233 / 0.28)',
        'nav-pill-hover':
          '0 1px 0 0 rgb(255 255 255 / 0.9) inset, 0 2px 0 0 rgb(226 232 240), 0 6px 12px -4px rgb(15 23 42 / 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'auth-glow': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'auth-glow': 'auth-glow 8s ease-in-out infinite',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
