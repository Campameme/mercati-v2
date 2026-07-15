# CLAUDE.md — regole vive del progetto

Guida operativa per lavorare su questo repo. Se qualcosa qui diverge da `docs/`,
vale questo file. Dettaglio grafico: `docs/brand-system.md` · voce e copy:
`docs/brand-voice.md` · installazione: `SETUP.md`.

## Il progetto
**"I Mercati della Riviera dei Fiori"** (https://mercatidiponente.it): guida ai
mercati settimanali della provincia di Imperia, da Ventimiglia a Diano/Cervo.
Next.js 14 App Router + Supabase + Tailwind + GSAP/Lenis + Leaflet. Produzione =
branch `main` → **deploy automatico su Vercel** (mercatidiponente.it); Netlify
(mercati-fiere.netlify.app) collegato ma legacy. Rebrand "Nodo × Mezzogiorno" in
corso su `redesign/esperienza-riviera-fiori` (nome precedente "Mercati della
Riviera di Ponente" ancora presente dove non migrato; la provincia di Savona è
stata rimossa del tutto, dati e codice, con la migrazione 0024_remove_savona).

## Regole di copy (del proprietario — non negoziabili)
- MAI slogan da agenzia, mai il brief come testo di pagina ("gli ambulanti sono il
  prodotto" è bandita). Fatti veri: giorni, piazze, gesti, nomi.
- Gli operatori sono **i banchi di fiducia della rete**: "Il banco di Antonio.",
  mestiere, citazioni in prima persona (#DietroIlBanco), riga di servizio
  `giorni · comune`. ("I Maestri del Banco" = naming precedente, in dismissione.)
- Ricorrenze e date SEMPRE in forma contratta ("venerdì, sabato e domenica dal 24/7
  al 30/8"), mai elenchi di date singole.
- Niente anglicismi. 4 lingue IT/FR/DE/EN (`lib/i18n/*`); il francese viene prima
  nei contenuti di servizio per i turisti.
- Target 40–80 e turisti francesi: corpi grandi, contrasto alto, poche scelte per
  schermata. I giovani si agganciano col valore (prezzi veri, stagione), non col tono.

## Regole di brand (sintesi — sistema "Nodo × Mezzogiorno", 2026-07-12)
- Simbolo: **il Nodo** (tratto calligrafico annodato, capo terracotta; solo
  tratto nelle riduzioni piccole). Concetto: **la rete dei banchi** (3 requisiti:
  banco pulito e curato · prodotti di qualità · serietà) + bollino "RETE DEI BANCHI".
- Due caratteri: **Bricolage Grotesque** (display 800, tracking −0.02em;
  citazioni 500 italic) + **Figtree** (tutto il resto; italic per sottotitoli).
  Italiana e Caveat dismessi: solo nelle pagine non ancora migrate.
- Palette **Mezzogiorno** (ruoli fissi): crema `#FBF6EC` fondo · ink `#26241E` ·
  **alga** `#46683B` istituzionale (nav, bollino, badge, giorno attivo) ·
  **terracotta** `#C4593C` azione (CTA, capo del nodo, preferiti) · **limone**
  `#EAC54F` terza voce calda. Unica texture ammessa: tratteggio incrociato
  diagonale tenue (5–6%) su hero/social.
- Motion: **sfondi puliti e fermi, anima solo il contenuto** (nodo che si
  annoda, titoli cinetici, chips a stagger, contatori che contano su). Niente
  titoli-fantasma in home, silhouette in deriva o marquee di nomi.
- Dettaglio completo e mappa di transizione dai vecchi token:
  `docs/brand-system.md` (§7). Gli eventi pubblici NON esistono più: `/eventi`
  e `/calendar` → 308 su `/tipici` (admin e tabelle DB intatti).

## Regole tecniche ricorrenti
- Motion: solo transform/opacity, reveal one-shot, tutto reduced-motion safe.
  Il marquee anima SOLO `.imk-marquee-track`, MAI il contenitore.
- Verifica: il preview MCP dà EPERM in questa cartella → `npm run dev`/`start` via
  shell + curl sui marker + screenshot con Chrome headless. MAI `dev` e `start`
  insieme sulla stessa `.next`.
- Scritture su produzione (DB Supabase, config Netlify, promozioni di ruolo):
  solo con autorizzazione esplicita del proprietario, che le query di privilegio
  preferisce eseguire da solo.
- Pipeline: lavoro su `redesign/esperienza-riviera-fiori` → merge ff su `main` →
  push → verifica dei marker in produzione. Il codice obsoleto si elimina al push.
- Materiale business e credenziali stanno FUORI dal repo (cartella superiore):
  non committarli mai.
