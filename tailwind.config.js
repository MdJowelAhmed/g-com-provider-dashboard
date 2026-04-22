/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#a0522d',
          hover: '#b5612f',
          ring: '#c2772f',
          soft: '#3a2218',
        },
        surface: {
          page: '#121214',
          sidebar: '#19191b',
          card: '#242429',
          elevated: '#2a2a30',
          input: '#ffffff',
          border: '#2e2e34',
        },
        accent: {
          amber: '#d9a441',
          cream: '#f5ebdb',
          success: '#22c55e',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
