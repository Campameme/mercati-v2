// Event type backed by DB (table "events").
export interface MarketEvent {
  id: string
  market_id: string
  title: string
  description: string | null
  category: string
  location: string | null
  start_at: string       // ISO
  end_at: string | null  // ISO
  is_recurring: boolean
  recurrence_rule: string | null
  created_at: string
  created_by: string | null
  markets?: { slug: string; name: string; city: string } | null
}
