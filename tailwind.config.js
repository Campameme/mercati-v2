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
        // BRAND "Mercati della Riviera di Ponente" (provincia di Imperia)
        // Palette coerente: Mare (primario) · Sole (oggi/aperto) ·
        // Fiore (accento) · Carta · Inchiostro. Niente verde generico.
        // ============================================================
        carta: '#F7EFDD',
        marel: '#DCEBEC', // mare chiaro (sfondi)
        notte: '#0E3040',
        ink: { DEFAULT: '#1A1714', soft: '#4A4438', muted: '#8A8275' },
        mare: { DEFAULT: '#15607C', 400: '#2E84A3', 600: '#114F66', 700: '#0E3F52' },
        sole: { DEFAULT: '#F4B62C', 600: '#D69A12' },
        fiore: { DEFAULT: '#EC6A5E', 100: '#FBE0D9', 600: '#D24B3F' },

        // Gli alias legacy (paper, night, cream, primary) sono stati migrati
        // ai token canonici e rimossi il 2026-07-03. Usare SOLO i token sopra.
      },
      fontFamily: {
        // Sistema a due caratteri: titolo = Italiana (display/serif, solo 400),
        // tutto il resto = Figtree (sans/alt/accent), gerarchia via pesi.
        sans: ['var(--font-alt)', 'system-ui', 'sans-serif'],
        alt: ['var(--font-alt)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Italiana', 'Georgia', 'serif'],
        serif: ['var(--font-display)', 'Italiana', 'Georgia', 'serif'],
        accent: ['var(--font-alt)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-plus': '0.22em',
      },
    },
  },
  plugins: [],
}
