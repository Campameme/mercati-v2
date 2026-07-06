# CLAUDE.md — regole vive del progetto

Guida operativa per lavorare su questo repo. Se qualcosa qui diverge da `docs/`,
vale questo file. Dettaglio grafico: `docs/brand-system.md` · voce e copy:
`docs/brand-voice.md` · installazione: `SETUP.md`.

## Il progetto
"Mercati della Riviera di Ponente" (https://mercati-fiere.netlify.app): guida ai
mercati settimanali da Ventimiglia a Varazze. Next.js 14 App Router + Supabase +
Tailwind + GSAP/Lenis + Leaflet. Produzione = branch `main` (deploy Netlify automatico).

## Regole di copy (del proprietario — non negoziabili)
- MAI slogan da agenzia, mai il brief come testo di pagina ("gli ambulanti sono il
  prodotto" è bandita). Fatti veri: giorni, piazze, gesti, nomi.
- Gli operatori sono **"I Maestri del Banco"**: nome in Italiana col punto ("Franco."),
  riga di servizio `mestiere · comune, giorno`.
- Ricorrenze e date SEMPRE in forma contratta ("venerdì, sabato e domenica dal 24/7
  al 30/8"), mai elenchi di date singole.
- Niente anglicismi. 4 lingue IT/FR/DE/EN (`lib/i18n/*`); il francese viene prima
  nei contenuti di servizio per i turisti.
- Target 40–80 e turisti francesi: corpi grandi, contrasto alto, poche scelte per
  schermata. I giovani si agganciano col valore (prezzi veri, stagione), non col tono.

## Regole di brand (sintesi)
- Tre caratteri: **Italiana** (solo 400: logo, H1, nomi dei Maestri), **Figtree**
  (tutto il resto), **Caveat** `font-hand`/`font-accent` (SOLO la "mano del banco":
  prezzi, numeri, anni, didascalie — mai testi di servizio).
- Token colore canonici: carta / marel / notte / mare / sole / fiore / ink.
  Sfondi **color-block pieni** (mare, carta, sole, notte): niente texture, niente
  pastelli al 40%.
- Asset firmati: cartellino giallo `.imk-cartellino`, tabellone `.imk-leader`,
  tendone (`.imk-awning` + `CanopyEdge`). La riga di servizio gialla (`text-sole`)
  vive SOLO su fondi notte/mare; su carta si usa `mare-600` (contrasto).
- Gli eventi pubblici NON esistono più: `/eventi` e `/calendar` → 308 su `/tipici`
  (admin e tabelle DB intatti).

## Regole tecniche ricorrenti
- Motion: solo transform/opacity, reveal one-shot, tutto reduced-motion safe.
  Il marquee anima SOLO `.imk-marquee-track`, MAI il contenitore.
- Verifica: il preview MCP dà EPERM in questa cartella → `npm run dev`/`start` via
  shell + curl sui marker + screenshot con Chrome headless. MAI `dev` e `start`
  insieme sulla stessa `.next`.
- Scritture su produzione (DB Supabase, config Netlify, promozioni di ruolo):
  solo con autorizzazione esplicita del proprietario, che le query di privilegio
  preferisce eseguire da solo.
- Pipeline: lavoro su `redesign/ponente-ottimizzazione` → merge ff su `main` →
  push → verifica dei marker in produzione. Il codice obsoleto si elimina al push.
- Materiale business e credenziali stanno FUORI dal repo (cartella superiore):
  non committarli mai.
