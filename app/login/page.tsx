'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogIn, Mail, Lock, UserPlus, KeyRound } from 'lucide-react'
import Logo from '@/components/Logo'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 max-w-md text-center text-ink-muted">Caricamento…</div>}>
      <LoginPageInner />
    </Suspense>
  )
}

type Mode = 'signin' | 'signup' | 'reset' | 'update'

function LoginPageInner() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') ?? '/'
  const [mode, setMode] = useState<Mode>(search.get('recovery') ? 'update' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Arrivo da link di recupero password: Supabase mette i token nell'hash e
  // il client emette PASSWORD_RECOVERY. In quel caso mostriamo il form
  // "imposta nuova password" (sessione già attiva).
  useEffect(() => {
    const hashRecovery = typeof window !== 'undefined' && window.location.hash.includes('type=recovery')
    if (hashRecovery) setMode('update')
    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('update')
    })
    // Già autenticato e NON in modalità recovery → niente doppio login:
    // portiamo subito l'utente dove gli compete (admin, operatore, home).
    if (!hashRecovery && !search.get('recovery')) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) routeByRole(supabase)
      })
    }
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Dopo il login (o il cambio password) porta l'utente dove gli compete. */
  async function routeByRole(supabase: ReturnType<typeof createClient>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Trigger server-side invite auto-link and detect if user is an operator.
    let isOperator = false
    try {
      const meRes = await fetch('/api/operators/me', { cache: 'no-store' })
      if (meRes.ok) {
        const me = await meRes.json()
        isOperator = !!me.data
      }
    } catch { /* ignore */ }

    if (isOperator) {
      router.replace('/operator')
      router.refresh()
      return
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).maybeSingle()
    const role = profile?.role ?? 'citizen'
    if (role === 'super_admin') router.replace('/admin/markets')
    else if (role === 'market_admin') {
      const { data: assigns } = await supabase
        .from('market_admins').select('market_id, markets!inner(slug)').limit(1)
      const slug = (assigns?.[0] as any)?.markets?.slug
      router.replace(slug ? `/${slug}/admin` : next)
    } else {
      router.replace(next)
    }
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setNotice(null)
    const supabase = createClient()
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setNotice('Controlla la tua email per confermare la registrazione.')
      } else if (mode === 'reset') {
        // Il link di ritorno usa SEMPRE l'origin corrente: funziona in locale
        // e in produzione (l'URL va comunque autorizzato su Supabase).
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        })
        if (error) throw error
        setNotice('Email inviata: apri il link per impostare la nuova password (guarda anche nello spam).')
      } else if (mode === 'update') {
        if (password !== password2) throw new Error('Le due password non coincidono.')
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setNotice('Password aggiornata. Ti porto dentro…')
        await routeByRole(supabase)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await routeByRole(supabase)
      }
    } catch (err: any) {
      setError(err.message ?? 'Errore di autenticazione')
    } finally {
      setLoading(false)
    }
  }

  const TITLES: Record<Mode, string> = {
    signin: 'Accedi',
    signup: 'Registrati',
    reset: 'Recupera password',
    update: 'Nuova password',
  }

  return (
    <div className="min-h-[80vh] bg-carta flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border-2 border-ink/10 shadow-sm p-8">
          <div className="flex items-center justify-center gap-2 text-mare-600 mb-1">
            <Logo inline className="text-sm" />
            <span className="text-xs font-alt uppercase tracking-[0.14em]">· Riviera</span>
          </div>
          <h1 className="font-display text-3xl text-ink mb-2 text-center">{TITLES[mode]}</h1>
          {mode === 'update' && (
            <p className="text-sm text-ink-soft text-center mb-4">Scegli la nuova password per il tuo account.</p>
          )}
          {mode === 'reset' && (
            <p className="text-sm text-ink-soft text-center mb-4">Ti mandiamo un link per impostarne una nuova.</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {mode !== 'update' && (
              <label className="block">
                <span className="flex items-center text-xs font-alt uppercase tracking-wider text-ink-soft mb-1.5">
                  <Mail className="w-4 h-4 mr-1.5 text-mare" /> Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-carta border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-mare transition-colors"
                />
              </label>
            )}
            {mode !== 'reset' && (
              <label className="block">
                <span className="flex items-center text-xs font-alt uppercase tracking-wider text-ink-soft mb-1.5">
                  <Lock className="w-4 h-4 mr-1.5 text-mare" /> {mode === 'update' ? 'Nuova password' : 'Password'}
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-carta border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-mare transition-colors"
                />
              </label>
            )}
            {mode === 'update' && (
              <label className="block">
                <span className="flex items-center text-xs font-alt uppercase tracking-wider text-ink-soft mb-1.5">
                  <Lock className="w-4 h-4 mr-1.5 text-mare" /> Ripeti la nuova password
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="w-full px-3 py-2.5 bg-carta border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-mare transition-colors"
                />
              </label>
            )}

            {error && <p className="text-sm text-fiore-600">{error}</p>}
            {notice && <p className="text-sm text-mare-700">{notice}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-mare text-white font-alt uppercase tracking-wider text-sm rounded-full hover:bg-mare-600 disabled:opacity-50 transition-colors"
            >
              {mode === 'signup' ? <UserPlus className="w-4 h-4" /> : mode === 'signin' ? <LogIn className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
              <span>
                {loading ? 'Attendi…'
                  : mode === 'signin' ? 'Accedi'
                  : mode === 'signup' ? 'Registrati'
                  : mode === 'reset' ? 'Invia il link'
                  : 'Salva la nuova password'}
              </span>
            </button>
          </form>

          {mode !== 'update' && (
            <div className="mt-4 space-y-1.5 text-center">
              <button
                type="button"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setNotice(null) }}
                className="w-full text-sm text-ink-muted hover:text-mare-600 transition-colors"
              >
                {mode === 'signin' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
              </button>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => { setMode('reset'); setError(null); setNotice(null) }}
                  className="w-full text-sm text-ink-muted hover:text-mare-600 transition-colors"
                >
                  Password dimenticata?
                </button>
              )}
              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); setNotice(null) }}
                  className="w-full text-sm text-ink-muted hover:text-mare-600 transition-colors"
                >
                  ← Torna all'accesso
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
