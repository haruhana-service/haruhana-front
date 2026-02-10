/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        haru: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#ccd8ff',
          300: '#99b3ff',
          400: '#668cff',
          500: '#4a69ff', // Primary - Vibrant Blue
          600: '#3c58ff',
          700: '#2e44cc',
          800: '#1e2c85',
          900: '#1a1f36', // Deep Navy
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
