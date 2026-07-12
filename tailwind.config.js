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
        // BRAND "I Mercati della Riviera dei Fiori" — palette MEZZOGIORNO
        // (docs/brand-system.md): crema fondo · alga istituzionale ·
        // terracotta azione · limone terza voce calda.
        // ============================================================
        crema: { DEFAULT: '#FBF6EC', 2: '#F3EBDA' },
        alga: { DEFAULT: '#46683B', 600: '#35502C', 50: '#E4EBDF' },
        terracotta: { DEFAULT: '#C4593C', 600: '#9A4029', 50: '#F4E0D8' },
        limone: { DEFAULT: '#EAC54F', 700: '#7A611A' },

        // --- token del sistema precedente (pagine non ancora migrate) ---
        carta: '#F7EFDD',
        marel: '#DCEBEC', // mare chiaro (sfondi)
        notte: '#0E3040',
        ink: { DEFAULT: '#26241E', soft: '#55503F', muted: '#8A8275' },
        mare: { DEFAULT: '#15607C', 400: '#2E84A3', 600: '#114F66', 700: '#0E3F52' },
        sole: { DEFAULT: '#F4B62C', 600: '#D69A12' },
        fiore: { DEFAULT: '#EC6A5E', 100: '#FBE0D9', 600: '#D24B3F' },
      },
      fontFamily: {
        // Sistema a due caratteri (Nodo × Mezzogiorno): display = Bricolage
        // Grotesque (800 sui titoli, tracking stretto), tutto il resto Figtree.
        // Caveat resta mappato solo per le pagine non ancora migrate.
        sans: ['var(--font-alt)', 'system-ui', 'sans-serif'],
        alt: ['var(--font-alt)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Bricolage Grotesque', 'system-ui', 'sans-serif'],
        serif: ['var(--font-display)', 'Bricolage Grotesque', 'system-ui', 'sans-serif'],
        accent: ['var(--font-hand)', 'cursive'],
        hand: ['var(--font-hand)', 'cursive'],
      },
      letterSpacing: {
        'widest-plus': '0.22em',
      },
    },
  },
  plugins: [],
}
