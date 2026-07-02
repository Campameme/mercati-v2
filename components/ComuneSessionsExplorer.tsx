'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MapPin, Store, Navigation2 } from 'lucide-react'
import MarketViewer from '@/components/MarketViewer'
import { classifySchedule, CATEGORY_COLOR, CATEGORY_LABEL } from '@/lib/schedules/classify'

interface SessionLite {
  id: string
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  settori: string | null
  lat: number | null
  lng: number | null
  polygon_geojson?: GeoJSON.Feature<GeoJSON.Polygon> | null
  /** Polygon ereditato dal place (preferito). Fallback su polygon_geojson legacy. */
  placePolygon?: GeoJSON.Feature<GeoJSON.Polygon> | null
}

interface OperatorLite {
  id: string
  name: string
  category: string
  description: string | null
  stall_number: string | null
  schedule_id: string | null
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

const CAT_LABEL: Record<string, string> = {
  fruit_vegetables: 'Frutta e verdura',
  bakery: 'Panificio',
  meat_fish: 'Carne e pesce',
  dairy: 'Latticini',
  flowers: 'Fiori',
  clothing: 'Abbigliamento',
  food: 'Alimentare',
  other: 'Altro',
}

function shortLabel(giorno: string): string {
  const lower = giorno.toLowerCase()
  if (/\bluned[iì]\b/.test(lower))    return 'Lunedì'
  if (/\bmarted[iì]\b/.test(lower))   return 'Martedì'
  if (/\bmercoled[iì]\b/.test(lower)) return 'Mercoledì'
  if (/\bgioved[iì]\b/.test(lower))   return 'Giovedì'
  if (/\bvenerd[iì]\b/.test(lower))   return 'Venerdì'
  if (/\bsabato\b/.test(lower))       return 'Sabato'
  if (/\bdomenica\b/.test(lower))     return 'Domenica'
  if (/\bdomeniche\b/.test(lower))    return 'Domeniche'
  if (/\bsabati\b/.test(lower))       return 'Sabati'
  return giorno.length > 22 ? giorno.slice(0, 20) + '…' : giorno
}

export default function ComuneSessionsExplorer({
  marketSlug,
  comune,
  sessions,
  operators,
}: Props) {
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

  const mapPins = useMemo(() => {
    if (!active || active.lat == null || active.lng == null) return []
    return [{
      id: active.id,
      lat: active.lat,
      lng: active.lng,
      kind: 'market' as const,
      title: `${active.comune} · ${active.giorno}`,
      subtitle: active.luogo ?? active.settori ?? undefined,
      polygon: (active.placePolygon ?? active.polygon_geojson ?? null) as any,
    }]
  }, [active])

  if (!active) return null

  return (
    <>
      {/* Tab sessione (solo se più di una) */}
      {sessions.length > 1 && (
        <section className="mb-6">
          <p className="font-alt text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted mb-3">Scegli l&apos;appuntamento</p>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => {
              const isActive = s.id === active.id
              const sCat = classifySchedule(s.settori)
              const color = CATEGORY_COLOR[sCat]
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  aria-pressed={isActive}
                  className={`group flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full border-2 text-left transition-colors ${
                    isActive
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-white text-ink border-ink/15 hover:border-mare'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: isActive ? '#FBF6EA' : color }} />
                  <span className="flex flex-col">
                    <span className="font-alt font-semibold text-sm leading-tight">{shortLabel(s.giorno)}</span>
                    {s.luogo && (
                      <span className={`text-xs leading-tight ${isActive ? 'text-paper/70' : 'text-ink-muted'}`}>
                        {s.luogo.length > 38 ? s.luogo.slice(0, 36) + '…' : s.luogo}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Dettaglio sessione */}
      <section className="mb-6">
        <div className="bg-white border-2 border-ink/10 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline flex-wrap gap-x-3 mb-1">
                <h2 className="font-display text-2xl text-ink">{active.giorno}</h2>
                {active.orario && <span className="text-sm text-ink-muted tabular-nums">{active.orario}</span>}
                <span
                  className="font-alt text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: CATEGORY_COLOR[cat] }}
                >
                  {CATEGORY_LABEL[cat]}
                </span>
              </div>
              {active.luogo && (
                <p className="text-sm text-ink flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-mare" aria-hidden="true" /> {active.luogo}
                </p>
              )}
              {active.settori && <p className="text-xs text-ink-muted italic mt-2">{active.settori}</p>}
            </div>
            {active.lat != null && active.lng != null && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${active.lat},${active.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="imk-lift inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink text-paper rounded-full font-alt text-sm font-semibold hover:bg-mare transition-colors flex-shrink-0"
              >
                <Navigation2 className="w-4 h-4" /> Indicazioni
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
            Banchi · {comuneOperators.length}
          </h3>
        </div>
        {comuneOperators.length === 0 ? (
          <div className="bg-white border-2 border-ink/10 rounded-xl p-6 text-sm text-ink-muted">
            Nessun operatore ancora registrato per questo mercato.
          </div>
        ) : (
          <ul className="divide-y-2 divide-ink/10 border-y-2 border-ink/10">
            {comuneOperators.map((op) => (
              <li key={op.id}>
                <Link
                  href={`/${marketSlug}/operators/${op.id}`}
                  className="group flex items-baseline justify-between gap-4 py-3.5 hover:bg-white -mx-3 px-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display text-base text-ink leading-tight">{op.name}</h4>
                    {op.description && <p className="text-sm text-ink-soft line-clamp-1 mt-0.5">{op.description}</p>}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted mt-1">
                      <span className="font-alt font-semibold uppercase tracking-wider">{CAT_LABEL[op.category] ?? op.category}</span>
                      {op.stall_number && <span>· Banco {op.stall_number}</span>}
                      {sessions.length > 1 && op.schedule_id && sessionById.get(op.schedule_id) && (
                        <span className={`font-alt font-semibold ${op.schedule_id === active.id ? 'text-mare-600' : ''}`}>
                          · {shortLabel(sessionById.get(op.schedule_id)!.giorno)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-ink-muted group-hover:text-mare-600 group-hover:translate-x-0.5 transition-all">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
