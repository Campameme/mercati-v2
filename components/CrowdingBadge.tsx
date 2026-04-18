'use client'

import { Users } from 'lucide-react'

type Level = 'empty' | 'low' | 'medium' | 'high' | 'full'

const STYLES: Record<Level, { bg: string; text: string; label: string }> = {
  empty:  { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Affluenza bassa' },
  low:    { bg: 'bg-lime-100',   text: 'text-lime-800',   label: 'Poca affluenza' },
  medium: { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'Affluenza media' },
  high:   { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Molto affollato' },
  full:   { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Affollatissimo' },
}

export function crowdingColor(level: Level): string {
  return ({
    empty: '#22c55e',
    low: '#84cc16',
    medium: '#f59e0b',
    high: '#f97316',
    full: '#ef4444',
  } as Record<Level, string>)[level]
}

export default function CrowdingBadge({ level, size = 'sm' }: { level: Level; size?: 'sm' | 'md' }) {
  const s = STYLES[level]
  const dims = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${dims} ${s.bg} ${s.text} font-medium`}>
      <Users className="w-3 h-3" />
      {s.label}
    </span>
  )
}
