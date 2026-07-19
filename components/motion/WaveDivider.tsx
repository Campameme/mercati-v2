// Divisore d'onda tra due sezioni.
//
//  - fill (default per il "merge"): un'onda PIENA e LIQUIDA che si deforma
//    lentamente (morph CSS della `d`, non uno scorrimento). currentColor = tinta
//    della sezione SUCCESSIVA, così il blocco dopo sembra salire e fondersi in
//    questo. Va messa in fondo alla sezione corrente. Reduced-motion: l'onda si
//    ferma su una forma d'appoggio (il path scritto nell'attributo `d`).
//  - stroke: una linea d'onda che scorre — usata come cornice del video hero
//    (classe .imk-vwave). Decoro, non merge.
//
// Le tre forme del morph vivono in globals.css (@keyframes imk-wave-morph);
// il path qui sotto è la forma-base (fallback + reduced-motion).

const WAVE_STROKE = 'M0 13 q30 -10 60 0' + ' t60 0'.repeat(47)
// Forma-base dell'onda piena (coincide col keyframe 0% in globals.css).
const WAVE_FILL_BASE =
  'M0,28 C180,14 300,14 480,30 C660,44 780,44 960,28 C1140,14 1260,16 1440,30 L1440,60 L0,60 Z'

export default function WaveDivider({ className = '', fill = false }: { className?: string; fill?: boolean }) {
  if (fill) {
    return (
      <span aria-hidden="true" className={`imk-wave-divider is-fill ${className}`}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" fill="none">
          <path className="imk-wave-fluid" d={WAVE_FILL_BASE} fill="currentColor" />
        </svg>
      </span>
    )
  }
  return (
    <span aria-hidden="true" className={`imk-wave-divider ${className}`}>
      <svg viewBox="0 0 2880 24" preserveAspectRatio="none" fill="none">
        <path d={WAVE_STROKE} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}
