export type NewsType = 'schedule' | 'notice' | 'event' | 'emergency'
export type NewsPriority = 'low' | 'medium' | 'high'

export interface NewsItem {
  id: string
  market_id: string | null
  is_global: boolean
  title: string
  content: string
  type: NewsType
  priority: NewsPriority
  publish_from: string
  publish_until: string | null
  created_at: string
  created_by: string | null
  markets?: { slug: string; name: string; city: string } | null
}
