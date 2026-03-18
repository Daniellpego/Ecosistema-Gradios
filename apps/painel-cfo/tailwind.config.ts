import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#FFFFFF',
          sidebar: '#F8FAFC',
          card: '#FFFFFF',
          hover: '#F1F5F9',
          input: '#F8FAFC',
        },
        brand: {
          blue: '#0A1B5C',
          cyan: '#00BFFF',
          'cyan-light': '#33CCFF',
          'cyan-lighter': '#66D9FF',
          'blue-secondary': '#14298A',
          'blue-deep': '#06103D',
        },
        status: {
          positive: '#10B981',
          negative: '#EF4444',
          warning: '#F59E0B',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [],
}
export default config
