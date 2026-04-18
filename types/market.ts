import type { Feature, Polygon } from 'geojson'

export interface Market {
  id: string
  slug: string
  name: string
  city: string
  description: string | null
  center_lat: number
  center_lng: number
  default_zoom: number
  default_zoom_operators: number
  market_days: number[]
  timezone: string
  is_active: boolean
  created_at: string
  created_by: string | null
}

export interface MarketArea {
  market_id: string
  polygon_geojson: Feature<Polygon>
  style: { color?: string; fillOpacity?: number; weight?: number }
  updated_at: string
  updated_by: string | null
}

export interface MarketAdminAssignment {
  market_id: string
  user_id: string
  created_at: string
}

export interface MarketSchedule {
  id: string
  market_id: string
  comune: string
  giorno: string
  orario: string | null
  settori: string | null
  luogo: string | null
  lat: number | null
  lng: number | null
  is_active: boolean
  created_at: string
}

export type UserRole = 'super_admin' | 'market_admin' | 'operator' | 'citizen'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  created_at: string
}
