import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Il gate con redirect a /login vale solo per le PAGINE: le route /api/**
  // rispondono 401/403 dalle proprie guardie (lib/auth/guard.ts), niente redirect
  // (la regex /^\/[^\/]+\/admin/ altrimenti cattura anche /api/admin/*).
  const needsAuth =
    !pathname.startsWith('/api') && (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/redazione') || // la redazione notizie
      pathname === '/operator' ||
      pathname.startsWith('/operator/') || // dashboard operatore (NON la pubblica /operatori)
      pathname === '/tessera' || // la tessera personale del cittadino
      !!pathname.match(/^\/[^\/]+\/admin/)
    )
  if (needsAuth && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // La redazione notizie: news_editor e super_admin.
  if (pathname.startsWith('/redazione') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'news_editor' && profile?.role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Area operatore (dashboard dei banchi): riservata a chi è del mestiere —
  // operator, market_admin o super_admin. Un citizen puro (solo tessera) NON deve
  // vederla → lo si porta alla sua tessera. La promozione citizen → operator
  // avviene al login (routeByRole → /api/operators/me) PRIMA del redirect a
  // /operator, quindi qui basta il gate sul ruolo. La /tessera resta libera.
  if ((pathname === '/operator' || pathname.startsWith('/operator/')) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = profile?.role ?? 'citizen'
    if (role !== 'operator' && role !== 'market_admin' && role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/tessera'
      return NextResponse.redirect(url)
    }
  }

  return response
}
