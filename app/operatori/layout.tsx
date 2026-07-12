import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'I banchi di fiducia',
  description:
    'I banchi di fiducia dei mercati della Riviera dei Fiori: chi sono, cosa vendono, in quali mercati li trovi.',
}

export default function OperatoriLayout({ children }: { children: React.ReactNode }) {
  return children
}
