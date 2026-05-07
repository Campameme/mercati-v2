'use client'

import { Star } from 'lucide-react'
import { useFavorites, type FavoriteKind } from '@/lib/favorites'

interface Props {
  kind: FavoriteKind
  id: string
  /** Etichetta per accessibilità (es. nome del mercato) */
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

export default function FavoriteButton({ kind, id, label, size = 'md', className = '' }: Props) {
  const { isFav, toggle } = useFavorites()
  const fav = isFav(kind, id)
  const px = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(kind, id)
      }}
      aria-label={fav ? `Rimuovi ${label ?? ''} dai preferiti` : `Aggiungi ${label ?? ''} ai preferiti`}
      title={fav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
      className={`inline-flex items-center justify-center rounded-full p-1.5 transition-colors ${
        fav ? 'text-amber-500 hover:text-amber-600' : 'text-ink-muted hover:text-amber-500'
      } ${className}`}
    >
      <Star className={`${px} ${fav ? 'fill-amber-500' : ''}`} />
    </button>
  )
}
