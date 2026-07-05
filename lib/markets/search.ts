// Ricerca universale: una query libera (mercato, tipologia/"artigianato",
// zona, nome di un operatore, comune…) → i mercati più pertinenti, ciascuno
// con la GIUSTIFICAZIONE del perché è stato mostrato (per l'infografica).

import type { MarketPin } from '@/components/home/types'
import { classifyMany, CATEGORY_I18N, type ScheduleCategory } from '@/lib/schedules/classify'
import { ZONE_BY_SLUG } from '@/lib/markets/zones'
import { haversineMeters } from '@/lib/markets/geo'
import { occursOn } from '@/lib/markets/hours'
import type { Lang } from '@/lib/i18n/home'

// ---- Intenzioni: giorni e sinonimi di tipologia (4 lingue) -----------------

/** parola → giorno della settimana (0=dom … 6=sab), nelle 4 lingue */
const DAY_WORDS: Array<[RegExp, number]> = [
  [/\b(domenica|dimanche|sonntag|sunday)\b/, 0],
  [/\b(luned[iì]|lundi|montag|monday)\b/, 1],
  [/\b(marted[iì]|mardi|dienstag|tuesday)\b/, 2],
  [/\b(mercoled[iì]|mercredi|mittwoch|wednesday)\b/, 3],
  [/\b(gioved[iì]|jeudi|donnerstag|thursday)\b/, 4],
  [/\b(venerd[iì]|vendredi|freitag|friday)\b/, 5],
  [/\b(sabato|samedi|samstag|saturday)\b/, 6],
]
const TODAY_RE = /\b(oggi|aujourd|heute|today)\b/
const TOMORROW_RE = /\b(domani|demain|morgen|tomorrow)\b/

/** sinonimi/parole-chiave → macro-tipologia (ricerca "pesce", "brocante"…) */
const CATEGORY_SYNONYMS: Record<ScheduleCategory, RegExp> = {
  alimentare: /\b(pesce|poisson|fisch|fish|frutta|verdura|legumes?|gemuse|vegetables?|formagg|fromage|kase|cheese|km\s*0|bio|contadin|producteur|erzeuger|farmer|sapori|gastronom)\w*/,
  antiquariato: /\b(brocante|vintage|usato|antiquit|antiques?|collezion|collection|sammler|modernariato|rigattier|flohmarkt)\w*/,
  artigianato: /\b(artigian|artisan|handwerk|crafts?|ceramic|keramik|creativ|opere|handmade)\w*/,
  generale: /\b(abbigliament|vetements?|kleidung|clothing|scarpe|chaussures|schuhe|shoes|casaling)\w*/,
}

/** Il giorno richiesto dalla query, se c'è (data concreta per l'occorrenza). */
function dayIntent(q: string, now: Date): { date: Date; label: string } | null {
  if (TODAY_RE.test(q)) return { date: now, label: 'oggi' }
  if (TOMORROW_RE.test(q)) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    return { date: d, label: 'domani' }
  }
  for (const [re, wd] of DAY_WORDS) {
    if (re.test(q)) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      while (d.getDay() !== wd) d.setDate(d.getDate() + 1)
      return { date: d, label: q.match(re)![0] }
    }
  }
  return null
}

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
  const wantedDay = dayIntent(q, new Date())
  const wantedCats = (Object.keys(CATEGORY_SYNONYMS) as ScheduleCategory[]).filter((c) => CATEGORY_SYNONYMS[c].test(q))

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
    // Intenzioni: "pesce" → alimentare, "brocante" → antiquariato…
    if (wantedCats.includes(cat))
      add(pin, 4, { kind: 'tipologia', field: FIELD_LABEL.tipologia, value: CATEGORY_I18N[cat][lang] })
    // …e "venerdì"/"oggi"/"domani" → mercati che si tengono davvero quel giorno
    if (wantedDay && pin.sessions.some((s) => occursOn(s.giorno, wantedDay.date)))
      add(pin, 5, { kind: 'giorno', field: FIELD_LABEL.giorno, value: wantedDay.label })
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
