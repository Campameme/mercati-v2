// Ondina calligrafica di divisione: un tratto che scorre piano, come il mare
// visto dai banchi. Usa .imk-wave-divider (globals.css): l'SVG è largo il
// doppio e trasla del 50%, quindi il motivo deve ripetersi esattamente a metà.
// Colore via currentColor (es. className="text-alga/40").
//
// Due modalità:
//  - default (tratto): una linea d'onda che scorre — decoro.
//  - fill: un'onda PIENA (currentColor = colore della sezione SUCCESSIVA) che
//    sale dal bordo, così la prossima sezione sembra "fondersi" in questa.
//    L'onda va messa in fondo alla sezione corrente con la stessa tinta del
//    blocco che introduce.

// Mezza onda ogni 60px: 24 mezze onde = 1440px, ripetute due volte (2880).
const WAVE_STROKE = 'M0 13 q30 -10 60 0' + ' t60 0'.repeat(47)
// Onda piena: parte dal basso, sale con le creste, richiude in basso.
const WAVE_FILL = 'M0 24 L0 13 q30 -12 60 0' + ' t60 0'.repeat(47) + ' L2880 24 Z'

export default function WaveDivider({ className = '', fill = false }: { className?: string; fill?: boolean }) {
  return (
    <span aria-hidden="true" className={`imk-wave-divider ${fill ? 'is-fill' : ''} ${className}`}>
      <svg viewBox="0 0 2880 24" preserveAspectRatio="none" fill="none">
        {fill ? (
          <path d={WAVE_FILL} fill="currentColor" />
        ) : (
          <path d={WAVE_STROKE} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        )}
      </svg>
    </span>
  )
}
