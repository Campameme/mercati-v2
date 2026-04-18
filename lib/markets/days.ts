export function formatMarketDays(days: number[]): string {
  if (!days || days.length === 0) return ''
  if (days.length === 7) return 'Tutti i giorni'
  const labels: Record<number, string> = {
    0: 'domenica', 1: 'lunedì', 2: 'martedì', 3: 'mercoledì', 4: 'giovedì', 5: 'venerdì', 6: 'sabato',
  }
  const sortedMonFirst = [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  if (sortedMonFirst.length === 1) return labels[sortedMonFirst[0]]
  const last = sortedMonFirst.pop() as number
  return `${sortedMonFirst.map((d) => labels[d]).join(', ')} e ${labels[last]}`
}
