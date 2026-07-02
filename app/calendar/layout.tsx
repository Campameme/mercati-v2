import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendario dei mercati',
  description:
    'Il calendario completo dei mercati settimanali, delle fiere e degli eventi della Riviera dei Fiori, in provincia di Imperia.',
}

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children
}
