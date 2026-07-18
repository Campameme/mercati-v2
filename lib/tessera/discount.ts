// Lo sconto della tessera è funzione dei punti raccolti. I punti si guadagnano
// comprando dai banchi: 1 € = 10 punti. Le soglie sono i tagli "×10" richiesti
// dal proprietario: 5.000 / 10.000 / 15.000 / 20.000 punti (cioè 500 / 1.000 /
// 1.500 / 2.000 € di spesa) → 5 / 10 / 15 / 20 %. Cap al 20 %.

export const EURO_TO_POINTS = 10

export interface DiscountTier {
  points: number // soglia minima in punti
  percent: number // sconto al banco
}

export const DISCOUNT_TIERS: DiscountTier[] = [
  { points: 5000, percent: 5 },
  { points: 10000, percent: 10 },
  { points: 15000, percent: 15 },
  { points: 20000, percent: 20 },
]

export interface DiscountStatus {
  percent: number // sconto attuale (0 se sotto la prima soglia)
  current: DiscountTier | null // scaglione raggiunto
  next: DiscountTier | null // prossimo scaglione (null se al massimo)
  toNext: number // punti mancanti al prossimo scaglione (0 se al massimo)
  progress: number // 0..1 avanzamento verso il prossimo scaglione
}

/** Stato sconto per un dato saldo punti. */
export function discountFor(balance: number): DiscountStatus {
  const b = Math.max(0, Math.floor(balance || 0))
  let current: DiscountTier | null = null
  for (const t of DISCOUNT_TIERS) if (b >= t.points) current = t
  const next = DISCOUNT_TIERS.find((t) => t.points > b) ?? null
  const floor = current?.points ?? 0
  const ceil = next?.points ?? floor
  const progress = next ? Math.min(1, Math.max(0, (b - floor) / (ceil - floor))) : 1
  return {
    percent: current?.percent ?? 0,
    current,
    next,
    toNext: next ? next.points - b : 0,
    progress,
  }
}

/** Punti corrispondenti a un importo in centesimi (1 € = 10 punti, euro arrotondati). */
export function pointsForCents(amountCents: number): number {
  return Math.round(amountCents / 100) * EURO_TO_POINTS
}
