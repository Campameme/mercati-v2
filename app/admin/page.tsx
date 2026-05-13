import Link from 'next/link'
import { Power, Settings, MapPin, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminRoot() {
  const supabase = createClient()
  const [{ count: marketsTotal }, { count: marketsActive }, { count: sessionsTotal }, { count: sessionsActive }] = await Promise.all([
    supabase.from('markets').select('*', { count: 'exact', head: true }),
    supabase.from('markets').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('market_schedules').select('*', { count: 'exact', head: true }),
    supabase.from('market_schedules').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-5xl">
      <div className="mb-8 border-b border-cream-300 pb-5">
        <p className="text-[0.72rem] uppercase tracking-widest-plus text-ink-muted mb-1">Super-admin</p>
        <h1 className="font-serif text-3xl md:text-4xl text-ink leading-tight">Dashboard provincia</h1>
        <p className="text-sm text-ink-soft mt-2">Gestione globale di zone e singole sessioni di mercato.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-cream-50 border border-cream-300 rounded-sm p-4">
          <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted">Zone</p>
          <p className="font-serif text-2xl text-ink tabular-nums mt-1">
            {marketsActive ?? 0}<span className="text-ink-muted text-sm">/{marketsTotal ?? 0}</span>
          </p>
          <p className="text-[10px] text-ink-muted mt-0.5">attive</p>
        </div>
        <div className="bg-cream-50 border border-cream-300 rounded-sm p-4">
          <p className="text-[10px] uppercase tracking-widest-plus text-ink-muted">Sessioni</p>
          <p className="font-serif text-2xl text-ink tabular-nums mt-1">
            {sessionsActive ?? 0}<span className="text-ink-muted text-sm">/{sessionsTotal ?? 0}</span>
          </p>
          <p className="text-[10px] text-ink-muted mt-0.5">attive</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/sessions"
          className="group bg-cream-50 border border-cream-300 rounded-sm p-5 hover:border-olive-500 hover:-translate-y-0.5 transition-all"
        >
          <Power className="w-8 h-8 text-olive-500 mb-3" />
          <h2 className="font-serif text-lg text-ink mb-1 group-hover:text-olive-700 transition-colors">
            Accendi / Spegni mercati
          </h2>
          <p className="text-sm text-ink-soft">
            Toggle rapido per zone e singole sessioni. I mercati spenti scompaiono da mappa, calendario e ricerca.
          </p>
          <span className="inline-flex items-center gap-1 mt-3 text-xs text-olive-700 group-hover:translate-x-0.5 transition-transform">
            Apri <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/admin/markets"
          className="group bg-cream-50 border border-cream-300 rounded-sm p-5 hover:border-olive-500 hover:-translate-y-0.5 transition-all"
        >
          <Settings className="w-8 h-8 text-olive-500 mb-3" />
          <h2 className="font-serif text-lg text-ink mb-1 group-hover:text-olive-700 transition-colors">
            Gestione zone
          </h2>
          <p className="text-sm text-ink-soft">
            Crea, modifica e archivia le zone aggregate. Importa/esporta operatori in Excel.
          </p>
          <span className="inline-flex items-center gap-1 mt-3 text-xs text-olive-700 group-hover:translate-x-0.5 transition-transform">
            Apri <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      <div className="mt-10 pt-6 border-t border-cream-300 text-xs text-ink-muted">
        <p className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          Per gestire una zona specifica (banchi, area sessione, notizie), entra dalla scheda zona e clicca &ldquo;Gestione&rdquo;.
        </p>
      </div>
    </div>
  )
}
