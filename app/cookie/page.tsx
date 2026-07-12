import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
  title: 'Cookie Policy',
  description: 'Come usiamo cookie e storage del browser sul sito I Mercati della Riviera dei Fiori.',
}

const LAST_UPDATE = '14 maggio 2026'

export default function CookiePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl py-10 md:py-14">
      <Link href="/" className="inline-flex items-center gap-1.5 font-alt text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted hover:text-alga mb-6 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5" /> Homepage
      </Link>

      <p className="font-alt text-xs font-bold uppercase tracking-[0.16em] text-alga mb-3">Informativa</p>

      <h1 className="font-display font-extrabold tracking-tight text-3xl md:text-5xl text-ink leading-[1.06] mb-3">
        Cookie <span className="text-alga">Policy</span>
      </h1>
      <p className="text-sm text-ink-muted mb-10">Ultimo aggiornamento: {LAST_UPDATE}</p>

      <div className="space-y-8 text-ink-soft leading-relaxed">
        <section>
          <p className="text-lg text-ink mb-4">
            <strong>Il sito I Mercati della Riviera dei Fiori non usa cookie di profilazione, tracciamento o pubblicità.</strong>
          </p>
          <p>
            Le nostre statistiche di visita sono <em>cookieless</em>: usiamo un identificatore tecnico
            calcolato come hash crittografico (IP + user agent + data + chiave segreta) che cambia ogni
            giorno e non permette di identificarti né di seguirti tra sessioni. Per questo motivo non
            mostriamo banner di consenso ai cookie analitici: non te ne servono.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Cookie tecnici (strettamente necessari)</h2>
          <p className="mb-4">Sono gli unici cookie che il sito imposta, solo quando servono davvero:</p>

          <div className="border border-[#e0d7c1] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-crema-2">
                <tr className="text-left">
                  <th className="px-4 py-2.5 font-alt font-semibold uppercase tracking-[0.08em] text-xs text-ink-soft">Nome</th>
                  <th className="px-4 py-2.5 font-alt font-semibold uppercase tracking-[0.08em] text-xs text-ink-soft">Origine</th>
                  <th className="px-4 py-2.5 font-alt font-semibold uppercase tracking-[0.08em] text-xs text-ink-soft">Durata</th>
                  <th className="px-4 py-2.5 font-alt font-semibold uppercase tracking-[0.08em] text-xs text-ink-soft">Scopo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">sb-*-auth-token</td>
                  <td className="px-4 py-3">Supabase</td>
                  <td className="px-4 py-3">Sessione</td>
                  <td className="px-4 py-3">Solo per admin loggati: mantiene la sessione.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm mt-3 text-ink-muted">
            Se non hai mai effettuato l&apos;accesso all&apos;area admin, <strong>nessun cookie viene impostato</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Storage del browser (localStorage)</h2>
          <p className="mb-3">Per ricordare le tue preferenze sul tuo dispositivo, usiamo localStorage:</p>
          <div className="border border-[#e0d7c1] rounded-xl overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-crema-2">
                <tr className="text-left">
                  <th className="px-4 py-2.5 font-alt font-semibold uppercase tracking-[0.08em] text-xs text-ink-soft">Chiave</th>
                  <th className="px-4 py-2.5 font-alt font-semibold uppercase tracking-[0.08em] text-xs text-ink-soft">Contiene</th>
                  <th className="px-4 py-2.5 font-alt font-semibold uppercase tracking-[0.08em] text-xs text-ink-soft">Scopo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">imercati:favorites:v1</td>
                  <td className="px-4 py-3">Lista locali ID di mercati e operatori</td>
                  <td className="px-4 py-3">Ricordare i preferiti che hai stellato.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm mt-3">
            Sono dati che restano sul tuo dispositivo, non vengono inviati a noi. Puoi cancellarli in qualsiasi momento
            dalle impostazioni del browser.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Come disabilitarli</h2>
          <p>
            Puoi sempre bloccare o cancellare cookie e localStorage dalle impostazioni del tuo browser.
            Se blocchi i cookie di Supabase, potresti non riuscire ad accedere all&apos;area admin —
            ma per la navigazione del sito non cambia nulla.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Domande?</h2>
          <p>
            Scrivi a <a href="mailto:emanueleecampanini@gmail.com" className="text-alga-600 underline underline-offset-2 hover:text-alga">emanueleecampanini@gmail.com</a>.
            Per il quadro completo, vedi la <Link href="/privacy" className="text-alga-600 underline underline-offset-2 hover:text-alga">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
