'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { getComuneImage } from '@/lib/home/comuneImage'

// Foto "cinematografica" del Ponente: recupera la foto reale via
// /api/comune-image (Wikipedia, già filtrata), con reveal a tendina all'entrata,
// Ken Burns lento (o zoom su hover), e un viraggio DUOTONE notte/mare → colore
// che "omologa" foto eterogenee in un'unica pellicola coerente. Solo
// transform/opacity/filter (GPU). Reduced-motion safe (via CSS).
type Tint = 'rest' | 'hover' | 'none'

export default function PhotoFx({
  query,
  fallbackQuery,
  alt,
  className = '',
  aspect = 'aspect-[4/3]',
  kenBurns = false,
  hoverZoom = false,
  priority = false,
  fill = false,
  tint = 'none',
  overlay,
}: {
  query: string
  fallbackQuery?: string
  alt?: string
  className?: string
  aspect?: string
  kenBurns?: boolean
  hoverZoom?: boolean
  priority?: boolean
  fill?: boolean
  /** 'rest' = sempre in duotone mare · 'hover' = duotone→colore su hover · 'none' = colore pieno */
  tint?: Tint
  overlay?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [src, setSrc] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [inView, setInView] = useState(false)

  // fetch al mount (deduplicato in lib/home/comuneImage → niente "herd")
  useEffect(() => {
    let cancelled = false
    setFailed(false)
    getComuneImage(query, fallbackQuery).then((u) => {
      if (cancelled) return
      if (u) setSrc(u); else setFailed(true)
    })
    return () => { cancelled = true }
  }, [query, fallbackQuery])

  // reveal/Ken Burns quando entra in vista; fallback a timeout se l'IO non scatta
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let done = false
    const trigger = () => { if (!done) { done = true; setInView(true) } }
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) trigger() }, { rootMargin: '200px', threshold: 0 })
    io.observe(el)
    const t = window.setTimeout(trigger, 1500)
    return () => { io.disconnect(); window.clearTimeout(t) }
  }, [])

  const filter =
    tint === 'rest' ? 'grayscale-[.4] saturate-[.75]'
    : tint === 'hover' ? 'grayscale-[.5] saturate-[.7] group-hover:grayscale-0 group-hover:saturate-100'
    : ''

  return (
    <div ref={ref} className={`imk-reveal-clip overflow-hidden bg-notte ${fill ? 'absolute inset-0' : `relative ${aspect}`} ${inView ? 'is-in' : ''} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-mare/40 via-notte/50 to-mare-700/50" aria-hidden="true" />
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? query}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform,filter] duration-700 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${kenBurns && inView ? 'imk-kenburns' : ''} ${hoverZoom ? 'group-hover:scale-110' : ''} ${filter}`}
        />
      )}
      {/* velo mare: omologa la pellicola; svanisce su hover se tint='hover' */}
      {tint !== 'none' && (
        <div className={`absolute inset-0 bg-mare/25 mix-blend-multiply pointer-events-none transition-opacity duration-700 ${tint === 'hover' ? 'group-hover:opacity-0' : ''}`} aria-hidden="true" />
      )}
      {/* vignetta "pellicola" */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(14,42,51,0.35)' }} aria-hidden="true" />
      {overlay}
    </div>
  )
}
