import Link from 'next/link'
import Logo from '@/components/Logo'
import { getLang } from '@/lib/i18n/getLang'
import { UI_I18N } from '@/lib/i18n/ui'
import { CookiePreferencesLink } from '@/components/CookieNotice'

// Footer condiviso: identico su tutte le pagine, nella lingua scelta (cookie).
export default function Footer() {
  const ui = UI_I18N[getLang()]
  return (
    <footer className="bg-crema-2 border-t border-ink/10 py-8">
      <div className="container mx-auto px-4 md:px-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
        <Logo inline className="text-ink text-xs" />
        <span className="text-ink-muted/70">{ui.footerTagline}</span>
        <span className="flex-1" />
        <Link href="/mappa" className="hover:text-alga transition-colors">{ui.navMap}</Link>
        <Link href="/operatori" className="hover:text-alga transition-colors">{ui.navOperators}</Link>
        <Link href="/notizie" className="hover:text-alga transition-colors">{ui.footerNews}</Link>
        <Link href="/aderisci" className="hover:text-alga transition-colors">{ui.footerJoin}</Link>
        <Link href="/privacy" className="hover:text-alga transition-colors">Privacy</Link>
        <Link href="/cookie" className="hover:text-alga transition-colors">Cookie</Link>
        <CookiePreferencesLink className="hover:text-alga transition-colors" />
        <Link href="/crediti" className="hover:text-alga transition-colors">{ui.footerCredits}</Link>
        <a href="mailto:emanueleecampanini@gmail.com" className="hover:text-alga transition-colors">{ui.footerContacts}</a>
      </div>
    </footer>
  )
}
