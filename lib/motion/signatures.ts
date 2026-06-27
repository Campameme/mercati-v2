// Animazioni "firmate" riusabili — vedi docs/brand-system.md §7.4.
// Tutte: no-op sotto reduced-motion, cleanup-friendly (ritornano il tween),
// transform/opacity only, clearProps per non lasciare stato sporco.

import { gsap } from './gsap'
import { DUR, EASE, prefersReduced } from './tokens'

type Targets = gsap.TweenTarget

/** Onda — reveal a cascata (liste/griglie). Usare con ScrollTrigger a monte. */
export function onda(targets: Targets, vars: gsap.TweenVars = {}) {
  if (prefersReduced()) return
  return gsap.from(targets, {
    y: 18,
    opacity: 0,
    duration: DUR.base,
    ease: EASE.onda,
    stagger: 0.06,
    clearProps: 'transform,opacity',
    ...vars,
  })
}

/** Sbocciare — ingresso con micro-overshoot (card, badge, pin). */
export function sbocciare(targets: Targets, vars: gsap.TweenVars = {}) {
  if (prefersReduced()) return
  return gsap.from(targets, {
    scale: 0.92,
    opacity: 0,
    transformOrigin: '50% 60%',
    duration: DUR.base,
    ease: EASE.molla,
    clearProps: 'transform,opacity',
    ...vars,
  })
}

/**
 * Vela — pannello/card che scivola dentro IN SICUREZZA: offset PICCOLO, mai
 * fuori schermo, clearProps a fine (vedi regola d'oro §7.1).
 */
export function vela(target: Targets, opts: { from?: 'right' | 'bottom' } = {}, vars: gsap.TweenVars = {}) {
  if (prefersReduced()) return
  const from = opts.from ?? 'right'
  return gsap.from(target, {
    x: from === 'right' ? 60 : 0,
    y: from === 'bottom' ? 60 : 0,
    duration: DUR.base,
    ease: EASE.vela,
    clearProps: 'transform',
    ...vars,
  })
}

/** Cinetica — titolo che si svela a maschera dal basso (split a parole/righe). */
export function cinetica(words: Targets, vars: gsap.TweenVars = {}) {
  if (prefersReduced()) return
  return gsap.from(words, {
    yPercent: 115,
    rotate: 3,
    stagger: 0.05,
    duration: DUR.slow,
    ease: EASE.molla,
    clearProps: 'transform',
    ...vars,
  })
}

/** Approdo — pin che atterrano elastici (mappa). */
export function approdo(pins: Targets, vars: gsap.TweenVars = {}) {
  if (prefersReduced()) return
  return gsap.from(pins, {
    y: -46,
    opacity: 0,
    duration: DUR.scena,
    ease: EASE.approdo,
    stagger: { each: 0.05, from: 'random' },
    ...vars,
  })
}

/** Count-up firmato per i numeri (es. "N aperti adesso"). */
export function contaSu(value: number, onUpdate: (n: number) => void) {
  if (prefersReduced()) {
    onUpdate(value)
    return
  }
  const obj = { v: 0 }
  return gsap.to(obj, {
    v: value,
    duration: DUR.slow,
    ease: EASE.luce,
    snap: { v: 1 },
    onUpdate: () => onUpdate(Math.round(obj.v)),
  })
}
