import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#040814",
          900: "#060B19",
          800: "#0A1A2C",
          700: "#0F172A",
        },
        brand: {
          green: "#4ADE80",
          teal: "#5EEAD4",
          cyan: "#22D3EE",
          blue: "#60A5FA",
          navy: "#3B4FD8",
        },
        text: {
          DEFAULT: "#E6EDF7",
          muted: "#A9B6CA",
          faint: "#8A99AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        site: "1600px",
      },
    },
  },
  plugins: [],
};

export default config;
