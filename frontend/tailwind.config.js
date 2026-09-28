/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#F8FAFC',
          stone: '#F1F5F9',
          card: '#FFFFFF',
          border: '#E2E8F0',
          darkBg: '#0B0F19',
          darkSurface: '#111827',
          darkElevated: '#1F2937',
          darkBorder: '#374151',
        },
        ink: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
          darkPrimary: '#F8FAFC',
          darkSecondary: '#CBD5E1',
        },
        terracotta: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          dark: '#3B82F6',
        },
        tealbrand: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          light: '#F0FDFA',
        },
        goldbrand: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
        },
        forest: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
        },
        brick: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
        data: ['"Space Grotesk"', 'Inter', 'monospace', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
