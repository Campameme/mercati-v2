import Link from 'next/link'
import Logo from '@/components/Logo'

// Footer condiviso: identico su tutte le pagine (prima esisteva solo in home).
export default function Footer() {
  return (
    <footer className="bg-carta border-t-2 border-ink/10 py-8">
      <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
        <Logo inline className="text-ink text-xs" />
        <span className="text-ink-muted/70">Guida ai mercati della Riviera di Ponente.</span>
        <span className="flex-1" />
        <Link href="/mappa" className="hover:text-ink">Mappa</Link>
        <Link href="/operatori" className="hover:text-ink">Ambulanti</Link>
        <Link href="/eventi" className="hover:text-ink">Eventi</Link>
        <Link href="/notizie" className="hover:text-ink">Notizie</Link>
        <Link href="/calendar" className="hover:text-ink">Calendario</Link>
        <Link href="/aderisci" className="hover:text-ink">Aderisci</Link>
        <Link href="/privacy" className="hover:text-ink">Privacy</Link>
        <Link href="/cookie" className="hover:text-ink">Cookie</Link>
        <Link href="/crediti" className="hover:text-ink">Crediti foto</Link>
        <a href="mailto:emanueleecampanini@gmail.com" className="hover:text-ink">Contatti</a>
      </div>
    </footer>
  )
}
