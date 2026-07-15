'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface StackPhoto {
  src: string
  alt: string
  caption?: string
}

/**
 * Pila di foto sovrapposte, trascinabili come uno slide: la carta in cima si
 * sposta col dito/mouse e, superata la soglia, vola via e si riposiziona in
 * fondo scoprendo la successiva. Sistema Nodo × Mezzogiorno.
 *
 * Leggero e senza dipendenze: pointer events + transform/opacity in CSS
 * (niente librerie di motion). Fallback: tap o frecce per avanzare, e
 * reduced-motion safe (avanza senza animazione di uscita).
 */
const THRESHOLD = 84 // px orizzontali per scattare l'avanzamento

export default function PhotoStack({
  photos,
  aspect = 'aspect-[4/5]',
  className = '',
}: {
  photos: StackPhoto[]
  aspect?: string
  className?: string
}) {
  const [order, setOrder] = useState<number[]>(() => photos.map((_, i) => i))
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const [flyOut, setFlyOut] = useState<0 | 1 | -1>(0)
  const [hinted, setHinted] = useState(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const reduce = useRef(false)

  useEffect(() => {
    reduce.current = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  }, [])

  const advance = useCallback(
    (dir: 1 | -1) => {
      if (photos.length < 2) { setDrag(null); return }
      setHinted(true)
      setFlyOut(dir)
      const commit = () => {
        setOrder((o) => [...o.slice(1), o[0]])
        setFlyOut(0)
        setDrag(null)
      }
      if (reduce.current) commit()
      else window.setTimeout(commit, 300)
    },
    [photos.length],
  )

  function onDown(e: React.PointerEvent) {
    if (flyOut) return
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    startRef.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: 0, y: 0 })
  }
  function onMove(e: React.PointerEvent) {
    if (!startRef.current || flyOut) return
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y })
  }
  function onUp() {
    const dx = drag?.x ?? 0
    const moved = startRef.current !== null
    startRef.current = null
    if (!moved) return
    if (Math.abs(dx) > THRESHOLD) advance(dx < 0 ? -1 : 1)
    else if (Math.abs(dx) < 4) advance(1) // tap = prossima
    else setDrag(null) // torna in posizione
  }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') advance(-1)
    else if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(1) }
  }

  return (
    <div className={`relative ${aspect} ${className}`} aria-roledescription="galleria trascinabile">
      {order.map((idx, depth) => {
        const p = photos[idx]
        const isFront = depth === 0
        const dragging = isFront && drag !== null && !flyOut

        let transform: string
        let transition: string
        let opacity = 1
        if (isFront && flyOut) {
          transform = `translateX(${flyOut * 135}%) rotate(${flyOut * 15}deg)`
          transition = 'transform .3s ease-in, opacity .3s ease-in'
          opacity = 0
        } else if (dragging) {
          const { x, y } = drag!
          transform = `translate(${x}px, ${y * 0.35}px) rotate(${x * 0.04}deg)`
          transition = 'none'
        } else {
          const d = Math.min(depth, 3)
          const rot = d === 0 ? 0 : (idx % 2 === 0 ? -1 : 1) * (1.6 + d)
          transform = `translateY(${d * 14}px) scale(${1 - d * 0.05}) rotate(${rot}deg)`
          transition = 'transform .5s cubic-bezier(.22,1,.36,1), opacity .35s ease'
          opacity = depth > 3 ? 0 : 1
        }

        return (
          <figure
            key={idx}
            className="absolute inset-0 m-0 overflow-hidden rounded-2xl border border-[#e0d7c1] bg-white shadow-xl will-change-transform select-none"
            style={{
              transform,
              transition,
              opacity,
              zIndex: photos.length - depth,
              cursor: isFront ? (dragging ? 'grabbing' : 'grab') : 'default',
              touchAction: 'pan-y',
              pointerEvents: isFront ? 'auto' : 'none',
            }}
            onPointerDown={isFront ? onDown : undefined}
            onPointerMove={isFront ? onMove : undefined}
            onPointerUp={isFront ? onUp : undefined}
            onPointerCancel={isFront ? onUp : undefined}
            onKeyDown={isFront ? onKey : undefined}
            tabIndex={isFront ? 0 : -1}
            role={isFront ? 'button' : undefined}
            aria-label={isFront ? `${p.alt} — trascina o tocca per la prossima` : undefined}
            aria-hidden={isFront ? undefined : true}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt={p.alt}
              draggable={false}
              loading={depth <= 1 ? 'eager' : 'lazy'}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            {p.caption && (
              <>
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/75 to-transparent" />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 px-4 pb-3.5">
                  <span className="font-alt italic text-sm text-crema/95">{p.caption}</span>
                </figcaption>
              </>
            )}
          </figure>
        )
      })}

      {/* Affordance: pallini di posizione + hint "trascina", finché non interagisci */}
      {photos.length > 1 && (
        <div className="pointer-events-none absolute -bottom-7 inset-x-0 flex items-center justify-center gap-2">
          <span className="flex gap-1.5">
            {photos.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === order[0] ? 'w-5 bg-terracotta' : 'w-1.5 bg-ink/20'}`} />
            ))}
          </span>
          {!hinted && (
            <span className="ml-2 font-alt text-[11px] font-semibold uppercase tracking-wider text-ink-muted/80">trascina ↔</span>
          )}
        </div>
      )}
    </div>
  )
}
