/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0a0f1c",
        surface: "#0f1830",
        "surface-2": "#121a2e",
        brd: "#1d2942",
        ink: "#e6edf7",
        muted: "#93a4c4",
        cyan: "#2dd4ff",
        magenta: "#ff4ecd",
        correct: "#06d6a0",
        incorrect: "#ff4d6d",
      },
      opacity: {
        15: "0.15",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-cyan": "0 0 10px rgba(45,212,255,.45), inset 0 0 8px rgba(45,212,255,.12)",
        "glow-magenta": "0 0 14px rgba(255,78,205,.55), inset 0 0 8px rgba(255,78,205,.15)",
        "glow-green": "0 0 12px rgba(6,214,160,.5)",
        "glow-red": "0 0 12px rgba(255,77,109,.5)",
      },
      keyframes: {
        "buzz-glow": {
          "0%,100%": { boxShadow: "0 0 14px rgba(255,78,205,.45)" },
          "50%": { boxShadow: "0 0 26px rgba(255,78,205,.85)" },
        },
      },
      animation: {
        "buzz-glow": "buzz-glow 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
