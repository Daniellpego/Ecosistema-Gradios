import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      'xs': '380px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        bg: {
          base: '#FFFFFF',
          sidebar: '#F8FAFC',
          card: '#FFFFFF',
          hover: '#F1F5F9',
          input: '#F8FAFC',
          navy: '#0A1628',
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
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 191, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 191, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
