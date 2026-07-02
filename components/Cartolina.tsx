import ZoneImage from '@/components/ZoneImage'

/**
 * "Cartolina": immagine (costa/borgo/mercato della Riviera) in cornice di carta,
 * con leggera rotazione imperfetta, nastro washi e didascalia. Usa ZoneImage
 * (foto via Wikipedia). Coerente col linguaggio imperfetto-pop.
 */
export default function Cartolina({
  query,
  fallbackQuery,
  caption,
  alt,
  aspect = 'aspect-[4/3]',
  tilt,
  tape = false,
  priority = false,
  kenBurns = false,
  className = '',
}: {
  query: string
  fallbackQuery?: string
  caption?: string
  alt?: string
  aspect?: string
  tilt?: 'l' | 'r'
  tape?: boolean
  priority?: boolean
  kenBurns?: boolean
  className?: string
}) {
  const tiltCls = tilt === 'l' ? 'imk-tilt-l' : tilt === 'r' ? 'imk-tilt-r' : ''
  return (
    <figure className={`imk-lift group relative bg-white border-2 border-ink/10 imk-edge p-2 pb-3 shadow-sm ${tape ? 'imk-tape' : ''} ${tiltCls} ${className}`}>
      <div className="imk-edge-2 overflow-hidden border border-ink/10">
        <ZoneImage query={query} fallbackQuery={fallbackQuery} alt={alt ?? query} aspect={aspect} hoverZoom={!kenBurns} kenBurns={kenBurns} priority={priority} />
      </div>
      {caption && (
        <figcaption className="mt-1.5 px-1 font-accent text-base text-ink-soft leading-tight">{caption}</figcaption>
      )}
    </figure>
  )
}
