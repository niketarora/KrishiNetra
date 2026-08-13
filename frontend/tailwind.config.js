/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: "#0d1b14",
        forest: {
          50: "#eef6f0",
          100: "#d6ebdd",
          600: "#1f7a4d",
          700: "#15603b",
          800: "#124b30",
          900: "#0f3d27",
        },
        charcoal: "#141a26",
        slatebg: "#f5f8f6",
        ocean: "#1e63b3",
      },
    },
  },
  plugins: [],
};
