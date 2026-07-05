// Time-awareness per i mercati. L'orario e il giorno in DB sono stringhe libere
// (es. "08.00 / 13.00", giorno = "Venerdì", "Martedì e sabato",
// "3° sabato del mese", "Ultima domenica del mese", "1ª domenica del mese",
// "Domeniche (dal 07/06 al 13/09)", "Martedì di luglio, agosto").
// Qui le interpretiamo per dire se un mercato si tiene OGGI ed è aperto ORA.

const WEEKDAY_PATTERNS: Array<[RegExp, number]> = [
  [/domenic/i, 0],
  [/luned/i, 1],
  [/marted/i, 2],
  [/mercoled/i, 3],
  [/gioved/i, 4],
  [/venerd/i, 5],
  [/sabat/i, 6],
]

const MONTHS: Record<string, number> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
}

/** Tutti i giorni della settimana citati (0=domenica … 6=sabato). */
export function weekdaysOf(giorno?: string | null): number[] {
  if (!giorno) return []
  const out = new Set<number>()
  for (const [re, d] of WEEKDAY_PATTERNS) if (re.test(giorno)) out.add(d)
  return Array.from(out)
}

/** Ordinali del mese richiesti: numeri (1..5) e/o 'last'. Vuoto = ogni settimana. */
function ordinalsOf(giorno: string): Array<number | 'last'> {
  const out: Array<number | 'last'> = []
  if (/ultim/i.test(giorno)) out.push('last')
  let m: RegExpExecArray | null
  const re = /(\d)\s*[°ª]/g
  while ((m = re.exec(giorno))) out.push(parseInt(m[1], 10))
  return out
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/** True se il testo contiene un vincolo stagionale (range date/mesi o mesi citati). */
function hasSeasonConstraint(giorno: string): boolean {
  const lower = giorno.toLowerCase()
  if (/(\d{1,2})\/(\d{1,2})\s+al\s+(\d{1,2})\/(\d{1,2})/.test(lower)) return true
  const monthNames = Object.keys(MONTHS).join('|')
  if (new RegExp(`da\\s+(${monthNames})\\s+a\\s+(${monthNames})`).test(lower)) return true
  if (Object.keys(MONTHS).some((name) => lower.includes(name))) return true
  return false
}

/** True se riusciamo a interpretare il giorno/stagione (per stato 'unknown'). */
function isParseableDay(giorno?: string | null): boolean {
  if (!giorno) return false
  return weekdaysOf(giorno).length > 0 || hasSeasonConstraint(giorno)
}

/** True se `date` rientra negli eventuali vincoli stagionali del testo. */
function inSeason(giorno: string, date: Date): boolean {
  const lower = giorno.toLowerCase()
  const md = (mo: number, d: number) => mo * 100 + d
  const today = md(date.getMonth() + 1, date.getDate())

  // Range espliciti gg/mm: "dal 30/05 al 13/09"
  const dateRanges = Array.from(lower.matchAll(/(\d{1,2})\/(\d{1,2})\s+al\s+(\d{1,2})\/(\d{1,2})/g))
  if (dateRanges.length) {
    return dateRanges.some((r) => {
      const s = md(parseInt(r[2], 10), parseInt(r[1], 10))
      const e = md(parseInt(r[4], 10), parseInt(r[3], 10))
      return s <= e ? today >= s && today <= e : today >= s || today <= e
    })
  }

  // Range di mesi: "da aprile a ottobre"
  const monthNames = Object.keys(MONTHS).join('|')
  const mr = lower.match(new RegExp(`da\\s+(${monthNames})\\s+a\\s+(${monthNames})`))
  if (mr) {
    const s = MONTHS[mr[1]]
    const e = MONTHS[mr[2]]
    const m = date.getMonth() + 1
    return s <= e ? m >= s && m <= e : m >= s || m <= e
  }

  // Mesi singoli citati: "di luglio, agosto"
  const mentioned = Object.keys(MONTHS).filter((name) => lower.includes(name))
  if (mentioned.length) {
    const m = date.getMonth() + 1
    return mentioned.some((name) => MONTHS[name] === m)
  }

  return true
}

/** True se il mercato si tiene esattamente in `date` (giorno + ordinale + stagione). */
export function occursOn(giorno: string | null | undefined, date: Date): boolean {
  if (!giorno) return false
  const wds = weekdaysOf(giorno)
  // Nessun giorno della settimana ma con stagione (es. "Dal 30/05 al 13/09",
  // "Sere dal 20/06 al 20/09"): il mercato si tiene ogni giorno in stagione.
  if (wds.length === 0) {
    return hasSeasonConstraint(giorno) ? inSeason(giorno, date) : false
  }
  if (!wds.includes(date.getDay())) return false
  if (!inSeason(giorno, date)) return false
  const ords = ordinalsOf(giorno)
  if (ords.length === 0) return true
  const occurrence = Math.floor((date.getDate() - 1) / 7) + 1
  const isLast = date.getDate() + 7 > daysInMonth(date)
  return ords.some((o) => (o === 'last' ? isLast : o === occurrence))
}

/**
 * True se la cadenza NON è la semplice settimana piena: ordinali del mese
 * ("1° sabato", "ultima domenica"), stagionalità o date esplicite. Usato per
 * distinguere i mercati "ricorrenti speciali" (antiquariato mensile, mercatini
 * estivi) da quelli settimanali.
 */
export function isNonWeekly(giorno?: string | null): boolean {
  if (!giorno) return false
  if (ordinalsOf(giorno).length > 0) return true
  if (hasSeasonConstraint(giorno)) return true
  return weekdaysOf(giorno).length === 0
}

export interface HourRange {
  start: number // ore decimali (es. 8.5 = 08:30)
  end: number
}

/** Estrae gli intervalli orari (coppie inizio/fine) da una stringa libera. */
export function parseOrarioRanges(orario?: string | null): HourRange[] {
  if (!orario) return []
  const nums: number[] = []
  const re = /(\d{1,2})[.:](\d{2})/g
  let m: RegExpExecArray | null
  while ((m = re.exec(orario))) {
    const h = parseInt(m[1], 10)
    const min = parseInt(m[2], 10)
    if (h <= 24 && min < 60) nums.push(h + min / 60)
  }
  const ranges: HourRange[] = []
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const start = nums[i]
    const end = nums[i + 1]
    if (end > start) ranges.push({ start, end })
  }
  return ranges
}

export type MarketState = 'open' | 'opens' | 'closed' | 'unknown'

export interface MarketStatus {
  state: MarketState
  /** Per 'open' = ora di chiusura; per 'opens' = ora di apertura. */
  hour?: number
}

/**
 * Stato del mercato rispetto a `now`, dati giorno e orario (stringhe DB).
 * - unknown: impossibile interpretare giorno/orario
 * - closed: oggi non si tiene (giorno/ordinale/stagione), oppure è già finito
 * - opens: oggi si tiene ma deve ancora aprire
 * - open: aperto adesso
 */
export function marketStatus(now: Date, giorno?: string | null, orario?: string | null): MarketStatus {
  const ranges = parseOrarioRanges(orario)
  if (ranges.length === 0 || !isParseableDay(giorno)) return { state: 'unknown' }
  if (!occursOn(giorno, now)) return { state: 'closed' }
  const h = now.getHours() + now.getMinutes() / 60
  let opensAt = Infinity
  for (const r of ranges) {
    if (h >= r.start && h < r.end) return { state: 'open', hour: r.end }
    if (h < r.start) opensAt = Math.min(opensAt, r.start)
  }
  if (opensAt !== Infinity) return { state: 'opens', hour: opensAt }
  return { state: 'closed' }
}

export function isOpenNow(now: Date, giorno?: string | null, orario?: string | null): boolean {
  return marketStatus(now, giorno, orario).state === 'open'
}

/** Formatta un'ora decimale in "HH:MM". */
export function fmtHour(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}
