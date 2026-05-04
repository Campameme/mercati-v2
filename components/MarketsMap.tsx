'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import L, { LatLngBoundsExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Override default markers (Leaflet bug with bundlers)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const parkingIcon = L.divIcon({
  className: '',
  html: '<div style="background:#3a6a8a;color:#fff;width:22px;height:22px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,0.3)">P</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

export interface MapPin {
  /** Identifier — schedule_id or comune slug */
  id: string
  lat: number
  lng: number
  /** Title shown on the pin popup, e.g. "Imperia Mercoledì" */
  title: string
  /** Subtitle: luogo + orario or settori */
  subtitle?: string
  /** Optional polygon area for this pin (Feature<Polygon>). */
  polygon?: GeoJSON.Feature<GeoJSON.Polygon> | null
  /** Optional href to push when popup link is clicked. */
  href?: string
}

interface ParkingFromApi {
  id?: string
  name: string
  location: { lat: number; lng: number }
  distance?: number
  capacity?: number
  type?: string
}

interface Props {
  pins: MapPin[]
  /** Map height (Tailwind/CSS units). Default 380px. */
  height?: number | string
  /** Whether to fetch & show parking around the pins' bounding box. Default true. */
  showParking?: boolean
  /** Optional fallback center when pins are empty. */
  fallbackCenter?: [number, number]
  /** Padding when fitting bounds. */
  fitPadding?: number
}

function FitBounds({ pins, padding = 40 }: { pins: MapPin[]; padding?: number }) {
  const map = useMap()
  useEffect(() => {
    if (pins.length === 0) return
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 14)
      return
    }
    const bounds: LatLngBoundsExpression = pins.map((p) => [p.lat, p.lng])
    try {
      map.fitBounds(bounds as any, { padding: [padding, padding] })
    } catch {}
  }, [pins.map((p) => p.id).join('|')]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function MarketsMap({
  pins,
  height = 380,
  showParking = true,
  fallbackCenter = [43.9, 7.85],
  fitPadding = 40,
}: Props) {
  const [parkings, setParkings] = useState<ParkingFromApi[]>([])

  // Centro iniziale: media dei pin o fallback
  const initialCenter: [number, number] = useMemo(() => {
    if (pins.length === 0) return fallbackCenter
    const avgLat = pins.reduce((s, p) => s + p.lat, 0) / pins.length
    const avgLng = pins.reduce((s, p) => s + p.lng, 0) / pins.length
    return [avgLat, avgLng]
  }, [pins, fallbackCenter])

  useEffect(() => {
    if (!showParking || pins.length === 0) {
      setParkings([])
      return
    }
    let cancelled = false
    ;(async () => {
      // Per ogni pin: fetch parcheggi nel raggio default
      const results = await Promise.all(
        pins.map(async (p) => {
          try {
            const url = `/api/parking?lat=${p.lat}&lng=${p.lng}&city=${encodeURIComponent(p.title)}`
            const r = await fetch(url)
            if (!r.ok) return []
            const j = await r.json()
            return (j.data ?? []) as ParkingFromApi[]
          } catch {
            return []
          }
        }),
      )
      if (cancelled) return
      // Dedup per coordinate (entro ~30m)
      const merged: ParkingFromApi[] = []
      for (const list of results) {
        for (const p of list) {
          if (!p?.location) continue
          const dup = merged.some((m) =>
            Math.abs(m.location.lat - p.location.lat) < 0.0003 &&
            Math.abs(m.location.lng - p.location.lng) < 0.0003,
          )
          if (!dup) merged.push(p)
        }
      }
      setParkings(merged)
    })()
    return () => { cancelled = true }
  }, [pins.map((p) => `${p.id}:${p.lat}:${p.lng}`).join('|'), showParking])

  return (
    <div className="rounded-sm overflow-hidden border border-cream-300 bg-cream-50">
      <MapContainer
        center={initialCenter}
        zoom={12}
        scrollWheelZoom={false}
        style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds pins={pins} padding={fitPadding} />

        {pins.map((p) =>
          p.polygon ? (
            <GeoJSON
              key={`poly-${p.id}`}
              data={p.polygon as any}
              style={{ color: '#7d8f4e', fillColor: '#7d8f4e', fillOpacity: 0.18, weight: 2 }}
            />
          ) : null,
        )}

        {pins.map((p) => (
          <Marker key={`pin-${p.id}`} position={[p.lat, p.lng]} icon={defaultIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-ink">{p.title}</div>
                {p.subtitle && <div className="text-xs text-ink-muted mt-0.5">{p.subtitle}</div>}
                {p.href && (
                  <a href={p.href} className="block mt-1 text-xs text-olive-700 underline">
                    Apri pagina →
                  </a>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-xs text-olive-700 underline"
                >
                  Indicazioni
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {parkings.map((p, i) => (
          <Marker key={`park-${i}`} position={[p.location.lat, p.location.lng]} icon={parkingIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-ink">{p.name}</div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {p.type ?? 'Parcheggio'}
                  {p.capacity ? ` · ~${p.capacity} posti` : ''}
                  {p.distance ? ` · ${Math.round(p.distance)}m` : ''}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${p.location.lat},${p.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-xs text-sea-600 underline"
                >
                  Indicazioni
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
