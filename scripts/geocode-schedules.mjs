// Raffina le coordinate dei mercati (market_schedules.lat/lng) via Google Geocoding.
// I lat/lng del seed sono approssimati (centro paese): questo script geocodifica
// ogni coppia (comune, luogo) e aggiorna le righe corrispondenti.
//
// Uso:
//   node scripts/geocode-schedules.mjs --dry     # anteprima, NON scrive
//   node scripts/geocode-schedules.mjs           # applica gli aggiornamenti
//
// Richiede in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// e una chiave Google (GOOGLE_PLACES_API_KEY o NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
// con la "Geocoding API" abilitata.

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const DRY = process.argv.includes('--dry')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GKEY = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
if (!GKEY) {
  console.error('Manca la chiave Google (GOOGLE_PLACES_API_KEY o NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)')
  process.exit(1)
}

// Bounding box generoso della provincia di Imperia: scarta risultati fuori zona.
const BOUNDS = { latMin: 43.7, latMax: 44.25, lngMin: 7.45, lngMax: 8.25 }
const ACCEPT = new Set(['ROOFTOP', 'RANGE_INTERPOLATED', 'GEOMETRIC_CENTER'])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function geocode(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', query)
  url.searchParams.set('region', 'it')
  url.searchParams.set('bounds', `${BOUNDS.latMin},${BOUNDS.lngMin}|${BOUNDS.latMax},${BOUNDS.lngMax}`)
  url.searchParams.set('key', GKEY)
  const r = await fetch(url)
  const j = await r.json()
  if (j.status !== 'OK' || !j.results?.length) return null
  const top = j.results[0]
  const loc = top.geometry?.location
  const type = top.geometry?.location_type
  if (!loc || !ACCEPT.has(type)) return null
  if (loc.lat < BOUNDS.latMin || loc.lat > BOUNDS.latMax || loc.lng < BOUNDS.lngMin || loc.lng > BOUNDS.lngMax) return null
  return { lat: loc.lat, lng: loc.lng, type }
}

function distM(a, b, c, d) {
  const R = 6371000
  const dLat = ((c - a) * Math.PI) / 180
  const dLng = ((d - b) * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

const { data: rows, error } = await sb
  .from('market_schedules')
  .select('id, comune, luogo, lat, lng')
if (error) {
  console.error('Errore lettura market_schedules:', error.message)
  process.exit(1)
}

// Raggruppa per (comune, luogo)
const groups = new Map()
for (const r of rows ?? []) {
  const key = `${r.comune}||${r.luogo ?? ''}`
  if (!groups.has(key)) groups.set(key, { comune: r.comune, luogo: r.luogo, ids: [], lat: r.lat, lng: r.lng })
  groups.get(key).ids.push(r.id)
}

console.log(`${groups.size} luoghi distinti · ${DRY ? 'DRY-RUN (nessuna scrittura)' : 'AGGIORNO il DB'}\n`)

let updated = 0, skipped = 0
for (const g of groups.values()) {
  const query = [g.luogo, g.comune, 'Provincia di Imperia', 'Liguria', 'Italia'].filter(Boolean).join(', ')
  let res = null
  try {
    res = await geocode(query)
  } catch (e) {
    console.warn(`  ! errore geocode "${query}": ${e.message}`)
  }
  await sleep(120) // rispetta i limiti di rate Google

  if (!res) {
    skipped++
    console.log(`SKIP  ${g.comune} · ${g.luogo ?? '—'} (nessun risultato affidabile)`)
    continue
  }
  const moved = g.lat != null && g.lng != null ? distM(g.lat, g.lng, res.lat, res.lng) : null
  console.log(
    `OK    ${g.comune} · ${g.luogo ?? '—'} → ${res.lat.toFixed(5)},${res.lng.toFixed(5)} [${res.type}]` +
      (moved != null ? ` (spostato ${moved} m)` : ''),
  )
  if (!DRY) {
    const { error: uErr } = await sb.from('market_schedules').update({ lat: res.lat, lng: res.lng }).in('id', g.ids)
    if (uErr) console.warn(`  ! update fallito: ${uErr.message}`)
    else updated += g.ids.length
  }
}

console.log(`\nFatto. ${DRY ? 'Anteprima' : `Aggiornate ${updated} sessioni`} · ${skipped} luoghi saltati.`)
