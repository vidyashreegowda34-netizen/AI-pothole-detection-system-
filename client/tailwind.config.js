/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tumkur: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        civic: {
          primary: '#d97706', // Karnataka Amber / Gold
          secondary: '#1e3a8a', // Deep Administrative Navy
          accent: '#059669', // Civic Resolution Emerald
          danger: '#dc2626',
        }
      },
      fontFamily: {
        kannada: ['"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
