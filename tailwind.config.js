/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        determination: {
          red: '#ff2d20',
          orange: '#ff9a1a',
          yellow: '#facc15',
          black: '#111111'
        }
      },
      fontFamily: {
        retro: ['"Press Start 2P"', 'cursive'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif']
      }
    },
  },
  plugins: [],
};
