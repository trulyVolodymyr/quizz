/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#4b05ff',
          700: '#254d7a',
          600: '#2d6099',
        }
      }
    },
  },
  plugins: [],
}
