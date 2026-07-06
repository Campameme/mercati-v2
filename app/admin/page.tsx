import Link from 'next/link'
import { Power, Settings, MapPin, ArrowRight, BarChart3, Mail, TrendingUp, Eye, Users, Store, Ticket } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Logo from '@/components/Logo'

export const dynamic = 'force-dynamic'

interface MarketStat {
  market_id: string
  market_slug: string
  market_name: string
  views_30d: number
  unique_visitors_30d: number
  views_7d: number
  last_view_at: string | null
}

interface OperatorStat {
  operator_id: string
  operator_name: string
  market_id: string
  views_30d: number
  unique_visitors_30d: number
  views_7d: number
  last_view_at: string | null
}

interface AdesioneRow {
  id: string
  created_at: string
  nome: string
  email: string
  attivita: string
  stato: string
}

export default async function AdminRoot() {
  const supabase = createClient()
  const [
    { count: marketsTotal },
    { count: marketsActive },
    { count: sessionsTotal },
    { count: sessionsActive },
    { count: operatorsTotal },
    { count: adesioniNuove },
    { count: viewsTotal7d },
    { data: topMarkets },
    { data: topOperators },
    { data: recentAdesioni },
  ] = await Promise.all([
    supabase.from('markets').select('*', { count: 'exact', head: true }),
    supabase.from('markets').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('market_schedules').select('*', { count: 'exact', head: true }),
    supabase.from('market_schedules').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('operators').select('*', { count: 'exact', head: true }),
    supabase.from('adesioni_operatori').select('*', { count: 'exact', head: true }).eq('stato', 'nuovo'),
    supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()),
    supabase
      .from('market_stats_30d')
      .select('*')
      .order('views_30d', { ascending: false })
      .limit(8),
    supabase
      .from('operator_stats_30d')
      .select('*')
      .order('views_30d', { ascending: false })
      .limit(10),
    supabase
      .from('adesioni_operatori')
      .select('id, created_at, nome, email, attivita, stato')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const topMarketsRows = (topMarkets ?? []) as MarketStat[]
  const topOperatorsRows = (topOperators ?? []) as OperatorStat[]
  const adesioniRows = (recentAdesioni ?? []) as AdesioneRow[]

  return (
    <div className="min-h-screen bg-carta">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-6xl">
        <div className="mb-8 border-b-2 border-ink/10 pb-5">
          <p className="text-xs font-alt uppercase tracking-[0.14em] text-mare-600 mb-1">Super-admin</p>
          <h1 className="font-alt font-bold text-3xl md:text-4xl text-ink leading-tight flex items-center gap-3">
            Dashboard <Logo inline />
          </h1>
          <p className="text-sm text-ink-soft mt-2">
            Stato del progetto, accendi/spegni zone, analytics anonime di visita, gestione adesioni.
          </p>
        </div>

        {/* Statistiche di stato */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          <Stat label="Zone" value={`${marketsActive ?? 0}/${marketsTotal ?? 0}`} sub="attive" icon={MapPin} />
          <Stat label="Sessioni" value={`${sessionsActive ?? 0}/${sessionsTotal ?? 0}`} sub="attive" icon={Power} />
          <Stat label="Operatori" value={`${operatorsTotal ?? 0}`} sub="totali" icon={Users} />
          <Stat label="Views 7g" value={`${viewsTotal7d ?? 0}`} sub="totali" icon={Eye} />
          <Stat label="Adesioni" value={`${adesioniNuove ?? 0}`} sub="da gestire" icon={Mail} highlight={(adesioniNuove ?? 0) > 0} />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <ActionCard
            href="/admin/operatori"
            icon={Store}
            title="Gestione operatori"
            desc="Crea i Maestri del Banco, assegnali ai mercati con la posizione, invia i link di accesso."
          />
          <ActionCard
            href="/admin/sessions"
            icon={Power}
            title="Accendi / Spegni"
            desc="Toggle zone e singole sessioni. Cascade automatica zona → sessioni."
          />
          <ActionCard
            href="/admin/tessera"
            icon={Ticket}
            title="Punti e coupon"
            desc="La tessera del mercato: saldo di ogni iscritto, assegna punti, emetti coupon."
          />
          <ActionCard
            href="/admin/markets"
            icon={Settings}
            title="Gestione zone"
            desc="Crea e modifica zone. Import/export Excel operatori."
          />
          <ActionCard
            href="/admin/adesioni"
            icon={Mail}
            title="Adesioni operatori"
            desc={`${adesioniNuove ?? 0} richieste da gestire. Risposte entro 48h.`}
            badge={adesioniNuove ?? 0}
          />
        </div>

        {/* Analytics: zone piu viste */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink/10 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-mare" />
              <h2 className="font-alt font-bold text-lg text-ink">Zone più viste · ultimi 30 giorni</h2>
            </div>
            <p className="text-[11px] text-ink-muted italic">Statistiche anonime cookieless</p>
          </div>
          {topMarketsRows.length === 0 ? (
            <p className="text-sm text-ink-muted italic py-6">Nessun dato ancora. Le views appariranno con il traffico.</p>
          ) : (
            <div className="bg-white border-2 border-ink/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-[11px] font-alt uppercase tracking-wider text-ink-muted bg-carta">
                  <tr className="text-left">
                    <th className="py-2.5 pl-4">Zona</th>
                    <th className="py-2.5 text-right tabular-nums">Views 30g</th>
                    <th className="py-2.5 text-right tabular-nums">Unici</th>
                    <th className="py-2.5 text-right tabular-nums">Views 7g</th>
                    <th className="py-2.5 pr-4 text-right">Ultima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {topMarketsRows.map((m) => (
                    <tr key={m.market_id} className="hover:bg-carta">
                      <td className="py-2.5 pl-4">
                        <Link href={`/${m.market_slug}`} className="font-alt text-ink hover:text-mare-600">
                          {m.market_name}
                        </Link>
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-ink">{m.views_30d}</td>
                      <td className="py-2.5 text-right tabular-nums text-ink-soft">{m.unique_visitors_30d}</td>
                      <td className="py-2.5 text-right tabular-nums text-ink-soft">{m.views_7d}</td>
                      <td className="py-2.5 pr-4 text-right text-xs text-ink-muted">{formatRelative(m.last_view_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Analytics: operatori piu visti */}
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink/10 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-mare" />
              <h2 className="font-alt font-bold text-lg text-ink">Operatori più visti · ultimi 30 giorni</h2>
            </div>
          </div>
          {topOperatorsRows.length === 0 ? (
            <p className="text-sm text-ink-muted italic py-6">Nessun operatore ha ancora ricevuto views.</p>
          ) : (
            <div className="bg-white border-2 border-ink/10 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-[11px] font-alt uppercase tracking-wider text-ink-muted bg-carta">
                  <tr className="text-left">
                    <th className="py-2.5 pl-4">Operatore</th>
                    <th className="py-2.5 text-right tabular-nums">Views 30g</th>
                    <th className="py-2.5 text-right tabular-nums">Unici</th>
                    <th className="py-2.5 text-right tabular-nums">Views 7g</th>
                    <th className="py-2.5 pr-4 text-right">Ultima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {topOperatorsRows.map((o) => (
                    <tr key={o.operator_id} className="hover:bg-carta">
                      <td className="py-2.5 pl-4">
                        <span className="text-ink">{o.operator_name}</span>
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-ink">{o.views_30d}</td>
                      <td className="py-2.5 text-right tabular-nums text-ink-soft">{o.unique_visitors_30d}</td>
                      <td className="py-2.5 text-right tabular-nums text-ink-soft">{o.views_7d}</td>
                      <td className="py-2.5 pr-4 text-right text-xs text-ink-muted">{formatRelative(o.last_view_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Ultime adesioni */}
        <section>
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-ink/10 pb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-mare" />
              <h2 className="font-alt font-bold text-lg text-ink">Ultime adesioni</h2>
            </div>
            <Link href="/admin/adesioni" className="text-xs font-alt uppercase tracking-wider text-mare-600 hover:text-mare-700">
              Vedi tutte →
            </Link>
          </div>
          {adesioniRows.length === 0 ? (
            <p className="text-sm text-ink-muted italic py-6">Nessuna richiesta ricevuta finora.</p>
          ) : (
            <ul className="bg-white border-2 border-ink/10 rounded-xl divide-y divide-ink/10">
              {adesioniRows.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-alt text-ink text-base">{a.nome}</p>
                    <p className="text-xs text-ink-muted">
                      {a.attivita} · {a.email} · {formatRelative(a.created_at)}
                    </p>
                  </div>
                  <StatoBadge stato={a.stato} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, sub, icon: Icon, highlight }: {
  label: string; value: string; sub: string; icon: any; highlight?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 border-2 ${
      highlight ? 'bg-sole/15 border-sole' : 'bg-white border-ink/10'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-fiore-600' : 'text-mare'}`} />
        <p className="text-[11px] font-alt uppercase tracking-wider text-ink-muted">{label}</p>
      </div>
      <p className="font-alt font-bold text-2xl text-ink tabular-nums">{value}</p>
      <p className="text-[11px] text-ink-muted mt-0.5">{sub}</p>
    </div>
  )
}

function ActionCard({ href, icon: Icon, title, desc, badge }: {
  href: string; icon: any; title: string; desc: string; badge?: number
}) {
  return (
    <Link
      href={href}
      className="group relative bg-white border-2 border-ink/10 rounded-xl p-5 hover:border-mare hover:-translate-y-0.5 transition-all"
    >
      <Icon className="w-8 h-8 text-mare mb-3" />
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute top-3 right-3 bg-fiore text-white text-[11px] font-bold rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
      <h2 className="font-alt font-bold text-lg text-ink mb-1 group-hover:text-mare-600 transition-colors">
        {title}
      </h2>
      <p className="text-sm text-ink-soft">{desc}</p>
      <span className="inline-flex items-center gap-1 mt-3 text-xs font-alt uppercase tracking-wider text-mare-600 group-hover:translate-x-0.5 transition-transform">
        Apri <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  )
}

function StatoBadge({ stato }: { stato: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    nuovo:        { label: 'Nuovo',         cls: 'bg-mare/15 text-mare-700 border-mare/40' },
    in_contatto:  { label: 'In contatto',   cls: 'bg-sole/20 text-ink-soft border-sole' },
    aderito:      { label: 'Aderito',       cls: 'bg-mare text-white border-mare' },
    scartato:     { label: 'Scartato',      cls: 'bg-carta text-ink-muted border-ink/15' },
  }
  const c = config[stato] ?? config.nuovo
  return (
    <span className={`flex-shrink-0 text-[11px] font-alt uppercase tracking-wider px-2 py-1 rounded-full border-2 ${c.cls}`}>
      {c.label}
    </span>
  )
}

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `${min}m fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h fa`
  const days = Math.floor(h / 24)
  if (days < 30) return `${days}g fa`
  return d.toLocaleDateString('it-IT')
}
