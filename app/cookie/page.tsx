import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SITE_NAME } from '@/lib/site'

export const metadata = {
  title: 'Cookie Policy',
  description: `Come usiamo cookie e strumenti di tracciamento sul sito ${SITE_NAME}.`,
}

// Da completare prima del lancio, dopo revisione legale.
const LAST_UPDATE = '(da completare)'

const thCls = 'px-4 py-2.5 font-alt font-semibold uppercase tracking-[0.08em] text-xs text-ink-soft text-left'

export default function CookiePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl py-10 md:py-14">
      {/* NOTA: far revisionare a un legale prima del lancio */}
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
            Usiamo cookie <strong>tecnici necessari</strong> per far funzionare il sito e, <strong>solo con il tuo
            consenso</strong>, cookie di <strong>statistica</strong> e di <strong>marketing</strong>.
          </p>
          <p>
            Gli strumenti di statistica e marketing sono orchestrati tramite <strong>Google Tag Manager</strong> e
            seguono il <strong>Consent Mode v2</strong> di Google: finché non scegli, restano in modalità
            &laquo;consenso negato&raquo; e non impostano cookie. Puoi decidere al primo accesso o cambiare idea in
            qualsiasi momento dal link{' '}
            <span className="font-semibold text-ink">&laquo;Preferenze cookie&raquo;</span> in fondo a ogni pagina.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Necessari (sempre attivi)</h2>
          <p className="mb-4">Indispensabili al funzionamento: non richiedono consenso e non si possono disattivare.</p>
          <div className="border border-[#e0d7c1] rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-crema-2">
                <tr>
                  <th className={thCls}>Nome</th>
                  <th className={thCls}>Origine</th>
                  <th className={thCls}>Durata</th>
                  <th className={thCls}>Scopo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">sb-*-auth-token</td>
                  <td className="px-4 py-3">Supabase</td>
                  <td className="px-4 py-3">Sessione</td>
                  <td className="px-4 py-3">Mantiene la sessione di chi accede (tessera, area riservata).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">imk_lang</td>
                  <td className="px-4 py-3">Sito (cookie)</td>
                  <td className="px-4 py-3">1 anno</td>
                  <td className="px-4 py-3">Ricorda la lingua scelta (IT/FR/DE/EN).</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">imercati:consent:v2</td>
                  <td className="px-4 py-3">Sito (localStorage)</td>
                  <td className="px-4 py-3">Persistente</td>
                  <td className="px-4 py-3">Memorizza le tue preferenze sui cookie.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">imercati:favorites:v1</td>
                  <td className="px-4 py-3">Sito (localStorage)</td>
                  <td className="px-4 py-3">Persistente</td>
                  <td className="px-4 py-3">Ricorda i mercati e i banchi che hai messo tra i preferiti.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm mt-3 text-ink-muted">
            I dati in <span className="font-mono text-xs">localStorage</span> restano sul tuo dispositivo e non vengono
            inviati a noi. Puoi cancellarli dalle impostazioni del browser.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Statistiche</h2>
          <p className="mb-4">Impostati <strong>solo con il tuo consenso</strong>. Ci dicono, in forma aggregata, come viene usato il sito.</p>
          <div className="border border-[#e0d7c1] rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-crema-2">
                <tr>
                  <th className={thCls}>Nome</th>
                  <th className={thCls}>Origine</th>
                  <th className={thCls}>Durata</th>
                  <th className={thCls}>Scopo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">_ga</td>
                  <td className="px-4 py-3">Google Analytics 4</td>
                  <td className="px-4 py-3">2 anni</td>
                  <td className="px-4 py-3">Distingue i visitatori in forma anonima.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">_ga_&lt;ID&gt;</td>
                  <td className="px-4 py-3">Google Analytics 4</td>
                  <td className="px-4 py-3">2 anni</td>
                  <td className="px-4 py-3">Mantiene lo stato della sessione di misurazione.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">_gid</td>
                  <td className="px-4 py-3">Google Analytics 4</td>
                  <td className="px-4 py-3">24 ore</td>
                  <td className="px-4 py-3">Distingue i visitatori nell&apos;arco della giornata.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Marketing</h2>
          <p className="mb-4">
            Impostati <strong>solo con il tuo consenso</strong>. Servono a misurare le conversioni e a mostrarti le
            nostre campagne (remarketing) su Google e Meta.
          </p>
          <div className="border border-[#e0d7c1] rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="bg-crema-2">
                <tr>
                  <th className={thCls}>Nome</th>
                  <th className={thCls}>Origine</th>
                  <th className={thCls}>Durata</th>
                  <th className={thCls}>Scopo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">_gcl_au</td>
                  <td className="px-4 py-3">Google Ads</td>
                  <td className="px-4 py-3">90 giorni</td>
                  <td className="px-4 py-3">Attribuzione delle conversioni delle campagne.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">_fbp</td>
                  <td className="px-4 py-3">Meta (Pixel)</td>
                  <td className="px-4 py-3">90 giorni</td>
                  <td className="px-4 py-3">Misurazione e remarketing su Facebook e Instagram.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">La mappa non usa Google</h2>
          <p>
            La mappa del sito è basata su <strong>Leaflet</strong> con mappe di sfondo (&laquo;tiles&raquo;) di
            <strong> CARTO</strong> su dati <strong>OpenStreetMap</strong>. Non carica Google Maps né i suoi script,
            quindi consultarla non richiede alcun consenso ai cookie.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Come cambiare o revocare le scelte</h2>
          <p className="mb-2">
            Apri il pannello <span className="font-semibold text-ink">&laquo;Preferenze cookie&raquo;</span> dal link a
            fondo pagina: puoi attivare o disattivare statistiche e marketing quando vuoi. La revoca vale per il futuro
            e non pregiudica ciò che è stato trattato prima.
          </p>
          <p>
            Puoi anche bloccare o cancellare i cookie dalle impostazioni del browser. Se blocchi i cookie tecnici di
            Supabase potresti non riuscire ad accedere all&apos;area riservata, ma la navigazione del sito resta possibile.
          </p>
        </section>

        <section>
          <h2 className="font-display font-extrabold tracking-tight text-2xl text-ink mb-3">Domande?</h2>
          <p>
            Per il quadro completo su come trattiamo i dati personali vedi la{' '}
            <Link href="/privacy" className="text-alga-600 underline underline-offset-2 hover:text-alga">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
