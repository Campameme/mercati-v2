import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Redazione notizie',
  robots: { index: false, follow: false },
}

export default function RedazioneLayout({ children }: { children: React.ReactNode }) {
  return children
}
