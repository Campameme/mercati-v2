'use client'

import { useEffect } from 'react'

interface Props {
  type: 'view_market' | 'view_operator' | 'view_comune' | 'view_homepage'
  marketId?: string
  operatorId?: string
  scheduleId?: string
  comune?: string
}

/**
 * Manda una pageview a /api/analytics/track al mount.
 * Cookieless: l'endpoint usa solo hash IP+UA giornaliero, niente storage client.
 * Best-effort: errori silenziati, non bloccano l'UI.
 */
export default function PageviewTracker(props: Props) {
  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...props, path }),
      keepalive: true,
    }).catch(() => {})
  }, []) // mount-only: una sola event per nav

  return null
}
