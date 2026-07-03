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
        },
      },
    },
  },
  plugins: [],
};

export default config;
