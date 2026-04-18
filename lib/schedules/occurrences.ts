import { classifySchedule, type ScheduleCategory } from './classify'

export interface ScheduleRow {
  id: string
  market_id: string
  market_slug: string
  market_name: string
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  settori: string | null
}

export interface Occurrence {
  schedule_id: string
  market_id: string
  market_slug: string
  market_name: string
  comune: string
  luogo: string | null
  orario: string | null
  giorno: string
  settori: string | null
  category: ScheduleCategory
  start: Date
  end: Date | null
}

const WEEKDAY_MAP: Record<string, number> = {
  'domenica': 0,
  'lunedi': 1, 'lunedì': 1,
  'martedi': 2, 'martedì': 2,
  'mercoledi': 3, 'mercoledì': 3,
  'giovedi': 4, 'giovedì': 4,
  'venerdi': 5, 'venerdì': 5,
  'sabato': 6,
}

function parseTimes(orario: string | null): { start: [number, number]; end: [number, number] | null } {
  const def: [number, number] = [9, 0]
  if (!orario) return { start: def, end: null }
  const matches = [...orario.matchAll(/(\d{1,2})[.:](\d{2})/g)]
  if (matches.length === 0) return { start: def, end: null }
  const start: [number, number] = [parseInt(matches[0][1], 10), parseInt(matches[0][2], 10)]
  const end: [number, number] | null = matches.length >= 2 ? [parseInt(matches[1][1], 10), parseInt(matches[1][2], 10)] : null
  return { start, end }
}

function extractWeekdays(giorno: string): number[] {
  const lower = giorno.toLowerCase()
  const out = new Set<number>()
  for (const [name, n] of Object.entries(WEEKDAY_MAP)) {
    if (new RegExp(`(?<!\\p{L})${name}(?!\\p{L})`, 'iu').test(lower)) out.add(n)
  }
  // Plurali "domeniche", "sabati", "martedì" già coperto (termina con ì)
  if (/\bdomeniche\b/.test(lower)) out.add(0)
  if (/\bsabati\b/.test(lower)) out.add(6)
  return Array.from(out)
}

interface MonthlyRule {
  ordinals: number[]
  weekday: number
  monthsAllowed: Set<number> | null
}

function extractMonthlyRule(giorno: string): MonthlyRule | null {
  const lower = giorno.toLowerCase()
  const weekdays = extractWeekdays(giorno)
  if (weekdays.length !== 1) return null

  const ordinals = new Set<number>()
  const ordPatterns: Array<[RegExp, number]> = [
    [/\b1[°ª^]|\bprim[ao]\b/, 1],
    [/\b2[°ª^]|\bsecond[ao]\b/, 2],
    [/\b3[°ª^]|\bterz[ao]\b/, 3],
    [/\b4[°ª^]|\bquart[ao]\b/, 4],
    [/\bultim[ao]\b/, -1],
  ]
  for (const [re, n] of ordPatterns) {
    if (re.test(lower)) ordinals.add(n)
  }
  if (ordinals.size === 0) return null

  let monthsAllowed: Set<number> | null = null
  if (/\bda aprile a ottobre\b/.test(lower)) monthsAllowed = new Set([3, 4, 5, 6, 7, 8, 9])
  return { ordinals: Array.from(ordinals), weekday: weekdays[0], monthsAllowed }
}

function extractDateRange(giorno: string): { startMonth: number; startDay: number; endMonth: number; endDay: number } | null {
  const m = giorno.match(/dal\s+(\d{1,2})\/(\d{1,2})\s+al\s+(\d{1,2})\/(\d{1,2})/i)
  if (!m) return null
  return {
    startDay: parseInt(m[1], 10),
    startMonth: parseInt(m[2], 10),
    endDay: parseInt(m[3], 10),
    endMonth: parseInt(m[4], 10),
  }
}

function isMonthlyHint(giorno: string): boolean {
  const l = giorno.toLowerCase()
  return /del mese|\bprim[ao]\b|\bsecond[ao]\b|\bterz[ao]\b|\bquart[ao]\b|\bultim[ao]\b|\d[°ª^]|da aprile a ottobre/.test(l)
}

function baseOcc(s: ScheduleRow): Omit<Occurrence, 'start' | 'end'> {
  return {
    schedule_id: s.id,
    market_id: s.market_id,
    market_slug: s.market_slug,
    market_name: s.market_name,
    comune: s.comune,
    luogo: s.luogo,
    orario: s.orario,
    giorno: s.giorno,
    settori: s.settori,
    category: classifySchedule(s.settori),
  }
}

function makeDate(y: number, m0: number, d: number, hm: [number, number]): Date {
  return new Date(y, m0, d, hm[0], hm[1])
}

function pushIfInRange(arr: Occurrence[], start: Date, end: Date | null, from: Date, to: Date, base: Omit<Occurrence, 'start' | 'end'>) {
  if (start >= from && start <= to) arr.push({ ...base, start, end })
}

export function expandScheduleOccurrences(s: ScheduleRow, from: Date, to: Date): Occurrence[] {
  const out: Occurrence[] = []
  const { start: stH, end: enH } = parseTimes(s.orario)
  const base = baseOcc(s)

  // Monthly ordinal recurrence (e.g., "1° sabato", "ultima domenica")
  if (isMonthlyHint(s.giorno)) {
    const rule = extractMonthlyRule(s.giorno)
    if (rule) {
      const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
      while (cursor <= to) {
        const y = cursor.getFullYear(); const m0 = cursor.getMonth()
        if (rule.monthsAllowed && !rule.monthsAllowed.has(m0)) {
          cursor.setMonth(m0 + 1); continue
        }
        for (const ord of rule.ordinals) {
          let day: number | null = null
          if (ord === -1) {
            const last = new Date(y, m0 + 1, 0)
            const delta = (last.getDay() - rule.weekday + 7) % 7
            day = last.getDate() - delta
          } else {
            const first = new Date(y, m0, 1)
            const delta = (rule.weekday - first.getDay() + 7) % 7
            day = 1 + delta + 7 * (ord - 1)
            if (day > new Date(y, m0 + 1, 0).getDate()) day = null
          }
          if (day != null) {
            const start = makeDate(y, m0, day, stH)
            const end = enH ? makeDate(y, m0, day, enH) : null
            pushIfInRange(out, start, end, from, to, base)
          }
        }
        cursor.setMonth(m0 + 1)
      }
      return out
    }
    // Monthly hint present but unparseable: skip to avoid noise
    return out
  }

  const rangeWeekdays = extractWeekdays(s.giorno)

  // Date-range seasonal (e.g., "Dal 30/05 al 13/09") — eventualmente ristretto a certi weekday
  const range = extractDateRange(s.giorno)
  if (range) {
    const years = [from.getFullYear(), to.getFullYear()]
    for (const y of Array.from(new Set(years))) {
      const rStart = new Date(y, range.startMonth - 1, range.startDay)
      const rEnd = new Date(y, range.endMonth - 1, range.endDay, 23, 59)
      const cursor = new Date(Math.max(from.getTime(), rStart.getTime()))
      cursor.setHours(0, 0, 0, 0)
      const stop = new Date(Math.min(to.getTime(), rEnd.getTime()))
      while (cursor <= stop) {
        if (rangeWeekdays.length === 0 || rangeWeekdays.includes(cursor.getDay())) {
          const start = makeDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), stH)
          const end = enH ? makeDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), enH) : null
          pushIfInRange(out, start, end, from, to, base)
        }
        cursor.setDate(cursor.getDate() + 1)
      }
    }
    return out
  }

  // Weekly by weekday
  const weekdays = rangeWeekdays
  if (weekdays.length === 0) return out
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  while (cursor <= to) {
    if (weekdays.includes(cursor.getDay())) {
      const start = makeDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), stH)
      const end = enH ? makeDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), enH) : null
      pushIfInRange(out, start, end, from, to, base)
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

export function expandAllOccurrences(schedules: ScheduleRow[], from: Date, to: Date): Occurrence[] {
  const all: Occurrence[] = []
  for (const s of schedules) all.push(...expandScheduleOccurrences(s, from, to))
  return all.sort((a, b) => a.start.getTime() - b.start.getTime())
}
