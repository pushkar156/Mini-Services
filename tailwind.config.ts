import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#121315",
        "surface-dim": "#121315",
        "surface-bright": "#38393b",
        "surface-container-lowest": "#0d0e10",
        "surface-container-low": "#1b1c1e",
        "surface-container": "#1f2022",
        "surface-container-high": "#292a2c",
        "surface-container-highest": "#343537",
        "on-surface": "#e3e2e5",
        "on-surface-variant": "#ccc6bc",
        "outline": "#969087",
        "outline-variant": "#4a463f",
        "primary": "#cdc6bb",
        "on-primary": "#343028",
        "primary-container": "#9e988e",
        "secondary": "#c4c6ce",
        "secondary-container": "#464950",
        "tertiary": "#c3c7ce",
        // Distinct Craft Muted Accents (Strictly non-vibrant)
        "craft-platinum": "#9E988E",
        "craft-amber": "#C89B6D",
        "craft-stone": "#A89F91",
        "craft-blueprint": "#7289A5",
        "craft-cashmere": "#C2B4A3",
        "craft-glacier": "#688B9A",
        "craft-silver": "#B0A89F",
      },
      fontFamily: {
        "headline-md": ["var(--font-syne)", "sans-serif"],
        "headline-lg": ["var(--font-syne)", "sans-serif"],
        "display-lg": ["var(--font-syne)", "sans-serif"],
        "body-sm": ["var(--font-space-grotesk)", "sans-serif"],
        "body-lg": ["var(--font-space-grotesk)", "sans-serif"],
        "title-md": ["var(--font-space-grotesk)", "sans-serif"],
        "mono-metric": ["var(--font-jetbrains-mono)", "monospace"],
        "label-caps": ["var(--font-jetbrains-mono)", "monospace"],
        "serif-news": ["var(--font-newsreader)", "serif"],
        "serif-brand": ["var(--font-italiana)", "serif"],
      },
      fontSize: {
        "label-caps": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em", fontWeight: "500" }],
        "mono-metric": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-sm": ["0.875rem", { lineHeight: "1.375rem", letterSpacing: "0", fontWeight: "400" }],
        "body-lg": ["1rem", { lineHeight: "1.5rem", letterSpacing: "0", fontWeight: "400" }],
        "title-md": ["1.125rem", { lineHeight: "1.625rem", letterSpacing: "-0.01em", fontWeight: "500" }],
        "headline-md": ["1.375rem", { lineHeight: "1.875rem", letterSpacing: "-0.015em", fontWeight: "500" }],
        "headline-lg": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em", fontWeight: "600" }],
        "display-lg": ["3rem", { lineHeight: "3.5rem", letterSpacing: "-0.03em", fontWeight: "700" }],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.25rem",
        xl: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
