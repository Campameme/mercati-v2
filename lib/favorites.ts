'use client'

import { useEffect, useState, useCallback } from 'react'

// Sistema preferiti basato su localStorage. Niente backend (privacy/anon-friendly).
// Eventuale migrazione a profile-bound in futuro: vedere `profile_favorites` table.

export type FavoriteKind = 'market' | 'comune' | 'place' | 'operator'

const STORAGE_KEY = 'imercati:favorites:v1'

interface FavoritesState {
  market: string[] // market_slug
  comune: string[] // "marketSlug/comuneSlug"
  place: string[] // place_id (uuid)
  operator: string[] // operator_id (uuid)
}

const empty = (): FavoritesState => ({ market: [], comune: [], place: [], operator: [] })

function read(): FavoritesState {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as Partial<FavoritesState>
    return {
      market: Array.isArray(parsed.market) ? parsed.market : [],
      comune: Array.isArray(parsed.comune) ? parsed.comune : [],
      place: Array.isArray(parsed.place) ? parsed.place : [],
      operator: Array.isArray(parsed.operator) ? parsed.operator : [],
    }
  } catch {
    return empty()
  }
}

function write(s: FavoritesState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    // notifica altre istanze (cross-tab) e altri hook nello stesso tab
    window.dispatchEvent(new CustomEvent('imercati:favorites-changed'))
  } catch {
    /* quota, privacy mode, ecc. — fail-soft */
  }
}

export function useFavorites() {
  const [state, setState] = useState<FavoritesState>(empty)

  useEffect(() => {
    setState(read())
    const onChange = () => setState(read())
    window.addEventListener('imercati:favorites-changed', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('imercati:favorites-changed', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  const isFav = useCallback(
    (kind: FavoriteKind, id: string) => state[kind].includes(id),
    [state],
  )

  const toggle = useCallback((kind: FavoriteKind, id: string) => {
    const cur = read()
    const has = cur[kind].includes(id)
    const next: FavoritesState = {
      ...cur,
      [kind]: has ? cur[kind].filter((x) => x !== id) : [...cur[kind], id],
    }
    write(next)
    setState(next)
  }, [])

  const clear = useCallback((kind?: FavoriteKind) => {
    if (!kind) {
      write(empty())
      setState(empty())
      return
    }
    const cur = read()
    const next: FavoritesState = { ...cur, [kind]: [] }
    write(next)
    setState(next)
  }, [])

  return { state, isFav, toggle, clear }
}
