'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, Polygon } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

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
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {areaPositions && (
        <Polygon
          positions={areaPositions}
          pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.15, weight: 2 }}
        />
      )}
      <ClickCapture onChange={onChange} />
      <DraggableMarker value={value} onChange={onChange} />
    </MapContainer>
  )
}
