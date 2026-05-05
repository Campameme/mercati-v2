'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Plus, Pencil, Trash2, ArrowLeft, MapPin, Navigation2, Search, MapIcon, Link2 } from 'lucide-react'
import LocationFields from '@/components/LocationFields'
import { classifySchedule, CATEGORY_COLOR, CATEGORY_LABEL } from '@/lib/schedules/classify'

const CATEGORIES = ['food', 'clothing', 'accessories', 'electronics', 'home', 'books', 'flowers', 'other']

interface Session {
  id: string
  market_id: string
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  settori: string | null
  lat: number | null
  lng: number | null
  place_id: string | null
}

interface PlaceInfo {
  id: string
  comune: string
  luogo: string
  schedules: Array<{ id: string; giorno: string; orario: string | null }>
  hasPolygon: boolean
}

interface OperatorRow {
  id: string
  name: string
  category: string
  stall_number: string | null
  location_lat: number | null
  location_lng: number | null
}

export default function AdminSessionPage() {
  const params = useParams<{ marketSlug: string; scheduleId: string }>()
  const slug = params?.marketSlug
  const scheduleId = params?.scheduleId

  const [session, setSession] = useState<Session | null>(null)
  const [placeInfo, setPlaceInfo] = useState<PlaceInfo | null>(null)
  const [marketName, setMarketName] = useState<string>('')
  const [marketCenter, setMarketCenter] = useState<[number, number] | null>(null)
  const [areaPositions, setAreaPositions] = useState<[number, number][] | null>(null)
  const [operators, setOperators] = useState<OperatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    category: 'food',
    stall_number: '',
    location_lat: null as number | null,
    location_lng: null as number | null,
  })
  const [error, setError] = useState<string | null>(null)

  // Selezione operatore esistente (cross-market)
  const [showLink, setShowLink] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; code: string | null; category: string; marketName: string | null; marketSlug: string | null }>>([])
  const [linkBusy, setLinkBusy] = useState(false)

  async function load() {
    if (!slug || !scheduleId) return
    setLoading(true)

    const mRes = await fetch(`/api/markets/by-slug/${encodeURIComponent(slug)}`)
    const m = await mRes.json()
    const marketId = m.data?.market?.id
    setMarketName(m.data?.market?.name ?? '')
    if (m.data?.market) setMarketCenter([m.data.market.center_lat, m.data.market.center_lng])
    const ring = m.data?.area?.polygon_geojson?.geometry?.coordinates?.[0]
    setAreaPositions(Array.isArray(ring) ? ring.map((c: number[]) => [c[1], c[0]] as [number, number]) : null)

    if (!marketId) { setLoading(false); return }

    // Trova la sessione (con place_id) tramite /api/schedules/list
    const schedRes = await fetch(`/api/schedules/list?marketId=${encodeURIComponent(marketId)}`)
    const schedJson = await schedRes.json()
    const sched = (schedJson.data ?? []).find((s: any) => s.id === scheduleId)
    let placeId: string | null = null
    if (sched) {
      placeId = sched.placeId ?? null
      setSession({
        id: sched.id,
        market_id: sched.marketId,
        comune: sched.comune,
        giorno: sched.giorno,
        orario: sched.orario,
        luogo: sched.luogo,
        settori: sched.settori,
        lat: sched.lat ?? null,
        lng: sched.lng ?? null,
        place_id: placeId,
      })
    }

    // Carica info place (luoghi del market) per avere le sessioni che condividono l'area
    if (placeId) {
      const placesRes = await fetch(`/api/markets/${marketId}/places`)
      const placesJson = await placesRes.json()
      const found = (placesJson.data ?? []).find((p: any) => p.id === placeId)
      if (found) {
        setPlaceInfo({
          id: found.id,
          comune: found.comune,
          luogo: found.luogo,
          schedules: found.schedules ?? [],
          hasPolygon: !!found.polygon_geojson,
        })
      } else {
        setPlaceInfo(null)
      }
    } else {
      setPlaceInfo(null)
    }

    // Operatori della sessione (filtro scheduleId)
    const opsRes = await fetch(`/api/operators?marketSlug=${encodeURIComponent(slug)}&scheduleId=${encodeURIComponent(scheduleId)}`)
    const ops = await opsRes.json()
    setOperators((ops.data ?? []).map((o: any) => ({
      id: o.id,
      name: o.name,
      category: o.category,
      stall_number: o.location?.stallNumber ?? null,
      location_lat: o.location?.lat || null,
      location_lng: o.location?.lng || null,
    })))

    setLoading(false)
  }
  useEffect(() => { load() }, [slug, scheduleId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!session) return
    const res = await fetch('/api/operators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market_id: session.market_id,
        schedule_id: session.id,
        name: createForm.name,
        category: createForm.category,
        stall_number: createForm.stall_number || null,
        location_lat: createForm.location_lat,
        location_lng: createForm.location_lng,
      }),
    })
    if (!res.ok) {
      const j = await res.json()
      setError(j.error ?? 'Errore')
      return
    }
    setShowCreate(false)
    setCreateForm({ name: '', category: 'food', stall_number: '', location_lat: null, location_lng: null })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questo banco? Anche i suoi prodotti verranno rimossi.')) return
    await fetch(`/api/operators/${id}`, { method: 'DELETE' })
    load()
  }

  async function searchOperators() {
    if (!searchQ.trim()) { setSearchResults([]); return }
    const r = await fetch(`/api/operators/search?q=${encodeURIComponent(searchQ.trim())}&limit=20`)
    const j = await r.json()
    // escludi operatori già presenti su questa sessione
    const existing = new Set(operators.map((o) => o.id))
    setSearchResults((j.data ?? []).filter((o: any) => !existing.has(o.id)))
  }

  async function linkExistingOperator(operatorId: string) {
    if (!session) return
    setLinkBusy(true)
    const r = await fetch(`/api/operators/${operatorId}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule_id: session.id,
        location_lat: session.lat,
        location_lng: session.lng,
      }),
    })
    setLinkBusy(false)
    if (!r.ok) {
      const j = await r.json()
      alert(j.error ?? 'Errore aggiunta operatore')
      return
    }
    setShowLink(false)
    setSearchQ('')
    setSearchResults([])
    load()
  }

  if (loading || !session) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">
        <p className="text-ink-muted">Caricamento…</p>
      </div>
    )
  }

  const cat = classifySchedule(session.settori)
  const sessionCenter: [number, number] =
    session.lat != null && session.lng != null ? [session.lat, session.lng] : (marketCenter ?? [43.9, 7.85])

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-5xl">
      <div className="mb-8 border-b border-cream-300 pb-6">
        <Link
          href={`/${slug}/admin`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Gestione {marketName}
        </Link>
        <div className="flex items-baseline gap-3 flex-wrap mb-1">
          <h1 className="font-serif text-3xl md:text-4xl text-ink">{session.comune}</h1>
          <span className="text-sm text-ink-muted">· {session.giorno}</span>
          {session.orario && <span className="text-sm text-ink-muted tabular-nums">{session.orario}</span>}
          <span
            className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-sm"
            style={{ color: CATEGORY_COLOR[cat], borderLeft: `3px solid ${CATEGORY_COLOR[cat]}` }}
          >
            {CATEGORY_LABEL[cat]}
          </span>
        </div>
        {session.luogo && (
          <p className="text-sm text-ink flex items-center gap-1.5 mt-2">
            <MapPin className="w-4 h-4 text-olive-500" /> {session.luogo}
            {session.lat != null && session.lng != null && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${session.lat},${session.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink underline underline-offset-2"
              >
                <Navigation2 className="w-3 h-3" /> Indicazioni
              </a>
            )}
          </p>
        )}
        {session.settori && <p className="text-xs text-ink-muted italic mt-2">{session.settori}</p>}
      </div>

      {/* Info area del luogo (place) */}
      {placeInfo && (
        <div className="mb-6 bg-cream-50 border border-cream-300 rounded-sm p-4 flex items-start gap-3 flex-wrap">
          <MapIcon className="w-4 h-4 text-olive-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink">
              {placeInfo.hasPolygon ? (
                <>Area definita su <strong>{placeInfo.luogo}</strong></>
              ) : (
                <>Nessuna area disegnata per <strong>{placeInfo.luogo}</strong></>
              )}
              {placeInfo.schedules.length > 1 && (
                <>
                  , condivisa con {placeInfo.schedules.length - 1}{' '}
                  altra sessione{placeInfo.schedules.length - 1 === 1 ? '' : 'i'} (
                  {placeInfo.schedules
                    .filter((s) => s.id !== scheduleId)
                    .map((s) => s.giorno)
                    .join(', ')}
                  ).
                </>
              )}
            </p>
          </div>
          {session.place_id && (
            <Link
              href={`/${slug}/admin/places/${session.place_id}/area`}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-cream-200 hover:bg-cream-300 text-ink rounded-sm text-xs flex-shrink-0"
            >
              <MapIcon className="w-3.5 h-3.5" /> Modifica area del luogo
            </Link>
          )}
        </div>
      )}

      {/* Banchi di questa sessione */}
      <section>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest-plus text-ink-muted">Banchi di questo mercato</p>
            <h2 className="font-serif text-2xl text-ink">{operators.length} {operators.length === 1 ? 'banco' : 'banchi'}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowLink((s) => !s); setShowCreate(false) }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-cream-200 hover:bg-cream-300 text-ink rounded-full text-sm"
            >
              <Link2 className="w-4 h-4" /> Aggiungi esistente
            </button>
            <button
              onClick={() => { setShowCreate((s) => !s); setShowLink(false) }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90"
            >
              <Plus className="w-4 h-4" /> Nuovo banco
            </button>
          </div>
        </div>

        {showLink && (
          <div className="bg-cream-50 border border-cream-300 rounded-sm p-5 mb-6 space-y-3">
            <p className="text-xs uppercase tracking-widest-plus text-ink-muted">Cerca un operatore già esistente (anche di altri mercati)</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchOperators() } }}
                  placeholder="Cerca per nome, codice, descrizione…"
                  className="w-full pl-9 pr-3 py-2 border border-cream-300 rounded-sm bg-cream-100 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={searchOperators}
                className="px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90"
              >
                Cerca
              </button>
            </div>
            {searchResults.length === 0 && searchQ.trim() && (
              <p className="text-xs text-ink-muted italic">Nessun risultato.</p>
            )}
            {searchResults.length > 0 && (
              <ul className="border-y border-cream-300 divide-y divide-cream-300 max-h-72 overflow-y-auto">
                {searchResults.map((op) => (
                  <li key={op.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-serif text-base text-ink">{op.name}</span>
                        {op.code && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-cream-200 rounded-sm text-ink-muted">{op.code}</span>}
                      </div>
                      <p className="text-xs text-ink-muted">
                        {op.category}
                        {op.marketName && <> · attualmente: <strong className="text-ink">{op.marketName}</strong></>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => linkExistingOperator(op.id)}
                      disabled={linkBusy}
                      className="px-3 py-1.5 text-xs bg-olive-600 hover:bg-olive-700 text-cream-100 rounded-full disabled:opacity-50"
                    >
                      Aggiungi qui
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="bg-cream-50 border border-cream-300 rounded-sm p-5 md:p-6 mb-6 space-y-4"
          >
            <p className="text-xs uppercase tracking-widest-plus text-ink-muted">
              Nuovo banco per {session.comune} · {session.giorno}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-ink">Nome</span>
                <input
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-cream-300 rounded-sm bg-cream-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Categoria</span>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-cream-300 rounded-sm bg-cream-100"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Banco (opz.)</span>
                <input
                  value={createForm.stall_number}
                  onChange={(e) => setCreateForm({ ...createForm, stall_number: e.target.value })}
                  className="w-full px-3 py-2 border border-cream-300 rounded-sm bg-cream-100"
                />
              </label>
            </div>

            <div className="border-t border-cream-300 pt-4">
              <LocationFields
                center={sessionCenter}
                zoom={17}
                lat={createForm.location_lat}
                lng={createForm.location_lng}
                onChange={(lat, lng) => setCreateForm({ ...createForm, location_lat: lat, location_lng: lng })}
                areaPositions={areaPositions}
                label="Posizione del banco"
                helperText={`Mappa centrata su "${session.luogo ?? session.comune}". Clicca, trascina o usa Sono qui.`}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-ink rounded-sm text-sm">Annulla</button>
              <button type="submit" className="px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90">Crea</button>
            </div>
          </form>
        )}

        {operators.length === 0 ? (
          <div className="bg-cream-50 border border-cream-300 rounded-sm p-8 text-center text-ink-muted">
            Nessun banco registrato per questa sessione.
          </div>
        ) : (
          <ul className="border-y border-cream-300 divide-y divide-cream-300">
            {operators.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-lg text-ink">{o.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-cream-200 text-ink rounded-sm">{o.category}</span>
                    {o.stall_number && <span className="text-xs text-ink-muted">· Banco {o.stall_number}</span>}
                  </div>
                  {o.location_lat != null && o.location_lng != null && (
                    <p className="text-xs text-ink-muted tabular-nums mt-1">
                      {o.location_lat.toFixed(5)}, {o.location_lng.toFixed(5)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/${slug}/admin/operators/${o.id}`}
                    className="p-2 text-ink-soft hover:text-ink"
                    title="Modifica"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="p-2 text-ink-soft hover:text-terra-500"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
