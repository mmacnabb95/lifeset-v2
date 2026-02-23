import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lifeset: {
          primary: "var(--lifeset-primary)",
          "primary-light": "var(--lifeset-primary-light)",
          "primary-dark": "var(--lifeset-primary-dark)",
          teal: "var(--lifeset-teal)",
          "teal-light": "var(--lifeset-teal-light)",
          accent: "var(--lifeset-accent)",
          bg: "var(--lifeset-bg)",
          sidebar: "var(--lifeset-sidebar)",
        },
      },
    },
  },
  plugins: [],
};
export default config;

