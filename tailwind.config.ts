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
      },
      boxShadow: {
        'inset-highlight': 'inset 0 1px 0 0 rgb(255 255 255 / 0.92)',
        'inset-well':
          'inset 0 2px 4px rgb(15 23 42 / 0.05), inset 0 -1px 0 rgb(15 23 42 / 0.04)',
        field:
          'inset 0 1px 3px rgb(15 23 42 / 0.05), 0 1px 0 0 rgb(255 255 255 / 0.98)',
        card: '0 1px 0 0 rgb(255 255 255 / 0.95) inset, 0 4px 18px -4px rgb(15 23 42 / 0.11), 0 2px 8px -2px rgb(15 23 42 / 0.07)',
        'card-hover':
          '0 1px 0 0 rgb(255 255 255 / 0.95) inset, 0 16px 36px -10px rgb(15 23 42 / 0.16), 0 8px 16px -4px rgb(15 23 42 / 0.1)',
        'nav-bar':
          '0 1px 0 0 rgb(255 255 255 / 0.95) inset, 0 10px 28px -8px rgb(15 23 42 / 0.12), 0 4px 12px -4px rgb(15 23 42 / 0.08)',
        'btn-primary': '0 2px 0 0 rgb(7 89 133), 0 6px 18px -4px rgb(2 132 199 / 0.42)',
        'btn-danger': '0 2px 0 0 rgb(127 29 29), 0 6px 18px -4px rgb(220 38 38 / 0.38)',
        'btn-outline':
          '0 1px 0 0 rgb(255 255 255 / 0.9) inset, 0 2px 8px -2px rgb(15 23 42 / 0.09)',
        'btn-secondary':
          '0 1px 0 0 rgb(255 255 255 / 0.75) inset, 0 2px 6px -2px rgb(15 23 42 / 0.07)',
        'chip-icon': '0 1px 0 0 rgb(255 255 255 / 0.85) inset, 0 2px 5px -1px rgb(15 23 42 / 0.12)',
        sheet: '0 12px 40px -8px rgb(15 23 42 / 0.2), 0 4px 16px -4px rgb(15 23 42 / 0.08)',
        'nav-pill-active':
          '0 1px 0 0 rgb(255 255 255 / 0.9) inset, 0 2px 6px -2px rgb(14 165 233 / 0.18)',
        'nav-pill-hover':
          '0 1px 0 0 rgb(255 255 255 / 0.85) inset, 0 2px 6px -2px rgb(15 23 42 / 0.08)',
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
