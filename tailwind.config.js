/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        botani: {
          bg: '#F6F1E7',
          surface: '#FBF8F2',
          text: '#1E1E1B',
          muted: '#5B5B55',
          green: '#5E7C5A',
          'green-dark': '#3F5C3B',
          border: '#E4DDD0',
          success: '#4F7A4F',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(30, 30, 27, 0.05)',
        elevated: '0 12px 32px -4px rgba(30, 30, 27, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
