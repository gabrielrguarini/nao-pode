/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '3xl-fluid': 'clamp(1.875rem, 4vw, 2.5rem)',
        '4xl-fluid': 'clamp(2rem, 5vw, 3rem)',
        '6xl-fluid': 'clamp(2.5rem, 10vw, 6rem)',
      }
    },
  },
  plugins: [],
}
