'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
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
  const [activeId, setActiveId] = useState<string>(sessions[0]?.id ?? '')
  const active = sessions.find((s) => s.id === activeId) ?? sessions[0]
  const cat = active ? classifySchedule(active.settori) : 'varie'

  const operatorsForSession = useMemo(() => {
    if (!active) return []
    return operators.filter((o) => o.schedule_id === active.id)
  }, [operators, active])

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
          <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-3">Scegli l&apos;appuntamento</p>
          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => {
              const isActive = s.id === active.id
              const sCat = classifySchedule(s.settori)
              const color = CATEGORY_COLOR[sCat]
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`group flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-sm border text-left transition-all ${
                    isActive
                      ? 'bg-ink text-cream-100 border-ink'
                      : 'bg-cream-50 text-ink border-cream-300 hover:border-olive-500 hover:-translate-y-0.5'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: isActive ? '#FCFAF5' : color }} />
                  <span className="flex flex-col">
                    <span className="font-medium text-sm leading-tight">{shortLabel(s.giorno)}</span>
                    {s.luogo && (
                      <span className={`text-xs leading-tight ${isActive ? 'text-cream-200' : 'text-ink-muted'}`}>
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
        <div className="bg-cream-50 border border-cream-300 rounded-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline flex-wrap gap-x-3 mb-1">
                <h2 className="font-serif text-2xl text-ink">{active.giorno}</h2>
                {active.orario && <span className="text-sm text-ink-muted tabular-nums">{active.orario}</span>}
                <span
                  className="text-[11px] uppercase tracking-wider"
                  style={{ color: CATEGORY_COLOR[cat] }}
                >
                  {CATEGORY_LABEL[cat]}
                </span>
              </div>
              {active.luogo && (
                <p className="text-sm text-ink flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-olive-500" /> {active.luogo}
                </p>
              )}
              {active.settori && <p className="text-xs text-ink-muted italic mt-2">{active.settori}</p>}
            </div>
            {active.lat != null && active.lng != null && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${active.lat},${active.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90 transition-colors flex-shrink-0"
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

      {/* Operatori della sessione */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4 text-ink-muted">
          <Store className="w-4 h-4" />
          <h3 className="text-xs uppercase tracking-widest-plus">
            Banchi · {operatorsForSession.length}
          </h3>
        </div>
        {operatorsForSession.length === 0 ? (
          <div className="bg-cream-50 border border-cream-300 rounded-sm p-6 text-sm text-ink-muted">
            Nessun operatore ancora registrato per questo mercato.
          </div>
        ) : (
          <ul className="divide-y divide-cream-300 border-y border-cream-300">
            {operatorsForSession.map((op) => (
              <li key={op.id}>
                <Link
                  href={`/${marketSlug}/operators/${op.id}`}
                  className="group flex items-baseline justify-between gap-4 py-3.5 hover:bg-cream-50 -mx-3 px-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif text-base text-ink leading-tight">{op.name}</h4>
                    {op.description && <p className="text-sm text-ink-soft line-clamp-1 mt-0.5">{op.description}</p>}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted mt-1">
                      <span className="uppercase tracking-wider">{CAT_LABEL[op.category] ?? op.category}</span>
                      {op.stall_number && <span>· Banco {op.stall_number}</span>}
                    </div>
                  </div>
                  <span className="text-ink-muted group-hover:text-olive-600 group-hover:translate-x-0.5 transition-all">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
