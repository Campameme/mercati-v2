import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .order('name', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()
  const {
    slug, name, city, description,
    center_lat, center_lng,
    default_zoom = 15, default_zoom_operators = 17, market_days = [], timezone = 'Europe/Rome',
    is_active = true,
  } = body

  if (!slug || !name || !city || center_lat == null || center_lng == null) {
    return NextResponse.json({ error: 'slug, name, city, center_lat, center_lng obbligatori' }, { status: 400 })
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'slug deve contenere solo minuscole, numeri e trattini' }, { status: 400 })
  }
  if (!Array.isArray(market_days) || market_days.some((d: unknown) => typeof d !== 'number' || d < 0 || d > 6)) {
    return NextResponse.json({ error: 'market_days deve essere un array di interi 0-6' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('markets')
    .insert({ slug, name, city, description, center_lat, center_lng, default_zoom, default_zoom_operators, market_days, timezone, is_active })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
