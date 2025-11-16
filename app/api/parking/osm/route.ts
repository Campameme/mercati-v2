import { NextRequest, NextResponse } from 'next/server'

// Interfaccia per i dati OpenStreetMap
interface OSMNode {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: {
    lat: number
    lon: number
  }
  nodes?: number[] // Per way: lista di ID nodi
  geometry?: Array<{ lat: number; lon: number }> // Geometria completa (con "out geom")
  members?: Array<{ type: string; ref: number; role?: string }> // Per relation
  tags?: {
    amenity?: string
    parking?: string
    name?: string
    capacity?: string
    spaces?: string
    fee?: string
    access?: string
    wheelchair?: string
    [key: string]: string | undefined
  }
}

interface OSMResponse {
  elements: OSMNode[]
}

// Converte un nodo OSM in un oggetto Parking
function convertOSMToParking(node: OSMNode, index: number, geometry?: { lat: number; lng: number }[]): any {
  const tags = node.tags || {}
  
  // Nome: usa il nome reale da OSM, altrimenti prova con altri tag, infine "Parcheggio"
  let name = tags.name
  if (!name) {
    // Prova con operator, addr:street, o altri tag comuni
    name = tags.operator || tags['addr:street'] || tags['addr:housename'] || null
  }
  if (!name) {
    // Se c'è una via, usa "Parcheggio [Via]"
    if (tags['addr:street']) {
      name = `Parcheggio ${tags['addr:street']}`
    } else {
      name = 'Parcheggio'
    }
  }
  
  const isPaid = tags.fee === 'yes' || tags.fee === 'true'
  const fee = isPaid ? 'Indefinito' : 'Gratuito'
  
  // Usa capacità esatta da OSM, se non disponibile usa 0 (non stimare)
  let capacity = 0
  if (tags.capacity) {
    const parsed = parseInt(tags.capacity)
    if (!isNaN(parsed) && parsed > 0) {
      capacity = parsed
    }
  }
  
  // Se non c'è capacità, prova a stimare da altri tag
  if (capacity === 0) {
    // Alcuni parcheggi hanno maxstay o spaces
    if (tags.spaces) {
      const parsed = parseInt(tags.spaces)
      if (!isNaN(parsed) && parsed > 0) capacity = parsed
    }
  }
  
  // Stima disponibilità solo se abbiamo capacità
  const availableSpots = capacity > 0 ? Math.floor(capacity * 0.6) : 0
  
  // Estrai coordinate: per node usa lat/lon, per way/relation usa center
  // PRIORITÀ: Se abbiamo geometria, usa il centro della geometria (più preciso)
  let lat: number | undefined
  let lng: number | undefined
  
  if (geometry && geometry.length > 0) {
    // Calcola il centro della geometria (più preciso del center di OSM)
    const sumLat = geometry.reduce((sum, p) => sum + p.lat, 0)
    const sumLng = geometry.reduce((sum, p) => sum + p.lng, 0)
    lat = sumLat / geometry.length
    lng = sumLng / geometry.length
  } else {
    // Fallback: usa coordinate dirette o center
    lat = node.lat || node.center?.lat
    lng = node.lon || node.center?.lon
  }
  
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return null // Salta se non ha coordinate valide
  }
  
  // Costruisci indirizzo completo se disponibile
  let address = name
  if (tags['addr:street']) {
    address = `${name}, ${tags['addr:street']}`
    if (tags['addr:housenumber']) {
      address = `${name}, ${tags['addr:street']} ${tags['addr:housenumber']}`
    }
  }
  if (!address.includes('Ventimiglia')) {
    address = `${address}, Ventimiglia`
  }
  
  return {
    id: `osm-${node.id}`,
    name,
    address,
    type: tags.parking === 'private' || tags.access === 'private' ? 'private' : 'municipal',
    paid: isPaid,
    fee,
    hours: '24/7',
    availableSpots,
    totalSpots: capacity, // Usa capacità esatta o 0
    location: {
      lat,
      lng,
    },
    // Aggiungi geometria se disponibile (per way/relation)
    geometry: geometry && geometry.length > 0 ? geometry : undefined,
    accessible: tags.wheelchair === 'yes',
    hasRestrooms: false,
    source: 'osm' as const,
    placeId: `osm-${node.id}`,
  }
}

export async function GET(request: NextRequest) {
  try {
    // Coordinate Ventimiglia e mercato
    const ventimigliaLat = 43.7885
    const ventimigliaLng = 7.6060
    
    // Coordinate mercato (centro area mercato)
    const marketLat = 43.7885
    const marketLng = 7.6060

          // Query Overpass API: cerca TUTTI i parcheggi in un'area più ampia (3km) per catturare tutti i parcheggi
          // Include anche parcheggi lungo le strade e in varie configurazioni
          const overpassQuery = `
            [out:json][timeout:45];
            (
              // Parcheggi in area più ampia (3km) - include tutti i tipi
              node["amenity"="parking"](around:3000,${marketLat},${marketLng});
              way["amenity"="parking"](around:3000,${marketLat},${marketLng});
              relation["amenity"="parking"](around:3000,${marketLat},${marketLng});
              
              // Parcheggi con tag parking (vari tipi)
              node["parking"](around:3000,${marketLat},${marketLng});
              way["parking"](around:3000,${marketLat},${marketLng});
              relation["parking"](around:3000,${marketLat},${marketLng});
              
              // Parcheggi lungo le strade (street_side, lane, etc.)
              node["parking"="street_side"](around:3000,${marketLat},${marketLng});
              node["parking"="lane"](around:3000,${marketLat},${marketLng});
              node["parking"="parallel"](around:3000,${marketLat},${marketLng});
              node["parking"="perpendicular"](around:3000,${marketLat},${marketLng});
              node["parking"="diagonal"](around:3000,${marketLat},${marketLng});
              
              // Parcheggi strutturati
              node["parking"="multi-storey"](around:3000,${marketLat},${marketLng});
              node["parking"="underground"](around:3000,${marketLat},${marketLng});
              node["parking"="surface"](around:3000,${marketLat},${marketLng});
            );
            out geom;
          `

    const overpassUrl = 'https://overpass-api.de/api/interpreter'
    
    // Aggiungi timeout al fetch (aumentato per query più complessa)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 secondi timeout per query più ampia
    
    let response: Response
    try {
      response = await fetch(overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        throw new Error('Timeout nella richiesta a Overpass API')
      }
      throw fetchError
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Overpass API error: ${response.status} - ${errorText}`)
    }

    let data: OSMResponse
    try {
      data = await response.json()
    } catch (jsonError) {
      throw new Error('Errore nel parsing della risposta da Overpass API')
    }
    
    // Verifica che la risposta abbia la struttura corretta
    if (!data || !Array.isArray(data.elements)) {
      throw new Error('Risposta non valida da Overpass API')
    }
    
    console.log(`OSM: Trovati ${data.elements.length} elementi totali`)
    
    // Separa way/node e crea mappa dei nodi
    const allNodes = data.elements.filter((el) => el.type === 'node' && el.lat && el.lon)
    const nodeMap = new Map<number, { lat: number; lon: number }>()
    
    // Crea mappa di tutti i nodi (inclusi quelli dei way)
    allNodes.forEach((node) => {
      if (node.lat && node.lon) {
        nodeMap.set(node.id, { lat: node.lat, lon: node.lon })
      }
    })
    
    // Estrai elementi parcheggio (node e way con tag parking)
    const parkingElements = data.elements.filter((el) => {
      if (!el.tags) return false
      const hasParkingTag = el.tags.amenity === 'parking' || el.tags.parking
      
      if (el.type === 'node') {
        return el.lat && el.lon && hasParkingTag
      }
      if (el.type === 'way') {
        return (el.center || el.lat) && hasParkingTag
      }
      return false
    })
    
    const parkingNodes = parkingElements.filter((el) => el.type === 'node')
    const parkingWays = parkingElements.filter((el) => el.type === 'way')
    
    console.log(`OSM: ${parkingElements.length} parcheggi trovati (${parkingNodes.length} nodi, ${parkingWays.length} way, ${allNodes.length} nodi totali)`)

    // Filtra posizioni che potrebbero essere in acqua o fuori dall'area urbana
    // Usa bounds più ampi per Ventimiglia
    const validElements = parkingElements.filter((el) => {
      // Estrai coordinate: per node usa lat/lon, per way usa center
      const lat = el.lat || el.center?.lat
      const lng = el.lon || el.center?.lon
      
      if (!lat || !lng) return false
      
      // Bounds più ampi per Ventimiglia (basati sui dati reali OSM)
      if (lat < 43.7750 || lat > 43.8100) return false
      if (lng < 7.5850 || lng > 7.6600) return false
      
      // Filtra solo posizioni chiaramente in acqua (mare)
      // Rilassato il filtro per non escludere parcheggi vicini alla costa
      if (lat < 43.785 && lng < 7.600) return false
      
      return true
    })
    
    console.log(`OSM: ${validElements.length} elementi dopo filtri geografici`)

    // Rimuovi duplicati: se due parcheggi sono troppo vicini (< 20m), mantieni solo quello con più informazioni
    // Aumentato a 20m per evitare duplicati ma mantenere parcheggi distinti
    const deduplicatedElements: OSMNode[] = []
    const processedPositions: Array<{ lat: number; lng: number }> = []
    
    // Ordina per qualità (quelli con nome, capacità e geometria prima)
    const sortedElements = validElements.sort((a, b) => {
      const aHasName = (a.tags?.name || a.tags?.['addr:street']) ? 3 : 0
      const bHasName = (b.tags?.name || b.tags?.['addr:street']) ? 3 : 0
      const aHasCapacity = a.tags?.capacity ? 2 : 0
      const bHasCapacity = b.tags?.capacity ? 2 : 0
      const aHasGeometry = (a.geometry && a.geometry.length > 0) ? 2 : 0
      const bHasGeometry = (b.geometry && b.geometry.length > 0) ? 2 : 0
      const aHasParkingTag = a.tags?.parking ? 1 : 0
      const bHasParkingTag = b.tags?.parking ? 1 : 0
      const aIsWay = a.type === 'way' ? 1 : 0 // Way hanno geometria migliore
      const bIsWay = b.type === 'way' ? 1 : 0
      return (bHasName + bHasCapacity + bHasGeometry + bHasParkingTag + bIsWay) - 
             (aHasName + aHasCapacity + aHasGeometry + aHasParkingTag + aIsWay)
    })
    
    for (const el of sortedElements) {
      // Estrai coordinate (stesso metodo di convertOSMToParking)
      let lat: number | undefined
      let lng: number | undefined
      
      // Se ha geometria, calcola centro
      if (el.geometry && el.geometry.length > 0) {
        const sumLat = el.geometry.reduce((sum, p) => sum + p.lat, 0)
        const sumLng = el.geometry.reduce((sum, p) => sum + p.lon, 0)
        lat = sumLat / el.geometry.length
        lng = sumLng / el.geometry.length
      } else {
        lat = el.lat || el.center?.lat
        lng = el.lon || el.center?.lon
      }
      
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue
      
      const isDuplicate = processedPositions.some((pos) => {
        // Calcola distanza precisa usando formula Haversine
        const R = 6371000 // Raggio Terra in metri
        const dLat = ((lat - pos.lat) * Math.PI) / 180
        const dLng = ((lng - pos.lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((pos.lat * Math.PI) / 180) *
            Math.cos((lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c
        return distance < 20 // Se sono a meno di 20m, sono duplicati
      })
      
      if (!isDuplicate) {
        deduplicatedElements.push(el)
        processedPositions.push({ lat, lng })
      }
    }

    // Converti in Parking e filtra null
    const parkings = deduplicatedElements
      .map((el, index) => {
        // Per way, ricostruisci geometria dai nodi
        let geometry: { lat: number; lng: number }[] | undefined
        
        if (el.type === 'way') {
          // PRIORITÀ: Usa geometry da "out geom" se disponibile
          if (el.geometry && el.geometry.length >= 3) {
            geometry = el.geometry
              .map((g) => ({ lat: g.lat, lng: g.lon }))
              .filter((g) => g.lat && g.lon && !isNaN(g.lat) && !isNaN(g.lon))
            
            // Chiudi il poligono se non è già chiuso
            if (geometry.length >= 3) {
              const first = geometry[0]
              const last = geometry[geometry.length - 1]
              if (first.lat !== last.lat || first.lng !== last.lng) {
                geometry.push(first)
              }
            } else {
              geometry = undefined // Troppo pochi punti validi
            }
            
            if (geometry) {
              console.log(`OSM: Way ${el.id} ha geometria con ${geometry.length} punti`)
            }
          } 
          // FALLBACK: Se non abbiamo geometry, prova con nodes array
          else if (el.nodes && el.nodes.length > 0) {
            const wayNodes = el.nodes
              .map((nodeId) => nodeMap.get(nodeId))
              .filter((node): node is { lat: number; lon: number } => node !== undefined)
            
            if (wayNodes.length >= 3) {
              geometry = wayNodes.map((node) => ({ lat: node.lat, lng: node.lon }))
              // Chiudi il poligono
              if (geometry.length > 0 && 
                  (geometry[0].lat !== geometry[geometry.length - 1].lat || 
                   geometry[0].lng !== geometry[geometry.length - 1].lng)) {
                geometry.push(geometry[0])
              }
            }
          }
        }
        
        return convertOSMToParking(el, index, geometry)
      })
      .filter((p): p is any => p !== null)
    
    console.log(`OSM: ${parkings.length} parcheggi finali dopo conversione`)
    
    // Log per debug: verifica geometrie
    const withGeometry = parkings.filter((p: any) => p.geometry && p.geometry.length > 0)
    const withoutGeometry = parkings.filter((p: any) => !p.geometry || p.geometry.length === 0)
    console.log(`OSM: ${withGeometry.length} parcheggi con geometria, ${withoutGeometry.length} senza geometria`)
    if (withGeometry.length > 0) {
      console.log('OSM: Esempio parcheggio con geometria:', {
        id: withGeometry[0].id,
        name: withGeometry[0].name,
        geometryPoints: withGeometry[0].geometry?.length,
        firstPoint: withGeometry[0].geometry?.[0],
      })
    }

    // Ordina per distanza dal centro di Ventimiglia
    const ventimigliaCenter = { lat: ventimigliaLat, lng: ventimigliaLng }
    
    parkings.forEach((parking) => {
      const distance = Math.sqrt(
        Math.pow(parking.location.lat - ventimigliaCenter.lat, 2) +
        Math.pow(parking.location.lng - ventimigliaCenter.lng, 2)
      ) * 111000 // conversione approssimativa in metri
      parking.distance = distance
    })
    
    parkings.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    return NextResponse.json({
      success: true,
      data: parkings,
      city: 'Ventimiglia',
      source: 'OpenStreetMap',
      lastUpdated: new Date().toISOString(),
      count: parkings.length,
    })
  } catch (error) {
    console.error('Errore nel caricamento parcheggi da OSM:', error)
    
    // Restituisci array vuoto invece di errore 500 per evitare crash dell'app
    return NextResponse.json({
      success: true,
      data: [],
      city: 'Ventimiglia',
      source: 'OpenStreetMap',
      lastUpdated: new Date().toISOString(),
      count: 0,
      warning: error instanceof Error ? error.message : 'Errore sconosciuto',
    })
  }
}

