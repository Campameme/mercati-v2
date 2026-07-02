import Link from 'next/link'
import { MapPin, Repeat, ArrowUpRight } from 'lucide-react'
import type { MarketEvent } from '@/types/event'
import WaterCard from '@/components/motion/WaterCard'

/** Etichette categoria evento (it). */
export const EVENT_CATEGORY_LABEL: Record<string, string> = {
  market: 'Mercato',
  fair: 'Fiera',
  food: 'Gastronomia',
  music: 'Musica',
  art: 'Arte',
  sport: 'Sport',
  other: 'Evento',
}

/**
 * Stile badge per categoria — allineato a EVT_COLOR in `lib/events/labels.ts`
 * (unica semantica colori eventi: mare=mercato · terracotta=fiera · verde
 * orto=gastronomia · viola=musica · fiore=arte · notte=sport).
 */
const EVENT_CATEGORY_STYLE: Record<string, { bg: string; fg: string }> = {
  market: { bg: 'bg-mare', fg: 'text-white' },
  fair: { bg: 'bg-[#C2502E]', fg: 'text-white' },
  food: { bg: 'bg-[#4C8B3F]', fg: 'text-white' },
  music: { bg: 'bg-[#8E5BB5]', fg: 'text-white' },
  art: { bg: 'bg-fiore', fg: 'text-white' },
  sport: { bg: 'bg-notte', fg: 'text-sole' },
  other: { bg: 'bg-ink', fg: 'text-paper' },
}

function catStyle(cat: string) {
  return EVENT_CATEGORY_STYLE[cat] ?? EVENT_CATEGORY_STYLE.other
}

function catLabel(cat: string) {
  return EVENT_CATEGORY_LABEL[cat] ?? cat
}

/** Parti della data per il "blocco data" grande. */
function dateParts(iso: string) {
  const d = new Date(iso)
  return {
    day: d.toLocaleDateString('it-IT', { day: 'numeric' }),
    month: d.toLocaleDateString('it-IT', { month: 'short' }).replace('.', ''),
    weekday: d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', ''),
    time: d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
  }
}

/** Intervallo leggibile inizio → fine. */
function rangeLabel(start: string, end: string | null) {
  const s = new Date(start)
  const startTime = s.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  if (!end) return startTime
  const e = new Date(end)
  const sameDay = s.toDateString() === e.toDateString()
  const endTime = e.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return `${startTime} – ${endTime}`
  const endDate = e.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }).replace('.', '')
  return `${startTime} → ${endDate} ${endTime}`
}

export interface EventCardProps {
  event: MarketEvent
  /** leggera rotazione imperfetta (alternata dalla griglia) */
  tilt?: 'l' | 'r'
}

export default function EventCard({ event, tilt }: EventCardProps) {
  const dp = dateParts(event.start_at)
  const style = catStyle(event.category)
  const market = event.markets
  const place = event.location ?? market?.city ?? null

  return (
    <WaterCard tilt={tilt} className="group relative flex flex-col overflow-hidden rounded-xl">
      {/* Banda colore per categoria in cima */}
      <span className={`block h-1.5 w-full ${style.bg}`} aria-hidden="true" />

      <div className="flex gap-4 p-5">
        {/* Blocco data grande */}
        <div className="flex-shrink-0">
          <div className="flex w-[68px] flex-col items-center rounded-xl border-2 border-ink/10 bg-paper px-2 py-2.5 text-center">
            <span className="font-alt text-[10px] uppercase tracking-[0.18em] text-ink-muted">{dp.weekday}</span>
            <span className="font-display text-3xl leading-none text-ink">{dp.day}</span>
            <span className="font-alt text-[11px] uppercase tracking-[0.14em] text-mare-600">{dp.month}</span>
          </div>
        </div>

        {/* Contenuto */}
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-alt text-[11px] font-semibold uppercase tracking-[0.08em] ${style.bg} ${style.fg}`}
            >
              {catLabel(event.category)}
            </span>
            {event.is_recurring && (
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-ink/10 px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                <Repeat className="h-3 w-3" aria-hidden="true" />
                ricorrente
              </span>
            )}
          </div>

          <h3 className="font-display text-lg leading-tight text-ink">{event.title}</h3>

          <p className="mt-1 font-alt text-sm font-medium text-ink-soft">
            {rangeLabel(event.start_at, event.end_at)}
          </p>

          {place && (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-soft">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="min-w-0">{place}</span>
            </p>
          )}

          {event.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft/90">{event.description}</p>
          )}

          {market?.slug && (
            <Link
              href={`/${market.slug}`}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-paper px-3 py-1 font-alt text-xs font-semibold text-ink ring-2 ring-ink/10 transition-colors hover:bg-ink hover:text-paper hover:ring-ink"
            >
              {market.name}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </WaterCard>
  )
}
