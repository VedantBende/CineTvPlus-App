/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          black: '#0f0f0f',
          gray: '#2F2F2F',
        },
        accent: {
          red: '#e60a15',
        }
      },
      fontFamily: {
        sans: ['"Lexend"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
