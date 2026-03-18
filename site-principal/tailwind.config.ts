import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        primary: "#0A1B5C",
        secondary: "#00BFFF",
        bg: "#F5F5F7",
        "bg-alt": "#FFFFFF",
        text: "#0A1B3D",
        "text-muted": "#64748B",
        "card-border": "#E2E8F0",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #0A1B5C 0%, #0E2878 25%, #1440A0 50%, #0090D9 75%, #00BFFF 100%)',
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
};
export default config;
