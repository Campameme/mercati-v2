'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface UnifiedMapPin {
  id: string
  lat: number
  lng: number
  kind: 'market' | 'parking' | 'operator'
  title: string
  subtitle?: string
  href?: string
  polygon?: GeoJSON.Feature<GeoJSON.Polygon> | null
  /** Solo per parking: distanza in metri dal mercato (mostrata nel popup) */
  distance?: number
}

interface Props {
  pins: UnifiedMapPin[]
  height?: number | string
  /** se true e ci sono pin con kind='market', fetch /api/parking per ognuno e li aggiunge come pin kind='parking'. Default false. */
  showParkingNearby?: boolean
  /** maxZoom per fitBounds, default 16 */
  maxZoom?: number
}

// ---- Icone divIcon -------------------------------------------------------

const marketIcon = L.divIcon({
  className: '',
  html: `<div style="background:#5d6e3b;color:#fff;width:40px;height:40px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:16px;box-shadow:0 1px 4px rgba(0,0,0,0.3)">M</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

const parkingIcon = L.divIcon({
  className: '',
  html: `<div style="background:#3a6a8a;color:#fff;width:26px;height:26px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;font-weight:700;font-size:13px;box-shadow:0 1px 3px rgba(0,0,0,0.3)">P</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

const operatorIcon = L.divIcon({
  className: '',
  html: `<div style="background:#7d8f4e;width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function iconFor(kind: UnifiedMapPin['kind']): L.DivIcon {
  if (kind === 'market') return marketIcon
  if (kind === 'parking') return parkingIcon
  return operatorIcon
}

// ---- FitBounds helper ----------------------------------------------------

function FitBounds({ points, maxZoom }: { points: Array<[number, number]>; maxZoom: number }) {
  const map = useMap()
  const key = points.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join('|')
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 16)
      return
    }
    try {
      map.fitBounds(points as L.LatLngBoundsExpression, { padding: [60, 60], maxZoom })
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, maxZoom])
  return null
}

// ---- Componente principale -----------------------------------------------

export default function UnifiedMap({ pins, height = 460, showParkingNearby = false, maxZoom = 16 }: Props) {
  const [parkingPins, setParkingPins] = useState<UnifiedMapPin[]>([])

  // chiave stabile sui market pin per dipendenza dell'effetto fetch
  const marketsKey = useMemo(
    () =>
      pins
        .filter((p) => p.kind === 'market')
        .map((p) => `${p.id}:${p.lat.toFixed(5)}:${p.lng.toFixed(5)}`)
        .join('|'),
    [pins],
  )

  useEffect(() => {
    if (!showParkingNearby) {
      setParkingPins([])
      return
    }
    const marketPins = pins.filter((p) => p.kind === 'market')
    if (marketPins.length === 0) {
      setParkingPins([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const lists = await Promise.all(
          marketPins.map(async (pin) => {
            const params = new URLSearchParams()
            params.set('lat', String(pin.lat))
            params.set('lng', String(pin.lng))
            params.set('city', pin.title)
            try {
              const r = await fetch(`/api/parking?${params.toString()}`)
              if (!r.ok) return [] as any[]
              const j = await r.json()
              return Array.isArray(j?.data) && j?.success ? j.data : []
            } catch {
              return []
            }
          }),
        )
        if (cancelled) return
        const merged: UnifiedMapPin[] = []
        for (const list of lists) {
          for (const p of list) {
            const lat = p?.location?.lat
            const lng = p?.location?.lng
            if (typeof lat !== 'number' || typeof lng !== 'number') continue
            // dedup ~30m (~0.0003 deg)
            const dup = merged.some(
              (m) => Math.abs(m.lat - lat) < 0.0003 && Math.abs(m.lng - lng) < 0.0003,
            )
            if (dup) continue
            merged.push({
              id: `parking-${p.id ?? `${lat},${lng}`}`,
              lat,
              lng,
              kind: 'parking',
              title: p.name ?? 'Parcheggio',
              subtitle: p.address ?? undefined,
              distance: typeof p.distance === 'number' ? p.distance : undefined,
            })
          }
        }
        setParkingPins(merged)
      } catch {
        if (!cancelled) setParkingPins([])
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketsKey, showParkingNearby])

  const allPins = useMemo(() => [...pins, ...parkingPins], [pins, parkingPins])
  const fitPoints = useMemo<[number, number][]>(() => allPins.map((p) => [p.lat, p.lng]), [allPins])

  // Centro iniziale: media o default Liguria
  const initialCenter = useMemo<[number, number]>(() => {
    if (allPins.length === 0) return [43.9, 7.85]
    if (allPins.length === 1) return [allPins[0].lat, allPins[0].lng]
    const sumLat = allPins.reduce((s, p) => s + p.lat, 0)
    const sumLng = allPins.reduce((s, p) => s + p.lng, 0)
    return [sumLat / allPins.length, sumLng / allPins.length]
  }, [allPins])

  return (
    <div className="rounded-sm overflow-hidden border border-cream-300 bg-cream-50" style={{ height }}>
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={fitPoints} maxZoom={maxZoom} />

        {/* Polygons (sotto i marker) */}
        {allPins.map((pin) =>
          pin.polygon ? (
            <GeoJSON
              key={`poly-${pin.id}-${JSON.stringify(pin.polygon)}`}
              data={pin.polygon}
              style={{ color: '#5d6e3b', fillColor: '#7d8f4e', fillOpacity: 0.25, weight: 2 } as any}
            />
          ) : null,
        )}

        {/* Markers */}
        {allPins.map((pin) => (
          <Marker key={`pin-${pin.kind}-${pin.id}`} position={[pin.lat, pin.lng]} icon={iconFor(pin.kind)}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{pin.title}</div>
                {pin.subtitle && <div className="text-xs text-gray-600 mt-0.5">{pin.subtitle}</div>}
                {pin.kind === 'parking' && typeof pin.distance === 'number' && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {pin.distance < 1000 ? `${Math.round(pin.distance)}m` : `${(pin.distance / 1000).toFixed(1)}km`}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 mt-1.5">
                  {pin.href && (
                    <a href={pin.href} className="text-xs text-olive-700 underline">
                      Apri pagina →
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-olive-700 underline"
                  >
                    Indicazioni
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
