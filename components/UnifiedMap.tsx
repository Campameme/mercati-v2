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
  /** 'default' (cream/olive, comportamento storico) | 'bold' (home mappa-centrica) */
  variant?: 'default' | 'bold'
  /** se fornita, il click sul pin invoca questa callback invece di aprire il Popup */
  onPinClick?: (pin: UnifiedMapPin) => void
  /** id del pin attualmente selezionato (evidenziato nella variante bold) */
  selectedId?: string | null
  /** se true, la mappa si centra/zooma sul pin selezionato */
  panToSelected?: boolean
  /** se true, niente bordo/sfondo sul wrapper (mappa full-bleed) */
  bare?: boolean
  /** posizione dell'utente: mostra un pin dedicato e ci si centra */
  userLocation?: { lat: number; lng: number } | null
}

// ---- Icone divIcon (variante default, comportamento storico) --------------

const marketIcon = L.divIcon({
  className: '',
  html: `<div style="background:#15607C;color:#fff;width:40px;height:40px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:16px;box-shadow:0 1px 4px rgba(0,0,0,0.3)">M</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

const parkingIcon = L.divIcon({
  className: '',
  html: `<div style="background:#0E3040;color:#fff;width:26px;height:26px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;font-weight:700;font-size:13px;box-shadow:0 1px 3px rgba(0,0,0,0.3)">P</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

const operatorIcon = L.divIcon({
  className: '',
  html: `<div style="background:#15607C;width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function defaultIcon(kind: UnifiedMapPin['kind']): L.DivIcon {
  if (kind === 'market') return marketIcon
  if (kind === 'parking') return parkingIcon
  return operatorIcon
}

// ---- Icone variante "bold" (Imperia / Riviera) ----------------------------

function boldIcon(kind: UnifiedMapPin['kind'], selected: boolean): L.DivIcon {
  if (kind === 'parking') {
    const html = `<div style="width:24px;height:24px;border-radius:8px;background:#1A1714;color:#F4B62C;border:2px solid #F7EFDD;display:flex;align-items:center;justify-content:center;font-family:'Archivo Black',sans-serif;font-weight:700;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.35)">P</div>`
    return L.divIcon({ className: '', html, iconSize: [24, 24], iconAnchor: [12, 12] })
  }
  if (kind === 'operator') {
    const html = `<div style="width:14px;height:14px;border-radius:50%;background:#15607C;border:2px solid #F7EFDD;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`
    return L.divIcon({ className: '', html, iconSize: [14, 14], iconAnchor: [7, 7] })
  }
  // market
  const d = selected ? 30 : 20
  const wrap = selected ? 56 : 30
  const color = selected ? '#F4B62C' : '#15607C'
  const ring = selected
    ? `<span class="imk-pin-ring" style="color:${color}"></span>`
    : ''
  const html =
    `<div style="position:relative;width:${wrap}px;height:${wrap}px;display:flex;align-items:center;justify-content:center">` +
    ring +
    `<div style="width:${d}px;height:${d}px;border-radius:50%;background:${color};border:3px solid #1A1714;box-shadow:0 3px 8px rgba(0,0,0,0.4)"></div>` +
    `</div>`
  return L.divIcon({ className: '', html, iconSize: [wrap, wrap], iconAnchor: [wrap / 2, wrap / 2] })
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:22px;height:22px"><span class="imk-pin-ring" style="color:#EC6A5E"></span><div style="width:16px;height:16px;margin:3px;border-radius:50%;background:#EC6A5E;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

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

// ---- PanTo helper (variante bold) ----------------------------------------

function PanTo({ pin }: { pin: UnifiedMapPin | undefined }) {
  const map = useMap()
  useEffect(() => {
    if (!pin) return
    const targetZoom = Math.max(map.getZoom(), 14)
    map.flyTo([pin.lat, pin.lng], targetZoom, { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin?.id])
  return null
}

// ---- Componente principale -----------------------------------------------

export default function UnifiedMap({
  pins,
  height = 460,
  showParkingNearby = false,
  maxZoom = 16,
  variant = 'default',
  onPinClick,
  selectedId = null,
  panToSelected = false,
  bare = false,
  userLocation = null,
}: Props) {
  const [parkingPins, setParkingPins] = useState<UnifiedMapPin[]>([])
  const isBold = variant === 'bold'

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
        // UNA sola chiamata server-side con tutti i punti → niente race condition
        // Google Places, niente rate-limit, dedup garantito sul backend.
        const points = marketPins.map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join('|')
        const params = new URLSearchParams()
        params.set('points', points)
        params.set('city', marketPins[0]?.title ?? 'Liguria')
        const r = await fetch(`/api/parking?${params.toString()}`)
        if (cancelled) return
        if (!r.ok) {
          setParkingPins([])
          return
        }
        const j = await r.json()
        const list: any[] = Array.isArray(j?.data) && j?.success ? j.data : []
        const merged: UnifiedMapPin[] = []
        for (const p of list) {
          const lat = p?.location?.lat
          const lng = p?.location?.lng
          if (typeof lat !== 'number' || typeof lng !== 'number') continue
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
  // FitBounds SOLO su pin "primari" (market/operator), non sui parcheggi:
  // i parcheggi sono satellite, possono allargare troppo il bounding e
  // far perdere fuoco sull'area mercato effettiva.
  const fitPoints = useMemo<[number, number][]>(
    () => pins.filter((p) => p.kind !== 'parking').map((p) => [p.lat, p.lng]),
    [pins],
  )

  // Centro iniziale: media o default Liguria
  const initialCenter = useMemo<[number, number]>(() => {
    if (allPins.length === 0) return [43.9, 7.85]
    if (allPins.length === 1) return [allPins[0].lat, allPins[0].lng]
    const sumLat = allPins.reduce((s, p) => s + p.lat, 0)
    const sumLng = allPins.reduce((s, p) => s + p.lng, 0)
    return [sumLat / allPins.length, sumLng / allPins.length]
  }, [allPins])

  const selectedPin = useMemo(
    () => (selectedId ? allPins.find((p) => p.id === selectedId) : undefined),
    [allPins, selectedId],
  )

  const wrapperClass = bare
    ? 'h-full w-full overflow-hidden imk-map'
    : 'rounded-sm overflow-hidden border border-cream-300 bg-cream-50'

  return (
    <div className={wrapperClass} style={{ height }}>
      <MapContainer
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Tile CARTO "Voyager" — minimalista, tonalita pastello coerenti con
            la palette del sito. Attribution corretta (CARTO + OSM). */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <FitBounds points={fitPoints} maxZoom={maxZoom} />
        {panToSelected && <PanTo pin={selectedPin} />}
        {userLocation && (
          <PanTo pin={{ id: '__user', lat: userLocation.lat, lng: userLocation.lng, kind: 'market', title: '' }} />
        )}

        {/* Polygons (sotto i marker) */}
        {allPins.map((pin) =>
          pin.polygon ? (
            <GeoJSON
              key={`poly-${pin.id}-${JSON.stringify(pin.polygon)}`}
              data={pin.polygon}
              style={
                {
                  color: isBold ? '#1A1714' : '#0E3040',
                  fillColor: isBold ? '#15607C' : '#15607C',
                  fillOpacity: 0.3,
                  weight: 3,
                  opacity: 0.95,
                } as any
              }
            />
          ) : null,
        )}

        {/* Markers */}
        {allPins.map((pin) => {
          const icon = isBold ? boldIcon(pin.kind, pin.id === selectedId) : defaultIcon(pin.kind)
          return (
            <Marker
              key={`pin-${pin.kind}-${pin.id}`}
              position={[pin.lat, pin.lng]}
              icon={icon}
              zIndexOffset={pin.id === selectedId ? 1000 : 0}
              eventHandlers={onPinClick ? { click: () => onPinClick(pin) } : undefined}
            >
              {/* Senza onPinClick manteniamo il Popup storico; con onPinClick il
                  dettaglio è gestito esternamente (card). */}
              {!onPinClick && (
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
              )}
            </Marker>
          )
        })}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={2000} />
        )}
      </MapContainer>
    </div>
  )
}
