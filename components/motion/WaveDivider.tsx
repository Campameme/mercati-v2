// Ondina calligrafica di divisione: un tratto che scorre piano, come il mare
// visto dai banchi. Usa .imk-wave-divider (globals.css): l'SVG è largo il
// doppio e trasla del 50%, quindi il motivo deve ripetersi esattamente a metà.
// Colore via currentColor (es. className="text-alga/40").

// Mezza onda ogni 60px: 24 mezze onde = 1440px, ripetute due volte (2880).
const WAVE_D = 'M0 13 q30 -10 60 0' + ' t60 0'.repeat(47)

export default function WaveDivider({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`imk-wave-divider ${className}`}>
      <svg viewBox="0 0 2880 24" preserveAspectRatio="none" fill="none">
        <path d={WAVE_D} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}
