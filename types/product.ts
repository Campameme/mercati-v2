export interface Product {
  id: string
  operator_id: string
  name: string
  description: string | null
  price: number | null
  currency: string
  photos: string[]
  is_available: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
