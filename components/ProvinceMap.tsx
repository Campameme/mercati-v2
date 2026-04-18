'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface Session {
  market_id: string
  market_slug: string
  market_name: string
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  lat: number | null
  lng: number | null
}

interface ComunePoint {
  comune: string
  lat: number
  lng: number
  market_slug: string
  market_name: string
  sessions: Session[]
}

export default function ProvinceMap({ sessions }: { sessions: Session[] }) {
  const points: ComunePoint[] = useMemo(() => {
    const byComune = new Map<string, ComunePoint>()
    for (const s of sessions) {
      if (s.lat == null || s.lng == null) continue
      const prev = byComune.get(s.comune)
      if (prev) {
        prev.sessions.push(s)
      } else {
        byComune.set(s.comune, {
          comune: s.comune,
          lat: s.lat,
          lng: s.lng,
          market_slug: s.market_slug,
          market_name: s.market_name,
          sessions: [s],
        })
      }
    }
    return Array.from(byComune.values())
  }, [sessions])

  return (
    <div className="h-[420px] md:h-[520px] w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        center={[43.9, 7.85]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <CircleMarker
            key={p.comune}
            center={[p.lat, p.lng]}
            radius={8}
            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.75, weight: 2 }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
              {p.comune} · {p.sessions.length} {p.sessions.length === 1 ? 'mercato' : 'mercati'}
            </Tooltip>
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold text-gray-900 mb-1">{p.comune}</div>
                <Link
                  href={`/${p.market_slug}`}
                  className="text-xs text-orange-600 hover:text-orange-700 underline block mb-2"
                >
                  Apri {p.market_name} →
                </Link>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {p.sessions.map((s, i) => (
                    <li key={i} className="text-xs border-t border-gray-100 pt-1 first:border-0 first:pt-0">
                      <div className="font-medium text-gray-800">{s.giorno}</div>
                      {s.orario && <div className="text-gray-600">{s.orario}</div>}
                      {s.luogo && <div className="text-gray-500">{s.luogo}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
