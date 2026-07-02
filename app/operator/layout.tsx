import type { Metadata } from 'next'

// Dashboard operatore: area riservata, mai indicizzata.
export const metadata: Metadata = {
  title: 'Area operatore',
  robots: { index: false, follow: false },
}

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
