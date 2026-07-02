// Ricerca universale: una query libera (mercato, tipologia/"artigianato",
// zona, nome di un operatore, comune…) → i mercati più pertinenti, ciascuno
// con la GIUSTIFICAZIONE del perché è stato mostrato (per l'infografica).

import type { MarketPin } from '@/components/home/types'
import { classifyMany, CATEGORY_I18N, type ScheduleCategory } from '@/lib/schedules/classify'
import { ZONE_BY_SLUG } from '@/lib/markets/zones'
import { haversineMeters } from '@/lib/markets/geo'
import type { Lang } from '@/lib/i18n/home'

export interface SearchOperatorLite {
  id: string
  name: string
  category: string
  description?: string
  marketSlug?: string | null
  comuni: string[]
}

export type ReasonKind = 'comune' | 'luogo' | 'zona' | 'tipologia' | 'operatore' | 'giorno' | 'settore'

export interface SearchReason {
  kind: ReasonKind
  /** etichetta breve del campo (es. "Operatore") */
  field: string
  /** valore che ha fatto match (es. "Mario Rossi") */
  value: string
}

export interface SearchResult {
  pin: MarketPin
  score: number
  reasons: SearchReason[]
}

const norm = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

const FIELD_LABEL: Record<ReasonKind, string> = {
  comune: 'Comune',
  luogo: 'Luogo',
  zona: 'Zona',
  tipologia: 'Tipologia',
  operatore: 'Operatore',
  giorno: 'Giorno',
  settore: 'Cosa trovi',
}

function pinCategory(pin: MarketPin): ScheduleCategory {
  return classifyMany(pin.sessions.map((s) => s.settori))
}

/**
 * Cerca tra i mercati. Restituisce risultati ordinati per pertinenza, con i
 * motivi del match. `userLoc` (se presente) usato come tie-break "più vicino".
 */
export function searchMarkets(
  rawQuery: string,
  pins: MarketPin[],
  operators: SearchOperatorLite[],
  lang: Lang = 'it',
  userLoc?: { lat: number; lng: number } | null,
): SearchResult[] {
  const q = norm(rawQuery)
  if (q.length < 2) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  const hit = (hay: string) => {
    const h = norm(hay)
    return tokens.every((t) => h.includes(t)) || h.includes(q)
  }

  const acc = new Map<string, SearchResult>()
  const add = (pin: MarketPin, score: number, reason: SearchReason) => {
    let r = acc.get(pin.id)
    if (!r) {
      r = { pin, score: 0, reasons: [] }
      acc.set(pin.id, r)
    }
    r.score += score
    if (!r.reasons.some((x) => x.kind === reason.kind && x.value === reason.value)) r.reasons.push(reason)
  }

  for (const pin of pins) {
    const cat = pinCategory(pin)
    const zone = ZONE_BY_SLUG[pin.marketSlug]
    const catLabels = Object.values(CATEGORY_I18N[cat]) // tutte le lingue → match "artigianato"/"crafts"

    if (hit(pin.comune)) add(pin, 6, { kind: 'comune', field: FIELD_LABEL.comune, value: pin.comune })
    if (zone && hit(zone.name)) add(pin, 5, { kind: 'zona', field: FIELD_LABEL.zona, value: zone.name })
    if (catLabels.some((l) => hit(l)))
      add(pin, 4, { kind: 'tipologia', field: FIELD_LABEL.tipologia, value: CATEGORY_I18N[cat][lang] })
    if (pin.luogo && hit(pin.luogo)) add(pin, 3, { kind: 'luogo', field: FIELD_LABEL.luogo, value: pin.luogo })
    for (const s of pin.sessions) {
      if (s.giorno && hit(s.giorno)) add(pin, 2, { kind: 'giorno', field: FIELD_LABEL.giorno, value: s.giorno })
      if (s.settori && hit(s.settori)) {
        const snippet = s.settori.split(/[·,/]/).map((x) => x.trim()).find((x) => hit(x)) ?? s.settori
        add(pin, 2, { kind: 'settore', field: FIELD_LABEL.settore, value: snippet })
      }
    }
  }

  // Operatori → mercato di riferimento (per comune o per market slug)
  for (const op of operators) {
    const matchName = hit(op.name)
    const matchCat = op.category && hit(op.category)
    const matchDesc = op.description && hit(op.description)
    if (!matchName && !matchCat && !matchDesc) continue
    const targetPins = pins.filter(
      (p) =>
        (op.marketSlug && p.marketSlug === op.marketSlug && (op.comuni.length === 0 || op.comuni.some((c) => norm(c) === norm(p.comune)))) ||
        op.comuni.some((c) => norm(c) === norm(p.comune)),
    )
    const reason: SearchReason = { kind: 'operatore', field: FIELD_LABEL.operatore, value: op.name }
    for (const p of targetPins) add(p, matchName ? 7 : 4, reason)
  }

  const results = Array.from(acc.values())
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (userLoc) {
      const da = haversineMeters(userLoc, { lat: a.pin.lat, lng: a.pin.lng })
      const db = haversineMeters(userLoc, { lat: b.pin.lat, lng: b.pin.lng })
      return da - db
    }
    return a.pin.comune.localeCompare(b.pin.comune, 'it')
  })
  // motivi: ordina per importanza
  const order: ReasonKind[] = ['operatore', 'comune', 'zona', 'tipologia', 'luogo', 'settore', 'giorno']
  for (const r of results) r.reasons.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))
  return results
}
