/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./public/**/*.{php,html,js}",
    "./app/**/*.{php,js}"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          base: "#0B0E11",
          section: "#0F1216",
          card: "#141820",
          border: "#1F2430"
        },
        accent: {
          primary: "#3B82F6",
          secondary: "#06B6D4"
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}