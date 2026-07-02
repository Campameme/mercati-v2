import { BorgoSil, WaveBand, SunSil, LemonSil, AwningSil, FlowerSil, FishSil } from './silhouettes'

/**
 * Sfondo "in ombra": silhouette liguri grandi, a bassa opacità, che derivano
 * lentamente. Coerente su tutte le pagine. CSS-only (reduced-motion safe via
 * globals .imk-drift-*). pointer-events-none, dietro al contenuto.
 *
 * tone: 'dark' (su sezioni notte) | 'light' (su carta/marel).
 * variant: 'hero' (denso) | 'section' (rado).
 */
export default function DriftBackdrop({
  tone = 'light',
  variant = 'section',
  className = '',
}: {
  tone?: 'dark' | 'light'
  variant?: 'hero' | 'section'
  className?: string
}) {
  // colore base delle ombre
  const col = tone === 'dark' ? 'text-paper' : 'text-mare'
  const op = tone === 'dark' ? 'opacity-[0.10]' : 'opacity-[0.07]'

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${col} ${op} ${className}`} aria-hidden="true">
      <BorgoSil className="imk-drift imk-drift-a absolute -left-6 bottom-0 w-[46%] max-w-[520px] h-auto" />
      <WaveBand className="imk-drift imk-drift-c absolute left-0 right-0 bottom-0 w-full h-auto" />
      <SunSil className="imk-drift imk-drift-b absolute right-[6%] top-[8%] w-28 md:w-40 h-auto" />
      {variant === 'hero' && (
        <>
          <AwningSil className="imk-drift imk-drift-c absolute right-[14%] bottom-[16%] w-20 md:w-28 h-auto" />
          <LemonSil className="imk-drift imk-drift-a absolute left-[42%] top-[18%] w-14 md:w-20 h-auto" />
          <FishSil className="imk-drift imk-drift-b absolute left-[18%] top-[30%] w-24 md:w-32 h-auto" />
          <FlowerSil className="imk-drift imk-drift-c absolute right-[34%] top-[40%] w-12 md:w-16 h-auto" />
        </>
      )}
      {variant === 'section' && (
        <>
          <LemonSil className="imk-drift imk-drift-a absolute right-[20%] bottom-[24%] w-12 md:w-16 h-auto" />
          <AwningSil className="imk-drift imk-drift-b absolute left-[12%] top-[22%] w-16 md:w-24 h-auto" />
        </>
      )}
    </div>
  )
}
