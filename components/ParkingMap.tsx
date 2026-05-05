'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GoogleMap, Marker, InfoWindow, Polygon } from '@react-google-maps/api'
import ParkingCard from './ParkingCard'
import { Parking } from '@/types/parking'
import { useMarketSlug } from '@/lib/markets/useMarketSlug'
import { geojsonToGoogleMapsPath } from '@/lib/geo/geojsonToGoogleMapsPath'
import { crowdingColor } from './CrowdingBadge'
import { matchesFilter, type ParkingFilter } from './ParkingFilters'

// Rimuoviamo le zone inventate - useremo solo i parcheggi reali

const defaultMapHeight = '600px'

const defaultCenter = {
  lat: 43.7885,
  lng: 7.6060,
}

export interface MarketPin {
  id: string
  lat: number
  lng: number
  label: string
  subtitle?: string
  href?: string
  polygon?: GeoJSON.Feature<GeoJSON.Polygon> | null
}

interface ParkingMapProps {
  onSelectParking: (id: string | null) => void
  filter?: ParkingFilter
  /**
   * Se fornite, sovrascrivono la ricerca per marketSlug e centrano mappa + query API
   * su coordinate esplicite (usato per i mercati a livello comune/sessione).
   */
  coordsOverride?: { lat: number; lng: number; city?: string }
  /** Pin di mercato (uno o più). Se valorizzato, ignora marketSlug/coordsOverride. */
  marketPins?: MarketPin[]
  height?: string
}

export default function ParkingMap({ onSelectParking, filter, coordsOverride, marketPins, height = '600px' }: ParkingMapProps) {
  const autoSlug = useMarketSlug()
  // Priorità: marketPins > coordsOverride > marketSlug (URL)
  const useMulti = !!(marketPins && marketPins.length > 0)
  const marketSlug = useMulti || coordsOverride ? undefined : autoSlug
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null)
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(null)
  const [selectedMarketPinId, setSelectedMarketPinId] = useState<string | null>(null)
  const [center, setCenter] = useState(defaultCenter)
  const [zoom, setZoom] = useState<number>(15)
  const [parkings, setParkings] = useState<Parking[]>([])
  const [areaPath, setAreaPath] = useState<google.maps.LatLngLiteral[]>([])
  const [pinPolygons, setPinPolygons] = useState<Array<{ id: string; path: google.maps.LatLngLiteral[] }>>([])
  const [areaStyle, setAreaStyle] = useState<{ color: string; fillOpacity: number }>({ color: '#7d8f4e', fillOpacity: 0.18 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite')
  const mapRef = useRef<google.maps.Map | null>(null)
  const pinsKey = (marketPins ?? []).map((p) => `${p.id}:${p.lat}:${p.lng}`).join('|')

  // Carica parcheggi
  useEffect(() => {
    const loadParkings = async () => {
      try {
        setLoading(true)
        setError(null)

        // Multi-pin: una fetch per ogni pin, poi merge dedup
        if (useMulti && marketPins) {
          const lists = await Promise.all(
            marketPins.map(async (pin) => {
              const p = new URLSearchParams()
              p.set('lat', String(pin.lat))
              p.set('lng', String(pin.lng))
              p.set('city', pin.label)
              const r = await fetch(`/api/parking?${p.toString()}`)
              if (!r.ok) return [] as Parking[]
              const j = await r.json()
              return (j.success && Array.isArray(j.data) ? j.data : []) as Parking[]
            }),
          )
          const merged: Parking[] = []
          for (const l of lists) {
            for (const p of l) {
              if (!p?.location?.lat || !p?.location?.lng) continue
              const dup = merged.some((m) =>
                Math.abs(m.location.lat - p.location.lat) < 0.0003 &&
                Math.abs(m.location.lng - p.location.lng) < 0.0003,
              )
              if (!dup) merged.push(p)
            }
          }
          setParkings(merged)
          setLoading(false)
          return
        }

        let qs = ''
        if (coordsOverride) {
          const p = new URLSearchParams()
          p.set('lat', String(coordsOverride.lat))
          p.set('lng', String(coordsOverride.lng))
          if (coordsOverride.city) p.set('city', coordsOverride.city)
          qs = `?${p.toString()}`
        } else if (marketSlug) {
          qs = `?marketSlug=${encodeURIComponent(marketSlug)}`
        }
        const response = await fetch(`/api/parking${qs}`)
        console.log('ParkingMap: Response status:', response.status, response.statusText)
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText)
          console.error('ParkingMap: Errore HTTP:', response.status, errorText)
          setError(`Errore HTTP ${response.status}: ${errorText}`)
          setLoading(false)
          return
        }
        
        const result = await response.json()
        console.log('ParkingMap: Risposta API:', {
          success: result.success,
          count: result.count,
          dataLength: result.data?.length,
          message: result.message,
          warning: result.warning,
          error: result.error,
        })
        
        if (result.success && result.data && Array.isArray(result.data)) {
          // Mostra tutti i parcheggi senza deduplicazione eccessiva
          // La deduplicazione è già fatta nel backend
          const validParkings = result.data.filter((p: Parking) => {
            const isValid = p.location && p.location.lat && p.location.lng && 
                           !isNaN(p.location.lat) && !isNaN(p.location.lng)
            if (!isValid) {
              console.warn('ParkingMap: Parcheggio non valido scartato:', p)
            }
            return isValid
          })
          
          console.log(`ParkingMap: ${result.data.length} parcheggi totali, ${validParkings.length} validi dopo filtri`)
          
          if (validParkings.length === 0 && result.data.length > 0) {
            console.warn('ParkingMap: Tutti i parcheggi sono stati filtrati! Dati raw:', result.data)
          }
          
          setParkings(validParkings)
          
          // Centra mappa sulla media delle posizioni
          if (validParkings.length > 0) {
            const lats = validParkings.map((p: Parking) => p.location?.lat).filter((lat: any) => lat && !isNaN(lat))
            const lngs = validParkings.map((p: Parking) => p.location?.lng).filter((lng: any) => lng && !isNaN(lng))
            
            if (lats.length > 0 && lngs.length > 0) {
              setCenter({
                lat: lats.reduce((a: number, b: number) => a + b, 0) / lats.length,
                lng: lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length,
              })
              console.log('ParkingMap: Mappa centrata su:', { lat: lats.reduce((a: number, b: number) => a + b, 0) / lats.length, lng: lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length })
            } else {
              setCenter(defaultCenter)
            }
          } else {
            setCenter(defaultCenter)
            if (result.warning) {
              setError(result.warning)
            } else if (result.message) {
              setError(result.message)
            } else {
              setError('Nessun parcheggio trovato')
            }
          }
        } else {
          console.error('ParkingMap: Formato risposta non valido:', result)
          setError(result.error || result.warning || 'Errore nel caricamento dei parcheggi')
        }
      } catch (err) {
        console.error('ParkingMap: Errore nel caricamento:', err)
        setError(`Errore: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`)
      } finally {
        setLoading(false)
      }
    }

    loadParkings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketSlug, coordsOverride?.lat, coordsOverride?.lng, coordsOverride?.city, pinsKey])

  // Centro mappa: priorità marketPins > coordsOverride > slug
  useEffect(() => {
    if (useMulti && marketPins && marketPins.length > 0) {
      // Calcola centro come media
      const avgLat = marketPins.reduce((s, p) => s + p.lat, 0) / marketPins.length
      const avgLng = marketPins.reduce((s, p) => s + p.lng, 0) / marketPins.length
      setCenter({ lat: avgLat, lng: avgLng })
      setZoom(marketPins.length === 1 ? 16 : 13)
      setAreaPath([])
      // Polygons per pin
      const polys = marketPins
        .filter((p) => p.polygon)
        .map((p) => ({ id: p.id, path: geojsonToGoogleMapsPath(p.polygon!) }))
      setPinPolygons(polys)
      return
    }
    if (coordsOverride) {
      setCenter({ lat: coordsOverride.lat, lng: coordsOverride.lng })
      setZoom(17)
      setAreaPath([])
      setPinPolygons([])
      return
    }
    if (!marketSlug) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/markets/by-slug/${encodeURIComponent(marketSlug)}`)
        if (!res.ok) return
        const { data } = await res.json()
        if (cancelled || !data) return
        if (data.market) {
          setCenter({ lat: data.market.center_lat, lng: data.market.center_lng })
          if (typeof data.market.default_zoom === 'number') setZoom(data.market.default_zoom)
        }
        if (data.area?.polygon_geojson) {
          setAreaPath(geojsonToGoogleMapsPath(data.area.polygon_geojson))
          if (data.area.style) {
            setAreaStyle({
              color: data.area.style.color ?? '#f97316',
              fillOpacity: data.area.style.fillOpacity ?? 0.2,
            })
          }
        } else {
          setAreaPath([])
        }
      } catch {
        /* ignore */
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketSlug, coordsOverride?.lat, coordsOverride?.lng, pinsKey])

  // Auto-fit bounds: include sia pin mercato che parcheggi visibili.
  // Cap del zoom massimo per evitare di "zoomare troppo" quando i punti sono pochi.
  useEffect(() => {
    if (!mapRef.current || loading) return

    // Punti che dovrebbero essere visibili
    const points: google.maps.LatLngLiteral[] = []
    if (useMulti && marketPins) {
      marketPins.forEach((p) => points.push({ lat: p.lat, lng: p.lng }))
    } else if (coordsOverride) {
      points.push({ lat: coordsOverride.lat, lng: coordsOverride.lng })
    } else if (center && center !== defaultCenter) {
      points.push(center)
    }
    parkings.forEach((p) => {
      if (p?.location?.lat && p?.location?.lng) {
        points.push({ lat: p.location.lat, lng: p.location.lng })
      }
    })

    if (points.length === 0) return
    if (points.length === 1) {
      // Solo un punto → centra e zoom 16 (vista a livello strada utile)
      mapRef.current.setCenter(points[0])
      mapRef.current.setZoom(16)
      return
    }

    const bounds = new google.maps.LatLngBounds()
    points.forEach((p) => bounds.extend(p))
    mapRef.current.fitBounds(bounds, 80)
    // Cap zoom max 16 per non andare troppo vicino
    const listener = google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
      const z = mapRef.current?.getZoom() ?? 14
      if (z > 16) mapRef.current?.setZoom(16)
    })
    return () => google.maps.event.removeListener(listener)
  }, [useMulti, pinsKey, parkings.length, loading, coordsOverride?.lat, coordsOverride?.lng]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sincronizza selezione dalla lista
  useEffect(() => {
    if (selectedParkingId && parkings.length > 0) {
      const parking = parkings.find(p => p.id === selectedParkingId)
      if (parking) {
        setSelectedParking(parking)
        setCenter(parking.location)
      }
    } else {
      setSelectedParking(null)
    }
  }, [selectedParkingId, parkings])

  // Espone funzione globale per selezione
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).selectParkingOnMap = (parkingId: string | null) => {
        setSelectedParkingId(parkingId)
        onSelectParking(parkingId)
      }
    }
  }, [onSelectParking])

  const handleParkingClick = useCallback((parking: Parking) => {
    setSelectedParking(parking)
    setSelectedParkingId(parking.id)
    onSelectParking(parking.id)
  }, [onSelectParking])

  const handleNavigate = useCallback((parking: Parking) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parking.location.lat},${parking.location.lng}`
    window.open(url, '_blank')
  }, [])

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const toggleMapType = useCallback(() => {
    setMapType((prev) => prev === 'satellite' ? 'roadmap' : 'satellite')
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Caricamento parcheggi...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold mb-2">⚠️ Errore</p>
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Controllo tipo mappa */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleMapType}
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-sm font-medium transition-colors"
        >
          {mapType === 'satellite' ? '🛰️ Satellite' : '🛣️ Stradale'}
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: height ?? defaultMapHeight }}
        center={center}
        zoom={zoom}
        onLoad={handleMapLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          mapTypeId: mapType,
          // Stile custom per roadmap
          styles: mapType === 'roadmap' ? [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e0f2fe' }],
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f9fafb' }],
            },
          ] : undefined,
        }}
      >
        {areaPath.length > 0 && (
          <Polygon
            paths={areaPath}
            options={{
              strokeColor: areaStyle.color,
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: areaStyle.color,
              fillOpacity: areaStyle.fillOpacity,
              clickable: false,
              zIndex: 1,
            }}
          />
        )}

        {/* Polygons per ciascun marketPin */}
        {pinPolygons.map((poly) => (
          <Polygon
            key={`pin-poly-${poly.id}`}
            paths={poly.path}
            options={{
              strokeColor: '#7d8f4e',
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: '#7d8f4e',
              fillOpacity: 0.18,
              clickable: false,
              zIndex: 1,
            }}
          />
        ))}

        {/* Marker mercato (uno per pin) */}
        {useMulti && marketPins && marketPins.map((pin) => {
          const svgIcon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="16" fill="#5d6e3b" stroke="#fff" stroke-width="3"/>
                <text x="20" y="26" font-family="Georgia, serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">M</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          }
          return (
            <Marker
              key={`market-pin-${pin.id}`}
              position={{ lat: pin.lat, lng: pin.lng }}
              icon={svgIcon}
              zIndex={50}
              onClick={() => setSelectedMarketPinId(pin.id)}
            >
              {selectedMarketPinId === pin.id && (
                <InfoWindow onCloseClick={() => setSelectedMarketPinId(null)}>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">{pin.label}</div>
                    {pin.subtitle && <div className="text-xs text-gray-600 mt-0.5">{pin.subtitle}</div>}
                    <div className="flex flex-col gap-0.5 mt-1.5">
                      {pin.href && (
                        <a href={pin.href} className="text-xs text-olive-700 underline">Apri pagina →</a>
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
                </InfoWindow>
              )}
            </Marker>
          )
        })}

        {parkings
          .filter((parking) => {
            const validPos = parking.location && parking.location.lat && parking.location.lng &&
                   !isNaN(parking.location.lat) && !isNaN(parking.location.lng)
            if (!validPos) return false
            if (filter && !matchesFilter(parking, filter)) return false
            return true
          })
          .map((parking) => {
          const position = { lat: parking.location.lat, lng: parking.location.lng }
          const isPaid = parking.paid
          const nearRiver = parking.nearRiver || false
          
          // Colore marker: priorità all'affluenza (crowding), fallback su tipo parcheggio
          let markerColor: string
          if (parking.crowding) {
            markerColor = crowdingColor(parking.crowding.level)
          } else if (nearRiver) {
            markerColor = '#3b82f6'
          } else {
            markerColor = isPaid ? '#ef4444' : '#f59e0b'
          }
          const borderColor = '#ffffff'
          const borderWidth = nearRiver ? 3 : 2

          // Crea icona SVG personalizzata con "P" di parcheggio
          const svgIcon = {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="${nearRiver ? '15' : '14'}" fill="${markerColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>
                <text x="18" y="24" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">P</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(nearRiver ? 36 : 32, nearRiver ? 36 : 32),
            anchor: new google.maps.Point(nearRiver ? 18 : 16, nearRiver ? 18 : 16),
          }

          return (
            <Marker
              key={`parking-marker-${parking.id}`}
              position={position}
              onClick={() => handleParkingClick(parking)}
              icon={svgIcon}
            >
              {selectedParking?.id === parking.id && (
                <InfoWindow onCloseClick={() => setSelectedParking(null)}>
                  <div className="text-sm">
                    <div className="font-semibold">{parking.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {nearRiver && <span className="text-blue-600 font-medium">🌊 Vicino al fiume Roja</span>}
                      {nearRiver && (isPaid !== undefined) && <span className="mx-1">•</span>}
                      {isPaid !== undefined && (isPaid ? '💰 A pagamento' : '🆓 Gratuito')}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )
        })}
        
      </GoogleMap>

      {selectedParking && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-[1000]">
          <ParkingCard parking={selectedParking} onNavigate={handleNavigate} />
        </div>
      )}
    </div>
  )
}
