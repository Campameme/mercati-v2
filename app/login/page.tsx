'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') ?? '/'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createClient()
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Controlla la tua email per confermare la registrazione.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
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
    } catch (err: any) {
      setError(err.message ?? 'Errore di autenticazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {mode === 'signin' ? 'Accedi' : 'Registrati'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 mr-1" /> Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>
          <label className="block">
            <span className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Lock className="w-4 h-4 mr-1" /> Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Attendi…' : mode === 'signin' ? 'Accedi' : 'Registrati'}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="w-full mt-4 text-sm text-gray-600 hover:text-primary-600"
        >
          {mode === 'signin' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
        </button>
      </div>
    </div>
  )
}
