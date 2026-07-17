'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react'
import Logo from '@/components/Logo'
import { useLang } from '@/lib/i18n/useLang'
import { LOGIN_I18N } from '@/lib/i18n/tessera'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 max-w-md text-center text-ink-muted">…</div>}>
      <LoginPageInner />
    </Suspense>
  )
}

// Due mondi: "citizen" entra con un CODICE via email (OTP, nessuna password);
// "staff" (admin e operatori) entra con la password. Il recupero/aggiornamento
// password vive nel mondo staff. Prima di tutto si sceglie CHI si è:
// cliente o banco (world = null → schermata di scelta).
type World = 'citizen' | 'staff' | null
type StaffMode = 'signin' | 'reset' | 'update'

function LoginPageInner() {
  const router = useRouter()
  const search = useSearchParams()
  // Open-redirect guard: si accettano SOLO path interni relativi (un solo '/'
  // iniziale, niente '//host', niente 'https://…', niente backslash). Un valore
  // esterno viene ignorato e si torna alla home.
  const rawNext = search.get('next') ?? '/'
  const next = /^\/($|[^/\\])/.test(rawNext) ? rawNext : '/'
  const [lang] = useLang()
  const t = LOGIN_I18N[lang]

  const recovery = !!search.get('recovery')
  const autherror = search.get('autherror')
  const [world, setWorld] = useState<World>(recovery || autherror ? 'staff' : null)
  const [staffMode, setStaffMode] = useState<StaffMode>(recovery ? 'update' : autherror ? 'reset' : 'signin')

  // OTP
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email')
  const [code, setCode] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (autherror) {
      setError(autherror.includes('expired')
        ? 'Il link è scaduto o è già stato usato. Richiedine uno nuovo qui sotto.'
        : 'Il link non è più valido. Richiedine uno nuovo qui sotto.')
    }
    const hashRecovery = typeof window !== 'undefined' && window.location.hash.includes('type=recovery')
    if (hashRecovery) { setWorld('staff'); setStaffMode('update') }
    const supabase = createClient()
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') { setWorld('staff'); setStaffMode('update') }
    })
    if (!hashRecovery && !recovery) {
      supabase.auth.getUser().then(({ data: { user } }) => { if (user) routeByRole() })
    }
    return () => sub.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Dopo l'accesso porta l'utente dove gli compete. I cittadini alla loro tessera. */
  async function routeByRole() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let isOperator = false
    try {
      const meRes = await fetch('/api/operators/me', { cache: 'no-store' })
      if (meRes.ok) isOperator = !!(await meRes.json()).data
    } catch { /* ignore */ }
    if (isOperator) { router.replace('/operator'); router.refresh(); return }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const role = profile?.role ?? 'citizen'
    if (role === 'super_admin') router.replace('/admin/markets')
    else if (role === 'news_editor') router.replace('/redazione')
    else if (role === 'market_admin') {
      const { data: assigns } = await supabase.from('market_admins').select('markets!inner(slug)').limit(1)
      const slug = (assigns?.[0] as any)?.markets?.slug
      router.replace(slug ? `/${slug}/admin` : next)
    } else {
      router.replace(next !== '/' ? next : '/tessera')
    }
    router.refresh()
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setNotice(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/tessera` },
      })
      if (error) throw error
      setOtpStep('code')
      setNotice(t.codeSent)
    } catch (err: any) {
      setError(err?.message ?? t.genericError)
    } finally { setLoading(false) }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' })
      if (error) throw error
      // Assicura il bonus di benvenuto (idempotente) prima di entrare.
      try { await fetch('/api/tessera', { cache: 'no-store' }) } catch { /* ignore */ }
      await routeByRole()
    } catch (err: any) {
      setError(err?.message ?? t.genericError)
    } finally { setLoading(false) }
  }

  async function handleStaff(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setNotice(null)
    const supabase = createClient()
    try {
      if (staffMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` })
        if (error) throw error
        setNotice('Email inviata: apri il link per impostare la nuova password (guarda anche nello spam).')
      } else if (staffMode === 'update') {
        if (password !== password2) throw new Error('Le due password non coincidono.')
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setNotice('Password aggiornata. Ti porto dentro…')
        await routeByRole()
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await routeByRole()
      }
    } catch (err: any) {
      setError(err?.message ?? 'Errore di autenticazione')
    } finally { setLoading(false) }
  }

  const inputCls = 'w-full px-3 py-2.5 bg-crema border-2 border-ink/15 rounded-xl text-ink focus:outline-none focus:border-alga transition-colors'
  const btnCls = 'w-full flex items-center justify-center gap-2 px-4 py-3 bg-alga text-white font-alt uppercase tracking-wider text-sm rounded-full hover:bg-alga-600 disabled:opacity-50 transition-colors'

  return (
    <div className="min-h-[80vh] bg-crema flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Tendone in testa alla tessera d'accesso */}
        <div aria-hidden="true" className="h-2.5 rounded-t-xl" />
        <div className="bg-white rounded-b-xl border-2 border-t-0 border-ink/10 shadow-sm p-8">
          <div className="flex items-center justify-center gap-2 text-alga-600 mb-1">
            <Logo inline className="text-sm" />
          </div>

          {world === null ? (
            <>
              {/* Prima scelta: cliente o banco. Poi ognuno alla sua porta. */}
              <h1 className="font-display font-extrabold text-3xl text-ink mb-1 text-center">{t.choiceTitle}</h1>
              <p className="text-sm text-ink-soft text-center mb-6">{t.choiceLead}</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => { setWorld('citizen'); setError(null); setNotice(null) }}
                  className="imk-lift group w-full text-left bg-alga text-crema rounded-2xl p-5 hover:bg-alga-600 transition-colors"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display font-extrabold tracking-tight text-xl">{t.choiceClient}</span>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                  <span className="block text-sm text-crema/85 mt-1">{t.choiceClientDesc}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setWorld('staff'); setStaffMode('signin'); setError(null); setNotice(null) }}
                  className="imk-lift group w-full text-left bg-terracotta text-crema rounded-2xl p-5 hover:bg-terracotta-600 transition-colors"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display font-extrabold tracking-tight text-xl">{t.choiceVendor}</span>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </span>
                  <span className="block text-sm text-crema/85 mt-1">{t.choiceVendorDesc}</span>
                </button>
              </div>
              <Link href="/aderisci" className="mt-6 block w-full text-center text-sm text-ink-muted hover:text-alga-600 transition-colors">
                {t.vendorJoin}
              </Link>
            </>
          ) : world === 'citizen' ? (
            <>
              <h1 className="font-display font-extrabold text-3xl text-ink mb-1 text-center">{t.title}</h1>
              <p className="text-sm text-ink-soft text-center mb-5">{t.lead}</p>

              {otpStep === 'email' ? (
                <form onSubmit={sendCode} className="space-y-4">
                  <label className="block">
                    <span className="flex items-center text-xs font-alt uppercase tracking-wider text-ink-soft mb-1.5">
                      <Mail className="w-4 h-4 mr-1.5 text-alga" /> {t.emailLabel}
                    </span>
                    <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </label>
                  {error && <p className="text-sm text-terracotta-600">{error}</p>}
                  {notice && <p className="text-sm text-alga-600">{notice}</p>}
                  <button type="submit" disabled={loading} className={btnCls}>
                    <Mail className="w-4 h-4" /> {loading ? 'Attendi…' : t.sendCode}
                  </button>
                  <p className="text-xs text-ink-muted text-center pt-1">{t.welcomeNote}</p>
                </form>
              ) : (
                <form onSubmit={verifyCode} className="space-y-4">
                  <p className="text-sm text-alga-600 text-center">{t.codeSent}</p>
                  <label className="block">
                    <span className="flex items-center text-xs font-alt uppercase tracking-wider text-ink-soft mb-1.5">
                      <KeyRound className="w-4 h-4 mr-1.5 text-alga" /> {t.codeLabel}
                    </span>
                    <input
                      inputMode="numeric" autoComplete="one-time-code" required autoFocus
                      value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      className={`${inputCls} text-center text-2xl font-alt tracking-[0.3em]`}
                    />
                  </label>
                  {error && <p className="text-sm text-terracotta-600">{error}</p>}
                  <button type="submit" disabled={loading || code.length < 6} className={btnCls}>
                    {loading ? 'Attendi…' : t.verify} <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <button type="button" onClick={sendCode} className="hover:text-alga-600">{t.resend}</button>
                    <button type="button" onClick={() => { setOtpStep('email'); setCode(''); setError(null) }} className="hover:text-alga-600">{t.changeEmail}</button>
                  </div>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setWorld('staff'); setStaffMode('signin'); setError(null); setNotice(null) }}
                className="mt-6 w-full text-center text-sm text-ink-muted hover:text-alga-600 transition-colors"
              >
                {t.staffLink}
              </button>
            </>
          ) : (
            <>
              <h1 className="font-display font-extrabold text-3xl text-ink mb-2 text-center">
                {staffMode === 'reset' ? 'Recupera password' : staffMode === 'update' ? 'Nuova password' : 'Accesso riservato'}
              </h1>
              {staffMode === 'signin' && <p className="text-sm text-ink-soft text-center mb-4">Operatori e amministratori.</p>}

              <form onSubmit={handleStaff} className="space-y-4 mt-4">
                {staffMode !== 'update' && (
                  <label className="block">
                    <span className="flex items-center text-xs font-alt uppercase tracking-wider text-ink-soft mb-1.5">
                      <Mail className="w-4 h-4 mr-1.5 text-alga" /> Email
                    </span>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </label>
                )}
                {staffMode !== 'reset' && (
                  <label className="block">
                    <span className="flex items-center text-xs font-alt uppercase tracking-wider text-ink-soft mb-1.5">
                      <Lock className="w-4 h-4 mr-1.5 text-alga" /> {staffMode === 'update' ? 'Nuova password' : 'Password'}
                    </span>
                    <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                  </label>
                )}
                {staffMode === 'update' && (
                  <label className="block">
                    <span className="flex items-center text-xs font-alt uppercase tracking-wider text-ink-soft mb-1.5">
                      <Lock className="w-4 h-4 mr-1.5 text-alga" /> Ripeti la nuova password
                    </span>
                    <input type="password" required minLength={6} value={password2} onChange={(e) => setPassword2(e.target.value)} className={inputCls} />
                  </label>
                )}
                {error && <p className="text-sm text-terracotta-600">{error}</p>}
                {notice && <p className="text-sm text-alga-600">{notice}</p>}
                <button type="submit" disabled={loading} className={btnCls}>
                  <KeyRound className="w-4 h-4" />
                  {loading ? 'Attendi…' : staffMode === 'signin' ? 'Accedi' : staffMode === 'reset' ? 'Invia il link' : 'Salva la nuova password'}
                </button>
              </form>

              {staffMode === 'signin' && (
                <button type="button" onClick={() => { setStaffMode('reset'); setError(null); setNotice(null) }} className="mt-3 w-full text-center text-sm text-ink-muted hover:text-alga-600">
                  Password dimenticata?
                </button>
              )}
              {staffMode !== 'update' && (
                <>
                  <Link href="/aderisci" className="mt-4 block w-full text-center text-sm text-ink-muted hover:text-alga-600 transition-colors">
                    {t.vendorJoin}
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setWorld(null); setStaffMode('signin'); setOtpStep('email'); setError(null); setNotice(null) }}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-sm text-ink-muted hover:text-alga-600 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {t.choiceTitle}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
