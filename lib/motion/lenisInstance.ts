// Singleton dell'istanza Lenis (smooth-scroll globale). SmoothScroll la
// registra al mount; chi serve (nav a capitoli, intro che mette in pausa lo
// scroll) la legge da qui. null se reduced-motion / non montata.
import type Lenis from 'lenis'

let _lenis: Lenis | null = null

export function setLenis(l: Lenis | null) { _lenis = l }
export function getLenis(): Lenis | null { return _lenis }
