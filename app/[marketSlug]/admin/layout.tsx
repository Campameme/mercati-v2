import type { Metadata } from 'next'

// Area admin di zona: mai indicizzata (il middleware fa già il gate di accesso).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MarketAdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
