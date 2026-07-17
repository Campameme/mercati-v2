import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Instagram, Facebook, Globe, Navigation2, MessageCircle, BadgeCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import FavoriteButton from '@/components/FavoriteButton'
import BancoAvatar from '@/components/BancoAvatar'
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
    .select('*, markets!operators_market_id_fkey!inner(slug, name)')
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

  const presenzeCount = sessions.length || assignedMarkets.length

  return (
    <div className="bg-crema min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-4xl">
        <PageviewTracker type="view_operator" operatorId={operator.id} />
        <Link
          href={`/${params.marketSlug}/operators`}
          className="inline-flex items-center gap-1.5 text-xs font-alt font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-alga-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Tutti i banchi
        </Link>

        {/* La carta del banco: card bianca grande con la band terracotta in
            testa — avatar, nome col punto, mestiere, bio e contatti. */}
        <article className="overflow-hidden bg-white rounded-xl border border-[#e0d7c1] shadow-[0_16px_30px_-24px_rgba(38,36,30,0.45)]">
          <span aria-hidden="true" className="mz-band" style={{ ['--band' as string]: '#C4593C' }} />

          <div className="p-5 md:p-8">
            <div className="flex items-start gap-4 md:gap-6 flex-wrap">
              <div className="flex-shrink-0">
                {operator.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={operator.photos[0]} alt={operator.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl border border-[#e0d7c1]" />
                ) : (
                  <BancoAvatar name={operator.name} size={96} className="border border-[#e0d7c1]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <h1 className="flex-1 font-display font-extrabold tracking-tight text-4xl md:text-5xl leading-[1.02] text-ink">
                    {operator.name.replace(/\.+$/, '')}<span className="text-terracotta">.</span>
                  </h1>
                  <FavoriteButton kind="operator" id={operator.id} label={operator.name} />
                </div>
                <div className="flex items-center gap-x-2 gap-y-2 mt-3 flex-wrap">
                  <span className="inline-block font-alt text-[11px] font-bold uppercase tracking-wide text-terracotta-600 bg-terracotta-50 rounded-full px-2.5 py-1">
                    {CAT_LABEL[operator.category] ?? operator.category}
                  </span>
                  {operator.verified && (
                    <span className="inline-flex items-center gap-1 font-alt text-[11px] font-bold uppercase tracking-wide text-alga-600 bg-alga-50 rounded-full px-2.5 py-1">
                      <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verificato
                    </span>
                  )}
                  {operator.stall_number && (
                    <span className="inline-block font-alt text-[11px] font-bold uppercase tracking-wide text-alga-600 bg-alga-50 rounded-full px-2.5 py-1">
                      banco {operator.stall_number}
                    </span>
                  )}
                  {operator.markets?.name && (
                    <span className="font-alt text-xs font-semibold text-ink-muted">{operator.markets.name}</span>
                  )}
                </div>
                {operator.description && (
                  <p className="text-ink-soft mt-4 max-w-2xl leading-relaxed">{operator.description}</p>
                )}
                <div className="flex items-center gap-2 mt-5 flex-wrap">
                  {social.whatsapp && (
                    <a
                      href={social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="imk-lift inline-flex items-center gap-1.5 px-5 py-2.5 bg-alga text-crema rounded-full text-sm font-alt font-semibold hover:bg-alga-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  )}
                  {operator.location_lat != null && operator.location_lng != null && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${operator.location_lat},${operator.location_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="imk-lift inline-flex items-center gap-1.5 px-5 py-2.5 bg-terracotta text-crema rounded-full text-sm font-alt font-semibold hover:bg-terracotta-600 transition-colors"
                    >
                      <Navigation2 className="w-4 h-4" /> Indicazioni
                    </a>
                  )}
                </div>
              </div>
            </div>

            {operator.photos?.length > 1 && (
              <div className="flex gap-3 mt-6 overflow-x-auto pb-1">
                {operator.photos.slice(1).map((url: string) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="w-40 h-40 object-cover rounded-xl flex-shrink-0 border border-[#e0d7c1]" />
                ))}
              </div>
            )}
          </div>

          {/* Presenze nei mercati: comune + chip del giorno */}
          <section className="border-t border-[#e0d7c1] p-5 md:p-8">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-1">Dove lo trovi</p>
            <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">
              {presenzeCount} {sessions.length ? `presenz${presenzeCount === 1 ? 'a' : 'e'}` : `mercat${presenzeCount === 1 ? 'o' : 'i'}`}
            </h2>
            {sessions.length === 0 ? (
              assignedMarkets.length === 0 ? (
                <p className="text-sm text-ink-muted italic">Nessun mercato configurato.</p>
              ) : (
                /* Nuovo modello: i mercati assegnati con la posizione sulla mappa. */
                <ul className="divide-y divide-[#e0d7c1]">
                  {assignedMarkets.map((m) => (
                    <li key={m.slug ?? m.name} className="py-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="font-display font-extrabold tracking-tight text-lg text-ink">{m.name}</span>
                      {m.stall && (
                        <span className="inline-flex items-center rounded-full border-[1.5px] border-alga/60 px-3 py-0.5 font-alt text-[13px] font-semibold text-alga-600">
                          banco {m.stall}
                        </span>
                      )}
                      {m.lat != null && m.lng != null && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-alt font-semibold text-alga-600 hover:text-alga underline underline-offset-2"
                        >
                          <Navigation2 className="w-3 h-3" /> Indicazioni
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <ul className="divide-y divide-[#e0d7c1]">
                {sessions.map((s) => (
                  <li key={s.scheduleId} className="py-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="font-display font-extrabold tracking-tight text-lg text-ink">{s.comune}</span>
                    <span className="inline-flex items-center rounded-full border-[1.5px] border-alga/60 px-3 py-0.5 font-alt text-[13px] font-semibold text-alga-600">
                      {s.giorno}
                    </span>
                    {s.orario && <span className="font-alt text-xs font-semibold text-ink-muted tabular-nums">{s.orario}</span>}
                    {(s.luogo || s.stallNumber) && (
                      <span className="text-xs text-ink-muted">
                        {s.luogo}
                        {s.stallNumber && `${s.luogo ? ' · ' : ''}banco ${s.stallNumber}`}
                      </span>
                    )}
                    {s.lat != null && s.lng != null && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-alt font-semibold text-alga-600 hover:text-alga underline underline-offset-2"
                      >
                        <Navigation2 className="w-3 h-3" /> Indicazioni
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* I prodotti sul banco, come chips (prezzo in display, niente cartellini) */}
          <section className="border-t border-[#e0d7c1] p-5 md:p-8">
            <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-terracotta mb-1">Sul banco</p>
            <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Prodotti</h2>
            {(!products || products.length === 0) ? (
              <p className="text-sm text-ink-muted italic">Nessun prodotto pubblicato.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {products.map((p) => (
                  <li key={p.id} className="inline-flex items-baseline gap-2 rounded-full bg-crema border border-[#e0d7c1] px-3.5 py-1.5">
                    <span className="font-alt text-sm font-semibold text-ink">{p.name}</span>
                    {p.price !== null && (
                      <span className="font-display font-extrabold tracking-tight text-sm text-terracotta-600">
                        {new Intl.NumberFormat('it-IT', { style: 'currency', currency: p.currency }).format(p.price)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Riga di servizio: lingue, pagamenti, social */}
          {(operator.languages?.length > 0 || operator.payment_methods?.length > 0 || social.instagram || social.facebook || social.website) && (
            <div className="border-t border-[#e0d7c1] bg-crema-2/60 px-5 md:px-8 py-4 flex items-center flex-wrap gap-x-6 gap-y-2 text-sm">
              {operator.languages?.length > 0 && (
                <div className="text-ink-muted">Lingue: <strong className="text-ink">{operator.languages.join(', ')}</strong></div>
              )}
              {operator.payment_methods?.length > 0 && (
                <div className="text-ink-muted">Pagamenti: <strong className="text-ink">{operator.payment_methods.join(', ')}</strong></div>
              )}
              {(social.instagram || social.facebook || social.website) && (
                <div className="flex items-center gap-3">
                  {social.instagram && (
                    <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-terracotta hover:text-terracotta-600">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {social.facebook && (
                    <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-alga hover:text-alga-600">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {social.website && (
                    <a href={social.website} target="_blank" rel="noreferrer" aria-label="Sito web" className="text-ink-soft hover:text-ink">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </article>
      </div>
    </div>
  )
}
