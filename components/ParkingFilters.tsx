'use client'

import { Filter } from 'lucide-react'

export interface ParkingFilter {
  type: 'all' | 'municipal' | 'private' | 'free'
  crowding: 'all' | 'empty' | 'low' | 'medium' | 'high' | 'full'
}

interface Props {
  value: ParkingFilter
  onChange: (f: ParkingFilter) => void
}

const TYPE_OPTIONS: Array<{ key: ParkingFilter['type']; label: string }> = [
  { key: 'all', label: 'Tutti' },
  { key: 'municipal', label: 'Comunale' },
  { key: 'private', label: 'Privato' },
  { key: 'free', label: 'Gratuito' },
]

const CROWDING_OPTIONS: Array<{ key: ParkingFilter['crowding']; label: string; color: string }> = [
  { key: 'all',    label: 'Tutte',               color: 'bg-gray-100 text-gray-700' },
  { key: 'empty',  label: 'Affluenza bassa',     color: 'bg-green-100 text-green-800' },
  { key: 'low',    label: 'Poca affluenza',      color: 'bg-lime-100 text-lime-800' },
  { key: 'medium', label: 'Media',               color: 'bg-amber-100 text-amber-800' },
  { key: 'high',   label: 'Molto affollato',     color: 'bg-orange-100 text-orange-800' },
  { key: 'full',   label: 'Affollatissimo',      color: 'bg-red-100 text-red-800' },
]

export default function ParkingFilters({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 space-y-3">
      <div className="flex items-center text-sm font-medium text-gray-700">
        <Filter className="w-4 h-4 mr-2" /> Filtra i parcheggi
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">Tipo</p>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => onChange({ ...value, type: o.key })}
              className={`px-3 py-1 rounded-full text-sm border ${
                value.type === o.key
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >{o.label}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">Affluenza</p>
        <div className="flex flex-wrap gap-2">
          {CROWDING_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => onChange({ ...value, crowding: o.key })}
              className={`px-3 py-1 rounded-full text-sm border ${
                value.crowding === o.key
                  ? 'ring-2 ring-primary-500 border-primary-500 ' + o.color
                  : o.color + ' border-transparent hover:brightness-95'
              }`}
            >{o.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function matchesFilter(p: { type: string; paid?: boolean; crowding?: { level: string } | null }, f: ParkingFilter): boolean {
  if (f.type === 'municipal' && p.type !== 'municipal') return false
  if (f.type === 'private' && p.type !== 'private') return false
  if (f.type === 'free' && p.paid !== false) return false
  if (f.crowding !== 'all') {
    if (!p.crowding || p.crowding.level !== f.crowding) return false
  }
  return true
}
