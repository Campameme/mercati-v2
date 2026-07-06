import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Instagram, Facebook, Globe, Navigation2, MessageCircle, BadgeCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import FavoriteButton from '@/components/FavoriteButton'
import { BancoPlaceholder } from '@/components/BancoAvatar'
import { CanopyEdge } from '@/components/decorations'
import PageviewTracker from '@/components/analytics/PageviewTracker'

const CAT_LABEL: Record<string, string> = {
  food: 'Alimentare',
  clothing: 'Abbigliamento',
  accessories: 'Accessori',
  electronics: 'Elettronica',
  home: 'Casa',
  books: 'Libri',
  flowers: 'Fiori',
  other: 'Altro',
  fruit_vegetables: 'Frutta e verdura',
  bakery: 'Panificio',
  meat_fish: 'Carne e pesce',
  dairy: 'Latticini',
}

export const dynamic = 'force-dynamic'

export default async function OperatorDetailPage({ params }: { params: { marketSlug: string; id: string } }) {
  const supabase = createClient()
  const { data: operator } = await supabase
    .from('operators')
    .select('*, markets!inner(slug, name)')
    .eq('id', params.id)
    .maybeSingle()
  if (!operator || operator.markets?.slug !== params.marketSlug) notFound()

  const [{ data: products }, { data: presences }, { data: marketLinks }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('operator_id', operator.id)
      .eq('is_available', true)
      .order('sort_order')
      .order('created_at', { ascending: false }),
    supabase
      .from('operator_schedules')
      .select('schedule_id, location_lat, location_lng, stall_number, market_schedules(id, comune, giorno, orario, luogo, lat, lng, markets(slug, name))')
      .eq('operator_id', operator.id),
    // Mercati assegnati (nuovo modello multi-mercato). Difensivo: se la tabella
    // non esiste ancora (pre-migration) `data` è null e si ignora.
    supabase
      .from('operator_markets')
      .select('market_id, location_lat, location_lng, stall_number, markets(slug, name)')
      .eq('operator_id', operator.id),
  ])

  const assignedMarkets = (marketLinks ?? []).map((m: any) => ({
    slug: m.markets?.slug ?? null,
    name: m.markets?.name ?? '',
    lat: m.location_lat ?? null,
    lng: m.location_lng ?? null,
    stall: m.stall_number ?? null,
  })).sort((a, b) => a.name.localeCompare(b.name))

  const social = (operator.social_links ?? {}) as Record<string, string>
  const sessions = (presences ?? [])
    .map((p: any) => ({
      scheduleId: p.schedule_id,
      stallNumber: p.stall_number ?? operator.stall_number ?? null,
      lat: p.location_lat ?? p.market_schedules?.lat ?? null,
      lng: p.location_lng ?? p.market_schedules?.lng ?? null,
      comune: p.market_schedules?.comune ?? '',
      giorno: p.market_schedules?.giorno ?? '',
      orario: p.market_schedules?.orario ?? '',
      luogo: p.market_schedules?.luogo ?? null,
      marketSlug: p.market_schedules?.markets?.slug ?? null,
      marketName: p.market_schedules?.markets?.name ?? null,
    }))
    .sort((a, b) => a.comune.localeCompare(b.comune))

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-4xl">
      <PageviewTracker type="view_operator" operatorId={operator.id} />
      <Link
        href={`/${params.marketSlug}/operators`}
        className="inline-flex items-center gap-1.5 text-xs font-alt font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-mare mb-3 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Tutti i banchi
      </Link>

      {/* Il ritratto del Maestro: pannello notte col tendone in testa, nome in
          Italiana col punto e riga di servizio gialla — come sui social. */}
      <div className="relative overflow-hidden imk-edge border-2 border-notte bg-notte text-carta mb-8">
        <div aria-hidden="true" className="imk-awning h-2.5" />
        <CanopyEdge color="#F7EFDD" className="h-3 md:h-3.5 -mt-px" />
        <div className="p-5 md:p-8">
          <div className="flex items-start gap-4 md:gap-6 flex-wrap">
            {/* Figurina: foto o placeholder duotone mare→sole */}
            <div className="flex-shrink-0">
              {operator.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={operator.photos[0]} alt={operator.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl border-2 border-carta/25" />
              ) : (
                <BancoPlaceholder name={operator.name} className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-2 border-carta/25" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h1 className="flex-1 font-display text-4xl md:text-6xl leading-[1.02] text-carta">
                  {operator.name.replace(/\.+$/, '')}<span className="text-sole">.</span>
                </h1>
                <span className="rounded-full bg-carta/90 shadow-sm">
                  <FavoriteButton kind="operator" id={operator.id} label={operator.name} />
                </span>
              </div>
              <div className="flex items-center gap-x-3 gap-y-2 mt-3 flex-wrap">
                <p className="font-alt text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-sole">
                  {CAT_LABEL[operator.category] ?? operator.category}
                  {operator.markets?.name ? ` · ${operator.markets.name}` : ''}
                </p>
                {operator.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-carta/15 text-carta rounded-full font-alt text-[11px] font-semibold uppercase tracking-wider">
                    <BadgeCheck className="w-3.5 h-3.5 text-sole" /> Verificato
                  </span>
                )}
                {operator.stall_number && (
                  <span className="imk-cartellino px-3 py-0.5 font-hand font-bold text-xl leading-snug">banco {operator.stall_number}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                {social.whatsapp && (
                  <a
                    href={social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-alt font-semibold hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {operator.location_lat != null && operator.location_lng != null && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${operator.location_lat},${operator.location_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-carta text-ink rounded-full text-sm font-alt font-semibold hover:bg-sole transition-colors"
                  >
                    <Navigation2 className="w-4 h-4" /> Indicazioni
                  </a>
                )}
              </div>
            </div>
          </div>
          {operator.description && <p className="text-carta/85 mt-5 max-w-2xl leading-relaxed">{operator.description}</p>}
        </div>
      </div>

      {operator.photos?.length > 1 && (
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {operator.photos.slice(1).map((url: string) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="w-48 h-48 object-cover rounded-xl flex-shrink-0 border-2 border-ink/10" />
          ))}
        </div>
      )}

      {/* Presenze nei mercati */}
      <section className="mb-10">
        <div className="flex items-baseline gap-3 mb-4">
          <p className="text-xs font-alt font-semibold uppercase tracking-[0.14em] text-ink-muted">Dove lo trovi</p>
          {(() => { const n = sessions.length || assignedMarkets.length; return (
            <h2 className="font-alt font-bold text-2xl text-ink">{n} {sessions.length ? `presenz${n === 1 ? 'a' : 'e'}` : `mercat${n === 1 ? 'o' : 'i'}`}</h2>
          ) })()}
        </div>
        {sessions.length === 0 ? (
          assignedMarkets.length === 0 ? (
            <p className="text-sm text-ink-muted italic">Nessun mercato configurato.</p>
          ) : (
            /* Nuovo modello: i mercati assegnati con la posizione sulla mappa. */
            <ul className="imk-edge border-2 border-ink/10 bg-white px-5 md:px-6 divide-y divide-ink/10">
              {assignedMarkets.map((m) => (
                <li key={m.slug ?? m.name} className="py-4 flex items-baseline gap-3">
                  <span className="font-alt font-bold text-lg text-ink whitespace-nowrap">{m.name}</span>
                  <span className="imk-leader text-ink" aria-hidden="true" />
                  <span className="min-w-0 text-right">
                    {m.stall && <span className="block text-xs text-ink-muted">banco {m.stall}</span>}
                    {m.lat != null && m.lng != null && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-mare hover:text-mare-600 underline underline-offset-2 mt-1"
                      >
                        <Navigation2 className="w-3 h-3" /> Indicazioni
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )
        ) : (
          /* Tabellone "da stazione": comune … giorno, col leader puntinato
             (lo stesso formato-settimana del kit social). */
          <ul className="imk-edge border-2 border-ink/10 bg-white px-5 md:px-6 divide-y divide-ink/10">
            {sessions.map((s) => (
              <li key={s.scheduleId} className="py-4 flex items-baseline gap-3">
                <span className="font-alt font-bold text-lg text-ink whitespace-nowrap">{s.comune}</span>
                <span className="imk-leader text-ink" aria-hidden="true" />
                <span className="min-w-0 text-right">
                  <span className="block font-alt font-semibold text-sm text-mare-600">
                    {s.giorno}
                    {s.orario && <span className="text-ink-muted font-normal tabular-nums"> · {s.orario}</span>}
                  </span>
                  {(s.luogo || s.stallNumber) && (
                    <span className="block text-xs text-ink-muted mt-0.5">
                      {s.luogo}
                      {s.stallNumber && ` · banco ${s.stallNumber}`}
                    </span>
                  )}
                  {s.lat != null && s.lng != null && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-mare hover:text-mare-600 underline underline-offset-2 mt-1"
                    >
                      <Navigation2 className="w-3 h-3" /> Indicazioni
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center flex-wrap gap-4 mb-10 text-sm">
        {operator.languages?.length > 0 && (
          <div className="text-ink-muted">Lingue: <strong className="text-ink">{operator.languages.join(', ')}</strong></div>
        )}
        {operator.payment_methods?.length > 0 && (
          <div className="text-ink-muted">Pagamenti: <strong className="text-ink">{operator.payment_methods.join(', ')}</strong></div>
        )}
      </div>

      {(social.instagram || social.facebook || social.website) && (
        <div className="flex items-center space-x-3 mb-10">
          {social.instagram && (
            <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-fiore hover:text-fiore-600">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {social.facebook && (
            <a href={social.facebook} target="_blank" rel="noreferrer" className="text-mare hover:text-mare-600">
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {social.website && (
            <a href={social.website} target="_blank" rel="noreferrer" className="text-ink-soft hover:text-ink">
              <Globe className="w-5 h-5" />
            </a>
          )}
        </div>
      )}

      <h2 className="font-alt font-bold text-2xl text-ink mb-4">Prodotti</h2>
      {(!products || products.length === 0) ? (
        <p className="bg-white border-2 border-ink/10 rounded-xl p-8 text-center text-ink-muted">
          Nessun prodotto pubblicato.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="imk-lift group bg-white border-2 border-ink/10 rounded-xl overflow-hidden flex flex-col">
              {p.photos?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photos[0]} alt={p.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-alt font-bold text-lg text-ink">{p.name}</h3>
                {p.description && <p className="text-sm text-ink-soft mt-1 flex-1">{p.description}</p>}
                {p.price !== null && (
                  /* Il prezzo sul cartellino, scritto a mano: "prezzo onesto" */
                  <p className="mt-3">
                    <span className="imk-cartellino px-3 py-0.5 font-hand font-bold text-2xl leading-snug">
                      {new Intl.NumberFormat('it-IT', { style: 'currency', currency: p.currency }).format(p.price)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
