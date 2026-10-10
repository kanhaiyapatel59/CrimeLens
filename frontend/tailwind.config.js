/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: '#E8ECF3',
          surface: '#E8ECF3',
          primary: '#356AE6',
          secondary: '#5C85F7',
          success: '#239B62',
          warning: '#D99118',
          danger: '#D94F55',
          text: '#202A3A',
          muted: '#8893A4',
          divider: '#D7DDE7',
          shadowLight: '#FFFFFF',
          shadowDark: '#C7CDD7',
        },
        primary: {
          50: '#eef3fe',
          100: '#d7e2fc',
          200: '#b4c9fa',
          300: '#86a8f7',
          400: '#5c85f7',
          500: '#356ae6',
          600: '#254ebf',
          700: '#1e3e9d',
          800: '#1b357e',
          900: '#1b2f67',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'neu-raised': '7px 7px 16px #C7CDD7, -7px -7px 16px #FFFFFF',
        'neu-raised-sm': '4px 4px 10px #C7CDD7, -4px -4px 10px #FFFFFF',
        'neu-inset': 'inset 4px 4px 8px #C7CDD7, inset -4px -4px 8px #FFFFFF',
        'neu-inset-sm': 'inset 2px 2px 5px #CBD1DB, inset -2px -2px 5px #FFFFFF',
      },
    },
  },
  plugins: [],
}