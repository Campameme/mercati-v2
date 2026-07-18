'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MapPin, Store, Navigation2, ChevronDown } from 'lucide-react'
import MarketViewer from '@/components/MarketViewer'
import { classifySchedule, categoryLabelI18n, CATEGORY_COLOR } from '@/lib/schedules/classify'
import { useLang } from '@/lib/i18n/useLang'
import { UI_I18N, type UiDict } from '@/lib/i18n/ui'
import { categoryLabel } from '@/lib/i18n/home'

interface SessionLite {
  id: string
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  settori: string | null
  lat: number | null
  lng: number | null
  /** area del mercato disegnata in admin (mostrata su questa scheda) */
  polygon?: GeoJSON.Feature<GeoJSON.Polygon> | null
}

interface OperatorLite {
  id: string
  name: string
  category: string
  description: string | null
  stall_number: string | null
  schedule_id: string | null
  location_lat?: number | null
  location_lng?: number | null
}

interface Props {
  marketSlug: string
  marketName: string
  marketCity: string | null
  comune: string
  sessions: SessionLite[]
  /** Operatori del market (filtriamo per schedule lato client) */
  operators: OperatorLite[]
}

// Normalizza il giorno (testo libero dal DB, in italiano) in un'etichetta breve
// nella lingua dell'utente. weekdaysLong: indice 0=domenica … 6=sabato.
function shortLabel(giorno: string, ui: UiDict): string {
  const lower = giorno.toLowerCase()
  if (/\bluned[iì]\b/.test(lower))    return ui.weekdaysLong[1]
  if (/\bmarted[iì]\b/.test(lower))   return ui.weekdaysLong[2]
  if (/\bmercoled[iì]\b/.test(lower)) return ui.weekdaysLong[3]
  if (/\bgioved[iì]\b/.test(lower))   return ui.weekdaysLong[4]
  if (/\bvenerd[iì]\b/.test(lower))   return ui.weekdaysLong[5]
  if (/\bsabato\b/.test(lower))       return ui.weekdaysLong[6]
  if (/\bdomenica\b/.test(lower))     return ui.weekdaysLong[0]
  if (/\bdomeniche\b/.test(lower))    return ui.sundaysPlural
  if (/\bsabati\b/.test(lower))       return ui.saturdaysPlural
  return giorno.length > 22 ? giorno.slice(0, 20) + '…' : giorno
}

export default function ComuneSessionsExplorer({
  marketSlug,
  comune,
  sessions,
  operators,
}: Props) {
  const [lang] = useLang()
  const ui = UI_I18N[lang]
  const searchParams = useSearchParams()
  const initialId = (() => {
    const q = searchParams?.get('s')
    if (q && sessions.some((s) => s.id === q)) return q
    return sessions[0]?.id ?? ''
  })()
  const [activeId, setActiveId] = useState<string>(initialId)

  // Se l'utente cambia query string mentre è sulla pagina, aggiorna la tab
  useEffect(() => {
    const q = searchParams?.get('s')
    if (q && sessions.some((s) => s.id === q) && q !== activeId) setActiveId(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0]
  const cat = active ? classifySchedule(active.settori) : 'generale'

  // TUTTI i banchi del comune con il giorno della loro sessione — niente banchi
  // "nascosti" dietro i tab: prima quelli dell'appuntamento attivo, poi gli altri.
  const sessionById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions])
  const comuneOperators = useMemo(() => {
    const list = operators.filter((o) => o.schedule_id && sessionById.has(o.schedule_id))
    return list.sort((a, b) => {
      const aActive = a.schedule_id === active?.id ? 0 : 1
      const bActive = b.schedule_id === active?.id ? 0 : 1
      return aActive - bActive || a.name.localeCompare(b.name, 'it')
    })
  }, [operators, sessionById, active])

  // Mappa della sessione attiva: pin del mercato + AREA evidenziata (se
  // disegnata in admin) + gli operatori caricati con la loro posizione.
  const mapPins = useMemo(() => {
    if (!active || active.lat == null || active.lng == null) return []
    const pins: Array<{
      id: string; lat: number; lng: number; kind: 'market' | 'operator'
      title: string; subtitle?: string; href?: string
      category?: ReturnType<typeof classifySchedule>
      polygon?: GeoJSON.Feature<GeoJSON.Polygon> | null
    }> = [{
      id: active.id,
      lat: active.lat,
      lng: active.lng,
      kind: 'market' as const,
      title: `${active.comune} · ${active.giorno}`,
      subtitle: active.luogo ?? active.settori ?? undefined,
      category: classifySchedule(active.settori),
      polygon: active.polygon ?? null,
    }]
    for (const op of operators) {
      if (op.schedule_id !== active.id) continue
      if (op.location_lat == null || op.location_lng == null) continue
      pins.push({
        id: `op-${op.id}`,
        lat: op.location_lat,
        lng: op.location_lng,
        kind: 'operator' as const,
        title: op.name,
        subtitle: op.stall_number ? `${ui.comuneBancoSingolare} ${op.stall_number}` : undefined,
        href: `/operatori/${op.id}`,
      })
    }
    return pins
  }, [active, operators, marketSlug, ui])

  if (!active) return null

  return (
    <>
      {/* Scegli un giorno: menu a tendina con i SOLI giorni in cui questo
          comune ha davvero un mercato (una voce per sessione). */}
      {sessions.length > 1 && (
        <section className="mb-6">
          <label htmlFor="comune-giorno" className="block font-alt text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted mb-3">
            {ui.comuneChooseDay}
          </label>
          <div className="relative inline-block w-full max-w-md">
            <span
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLOR[cat] }}
              aria-hidden="true"
            />
            <select
              id="comune-giorno"
              value={active.id}
              onChange={(e) => setActiveId(e.target.value)}
              className="w-full appearance-none font-alt font-semibold text-sm text-ink bg-white border-[1.5px] border-alga/60 rounded-full pl-9 pr-10 py-3 focus:outline-none focus:border-alga cursor-pointer"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {shortLabel(s.giorno, ui)}
                  {s.luogo ? ` — ${s.luogo.length > 40 ? s.luogo.slice(0, 38) + '…' : s.luogo}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" aria-hidden="true" />
          </div>
        </section>
      )}

      {/* Dettaglio sessione: card bianca con band della tipologia */}
      <section className="mb-6">
        <div className="bg-white rounded-xl border border-[#e0d7c1] overflow-hidden shadow-[0_16px_30px_-24px_rgba(38,36,30,0.45)]">
          <span aria-hidden="true" className="mz-band block" style={{ ['--band' as string]: CATEGORY_COLOR[cat] }} />
          <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1.5 mb-1">
                <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink">{active.giorno}</h2>
                {active.orario && <span className="text-sm text-ink-muted tabular-nums">{active.orario}</span>}
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-alt font-bold uppercase tracking-wider text-crema"
                  style={{ background: CATEGORY_COLOR[cat] }}
                >
                  {categoryLabelI18n(cat, lang)}
                </span>
              </div>
              {active.luogo && (
                <p className="text-sm text-ink flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-alga" aria-hidden="true" /> {active.luogo}
                </p>
              )}
              {active.settori && <p className="text-xs text-ink-muted italic mt-2">{active.settori}</p>}
            </div>
            {active.lat != null && active.lng != null && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${active.lat},${active.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="imk-lift inline-flex items-center gap-1.5 px-4 py-2.5 bg-terracotta text-crema rounded-full font-alt text-sm font-semibold hover:bg-terracotta-600 transition-colors flex-shrink-0"
              >
                <Navigation2 className="w-4 h-4" /> {ui.comuneDirections}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Mappa unificata: pin esatto sul luogo + area + parcheggi 2km */}
      {mapPins.length > 0 && (
        <section className="mb-10">
          <MarketViewer pins={mapPins} mapHeight="500px" />
        </section>
      )}

      {/* Banchi del comune (tutte le sessioni, col giorno in evidenza) */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4 text-ink-muted">
          <Store className="w-4 h-4" aria-hidden="true" />
          <h3 className="font-alt text-xs font-semibold uppercase tracking-[0.14em]">
            {ui.comuneBanchi} · {comuneOperators.length}
          </h3>
        </div>
        {comuneOperators.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e0d7c1] p-6 text-sm text-ink-muted">
            {ui.comuneNoOperators}
          </div>
        ) : (
          <ul className="divide-y divide-[#e0d7c1] border-y border-[#e0d7c1]">
            {comuneOperators.map((op) => (
              <li key={op.id}>
                <Link
                  href={`/operatori/${op.id}`}
                  className="group flex items-baseline justify-between gap-4 py-3.5 hover:bg-white -mx-3 px-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-extrabold tracking-tight text-base text-ink leading-tight group-hover:text-terracotta transition-colors">{op.name}</h4>
                    {op.description && <p className="text-sm text-ink-soft line-clamp-1 mt-0.5">{op.description}</p>}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted mt-1">
                      <span className="font-alt font-semibold uppercase tracking-wider text-terracotta-600 bg-terracotta-50 rounded-full px-2 py-0.5">{categoryLabel(op.category, lang)}</span>
                      {op.stall_number && <span>· {ui.comuneBancoSingolare} {op.stall_number}</span>}
                      {sessions.length > 1 && op.schedule_id && sessionById.get(op.schedule_id) && (
                        <span className={`font-alt font-semibold ${op.schedule_id === active.id ? 'text-alga-600' : ''}`}>
                          · {shortLabel(sessionById.get(op.schedule_id)!.giorno, ui)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-ink-muted group-hover:text-terracotta group-hover:translate-x-0.5 transition-all">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
