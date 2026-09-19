import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)", ink: "var(--ink)", muted: "var(--muted)", line: "var(--line)", paper: "var(--paper)", yellow: "var(--yellow)", coral: "var(--coral)", lime: "var(--lime)", lilac: "var(--lilac)",
      },
      fontFamily: { display: ["var(--font-space-grotesk)"], body: ["var(--font-plus-jakarta-sans)"] },
      boxShadow: { tactile: "3px 3px 0 var(--ink)", "tactile-sm": "1px 1px 0 var(--ink)" },
    },
  },
  plugins: [],
};

export default config;
