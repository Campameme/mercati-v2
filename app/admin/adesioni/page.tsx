import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AdesioneStatoToggle from '@/components/admin/AdesioneStatoToggle'

export const dynamic = 'force-dynamic'

interface Adesione {
  id: string
  created_at: string
  nome: string
  email: string
  telefono: string | null
  attivita: string
  mercati_frequentati: string | null
  messaggio: string | null
  email_sent: boolean
  email_error: string | null
  stato: string
  note_admin: string | null
}

export default async function AdesioniAdminPage({ searchParams }: {
  searchParams: { stato?: string }
}) {
  const supabase = createClient()
  const filter = searchParams.stato ?? 'all'

  let query = supabase
    .from('adesioni_operatori')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter !== 'all') query = query.eq('stato', filter)

  const { data, error } = await query
  const adesioni = (data ?? []) as Adesione[]

  const filters = [
    { value: 'all', label: 'Tutte' },
    { value: 'nuovo', label: 'Nuove' },
    { value: 'in_contatto', label: 'In contatto' },
    { value: 'aderito', label: 'Aderiti' },
    { value: 'scartato', label: 'Scartate' },
  ]

  return (
    <div className="min-h-screen bg-crema">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14 max-w-5xl">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-alt uppercase tracking-wider text-ink-muted hover:text-ink mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard admin
        </Link>
        <div className="mb-8 border-b-2 border-ink/10 pb-5">
          <p className="text-xs font-alt uppercase tracking-[0.14em] text-alga-600 mb-1">Super-admin</p>
          <h1 className="font-alt font-bold text-3xl md:text-4xl text-ink leading-tight">Adesioni operatori</h1>
          <p className="text-sm text-ink-soft mt-2">Richieste ricevute dal form pubblico /aderisci.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={f.value === 'all' ? '/admin/adesioni' : `/admin/adesioni?stato=${f.value}`}
              className={`px-3 py-1.5 text-xs font-alt uppercase tracking-wider rounded-full border-2 transition-colors ${
                filter === f.value
                  ? 'bg-ink text-crema border-ink'
                  : 'bg-white text-ink-soft border-ink/15 hover:border-alga'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {error && (
          <p className="text-sm text-terracotta-600 italic">Errore caricamento: {error.message}</p>
        )}

        {adesioni.length === 0 ? (
          <p className="text-sm text-ink-muted italic">Nessuna richiesta con questi filtri.</p>
        ) : (
          <ul className="space-y-3">
            {adesioni.map((a) => (
              <li key={a.id} className="border-2 border-ink/10 rounded-xl bg-white p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-alt font-bold text-xl text-ink leading-tight">{a.nome}</h2>
                    <p className="text-sm text-ink-soft mt-0.5">{a.attivita}</p>
                  </div>
                  <AdesioneStatoToggle id={a.id} initialStato={a.stato} />
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm text-ink-soft mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-alga" />
                    <a href={`mailto:${a.email}`} className="text-alga-600 underline underline-offset-2 truncate">
                      {a.email}
                    </a>
                  </div>
                  {a.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-alga" />
                      <a href={`tel:${a.telefono}`} className="text-alga-600">{a.telefono}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                    <span>{new Date(a.created_at).toLocaleString('it-IT')}</span>
                  </div>
                </div>

                {a.mercati_frequentati && (
                  <p className="text-sm text-ink-soft mb-2">
                    <strong className="text-ink-muted text-xs font-alt uppercase tracking-wider mr-2">Mercati</strong>
                    {a.mercati_frequentati}
                  </p>
                )}

                {a.messaggio && (
                  <div className="mt-3 pt-3 border-t-2 border-ink/10">
                    <p className="text-xs font-alt uppercase tracking-wider text-ink-muted mb-1">Messaggio</p>
                    <p className="text-sm text-ink whitespace-pre-wrap">{a.messaggio}</p>
                  </div>
                )}

                {!a.email_sent && (
                  <p className="mt-3 text-xs text-terracotta-600">
                    ⚠ Email di notifica non inviata ({a.email_error ?? 'errore sconosciuto'})
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
