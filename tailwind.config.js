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
        // ============================================================
        // BRAND "Mercati di Ponente" — Riviera di Ponente (Imperia)
        // Palette coerente: Mare (primario) · Sole (oggi/aperto) ·
        // Fiore (accento) · Carta · Inchiostro. Niente verde generico.
        // ============================================================
        carta: '#F7EFDD',
        marel: '#DCEBEC', // mare chiaro (sfondi)
        notte: '#0E3040',
        ink: { DEFAULT: '#1A1714', soft: '#4A4438', muted: '#8A8275' },
        mare: { DEFAULT: '#15607C', 600: '#114F66', 700: '#0E3F52' },
        sole: { DEFAULT: '#F4B62C', 600: '#D69A12' },
        fiore: { DEFAULT: '#EC6A5E', 600: '#D24B3F' },

        // --- Alias legacy → rimappati alla nuova palette (deprecati,
        //     usare mare/sole/fiore/carta/notte nel codice nuovo) ---
        paper: '#F7EFDD',
        night: '#0E3040',
        pesto: { DEFAULT: '#15607C', 600: '#114F66', 700: '#0E3F52' },
        riviera: { DEFAULT: '#15607C', 600: '#114F66' },
        mimosa: { DEFAULT: '#F4B62C', 600: '#D69A12' },
        coral: { DEFAULT: '#EC6A5E', 600: '#D24B3F' },
        cream: { 50: '#FDF8EC', 100: '#F7EFDD', 200: '#EFE3C8', 300: '#E2D6BC' },
        olive: { 100: '#DCEBEC', 400: '#2E84A3', 500: '#15607C', 600: '#114F66', 700: '#0E3F52' },
        sea: { 100: '#DCEBEC', 500: '#15607C', 600: '#114F66' },
        terra: { 100: '#FBE0D9', 500: '#EC6A5E', 600: '#D24B3F' },
        primary: {
          50: '#EAF2F5', 100: '#DCEBEC', 200: '#B9D6DE', 300: '#8FBDCB',
          400: '#2E84A3', 500: '#15607C', 600: '#114F66', 700: '#0E3F52',
          800: '#0E3040', 900: '#0A2533',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Fraunces', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'Archivo Black', 'system-ui', 'sans-serif'],
        alt: ['var(--font-alt)', 'system-ui', 'sans-serif'],
        accent: ['var(--font-accent)', 'Comic Sans MS', 'cursive'],
      },
      letterSpacing: {
        'widest-plus': '0.22em',
      },
    },
  },
  plugins: [],
}
