import type { Config } from 'tailwindcss';
import preset from '@gradios/tailwind-config';

const config: Config = {
  presets: [preset],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      colors: {
        // Identidade visual específica do site institucional (distinta dos
        // painéis CFO/CRM/CTO). Override pontual sobre o preset.
        primary: '#2546BD',
        secondary: '#00BFFF',
        bg: '#F5F5F7',
        'bg-alt': '#FFFFFF',
        text: '#0A1B3D',
        'text-muted': '#64748B',
        'card-border': '#E2E8F0',
      },
      backgroundImage: {
        'gradient-primary':
          'linear-gradient(90deg, #2546BD 0%, #1E3FA8 25%, #1856C0 50%, #0090D9 75%, #00BFFF 100%)',
      },
      borderRadius: {
        card: '16px',
        pill: '9999px',
      },
    },
  },
};

export default config;
