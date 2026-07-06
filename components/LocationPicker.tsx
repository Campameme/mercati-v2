'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, Polygon } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Mappa admin OMOLOGATA a quella pubblica: stesse tile CARTO "Voyager" e
// stessa icona-banco del brand (vedi components/UnifiedMap) al posto del
// marker blu di default di Leaflet.
function bancoIcon(): L.DivIcon {
  const color = '#15607C', dark = '#0E3F52'
  const svg =
    `<svg viewBox="0 0 28 32" width="100%" height="100%" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">` +
    `<rect x="13" y="13" width="2" height="13" fill="${dark}"/>` +
    `<circle cx="14" cy="27" r="3.2" fill="${dark}" stroke="#F7EFDD" stroke-width="1.5"/>` +
    `<rect x="2.5" y="6" width="23" height="5.2" rx="2.2" fill="${color}" stroke="#F7EFDD" stroke-width="1.2"/>` +
    `<path d="M3 11 q2.875 4.4 5.75 0 q2.875 4.4 5.75 0 q2.875 4.4 5.75 0 q2.875 4.4 5.75 0 L25 11 Z" fill="${color}" stroke="#F7EFDD" stroke-width="0.8"/>` +
    `</svg>`
  const w = 36, h = Math.round((w * 32) / 28)
  return L.divIcon({ className: '', html: `<div style="width:${w}px;height:${h}px">${svg}</div>`, iconSize: [w, h], iconAnchor: [w / 2, Math.round(h * 0.84)] })
}

interface Props {
  center: [number, number]
  zoom?: number
  value: [number, number] | null
  onChange: (pos: [number, number]) => void
  areaPositions?: [number, number][] | null
}

function ClickCapture({ onChange }: { onChange: (pos: [number, number]) => void }) {
  const map = useMap()
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => onChange([e.latlng.lat, e.latlng.lng])
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [map, onChange])
  return null
}

function DraggableMarker({ value, onChange }: { value: [number, number] | null; onChange: (pos: [number, number]) => void }) {
  const ref = useRef<L.Marker>(null)
  if (!value) return null
  return (
    <Marker
      position={value}
      draggable
      icon={bancoIcon()}
      ref={ref}
      eventHandlers={{
        dragend: () => {
          const m = ref.current
          if (!m) return
          const ll = m.getLatLng()
          onChange([ll.lat, ll.lng])
        },
      }}
    />
  )
}

export default function LocationPicker({ center, zoom = 17, value, onChange, areaPositions }: Props) {
  return (
    <MapContainer center={value ?? center} zoom={zoom} style={{ width: '100%', height: 420 }} scrollWheelZoom>
      {/* Stesse tile della mappa pubblica (CARTO Voyager) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      {areaPositions && (
        <Polygon
          positions={areaPositions}
          pathOptions={{ color: '#0E3040', fillColor: '#15607C', fillOpacity: 0.16, weight: 2 }}
        />
      )}
      <ClickCapture onChange={onChange} />
      <DraggableMarker value={value} onChange={onChange} />
    </MapContainer>
  )
}
