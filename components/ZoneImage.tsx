'use client'

import { useEffect, useState } from 'react'

interface Props {
  query: string
  fallbackQuery?: string
  alt?: string
  className?: string
  /** Classi aspect-ratio Tailwind, default aspect-[4/3] */
  aspect?: string
  /** Se true: applica un leggero zoom hover (parent deve avere group) */
  hoverZoom?: boolean
  priority?: boolean
}

export default function ZoneImage({
  query,
  fallbackQuery,
  alt,
  className = '',
  aspect = 'aspect-[4/3]',
  hoverZoom = false,
  priority = false,
}: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    setFailed(false)
    ;(async () => {
      async function tryQuery(q: string): Promise<string | null> {
        try {
          const r = await fetch(`/api/comune-image?q=${encodeURIComponent(q)}`)
          const d = await r.json()
          return d.originalUrl ?? d.imageUrl ?? null
        } catch {
          return null
        }
      }
      let url = await tryQuery(query)
      if (!url && fallbackQuery) url = await tryQuery(fallbackQuery)
      if (cancelled) return
      if (url) setSrc(url)
      else setFailed(true)
    })()
    return () => { cancelled = true }
  }, [query, fallbackQuery])

  return (
    <div className={`relative overflow-hidden bg-cream-200 ${aspect} ${className}`}>
      {/* Placeholder sempre presente sotto */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-olive-100 via-cream-200 to-terra-100">
        <svg viewBox="0 0 120 40" className="w-24 h-8 text-olive-500 opacity-35" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M0 20 C 40 20, 80 20, 120 20" />
          <ellipse cx="25" cy="12" rx="6" ry="3" transform="rotate(-18 25 12)" fill="currentColor" opacity="0.8" />
          <ellipse cx="45" cy="28" rx="6" ry="3" transform="rotate(18 45 28)" fill="currentColor" opacity="0.8" />
          <ellipse cx="65" cy="12" rx="6" ry="3" transform="rotate(-18 65 12)" fill="currentColor" opacity="0.8" />
          <ellipse cx="85" cy="28" rx="6" ry="3" transform="rotate(18 85 28)" fill="currentColor" opacity="0.8" />
        </svg>
      </div>

      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? query}
          loading={priority ? 'eager' : 'lazy'}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
          } ${hoverZoom ? 'group-hover:scale-[1.04]' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
