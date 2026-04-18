'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

interface Props {
  center: [number, number]
  zoom: number
  initialPolygon?: GeoJSON.Feature<GeoJSON.Polygon> | null
  onPolygonChange: (f: GeoJSON.Feature<GeoJSON.Polygon> | null) => void
}

function GeomanLayer({ initialPolygon, onPolygonChange }: Pick<Props, 'initialPolygon' | 'onPolygonChange'>) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)
  const [ready, setReady] = useState(false)

  function replaceLayer(newLayer: L.Layer | null) {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
    }
    layerRef.current = newLayer
    if (newLayer) {
      const gj = (newLayer as any).toGeoJSON() as GeoJSON.Feature<GeoJSON.Polygon>
      onPolygonChange(gj)
    } else {
      onPolygonChange(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // Dynamic import ensures Geoman's side effects attach to L.Map.prototype client-side
      await import('@geoman-io/leaflet-geoman-free')
      if (cancelled) return
      setReady(true)
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!ready) return
    const LAny = L as any
    // The map is created before Geoman loaded, so the init-hook never fired.
    // Manually attach pm to this map instance.
    if (!(map as any).pm && LAny.PM?.Map) {
      ;(map as any).pm = new LAny.PM.Map(map)
    }
    if (!(map as any).pm) {
      console.error('Geoman non caricato: L.PM.Map non disponibile')
      return
    }
    ;(map as any).pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawCircle: false,
      drawRectangle: false,
      drawPolyline: false,
      drawText: false,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    })
    ;(map as any).pm.setGlobalOptions({ allowSelfIntersection: false })

    if (initialPolygon) {
      const layer = L.geoJSON(initialPolygon, { style: { color: '#f97316', fillOpacity: 0.2 } }).getLayers()[0]
      if (layer) {
        layer.addTo(map)
        layerRef.current = layer
        onPolygonChange(initialPolygon)
        try { map.fitBounds((layer as any).getBounds(), { padding: [20, 20] }) } catch {}
      }
    }

    const handleCreate = (e: any) => {
      const layer = e.layer as L.Layer
      // Enforce single polygon: replace any existing one
      if (layerRef.current && layerRef.current !== layer) {
        map.removeLayer(layerRef.current)
      }
      replaceLayer(layer)
    }
    const handleEdit = (e: any) => {
      const layer = e.layer as L.Layer
      replaceLayer(layer)
    }
    const handleRemove = () => {
      layerRef.current = null
      onPolygonChange(null)
    }

    map.on('pm:create', handleCreate)
    map.on('pm:edit', handleEdit)
    map.on('pm:remove', handleRemove)
    return () => {
      map.off('pm:create', handleCreate)
      map.off('pm:edit', handleEdit)
      map.off('pm:remove', handleRemove)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, ready])

  return null
}

export default function MarketAreaDrawer({ center, zoom, initialPolygon, onPolygonChange }: Props) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: 560 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeomanLayer initialPolygon={initialPolygon} onPolygonChange={onPolygonChange} />
    </MapContainer>
  )
}
