export interface Parking {
  id: string
  name: string
  address: string
  type: 'municipal' | 'private'
  paid: boolean
  fee: string
  hours: string
  availableSpots: number
  totalSpots: number
  location: {
    lat: number
    lng: number
  }
  geometry?: Array<{ lat: number; lng: number }> // Geometria reale del parcheggio (per way)
  accessible: boolean
  hasRestrooms: boolean
  // Dati aggiuntivi da Google Places
  placeId?: string
  rating?: number
  userRatingsTotal?: number
  distance?: number // distanza in metri dalla posizione di ricerca
  source?: 'local' | 'google' | 'osm' | 'ai-vision' // origine del dato
  confidence?: number // Confidenza AI (0-1) se source è 'ai-vision'
  nearRiver?: boolean // Flag per parcheggi vicini al fiume Roja
  // Informazioni sui costi
  pricing?: {
    hourlyRate?: number
    dailyRate?: number
    currentHourlyRate?: number
    currentDailyRate?: number
    trafficMultiplier?: number
    lastUpdated?: string
  }
  crowding?: {
    score: 1 | 2 | 3 | 4 | 5
    level: 'empty' | 'low' | 'medium' | 'high' | 'full'
    factors: {
      trafficRatio?: number // duration_in_traffic / duration
      timeOfDay: number // hourly heuristic 0.9-2.1
      isMarketDay: boolean
    }
    lastUpdated: string
  }
}

