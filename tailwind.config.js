/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette Ligure
        cream: {
          50:  '#FCFAF5',
          100: '#F7F2E7',
          200: '#EDE4CE',
          300: '#E1D5B5',
        },
        ink: {
          DEFAULT: '#1F2813', // olive-black per testo
          soft: '#4A4F3B',
          muted: '#7A7968',
        },
        olive: {
          100: '#EAEDDA',
          400: '#8FA05A',
          500: '#6B7F3A',
          600: '#54662B',
          700: '#3E4C1F',
        },
        sea: {
          100: '#DCEAF0',
          500: '#2A5A75',
          600: '#1F4A62',
        },
        terra: {
          100: '#F4DFD4',
          500: '#B75A40',
          600: '#9A4733',
        },
        // retrocompat
        primary: {
          50:  '#FCFAF5',
          100: '#F7F2E7',
          200: '#EAEDDA',
          300: '#E1D5B5',
          400: '#8FA05A',
          500: '#6B7F3A',
          600: '#54662B',
          700: '#3E4C1F',
          800: '#2B3520',
          900: '#1F2813',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Fraunces', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'widest-plus': '0.22em',
      },
    },
  },
  plugins: [],
}
