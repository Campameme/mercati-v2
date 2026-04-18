'use client'

import { type ReactNode, type ElementType } from 'react'
import { useReveal } from '@/hooks/useReveal'

interface Props {
  children: ReactNode
  as?: ElementType
  delayMs?: number
  className?: string
}

/**
 * Avvolge un qualsiasi elemento e applica l'animazione fade-up quando entra nel viewport.
 * `delayMs` utile per stagger su liste (es. index * 60ms).
 */
export default function Reveal({ children, as: Tag = 'div', delayMs = 0, className = '' }: Props) {
  const { ref, shown } = useReveal<HTMLElement>()
  return (
    <Tag
      ref={ref as any}
      className={`reveal ${shown ? 'is-visible' : ''} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
