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
    hourlyRate?: number // Costo orario base in euro
    dailyRate?: number // Costo giornaliero base in euro
    currentHourlyRate?: number // Costo orario attuale (aggiornato in base al traffico)
    currentDailyRate?: number // Costo giornaliero attuale (aggiornato in base al traffico)
    trafficMultiplier?: number // Moltiplicatore basato sul traffico (1.0 = normale, >1.0 = alto traffico)
    lastUpdated?: string // Timestamp ultimo aggiornamento
  }
}

