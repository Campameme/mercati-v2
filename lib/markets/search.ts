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
  alimentare: /\b(pesce|poisson|fisch|fish|frutta|verdura|zucchin|pomodor|carciof|melanzan|insalat|stoccafiss|baccal|legumes?|gemuse|vegetables?|courgette|zucchini|formagg|fromage|kase|cheese|km\s*0|bio|contadin|producteur|erzeuger|farmer|sapori|gastronom|spezie|aromatic)\w*/,
  antiquariato: /\b(brocante|vintage|usato|antiquit|antiques?|collezion|collection|sammler|modernariato|rigattier|flohmarkt)\w*/,
  artigianato: /\b(artigian|artisan|handwerk|crafts?|ceramic|keramik|creativ|opere|handmade)\w*/,
  generale: /\b(abbigliament|vetements?|kleidung|clothing|scarpe|chaussures|schuhe|shoes|casaling|pantalon|jeans|camici|maglie|intimo|sciarp|borse|tendagg|lenzuol|tovagli|rideau|vorhang|curtain|trousers|hose)\w*/,
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
  products?: string[]
  marketSlug?: string | null
  comuni: string[]
}

// Parole "di servizio" da ignorare: articoli, preposizioni, aggettivi generici
// di qualità/gradimento. Così "le zucchine più buone" pesa solo su "zucchine",
// "tendaggi per la casa di qualità" su "tendaggi"+"casa". 4 lingue.
const STOPWORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'del', 'della', 'dei', 'delle', 'degli',
  'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'a', 'al', 'allo', 'alla', 'e', 'o', 'ed', 'od',
  'piu', 'meno', 'molto', 'tanto', 'buono', 'buoni', 'buona', 'buone', 'bello', 'belli', 'bella', 'belle',
  'migliore', 'migliori', 'ottimo', 'ottima', 'qualita', 'buon', 'del', 'che', 'come',
  'le', 'les', 'des', 'du', 'de', 'la', 'un', 'une', 'et', 'ou', 'pour', 'avec', 'plus', 'bon', 'bonne', 'qualite', 'meilleur', 'meilleure',
  'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'fur', 'mit', 'gut', 'gute', 'guter', 'beste', 'qualitat', 'mehr',
  'the', 'of', 'and', 'or', 'for', 'with', 'good', 'best', 'better', 'quality', 'more',
])

// Intento di prossimità: "mercati vicino bordighera", "près de", "nahe", "near".
const NEAR_RE = /\b(vicino|vicini|presso|nei pressi|dintorni|pres|proche|nahe|near|around)\b/
// Intento "mercati tipici/tematici": i mercati non di merci varie (antiquariato…).
const TIPICI_RE = /\b(tipic\w*|tematic\w*|typiqu\w*|typisch\w*|typical|themed|special\w*|speciaux)\b/

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
  // Token "di contenuto": tolte le stopword. Se resta vuoto (query tutta
  // stopword) si ripiega sui token grezzi.
  const rawTokens = q.split(/\s+/).filter(Boolean)
  const tokens = rawTokens.filter((t) => t.length >= 2 && !STOPWORDS.has(t))
  const terms = tokens.length ? tokens : rawTokens
  // Match AMPIO: basta che UNO dei termini compaia nel campo (o l'intera frase).
  // `hitCount` pesa per quanti termini colpiscono → più termini, più pertinente.
  const hitCount = (hay: string) => {
    const h = norm(hay)
    if (!h) return 0
    if (terms.length > 1 && h.includes(q)) return terms.length + 1 // bonus frase intera
    let n = 0
    for (const t of terms) if (h.includes(t)) n++
    return n
  }
  const hit = (hay: string) => hitCount(hay) > 0

  const wantedDay = dayIntent(q, new Date())
  const wantedCats = (Object.keys(CATEGORY_SYNONYMS) as ScheduleCategory[]).filter((c) => CATEGORY_SYNONYMS[c].test(q))
  const wantsTipici = TIPICI_RE.test(q)

  // "vicino a X": risolvo il luogo (comune o zona) citato nella query e ordino
  // per distanza da lì. Il centro è la media dei pin di quel comune/zona.
  let nearCenter: { lat: number; lng: number } | null = null
  if (NEAR_RE.test(q)) {
    const near = pins.filter((p) => terms.some((t) => norm(p.comune).includes(t) || norm(ZONE_BY_SLUG[p.marketSlug]?.name ?? '').includes(t)))
    if (near.length) {
      nearCenter = {
        lat: near.reduce((s, p) => s + p.lat, 0) / near.length,
        lng: near.reduce((s, p) => s + p.lng, 0) / near.length,
      }
    }
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
    const isTipico = cat !== 'generale'

    const cHit = hitCount(pin.comune)
    if (cHit) add(pin, 6 * cHit, { kind: 'comune', field: FIELD_LABEL.comune, value: pin.comune })
    if (zone && hit(zone.name)) add(pin, 5, { kind: 'zona', field: FIELD_LABEL.zona, value: zone.name })
    if (catLabels.some((l) => hit(l)))
      add(pin, 4, { kind: 'tipologia', field: FIELD_LABEL.tipologia, value: CATEGORY_I18N[cat][lang] })
    // Intenzioni: "pesce" → alimentare, "brocante" → antiquariato…
    if (wantedCats.includes(cat))
      add(pin, 4, { kind: 'tipologia', field: FIELD_LABEL.tipologia, value: CATEGORY_I18N[cat][lang] })
    // "mercati tipici/tematici" → i mercati non di merci varie
    if (wantsTipici && isTipico)
      add(pin, 5, { kind: 'tipologia', field: FIELD_LABEL.tipologia, value: CATEGORY_I18N[cat][lang] })
    // …e "venerdì"/"oggi"/"domani" → mercati che si tengono davvero quel giorno
    if (wantedDay && pin.sessions.some((s) => occursOn(s.giorno, wantedDay.date)))
      add(pin, 5, { kind: 'giorno', field: FIELD_LABEL.giorno, value: wantedDay.label })
    if (pin.luogo && hit(pin.luogo)) add(pin, 3, { kind: 'luogo', field: FIELD_LABEL.luogo, value: pin.luogo })
    for (const s of pin.sessions) {
      if (s.giorno && hit(s.giorno)) add(pin, 2, { kind: 'giorno', field: FIELD_LABEL.giorno, value: s.giorno })
      if (s.settori) {
        const snippet = s.settori.split(/[·,/]/).map((x) => x.trim()).find((x) => hit(x))
        if (snippet) add(pin, 3, { kind: 'settore', field: FIELD_LABEL.settore, value: snippet })
      }
    }
    // "vicino a X": chi è vicino al centro citato prende un forte richiamo.
    if (nearCenter) {
      const dist = haversineMeters(nearCenter, { lat: pin.lat, lng: pin.lng })
      if (dist < 12000) add(pin, Math.max(1, 8 - Math.round(dist / 2000)), { kind: 'comune', field: FIELD_LABEL.comune, value: pin.comune })
    }
  }

  // Operatori → mercato di riferimento (per comune o per market slug).
  // Match ampio: nome, categoria, descrizione E prodotti del banco (così
  // "zucchine" trova chi le vende, "Claudia abbigliamento" il banco di Claudia).
  for (const op of operators) {
    const nameHits = hitCount(op.name)
    const descHits = op.description ? hitCount(op.description) : 0
    const catHits = op.category ? hitCount(op.category) : 0
    const prodHit = (op.products ?? []).map((p) => p.trim()).find((p) => hit(p))
    if (!nameHits && !descHits && !catHits && !prodHit) continue
    const targetPins = pins.filter(
      (p) =>
        (op.marketSlug && p.marketSlug === op.marketSlug && (op.comuni.length === 0 || op.comuni.some((c) => norm(c) === norm(p.comune)))) ||
        op.comuni.some((c) => norm(c) === norm(p.comune)),
    )
    // Il prodotto citato diventa il motivo (più parlante del nome del banco).
    const reason: SearchReason = prodHit && !nameHits
      ? { kind: 'settore', field: FIELD_LABEL.settore, value: prodHit }
      : { kind: 'operatore', field: FIELD_LABEL.operatore, value: op.name }
    const score = nameHits ? 7 * nameHits : prodHit ? 6 : 4
    for (const p of targetPins) add(p, score, reason)
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
