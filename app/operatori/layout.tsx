import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gli ambulanti',
  description:
    'Gli ambulanti dei mercati della Riviera di Ponente: categorie, specialità, in quali mercati li trovi e i loro banchi.',
}

export default function OperatoriLayout({ children }: { children: React.ReactNode }) {
  return children
}
