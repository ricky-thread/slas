/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6faf6',
          100: '#CCF1EB',
          200: '#99E4D6',
          300: '#66D6C2',
          400: '#33C9AD',
          500: '#00BB99',
          600: '#00967A',
          700: '#00705C',
          800: '#004B3D',
          900: '#00251F',
        },
        // Merlin semantic tokens
        content: {
          primary:   '#161618',
          secondary: '#605f68',
          tertiary:  '#7e7d86',
          placeholder: '#a09fa6',
        },
        bg: {
          secondary: '#faf9f6',
        },
        surface: {
          card: '#ffffff',
        },
        border: {
          primary:  '#dedee0',
          secondary: '#cfced4',
          card:     '#e9e9eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['13px', { lineHeight: '1.55' }],
      },
    },
  },
  plugins: [],
}
