'use client'

import { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import itLocale from '@fullcalendar/core/locales/it'
import frLocale from '@fullcalendar/core/locales/fr'
import deLocale from '@fullcalendar/core/locales/de'
import { MapPin } from 'lucide-react'
import {
  CATEGORY_COLOR,
  CATEGORY_ORDER,
  categoryLabelI18n,
  classifySchedule,
  type ScheduleCategory,
} from '@/lib/schedules/classify'
import { IMPERIA_ZONE_SLUGS } from '@/lib/markets/zones'
import { useLang } from '@/lib/i18n/useLang'
import type { Lang } from '@/lib/i18n/home'

interface Occ {
  schedule_id: string
  market_slug: string
  market_name: string
  comune: string
  luogo: string | null
  orario: string | null
  giorno: string
  settori: string | null
  start: string
  end: string | null
}

const LOCALES: Record<Lang, any> = { it: itLocale, fr: frLocale, de: deLocale, en: undefined }
const LOADING: Record<Lang, string> = { it: 'Caricamento…', fr: 'Chargement…', de: 'Laden…', en: 'Loading…' }
const CLOSE: Record<Lang, string> = { it: 'Chiudi', fr: 'Fermer', de: 'Schließen', en: 'Close' }

/**
 * Vista Calendario dei mercati (tutta la provincia di Imperia): le ricorrenze
 * dei mercati — settimanali e tematici — su un calendario mensile/agenda.
 * Le occorrenze arrivano da /api/schedules/occurrences (già espanse per data).
 */
export default function MarketCalendar() {
  const [lang] = useLang()
  const [occ, setOcc] = useState<Occ[]>([])
  const [loading, setLoading] = useState(true)
  const [cats, setCats] = useState<Set<ScheduleCategory>>(new Set(CATEGORY_ORDER))
  const [sel, setSel] = useState<Occ | null>(null)

  useEffect(() => {
    fetch('/api/schedules/occurrences')
      .then((r) => r.json())
      .then((j) => {
        const imperia = new Set<string>(IMPERIA_ZONE_SLUGS as readonly string[])
        setOcc((j.data ?? []).filter((o: Occ) => imperia.has(o.market_slug)))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const events = useMemo(
    () =>
      occ
        .filter((o) => cats.has(classifySchedule(o.settori)))
        .map((o) => {
          const cat = classifySchedule(o.settori)
          const color = CATEGORY_COLOR[cat]
          return {
            id: `${o.schedule_id}-${o.start}`,
            title: o.comune,
            start: o.start,
            end: o.end ?? undefined,
            backgroundColor: color,
            borderColor: color,
            textColor: '#FBF6EC',
            extendedProps: { o },
          }
        }),
    [occ, cats],
  )

  function toggle(c: ScheduleCategory) {
    setCats((prev) => {
      const n = new Set(prev)
      n.has(c) ? n.delete(c) : n.add(c)
      return n
    })
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-5 md:py-6">
      {/* Filtro tipologie */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORY_ORDER.map((c) => {
          const active = cats.has(c)
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className={`inline-flex items-center gap-1.5 font-alt text-xs font-semibold px-3 py-1.5 rounded-full border-[1.5px] transition-colors ${
                active ? 'text-crema border-transparent' : 'bg-white text-ink-muted border-ink/15 hover:border-ink/30'
              }`}
              style={active ? { backgroundColor: CATEGORY_COLOR[c] } : undefined}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: active ? '#FBF6EC' : CATEGORY_COLOR[c] }} />
              {categoryLabelI18n(c, lang)}
            </button>
          )
        })}
      </div>

      <div className="imk-cal bg-white border border-[#e0d7c1] rounded-2xl p-3 md:p-4 shadow-[0_16px_36px_-26px_rgba(38,36,30,0.5)]">
        {loading ? (
          <p className="text-center py-16 text-ink-muted text-sm">{LOADING[lang]}</p>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale={LOCALES[lang]}
            height={640}
            events={events}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' }}
            eventClick={(info) => setSel((info.event.extendedProps as { o: Occ }).o)}
            dayMaxEvents={3}
          />
        )}
      </div>

      {sel && (
        <div className="fixed inset-0 z-[1000] bg-ink/55 backdrop-blur-[2px] flex items-center justify-center p-4" onClick={() => setSel(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#e0d7c1] shadow-2xl">
            <span
              className="inline-block font-alt font-semibold text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full text-crema mb-3"
              style={{ backgroundColor: CATEGORY_COLOR[classifySchedule(sel.settori)] }}
            >
              {categoryLabelI18n(classifySchedule(sel.settori), lang)}
            </span>
            <h3 className="font-display font-extrabold tracking-tight text-2xl text-ink leading-tight">{sel.comune}</h3>
            <p className="text-sm text-ink-soft mt-1">{sel.giorno}{sel.orario ? ` · ${sel.orario}` : ''}</p>
            {sel.luogo && (
              <p className="text-sm text-ink flex items-center gap-1.5 mt-2"><MapPin className="w-4 h-4 text-terracotta" />{sel.luogo}</p>
            )}
            {sel.settori && <p className="text-xs text-ink-muted italic mt-2">{sel.settori}</p>}
            <a
              href={`/${sel.market_slug}`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-alga text-crema rounded-full font-alt text-sm font-semibold hover:bg-alga-600 transition-colors"
            >
              {sel.market_name || sel.comune}
            </a>
            <button
              onClick={() => setSel(null)}
              className="mt-2 px-4 py-2.5 bg-crema border-2 border-ink/15 hover:border-ink rounded-full w-full font-alt text-sm font-semibold text-ink transition-colors"
            >
              {CLOSE[lang]}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
