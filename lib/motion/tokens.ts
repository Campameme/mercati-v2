// Token di motion "Mercati di Ponente" — nomi nostri, valori unici.
// Vedi docs/brand-system.md §7.3.

export const DUR = {
  fast: 0.25,
  base: 0.5,
  slow: 0.8,
  scena: 1.1,
} as const

export const EASE = {
  onda: 'power3.out', // reveal / ingressi
  molla: 'back.out(1.6)', // "Sbocciare" (overshoot morbido)
  approdo: 'elastic.out(1, 0.5)', // pin che atterrano
  luce: 'power2.inOut', // transizioni / luce
  vela: 'power4.out', // pannelli che scivolano
} as const

/** True se l'utente ha chiesto meno movimento (o siamo lato server). */
export function prefersReduced(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}
