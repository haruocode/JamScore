import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f3ee",
        panel: "#fffdf9",
        ink: "#1f2937",
        accent: "#1d4ed8",
      },
    },
  },
  plugins: [],
};

export default config;
