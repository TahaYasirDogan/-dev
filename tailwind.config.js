/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
          animation: {
            'fade-in-up': 'fadeInUp 2s ease-out forwards',
          },
          keyframes: {
            fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(10px)' },
              '50%': { opacity: '1', transform: 'translateY(0)' },
              '100%': { opacity: '0', transform: 'translateY(-10px)' },
            },
          },
        },
      },
    plugins: [require('@tailwindcss/typography')],
  }
  