'use client'

const DAYS: Array<{ n: number; short: string }> = [
  { n: 1, short: 'Lun' },
  { n: 2, short: 'Mar' },
  { n: 3, short: 'Mer' },
  { n: 4, short: 'Gio' },
  { n: 5, short: 'Ven' },
  { n: 6, short: 'Sab' },
  { n: 0, short: 'Dom' },
]

interface Props {
  value: number[]
  onChange: (days: number[]) => void
}

export default function DaySelector({ value, onChange }: Props) {
  function toggle(n: number) {
    if (value.includes(n)) onChange(value.filter((d) => d !== n))
    else onChange([...value, n].sort((a, b) => a - b))
  }
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((d) => {
        const active = value.includes(d.n)
        return (
          <button
            key={d.n}
            type="button"
            onClick={() => toggle(d.n)}
            className={`w-12 py-2 rounded-md text-sm font-medium border transition-colors ${
              active
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {d.short}
          </button>
        )
      })}
    </div>
  )
}

export { formatMarketDays } from '@/lib/markets/days'
