export interface Operator {
  id: string
  name: string
  category: string
  description: string
  photos: string[]
  languages: string[]
  paymentMethods: ('cash' | 'card' | 'digital')[]
  socialLinks?: {
    facebook?: string
    instagram?: string
    website?: string
  }
  location: {
    lat: number
    lng: number
    stallNumber: string
  }
  isOpen: boolean
  rating?: number
}

export type OperatorCategory = 
  | 'food'
  | 'clothing'
  | 'accessories'
  | 'electronics'
  | 'home'
  | 'books'
  | 'flowers'
  | 'other'

