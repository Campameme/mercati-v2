export type ScheduleCategory = 'alimentare' | 'antiquariato' | 'artigianato' | 'varie'

/**
 * Classifica un mercato ricorrente in base al testo libero dei settori merceologici.
 * Regola: se la sessione contiene esplicitamente più macro-categorie (es. "alimentare + non alimentare")
 * si ricade su "varie" (la più generica). Antiquariato/artigianato prevalgono quando sono nomi
 * specifici. Altrimenti alimentare puro → alimentare.
 */
export function classifySchedule(settori: string | null | undefined): ScheduleCategory {
  if (!settori) return 'varie'
  const s = settori.toLowerCase()

  if (/antiquariat|collezion|\bvintage\b|brocante|vecchi oggetti/.test(s)) return 'antiquariato'
  if (/artigianat|opere dell'ingegn|\barte\b/.test(s)) return 'artigianato'

  // "non alimentare" / "merci varie" / "hobbysti" / "usato" indicano mix → varie
  if (/non aliment|merci varie|hobbyst|usato/.test(s)) return 'varie'

  if (/aliment|agricol|km\s*0|farmer/.test(s)) return 'alimentare'

  return 'varie'
}

export const CATEGORY_LABEL: Record<ScheduleCategory, string> = {
  alimentare:   'Alimentare · agricoli',
  antiquariato: 'Antiquariato',
  artigianato:  'Artigianato',
  varie:        'Merci varie',
}

/**
 * Palette coerente con il brand "bold" (Riviera).
 *   alimentare   → pesto (verde, campi/agrumi)
 *   antiquariato → coral (rosso facciate dei caruggi)
 *   artigianato  → riviera (blu mare, mestieri)
 *   varie        → inchiostro tenue
 */
export const CATEGORY_COLOR: Record<ScheduleCategory, string> = {
  alimentare:   '#2FA84F',
  antiquariato: '#EF4B27',
  artigianato:  '#1E73E8',
  varie:        '#4A4F3B',
}
