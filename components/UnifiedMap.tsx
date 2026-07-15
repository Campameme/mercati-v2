'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CATEGORY_COLOR, CATEGORY_COLOR_DARK, type ScheduleCategory } from '@/lib/schedules/classify'
import { nearestParkings } from '@/lib/markets/parkings'

export interface UnifiedMapPin {
  id: string
  lat: number
  lng: number
  kind: 'market' | 'parking' | 'operator'
  title: string
  subtitle?: string
  href?: string
  /**
   * Area del mercato (poligono disegnato in admin). Disegnata SOLO dove viene
   * passata: le schede del singolo mercato (pagina comune) la mostrano, le
   * mappe di panoramica (home, /mappa, zona) restano a soli pin.
   */
  polygon?: GeoJSON.Feature<GeoJSON.Polygon> | null
  /** Solo per parking: distanza in metri dal mercato (mostrata nel popup) */
  distance?: number
  /** Tipologia del mercato → colore dell'icona banco */
  category?: ScheduleCategory
}

interface Props {
  pins: UnifiedMapPin[]
  height?: number | string
  /** se true e ci sono pin con kind='market', aggiunge i parcheggi statici OSM (lib/markets/parkings) vicini a ogni mercato come pin kind='parking'. Default false. */
  showParkingNearby?: boolean
  /** maxZoom per fitBounds, default 16 */
  maxZoom?: number
  /** se fornita, il click sul pin invoca questa callback invece di aprire il Popup */
  onPinClick?: (pin: UnifiedMapPin) => void
  /** id del pin attualmente selezionato (ingrandito e in evidenza) */
  selectedId?: string | null
  /** se true, la mappa si centra/zooma sul pin selezionato */
  panToSelected?: boolean
  /** se true, niente bordo/sfondo sul wrapper (mappa full-bleed) */
  bare?: boolean
  /** posizione dell'utente: mostra un pin dedicato e ci si centra */
  userLocation?: { lat: number; lng: number } | null
}

// ---- Pin del sistema Nodo × Mezzogiorno ------------------------------------
// Un solo linguaggio su TUTTE le mappe (home, /mappa, pagine zona): PUNTI
// semplici e discreti, colorati per tipologia (alga=generale, verde orto=
// alimentare, terracotta=antiquariato, viola=artigianato). Il selezionato
// cresce e prende l'anello; P scura per i parcheggi, puntino per gli operatori.

function pinIcon(pin: UnifiedMapPin, selected: boolean): L.DivIcon {
  const kind = pin.kind
  if (kind === 'parking') {
    const html = `<div style="width:22px;height:22px;border-radius:7px;background:#26241E;color:#EAC54F;border:2px solid #FBF6EC;display:flex;align-items:center;justify-content:center;font-family:var(--font-alt),sans-serif;font-weight:800;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">P</div>`
    return L.divIcon({ className: '', html, iconSize: [22, 22], iconAnchor: [11, 11] })
  }
  if (kind === 'operator') {
    const html = `<div style="width:13px;height:13px;border-radius:50%;background:#46683B;border:2px solid #FBF6EC;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`
    return L.divIcon({ className: '', html, iconSize: [13, 13], iconAnchor: [7, 7] })
  }
  // market → punto colorato per tipologia. I mercati PRINCIPALI (settimanali,
  // 'generale') hanno il pin più grande e il bordo più marcato; i tematici
  // (antiquariato/alimentare/artigianato) restano più piccoli e discreti.
  // Il selezionato cresce ancora e prende l'anello.
  const cat = pin.category ?? 'generale'
  const color = CATEGORY_COLOR[cat]
  const dark = CATEGORY_COLOR_DARK[cat]
  const principale = cat === 'generale'
  const base = principale ? 23 : 15
  const size = selected ? base + 9 : base
  const border = principale ? 3 : 2.5
  const ring = selected ? `<span class="imk-pin-ring" style="color:${color};position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)"></span>` : ''
  const html =
    `<div style="position:relative;width:${size}px;height:${size}px">${ring}` +
    `<div style="width:100%;height:100%;border-radius:50%;background:${color};border:${border}px solid #FBF6EC;box-shadow:0 0 0 1px ${dark}40, 0 2px 6px rgba(0,0,0,0.3)"></div></div>`
  return L.divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:22px;height:22px"><span class="imk-pin-ring" style="color:#C4593C"></span><div style="width:16px;height:16px;margin:3px;border-radius:50%;background:#C4593C;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div></div>`,
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
    try {
      const targetZoom = Math.max(map.getZoom(), 14)
      map.flyTo([pin.lat, pin.lng], targetZoom, { duration: 0.8 })
    } catch {
      /* mappa non ancora dimensionata: ignora */
    }
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
  onPinClick,
  selectedId = null,
  panToSelected = false,
  bare = false,
  userLocation = null,
}: Props) {
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
    // Parcheggi statici OSM (lib/markets/parkings): niente API esterne, niente
    // Google. Il titolo del pin mercato è il comune → lookup diretto, con dedup
    // per coordinate quando più mercati condividono lo stesso comune.
    const merged: UnifiedMapPin[] = []
    const seen = new Set<string>()
    for (const mp of marketPins) {
      for (const p of nearestParkings(mp.lat, mp.lng, mp.title ?? '', 4)) {
        const key = `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`
        if (seen.has(key)) continue
        seen.add(key)
        merged.push({
          id: `parking-${key}`,
          lat: p.lat,
          lng: p.lng,
          kind: 'parking',
          title: p.name || 'Parcheggio',
          subtitle: p.fee == null ? undefined : p.fee ? 'A pagamento' : 'Gratuito',
          distance: p.distance,
        })
      }
    }
    setParkingPins(merged)
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
    : 'rounded-sm overflow-hidden border border-ink/15 bg-white'

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

        {/* Aree mercato (sotto i marker) — solo per i pin che le portano */}
        {allPins.map((pin) =>
          pin.polygon ? (
            <GeoJSON
              key={`area-${pin.id}`}
              data={pin.polygon}
              style={{
                color: '#0E3040',
                fillColor: '#15607C',
                fillOpacity: 0.16,
                weight: 2,
                opacity: 0.85,
              } as any}
            />
          ) : null,
        )}

        {/* Markers — icona banco unica */}
        {allPins.map((pin) => {
          const icon = pinIcon(pin, pin.id === selectedId)
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
                    <div className="font-semibold text-ink">{pin.title}</div>
                    {pin.subtitle && <div className="text-xs text-ink-soft mt-0.5">{pin.subtitle}</div>}
                    {pin.kind === 'parking' && typeof pin.distance === 'number' && (
                      <div className="text-xs text-ink-muted mt-0.5">
                        {pin.distance < 1000 ? `${Math.round(pin.distance)}m` : `${(pin.distance / 1000).toFixed(1)}km`}
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 mt-1.5">
                      {pin.href && (
                        <a href={pin.href} className="text-xs text-mare-700 underline">
                          Apri pagina →
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-mare-700 underline"
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
