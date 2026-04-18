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
 * Palette coerente con la palette ligure della UI.
 *   alimentare   → olive (terra, campi)
 *   antiquariato → terracotta (vecchio, rustico)
 *   artigianato  → sea blue (mestieri)
 *   varie        → grigio inchiostro
 */
export const CATEGORY_COLOR: Record<ScheduleCategory, string> = {
  alimentare:   '#6B7F3A',
  antiquariato: '#B75A40',
  artigianato:  '#2A5A75',
  varie:        '#4A4F3B',
}
