/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'omnigray': '#0f172a',
        'omniblue': '#0ea5e9',
      },
    },
  },
  plugins: [],
}

