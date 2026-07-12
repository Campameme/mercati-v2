'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { X, Navigation as NavIcon, Star, MapPin, Clock, Car, MessageCircle, ArrowRight } from 'lucide-react'
import type { Operator } from '@/types/operator'
import BancoAvatar from '@/components/BancoAvatar'
import ZoneImage from '@/components/ZoneImage'
import type { MarketPin, MarketSession } from './types'
import { type Lang, type HomeDict, categoryLabel } from '@/lib/i18n/home'
import { type MarketStatus, fmtHour } from '@/lib/markets/hours'
import { classifyMany, CATEGORY_COLOR, categoryLabelI18n } from '@/lib/schedules/classify'
import { comuneDescription } from '@/lib/markets/comuni'
import { nearestParkings } from '@/lib/markets/parkings'

interface Props {
  pin: MarketPin
  session: MarketSession
  status: MarketStatus
  lang: Lang
  dict: HomeDict
  onClose: () => void
}

function fmtDistance(m?: number): string {
  if (typeof m !== 'number') return ''
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
}

function waHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return `https://wa.me/${value.replace(/[^0-9]/g, '')}`
}

export default function MarketPanel({ pin, session, status, lang, dict, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [operators, setOperators] = useState<Operator[] | null>(null)

  const category = useMemo(() => classifyMany(pin.sessions.map((s) => s.settori)), [pin])
  const parking = useMemo(() => nearestParkings(pin.lat, pin.lng, pin.comune, 4), [pin.lat, pin.lng, pin.comune])

  // Entrata sicura: offset PICCOLO (mai fuori schermo). clearProps a fine.
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || !ref.current) return
    const isDesktop = window.innerWidth >= 768
    gsap.from(ref.current, {
      x: isDesktop ? 60 : 0,
      y: isDesktop ? 0 : 60,
      duration: 0.45,
      ease: 'power3.out',
      clearProps: 'transform',
    })
  }, [])

  // Fetch operatori per la sessione selezionata
  useEffect(() => {
    const ctrl = new AbortController()
    setOperators(null)
    const opUrl = `/api/operators?marketSlug=${encodeURIComponent(pin.marketSlug)}&scheduleId=${encodeURIComponent(session.scheduleId)}`
    fetch(opUrl, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => setOperators(Array.isArray(j?.data) ? j.data : []))
      .catch(() => {
        if (!ctrl.signal.aborted) setOperators([])
      })
    return () => ctrl.abort()
  }, [pin.marketSlug, session.scheduleId])

  // Stagger operatori quando arrivano
  useEffect(() => {
    if (!operators || operators.length === 0) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || !ref.current) return
    const rows = ref.current.querySelectorAll('.imk-op')
    if (rows.length) gsap.from(rows, { x: 22, opacity: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out' })
  }, [operators])

  // Stati d'orario in palette Mezzogiorno: aperto = alga piena, apre = pill
  // terracotta chiara, chiuso/sconosciuto = crema-2 neutra.
  const statusBadge = (() => {
    if (status.state === 'open') return { bg: '#46683B', fg: '#FBF6EC', text: `${dict.openUntil} ${fmtHour(status.hour ?? 0)}` }
    if (status.state === 'opens') return { bg: '#F4E0D8', fg: '#9A4029', text: `${dict.opensAt} ${fmtHour(status.hour ?? 0)}` }
    if (status.state === 'closed') return { bg: '#F3EBDA', fg: '#8A8275', text: dict.closedToday }
    return { bg: '#F3EBDA', fg: '#8A8275', text: dict.hoursUnknown }
  })()

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`
  const fullHref = `/${pin.marketSlug}/c/${pin.comuneSlug}`

  // "Cosa trovi": settori unici aggregati da tutte le sessioni del mercato.
  const settoriList = Array.from(
    new Set(
      pin.sessions
        .flatMap((s) => (s.settori ?? '').split(/[·,/]/))
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  ).slice(0, 8)

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={pin.comune}
      className="absolute z-[1100] bg-white text-ink flex flex-col shadow-2xl overflow-hidden
                 left-0 right-0 bottom-0 max-h-[80%] rounded-t-2xl border-t border-[#e0d7c1]
                 md:left-auto md:top-0 md:right-0 md:bottom-0 md:h-full md:max-h-none md:w-[378px] md:rounded-none md:border-t-0 md:border-l"
    >
      {/* Band in testa col colore della tipologia */}
      <span aria-hidden="true" className="mz-band flex-shrink-0" style={{ ['--band' as string]: CATEGORY_COLOR[category] }} />
      {/* Header */}
      <div className="relative px-5 pt-4 pb-4 border-b border-[#e0d7c1]">
        <div className="md:hidden mx-auto mb-3 h-1.5 w-12 rounded-full bg-ink/20" aria-hidden="true" />
        <button
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute right-4 top-4 grid place-items-center w-9 h-9 rounded-full bg-ink text-crema hover:bg-alga transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-alt font-bold uppercase tracking-wider text-crema"
            style={{ background: CATEGORY_COLOR[category] }}
          >
            {categoryLabelI18n(category, lang)}
          </span>
        </div>
        <p className="font-alt text-[11px] font-bold uppercase tracking-[0.14em] text-alga mt-2">{pin.marketName}</p>
        <h2 className="font-display font-extrabold tracking-tight text-3xl text-ink leading-none mt-1 pr-10">{pin.comune}</h2>
        {pin.luogo && (
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-ink-soft">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-ink-muted" aria-hidden="true" />
            <span>{pin.luogo}</span>
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-alga" aria-hidden="true" />
            {session.giorno ?? ''}
          </span>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ background: statusBadge.bg, color: statusBadge.fg }}
          >
            {statusBadge.text}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto imk-scroll px-5 py-4" data-lenis-prevent>
        {/* La foto del comune, in cornice semplice (niente nastri né ghirigori) */}
        <figure className="mb-4 bg-white rounded-xl border border-[#e0d7c1] overflow-hidden shadow-[0_12px_26px_-20px_rgba(38,36,30,0.5)]">
          <ZoneImage
            query={pin.comune}
            fallbackQuery={`${pin.comune} Liguria`}
            alt={pin.comune}
            aspect="aspect-[16/9]"
          />
          <figcaption className="px-3 py-2 font-alt italic text-xs text-ink-soft leading-tight">{pin.luogo ?? pin.comune}</figcaption>
        </figure>

        {/* Il borgo, in due righe (descrizione curata, niente slogan) */}
        {comuneDescription(pin.comune, lang) && (
          <p className="text-sm text-ink-soft leading-relaxed mb-4 line-clamp-3">{comuneDescription(pin.comune, lang)}</p>
        )}

        {/* Giorni e orari (tutte le sessioni del mercato) */}
        <h3 className="font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted mb-2">{dict.daysHours}</h3>
        <ul className="mb-5 rounded-xl border border-[#e0d7c1] bg-crema/70 divide-y divide-[#e0d7c1]/70 overflow-hidden">
          {pin.sessions.map((s) => {
            const isActive = s.scheduleId === session.scheduleId
            return (
              <li key={s.scheduleId} className={`flex items-center justify-between gap-3 px-3 py-2 ${isActive ? 'bg-alga-50/70' : ''}`}>
                <span className={`text-sm font-medium text-ink flex items-center gap-2 ${isActive ? 'font-semibold' : ''}`}>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-alga flex-shrink-0" aria-hidden="true" />}
                  {s.giorno ?? '—'}
                </span>
                <span className="text-sm text-ink-soft tabular-nums">{s.orario ?? dict.hoursUnknown}</span>
              </li>
            )
          })}
        </ul>

        {/* Cosa trovi (settori) */}
        {settoriList.length > 0 && (
          <>
            <h3 className="font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted mb-2">{dict.whatToFind}</h3>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {settoriList.map((s) => (
                <span key={s} className="text-xs font-semibold text-alga-600 bg-alga-50 rounded-full px-2.5 py-1">
                  {s}
                </span>
              ))}
            </div>
          </>
        )}

        {/* I banchi di fiducia del mercato */}
        <h3 className="font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted mb-2">
          {dict.operators}
          {operators && operators.length > 0 && <span className="text-ink-muted/70"> · {operators.length}</span>}
        </h3>
        {operators === null ? (
          <p className="text-sm text-ink-muted py-2">{dict.loading}</p>
        ) : operators.length === 0 ? (
          <p className="text-sm text-ink-muted py-2">{dict.noOperators}</p>
        ) : (
          <ul className="space-y-2 mb-5">
            {operators.map((op) => (
              <li key={op.id} className="imk-op imk-lift flex items-center gap-3 rounded-xl border border-[#e0d7c1] bg-white px-3 py-2.5 hover:border-terracotta transition-colors">
                <Link href={`/${pin.marketSlug}/operators/${op.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                  <BancoAvatar name={op.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[15px] leading-tight truncate group-hover:text-terracotta transition-colors">{op.name}</div>
                    <div className="text-xs text-ink-muted truncate">
                      {categoryLabel(op.category, lang)}
                      {op.location?.stallNumber ? ` · ${dict.stall} ${op.location.stallNumber}` : ''}
                    </div>
                  </div>
                </Link>
                {typeof op.rating === 'number' && op.rating > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-ink-soft flex-shrink-0">
                    <Star className="w-3.5 h-3.5 text-terracotta fill-terracotta" aria-hidden="true" />
                    {op.rating.toFixed(1)}
                  </span>
                )}
                {op.socialLinks?.whatsapp && (
                  <a
                    href={waHref(op.socialLinks.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${dict.whatsapp} — ${op.name}`}
                    className="grid place-items-center w-8 h-8 rounded-full bg-alga text-crema flex-shrink-0 hover:bg-alga-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Parcheggi (da OpenStreetMap, statici) */}
        <h3 className="font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted mb-2">{dict.parking}</h3>
        {parking.length === 0 ? (
          <p className="text-sm text-ink-muted py-2">{dict.noParking}</p>
        ) : (
          <ul className="space-y-2">
            {parking.map((p, i) => (
              <li key={`${p.lat}-${p.lng}-${i}`} className="imk-lift flex items-center gap-3 rounded-xl border border-[#e0d7c1] bg-white px-3 py-2.5">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-alga-50 text-alga-600 flex-shrink-0" aria-hidden="true">
                  <Car className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] leading-tight truncate">{p.name}</div>
                  <div className="text-xs text-ink-muted flex items-center gap-2">
                    <span>{fmtDistance(p.distance)} {dict.away}</span>
                    {p.fee !== null && (
                      <span className={p.fee ? 'text-ink-muted' : 'text-alga-600 font-medium'}>
                        · {p.fee ? dict.paidParking : dict.freeParking}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={dict.directions}
                  className="text-ink-muted hover:text-terracotta flex-shrink-0"
                >
                  <NavIcon className="w-4 h-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CTA: pagina del mercato (alga, istituzionale) + indicazioni (terracotta, azione) */}
      <div className="grid grid-cols-2 border-t border-[#e0d7c1]">
        <Link
          href={fullHref}
          className="group flex items-center justify-center gap-2 bg-alga text-crema font-alt font-semibold py-4 hover:bg-alga-600 transition-colors"
        >
          {dict.fullCard}
          <ArrowRight className="imk-march w-4 h-4" />
        </Link>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-terracotta text-crema font-alt font-semibold py-4 hover:bg-terracotta-600 transition-colors"
        >
          <NavIcon className="w-4 h-4" />
          {dict.directions}
        </a>
      </div>
    </div>
  )
}
