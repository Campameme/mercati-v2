import type { Lang } from '@/lib/i18n/home'

// ============================================================================
// Tipologie di mercato (macro-categorie)
// 4 macro-categorie che coprono tutti i mercati della provincia senza lasciarne
// nessuna isolata: il grande mercato settimanale "generale", l'alimentare/
// agricolo a km0, l'antiquariato/vintage e l'artigianato/creativo.
// Guidano: colore dei pin sulla mappa, filtro per tipologia, legenda, badge.
// ============================================================================

export type ScheduleCategory = 'generale' | 'alimentare' | 'antiquariato' | 'artigianato'

/** Ordine canonico per chips/legenda (dal più comune al più di nicchia). */
export const CATEGORY_ORDER: ScheduleCategory[] = ['generale', 'alimentare', 'antiquariato', 'artigianato']

/**
 * Classifica un mercato ricorrente dal testo libero dei settori merceologici.
 * Priorità: antiquariato/artigianato (nomi specifici) → alimentare puro →
 * generale (merci varie / abbigliamento / mix alimentare+non).
 */
export function classifySchedule(settori: string | null | undefined): ScheduleCategory {
  if (!settori) return 'generale'
  const s = settori.toLowerCase()

  if (/antiquariat|collezion|\bvintage\b|brocante|vecchi oggetti/.test(s)) return 'antiquariato'
  if (/artigianat|opere dell'ingegn|creativ|\barte\b/.test(s)) return 'artigianato'

  // mix alimentare + non, "merci varie", hobbisti, usato, abbigliamento → generale
  if (/non aliment|merci varie|hobbyst|usato|abbigliam/.test(s)) return 'generale'

  if (/aliment|agricol|km\s*0|farmer|produttori|frutta|verdura|pesce/.test(s)) return 'alimentare'

  return 'generale'
}

/**
 * Categoria "dominante" di un insieme di sessioni (un pin = un luogo con più
 * giornate). Conta le categorie delle sue sessioni; a parità vince l'ordine
 * canonico. Serve a colorare un singolo pin sulla mappa.
 */
export function classifyMany(settoriList: Array<string | null | undefined>): ScheduleCategory {
  if (settoriList.length === 0) return 'generale'
  const counts: Record<ScheduleCategory, number> = { generale: 0, alimentare: 0, antiquariato: 0, artigianato: 0 }
  for (const s of settoriList) counts[classifySchedule(s)]++
  let best: ScheduleCategory = 'generale'
  let bestN = -1
  // I tipi "di nicchia" (antiquariato/artigianato/alimentare) prevalgono sul
  // generale quando presenti in egual numero: identità del mercato più forte.
  for (const c of ['antiquariato', 'artigianato', 'alimentare', 'generale'] as ScheduleCategory[]) {
    if (counts[c] > bestN) {
      best = c
      bestN = counts[c]
    }
  }
  return best
}

/** Etichetta IT (default, retro-compatibile). */
export const CATEGORY_LABEL: Record<ScheduleCategory, string> = {
  generale: 'Mercato generale',
  alimentare: 'Alimentare & agricolo',
  antiquariato: 'Antiquariato & vintage',
  artigianato: 'Artigianato & creativo',
}

/** Etichetta breve (per chip strette). */
export const CATEGORY_LABEL_SHORT: Record<ScheduleCategory, string> = {
  generale: 'Generale',
  alimentare: 'Alimentare',
  antiquariato: 'Antiquariato',
  artigianato: 'Artigianato',
}

/** Etichette multilingua per le 4 lingue del pubblico. */
export const CATEGORY_I18N: Record<ScheduleCategory, Record<Lang, string>> = {
  generale: { it: 'Mercato generale', fr: 'Marché général', de: 'Allgemeiner Markt', en: 'General market' },
  alimentare: { it: 'Alimentare & agricolo', fr: 'Alimentaire & agricole', de: 'Lebensmittel & Erzeuger', en: 'Food & farm' },
  antiquariato: { it: 'Antiquariato & vintage', fr: 'Antiquités & vintage', de: 'Antiquitäten & Vintage', en: 'Antiques & vintage' },
  artigianato: { it: 'Artigianato & creativo', fr: 'Artisanat & créatif', de: 'Handwerk & Kreatives', en: 'Crafts & makers' },
}

export function categoryLabelI18n(cat: ScheduleCategory, lang: Lang): string {
  return CATEGORY_I18N[cat][lang]
}

/**
 * Colori per tipologia — distinti sulla mappa pastello (CARTO Voyager) e
 * armonici col brand. NON usano il giallo "sole"/corallo "fiore" che sono
 * riservati a stato (selezionato/aperto), così tipo e stato non si confondono.
 *   generale     → mare (blu, l'ossatura quotidiana)
 *   alimentare   → verde orto
 *   antiquariato → terracotta dei caruggi
 *   artigianato  → viola/creativo
 */
export const CATEGORY_COLOR: Record<ScheduleCategory, string> = {
  generale: '#15607C',
  alimentare: '#4C8B3F',
  antiquariato: '#C2502E',
  artigianato: '#8E5BB5',
}

/** Variante scura del colore (bordi, testo su sfondo chiaro). */
export const CATEGORY_COLOR_DARK: Record<ScheduleCategory, string> = {
  generale: '#0E3F52',
  alimentare: '#36621C',
  antiquariato: '#8F3A1E',
  artigianato: '#653F86',
}

/** Glifo del banco per ciascuna tipologia (telo del banco con simbolo). */
export const CATEGORY_GLYPH: Record<ScheduleCategory, string> = {
  generale: '🛍',
  alimentare: '🥕',
  antiquariato: '🕰',
  artigianato: '✿',
}
