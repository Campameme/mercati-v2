import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET: elenca le sessioni (presenze) di un operatore, con dettagli sessione
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('operator_schedules')
    .select('schedule_id, location_lat, location_lng, stall_number, notes, market_schedules(id, market_id, comune, giorno, orario, luogo, settori, lat, lng, markets(slug, name))')
    .eq('operator_id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const shaped = (data ?? []).map((os: any) => ({
    scheduleId: os.schedule_id,
    locationLat: os.location_lat,
    locationLng: os.location_lng,
    stallNumber: os.stall_number,
    notes: os.notes,
    session: os.market_schedules
      ? {
          id: os.market_schedules.id,
          marketId: os.market_schedules.market_id,
          marketSlug: os.market_schedules.markets?.slug ?? null,
          marketName: os.market_schedules.markets?.name ?? null,
          comune: os.market_schedules.comune,
          giorno: os.market_schedules.giorno,
          orario: os.market_schedules.orario,
          luogo: os.market_schedules.luogo,
          settori: os.market_schedules.settori,
          lat: os.market_schedules.lat,
          lng: os.market_schedules.lng,
        }
      : null,
  }))
  return NextResponse.json({ data: shaped })
}

// POST: aggiunge/aggiorna (upsert) una presenza su una sessione
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const body = await request.json()
  const { schedule_id, location_lat, location_lng, stall_number, notes } = body
  if (!schedule_id) return NextResponse.json({ error: 'schedule_id obbligatorio' }, { status: 400 })

  const { data, error } = await supabase
    .from('operator_schedules')
    .upsert({
      operator_id: params.id,
      schedule_id,
      location_lat: location_lat ?? null,
      location_lng: location_lng ?? null,
      stall_number: stall_number ?? null,
      notes: notes ?? null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// DELETE: rimuove una presenza ?schedule_id=...
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const scheduleId = searchParams.get('schedule_id')
  if (!scheduleId) return NextResponse.json({ error: 'schedule_id obbligatorio' }, { status: 400 })

  const { error } = await supabase
    .from('operator_schedules')
    .delete()
    .eq('operator_id', params.id)
    .eq('schedule_id', scheduleId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
