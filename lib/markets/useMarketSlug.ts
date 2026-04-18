'use client'

import { useParams, usePathname } from 'next/navigation'

/**
 * Returns the current market slug from the URL if we are on a `/[marketSlug]/...` route.
 * Returns undefined on the landing page, login, or super-admin routes.
 */
export function useMarketSlug(): string | undefined {
  const params = useParams()
  const pathname = usePathname()

  const fromParams = typeof params?.marketSlug === 'string' ? params.marketSlug : undefined
  if (fromParams) return fromParams

  const first = pathname?.split('/').filter(Boolean)[0]
  if (!first) return undefined
  // Known top-level non-market segments
  const reserved = new Set(['login', 'admin', 'api', 'operator', 'operatori', 'parcheggi', 'calendar', 'calendario'])
  if (reserved.has(first)) return undefined
  return first
}
