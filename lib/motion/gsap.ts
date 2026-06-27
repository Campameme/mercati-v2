// Registrazione centralizzata di GSAP + plugin.
// Importa SEMPRE gsap da qui (non da 'gsap') così i plugin sono registrati.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip)
}

export { gsap, ScrollTrigger, Flip }
