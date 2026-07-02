import type { ReactNode } from 'react'

/**
 * Card "acqua": bordo irregolare a mano, velo di luce che scorre (caustica) e
 * increspatura su hover. Effetti via globals (.imk-water/.imk-edge/.imk-lift),
 * reduced-motion safe. Coerente su tutte le pagine.
 */
export default function WaterCard({
  children,
  className = '',
  edge = 1,
  tilt,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  /** variante di bordo irregolare */
  edge?: 1 | 2
  /** leggera rotazione imperfetta */
  tilt?: 'l' | 'r'
  as?: any
}) {
  const tiltCls = tilt === 'l' ? 'imk-tilt-l' : tilt === 'r' ? 'imk-tilt-r' : ''
  return (
    <Tag
      className={`imk-water imk-lift ${edge === 2 ? 'imk-edge-2' : 'imk-edge'} ${tiltCls} border-2 border-ink/10 bg-white ${className}`}
    >
      {children}
    </Tag>
  )
}
