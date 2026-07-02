import type { Metadata } from 'next'

// Area riservata: mai indicizzata (il middleware fa già il gate di accesso).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
