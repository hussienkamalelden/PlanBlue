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
          primary: '#027DDA',
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
        "pb-letter": {
          "0%, 75%, 100%": { opacity: "0", transform: "rotateY(-90deg)" },
          "25%, 50%": { opacity: "1", transform: "rotateY(0deg)" },
        },
      },
      animation: {
        "pb-spinner": "pb-spinner 1s linear infinite",
        "pb-letter": "pb-letter 4s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
