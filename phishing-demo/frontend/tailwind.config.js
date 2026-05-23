/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gmail: {
          red: "#d93025",
          blue: "#1a73e8",
          gray: "#f6f8fc",
          border: "#e0e0e0",
          text: "#202124",
          muted: "#5f6368",
        },
      },
    },
  },
  plugins: [],
};
