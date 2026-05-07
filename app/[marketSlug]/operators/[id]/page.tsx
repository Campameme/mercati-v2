import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Instagram, Facebook, Globe, Navigation2, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import FavoriteButton from '@/components/FavoriteButton'

export const dynamic = 'force-dynamic'

export default async function OperatorDetailPage({ params }: { params: { marketSlug: string; id: string } }) {
  const supabase = createClient()
  const { data: operator } = await supabase
    .from('operators')
    .select('*, markets!inner(slug, name)')
    .eq('id', params.id)
    .maybeSingle()
  if (!operator || operator.markets?.slug !== params.marketSlug) notFound()

  const [{ data: products }, { data: presences }] = await Promise.all([
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
  ])

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
      <Link
        href={`/${params.marketSlug}/operators`}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest-plus text-ink-muted hover:text-ink mb-3 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Tutti i banchi
      </Link>

      <div className="border-b border-cream-300 pb-6 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <h1 className="font-serif text-3xl md:text-5xl text-ink flex-1">{operator.name}</h1>
              <FavoriteButton kind="operator" id={operator.id} label={operator.name} />
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap text-sm text-ink-soft">
              <span className="px-2 py-0.5 bg-cream-200 text-ink rounded-sm text-xs uppercase tracking-wider">{operator.category}</span>
              {operator.stall_number && (
                <span className="flex items-center text-ink-muted"><MapPin className="w-3 h-3 mr-1" />Banco {operator.stall_number}</span>
              )}
            </div>
          </div>
          {operator.location_lat != null && operator.location_lng != null && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${operator.location_lat},${operator.location_lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-cream-100 rounded-full text-sm hover:bg-ink/90 transition-colors"
            >
              <Navigation2 className="w-4 h-4" /> Indicazioni
            </a>
          )}
        </div>
        {operator.description && <p className="text-ink-soft mt-4 max-w-2xl">{operator.description}</p>}
      </div>

      {operator.photos?.length > 0 && (
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {operator.photos.map((url: string) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="w-48 h-48 object-cover rounded-sm flex-shrink-0 border border-cream-300" />
          ))}
        </div>
      )}

      {/* Presenze nei mercati */}
      <section className="mb-10">
        <div className="flex items-baseline gap-3 mb-4">
          <p className="text-xs uppercase tracking-widest-plus text-ink-muted">Dove lo trovi</p>
          <h2 className="font-serif text-2xl text-ink">{sessions.length} presenz{sessions.length === 1 ? 'a' : 'e'}</h2>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-ink-muted italic">Nessuna sessione configurata.</p>
        ) : (
          <ul className="border-y border-cream-300 divide-y divide-cream-300">
            {sessions.map((s) => (
              <li key={s.scheduleId} className="py-4 flex items-center gap-4 flex-wrap">
                <CalendarDays className="w-4 h-4 text-olive-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-serif text-lg text-ink">{s.comune}</span>
                    <span className="text-sm text-ink-muted">· {s.giorno}</span>
                    {s.orario && <span className="text-xs text-ink-muted tabular-nums">{s.orario}</span>}
                  </div>
                  {s.luogo && (
                    <p className="text-sm text-ink-soft flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {s.luogo}
                      {s.stallNumber && <span className="text-xs text-ink-muted">· Banco {s.stallNumber}</span>}
                    </p>
                  )}
                </div>
                {s.lat != null && s.lng != null && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink underline underline-offset-2"
                  >
                    <Navigation2 className="w-3 h-3" /> Indicazioni
                  </a>
                )}
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
            <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-ink-muted hover:text-ink">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {social.facebook && (
            <a href={social.facebook} target="_blank" rel="noreferrer" className="text-ink-muted hover:text-ink">
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {social.website && (
            <a href={social.website} target="_blank" rel="noreferrer" className="text-ink-muted hover:text-ink">
              <Globe className="w-5 h-5" />
            </a>
          )}
        </div>
      )}

      <h2 className="font-serif text-2xl text-ink mb-4">Prodotti</h2>
      {(!products || products.length === 0) ? (
        <p className="bg-cream-50 border border-cream-300 rounded-sm p-8 text-center text-ink-muted">
          Nessun prodotto pubblicato.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-cream-50 border border-cream-300 rounded-sm overflow-hidden flex flex-col">
              {p.photos?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photos[0]} alt={p.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-serif text-lg text-ink">{p.name}</h3>
                {p.description && <p className="text-sm text-ink-soft mt-1 flex-1">{p.description}</p>}
                {p.price !== null && (
                  <p className="text-ink font-semibold mt-2 tabular-nums">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: p.currency }).format(p.price)}
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
