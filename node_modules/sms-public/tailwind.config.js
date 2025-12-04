/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#06b6d4",   // cyan-500
        secondary: "#3b82f6", // blue-600
        accent: "#10b981"     // green-500
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.08)",  // custom soft shadow
        hover: "0 4px 12px rgba(0,0,0,0.15)", // hover shadow
      },
    },
  },
  plugins: [],
}
