import type { Lang } from '@/lib/i18n/home'
import { UI_I18N } from '@/lib/i18n/ui'

// "Tutti i giorni" quando il mercato è aperto tutta la settimana.
const ALL_DAYS: Record<Lang, string> = {
  it: 'Tutti i giorni',
  fr: 'Tous les jours',
  de: 'Täglich',
  en: 'Every day',
}

// Connettore finale ("… e domenica").
const AND: Record<Lang, string> = { it: 'e', fr: 'et', de: 'und', en: 'and' }

// In IT/FR i nomi dei giorni vanno minuscoli dentro la frase; in DE (sostantivi)
// e EN restano con l'iniziale maiuscola.
const LOWERCASE_DAYS: Record<Lang, boolean> = { it: true, fr: true, de: false, en: false }

/**
 * Elenco contratto dei giorni di mercato, nella lingua richiesta.
 * `days`: indici 0=domenica … 6=sabato. Default `lang='it'` per i chiamanti
 * che non passano ancora la lingua.
 */
export function formatMarketDays(days: number[], lang: Lang = 'it'): string {
  if (!days || days.length === 0) return ''
  if (days.length === 7) return ALL_DAYS[lang]
  const names = UI_I18N[lang].weekdaysLong // 0=domenica … 6=sabato
  const label = (d: number) => (LOWERCASE_DAYS[lang] ? names[d].toLowerCase() : names[d])
  const sortedMonFirst = [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  if (sortedMonFirst.length === 1) return label(sortedMonFirst[0])
  const last = sortedMonFirst.pop() as number
  return `${sortedMonFirst.map(label).join(', ')} ${AND[lang]} ${label(last)}`
}
