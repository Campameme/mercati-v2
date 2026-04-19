'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Save, Mail, CheckCircle2, Plus, Trash2, MapPin, CalendarDays } from 'lucide-react'
import LocationFields from '@/components/LocationFields'

const CATEGORIES = ['food', 'clothing', 'accessories', 'electronics', 'home', 'books', 'flowers', 'other']

interface Operator {
  id: string
  market_id: string
  user_id: string | null
  name: string
  category: string
  description: string | null
  stall_number: string | null
  location_lat: number | null
  location_lng: number | null
  photos: string[]
  languages: string[]
  payment_methods: string[]
  social_links: Record<string, string>
}

interface SessionRow {
  id: string
  marketId: string
  marketSlug: string | null
  marketName: string | null
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  lat: number | null
  lng: number | null
}

interface Presence {
  scheduleId: string
  locationLat: number | null
  locationLng: number | null
  stallNumber: string | null
  notes: string | null
  session: {
    id: string
    marketId: string
    marketSlug: string | null
    marketName: string | null
    comune: string
    giorno: string
    orario: string | null
    luogo: string | null
    lat: number | null
    lng: number | null
  } | null
}

export default function AdminEditOperatorPage() {
  const params = useParams<{ marketSlug: string; id: string }>()
  const slug = params?.marketSlug
  const id = params?.id
  const [operator, setOperator] = useState<Operator | null>(null)
  const [market, setMarket] = useState<{ center_lat: number; center_lng: number; default_zoom: number } | null>(null)
  const [areaPositions, setAreaPositions] = useState<[number, number][] | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState<string | null>(null)

  // Presenze (M:N)
  const [presences, setPresences] = useState<Presence[]>([])
  const [allSessions, setAllSessions] = useState<SessionRow[]>([])
  const [showAddPresence, setShowAddPresence] = useState(false)
  const [newPresence, setNewPresence] = useState<{
    scheduleId: string
    lat: number | null
    lng: number | null
    stall: string
  }>({ scheduleId: '', lat: null, lng: null, stall: '' })

  async function load() {
    if (!slug || !id) return
    const m = await fetch(`/api/markets/by-slug/${encodeURIComponent(slug)}`).then(r => r.json())
    setMarket(m.data?.market)
    const ring = m.data?.area?.polygon_geojson?.geometry?.coordinates?.[0]
    setAreaPositions(Array.isArray(ring) ? ring.map((c: number[]) => [c[1], c[0]] as [number, number]) : null)

    const o = await fetch(`/api/operators/${id}`).then(r => r.json())
    setOperator(o.data)

    const p = await fetch(`/api/operators/${id}/schedules`).then(r => r.json())
    setPresences(p.data ?? [])

    // Sessioni della stessa zona (market) per selettore add
    if (o.data?.market_id) {
      const s = await fetch(`/api/schedules/list?marketSlug=${encodeURIComponent(slug)}`).then(r => r.json())
      setAllSessions(s.data ?? [])
    }
  }
  useEffect(() => { load() }, [slug, id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!operator) return
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/operators/${operator.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operator),
    })
    const j = await res.json()
    if (!res.ok) setMsg(j.error ?? 'Errore')
    else setMsg('Salvato')
    setSaving(false)
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteMsg(null)
    if (!id) return
    const res = await fetch(`/api/operators/${id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    const j = await res.json()
    if (!res.ok) setInviteMsg(j.error ?? 'Errore')
    else setInviteMsg(j.message ?? 'Invito inviato')
  }

  async function handleAddPresence(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !newPresence.scheduleId) return
    const res = await fetch(`/api/operators/${id}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule_id: newPresence.scheduleId,
        location_lat: newPresence.lat,
        location_lng: newPresence.lng,
        stall_number: newPresence.stall || null,
      }),
    })
    if (!res.ok) {
      const j = await res.json()
      alert(j.error ?? 'Errore aggiunta presenza')
      return
    }
    setShowAddPresence(false)
    setNewPresence({ scheduleId: '', lat: null, lng: null, stall: '' })
    load()
  }

  async function handleRemovePresence(scheduleId: string) {
    if (!confirm('Rimuovere questa presenza?')) return
    await fetch(`/api/operators/${id}/schedules?schedule_id=${encodeURIComponent(scheduleId)}`, { method: 'DELETE' })
    load()
  }

  async function handleUpdatePresence(p: Presence, patch: Partial<{ lat: number | null; lng: number | null; stall: string | null }>) {
    await fetch(`/api/operators/${id}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule_id: p.scheduleId,
        location_lat: patch.lat !== undefined ? patch.lat : p.locationLat,
        location_lng: patch.lng !== undefined ? patch.lng : p.locationLng,
        stall_number: patch.stall !== undefined ? patch.stall : p.stallNumber,
      }),
    })
    load()
  }

  if (!operator || !market) return <div className="container mx-auto px-4 py-8">Caricamento…</div>

  const availableSessions = allSessions.filter(
    (s) => !presences.some((p) => p.scheduleId === s.id),
  )

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-5xl">
      <Link
        href={`/${slug}/admin/operators`}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink mb-3 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Tutti i banchi
      </Link>
      <h1 className="font-serif text-3xl md:text-4xl text-ink mb-6">{operator.name}</h1>

      {/* Profilo */}
      <form onSubmit={handleSave} className="bg-cream-50 border border-cream-300 rounded-sm p-5 md:p-6 mb-6 space-y-4">
        <p className="text-xs uppercase tracking-widest-plus text-ink-muted">Profilo banco</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <F label="Nome" value={operator.name} onChange={(v) => setOperator({ ...operator, name: v })} />
          <label className="block">
            <span className="text-sm font-medium text-ink">Categoria</span>
            <select
              value={operator.category}
              onChange={(e) => setOperator({ ...operator, category: e.target.value })}
              className="w-full px-3 py-2 border border-cream-300 rounded-sm bg-cream-100"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <F
            label="Banco (default)"
            value={operator.stall_number ?? ''}
            onChange={(v) => setOperator({ ...operator, stall_number: v })}
          />
        </div>
        <label className="block">
          <span className="text-sm font-medium text-ink">Descrizione</span>
          <textarea
            value={operator.description ?? ''}
            onChange={(e) => setOperator({ ...operator, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-cream-300 rounded-sm bg-cream-100"
          />
        </label>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-ink-muted">{msg}</div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Salvataggio…' : 'Salva profilo'}
          </button>
        </div>
      </form>

      {/* Presenze nei mercati */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest-plus text-ink-muted">Presenze nei mercati</p>
            <h2 className="font-serif text-2xl text-ink">
              {presences.length} presenz{presences.length === 1 ? 'a' : 'e'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPresence((s) => !s)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90"
          >
            <Plus className="w-4 h-4" /> Aggiungi sessione
          </button>
        </div>

        {showAddPresence && (
          <form onSubmit={handleAddPresence} className="bg-cream-50 border border-cream-300 rounded-sm p-5 mb-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">Sessione mercato</span>
              <select
                required
                value={newPresence.scheduleId}
                onChange={(e) => {
                  const s = allSessions.find((x) => x.id === e.target.value)
                  setNewPresence({
                    scheduleId: e.target.value,
                    lat: s?.lat ?? null,
                    lng: s?.lng ?? null,
                    stall: '',
                  })
                }}
                className="w-full px-3 py-2 border border-cream-300 rounded-sm bg-cream-100"
              >
                <option value="">— scegli una sessione —</option>
                {availableSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.comune} · {s.giorno}{s.luogo ? ` — ${s.luogo}` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-ink-muted mt-1">
                L&apos;operatore può essere presente su più sessioni della stessa zona. Per altre zone, duplica dalla pagina di quella zona.
              </p>
            </label>

            <F
              label="Banco su questa sessione (opzionale)"
              value={newPresence.stall}
              onChange={(v) => setNewPresence({ ...newPresence, stall: v })}
            />

            {newPresence.scheduleId && (() => {
              const s = allSessions.find((x) => x.id === newPresence.scheduleId)
              const center: [number, number] = s?.lat != null && s?.lng != null
                ? [s.lat, s.lng]
                : [market.center_lat, market.center_lng]
              return (
                <LocationFields
                  center={center}
                  zoom={17}
                  lat={newPresence.lat}
                  lng={newPresence.lng}
                  onChange={(lat, lng) => setNewPresence({ ...newPresence, lat, lng })}
                  areaPositions={areaPositions}
                  label="Posizione del banco per questa sessione"
                  helperText={`Mappa centrata su "${s?.luogo ?? s?.comune}". Clicca, trascina o usa Sono qui.`}
                />
              )
            })()}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPresence(false)}
                className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-ink rounded-sm text-sm"
              >
                Annulla
              </button>
              <button type="submit" className="px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90">
                Aggiungi
              </button>
            </div>
          </form>
        )}

        {presences.length === 0 ? (
          <div className="bg-cream-50 border border-cream-300 rounded-sm p-6 text-center text-ink-muted text-sm">
            Nessuna presenza configurata. Aggiungi almeno una sessione per far apparire l&apos;operatore nei mercati.
          </div>
        ) : (
          <ul className="border-y border-cream-300 divide-y divide-cream-300">
            {presences.map((p) => (
              <li key={p.scheduleId} className="py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <CalendarDays className="w-4 h-4 text-olive-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-serif text-lg text-ink">{p.session?.comune ?? '—'}</span>
                      <span className="text-sm text-ink-muted">· {p.session?.giorno}</span>
                      {p.session?.orario && <span className="text-xs text-ink-muted tabular-nums">{p.session.orario}</span>}
                    </div>
                    {p.session?.luogo && (
                      <p className="text-xs text-ink-soft flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {p.session.luogo}
                      </p>
                    )}
                    <p className="text-xs text-ink-muted mt-1 tabular-nums">
                      {p.locationLat != null && p.locationLng != null
                        ? `Posizione banco: ${p.locationLat.toFixed(5)}, ${p.locationLng.toFixed(5)}`
                        : 'Nessuna posizione specifica'}
                      {p.stallNumber && ` · Banco ${p.stallNumber}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePresence(p.scheduleId)}
                    className="p-2 text-ink-soft hover:text-terra-500"
                    title="Rimuovi presenza"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 pl-7">
                  <LocationFields
                    center={
                      p.session?.lat != null && p.session?.lng != null
                        ? [p.session.lat, p.session.lng]
                        : [market.center_lat, market.center_lng]
                    }
                    zoom={17}
                    lat={p.locationLat}
                    lng={p.locationLng}
                    onChange={(lat, lng) => handleUpdatePresence(p, { lat, lng })}
                    areaPositions={areaPositions}
                    label="Modifica posizione"
                    helperText="Le modifiche si salvano automaticamente al click."
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Account */}
      <div className="bg-cream-50 border border-cream-300 rounded-sm p-5 md:p-6">
        <p className="text-xs uppercase tracking-widest-plus text-ink-muted mb-2">Account operatore</p>
        {operator.user_id ? (
          <p className="flex items-center text-olive-700 text-sm">
            <CheckCircle2 className="w-5 h-5 mr-2" /> Account collegato
          </p>
        ) : (
          <form onSubmit={handleInvite} className="flex items-center gap-2">
            <input
              type="email"
              required
              placeholder="email@operatore.it"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-cream-300 rounded-sm bg-cream-100"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90"
            >
              <Mail className="w-4 h-4" /> Invita
            </button>
          </form>
        )}
        {inviteMsg && <p className="text-sm text-ink mt-2">{inviteMsg}</p>}
        <p className="text-xs text-ink-muted mt-3">
          L&apos;operatore riceverà un&apos;email da Supabase per impostare la password.
        </p>
      </div>
    </div>
  )
}

function F({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-cream-300 rounded-sm bg-cream-100"
      />
    </label>
  )
}
