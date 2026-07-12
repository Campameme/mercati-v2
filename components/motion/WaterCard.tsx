import type { ReactNode } from 'react'

/**
 * Card standard del sistema Nodo × Mezzogiorno: bianca, angoli morbidi, bordo
 * carta chiaro, leggero sollevamento su hover (imk-lift, reduced-motion safe).
 * (Ex "card acqua": gli effetti liquidi sono stati dismessi col rebrand; le
 *  prop `edge`/`tilt` restano per compatibilità ma non hanno più effetto.)
 */
export default function WaterCard({
  children,
  className = '',
  edge,
  tilt,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  edge?: 1 | 2
  tilt?: 'l' | 'r'
  as?: any
}) {
  void edge
  void tilt
  return (
    <Tag className={`imk-lift rounded-xl border border-[#e0d7c1] bg-white ${className}`}>
      {children}
    </Tag>
  )
}
