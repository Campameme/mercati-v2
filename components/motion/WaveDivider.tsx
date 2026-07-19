// Divisore d'onda tra due sezioni.
//
//  - fill (default per il "merge"): un'onda PIENA e LIQUIDA a due strati che si
//    deforma lentamente (morph CSS della `d`, non uno scorrimento).
//    currentColor = tinta della sezione SUCCESSIVA, così il blocco dopo sembra
//    salire e fondersi in questo. Il path retrostante (opacità ridotta) ha
//    profilo, fase e durata diversi: dà la profondità dell'acqua. Va messa in
//    fondo alla sezione corrente. Reduced-motion: entrambe le onde si fermano
//    sulla forma d'appoggio (il path scritto nell'attributo `d`).
//  - stroke: una linea d'onda che scorre — decoro leggero, non merge.
//
// Le forme del morph vivono in globals.css (@keyframes imk-wave-morph e
// imk-wave-morph-back, 4 forme chiave ciascuna); i path qui sotto sono le
// forme-base (fallback + reduced-motion). Le anse sono volutamente IRREGOLARI
// (ampiezze e larghezze diverse): deve sembrare liquido, non un pattern.

const WAVE_STROKE = 'M0 13 q30 -10 60 0' + ' t60 0'.repeat(47)
// Forma-base dell'onda piena in primo piano (coincide col keyframe 0%).
const WAVE_FILL_BASE =
  'M0,70 C120,30 260,22 420,52 C560,78 640,96 800,66 C930,42 1010,26 1140,44 C1240,58 1330,84 1440,58 L1440,120 L0,120 Z'
// Forma-base dell'onda retrostante (keyframe 0% di imk-wave-morph-back).
const WAVE_FILL_BACK =
  'M0,40 C160,74 320,90 480,64 C640,38 760,18 920,40 C1060,58 1160,82 1280,66 C1360,54 1400,36 1440,32 L1440,120 L0,120 Z'

export default function WaveDivider({ className = '', fill = false }: { className?: string; fill?: boolean }) {
  if (fill) {
    return (
      <span aria-hidden="true" className={`imk-wave-divider is-fill ${className}`}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none">
          {/* strato retrostante: stessa acqua, mezza opacità, altro ritmo */}
          <path className="imk-wave-fluid-back" d={WAVE_FILL_BACK} fill="currentColor" opacity="0.45" />
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
