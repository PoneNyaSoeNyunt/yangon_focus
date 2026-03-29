/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00A389',
          50:  '#e6f7f5',
          100: '#ccefe9',
          200: '#99dfd3',
          300: '#66cfbd',
          400: '#33bfa7',
          500: '#00A389',
          600: '#008f78',
          700: '#007a66',
          800: '#006554',
          900: '#005043',
        },
      },
    },
  },
  plugins: [],
}

