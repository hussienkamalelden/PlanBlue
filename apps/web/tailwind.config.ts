import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4389F7',
          accent: '#0362C1',
          secondary: '#F7B90C',
          red: '#E42932',
          orange: '#D68527',
          warm: '#EFBB72',
          light: '#E9E4DF',
          green: '#2A6E42',
          silver: '#94A3B8',
        },
      },
      keyframes: {
        "pb-spinner": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "pb-spinner": "pb-spinner 1s linear infinite",
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'Cairo', 'var(--font-nunito)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
