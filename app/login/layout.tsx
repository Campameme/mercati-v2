import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accedi',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
