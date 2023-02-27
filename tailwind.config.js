/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        consolas: ['consolas', 'ui-monospace']
      },
      screens: {
        sm: { max: '768px' },
        md: { min: '768px' },
        lg: { min: '1024px' },
        xl: { min: '1280px' },
        '2xl': { min: '1556px' },
      }
    }
  },
  plugins: [],
}