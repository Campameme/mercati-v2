# Mercati della Riviera di Ponente — Brand & Motion System

> Canonico, aggiornato al **2026-07-06** (stile "Maestri del Banco" + sfondi
> color-block). Voce e copy: [`brand-voice.md`](./brand-voice.md) · regole
> operative sempre valide: [`../CLAUDE.md`](../CLAUDE.md).

## 1. Identità
- **Nome:** Mercati della Riviera di Ponente (*"Riviera dei Fiori"* solo come
  descrittore geografico/heritage).
- **Logo:** borgo sul promontorio + onde + sole (`components/Logo.tsx`); favicon
  stessa scena su notte.
- **Direzione:** "imperfetto-pop" marittimo + il linguaggio fisico del banco:
  tendoni, cartellini scritti a mano, tabelloni.
- **Claim:** *"I mercati che profumano di mare."* Gli operatori sono
  **I Maestri del Banco** e si presentano per nome, col punto ("Franco.").

## 2. Tipografia (tre caratteri)
- **Italiana** (`--font-display`, SOLO peso 400 — mai font-bold sui titoli):
  logo, H1, nomi dei Maestri.
- **Figtree** (`--font-alt`): corpo, UI, righe di servizio, con gerarchia di pesi.
- **Caveat** (`--font-hand`, mappato anche su `font-accent`): SOLO ciò che al
  banco si scrive a mano — prezzi, numeri di banco, anni, didascalie foto,
  empty-state. Mai per testi di servizio.

## 3. Palette (token canonici in `tailwind.config.js`)
- mare `#15607C` (400/600/700) · sole `#F4B62C` (600) · fiore `#EC6A5E` (100/600)
  · carta `#F7EFDD` · marel `#DCEBEC` · notte `#0E3040` · ink (+soft/muted).
- **Sfondi color-block PIENI** (come il feed social): home = foto/notte → mare →
  carta → sole → notte. Niente texture (la `.bg-paper-grain` è stata ritirata),
  niente tinte lavate tipo `marel/40`.
- Tipologie mercato (`lib/schedules/classify.ts`): generale=mare · alimentare=verde
  orto · antiquariato=terracotta · artigianato=viola.
- **Regola contrasto:** riga di servizio gialla (`text-sole`) solo su notte/mare;
  su fondi chiari si usa `mare-600`.

## 4. Le QUATTRO firme visive
1. **Acqua** — `lib/home/aqua.ts` (bollicine interattive nell'hero) +
   `components/motion/WaterCard.tsx`.
2. **Tendone** — `.imk-awning` (bande) + `CanopyEdge` (smerlo): testata delle
   pagine e cucitura tra le sezioni color-block.
3. **La mano del banco** — `.imk-cartellino` (etichetta sole ruotata −2°, si
   raddrizza su hover del `.group`), cifre in `font-hand`, tabelloni
   `giorno … mercato` con `.imk-leader`.
4. **DriftBackdrop** — silhouette liguri in deriva (`tone="dark|light"`).
Più la fotografia curata: `lib/zonePhotos.ts` + `public/zone/` (crediti in `/crediti`),
`PhotoFx` per le foto Wikipedia dei comuni.

## 5. Motion — regole d'oro
- Anima **solo transform/opacity**; mai opacity su testo senza `clearProps`;
  MAI `background-clip:text` su testo animato.
- Reveal secchi one-shot (ScrollTrigger `once`); scrub solo per set-piece
  (es. parallasse `[data-plx]` dei beat).
- **Marquee:** anima SOLO `.imk-marquee-track`; il contenitore `.imk-marquee`
  non trasla MAI (clippa e basta).
- **Lenis** smooth-scroll globale; pannelli con scroll interno → `data-lenis-prevent`.
- Coordinate SVG calcolate (cos/sin) vanno arrotondate (hydration mismatch).
- Tutto reduced-motion safe (`prefersReduced()` + media query nelle utility).
- Classi firmate (`app/globals.css`): `imk-water`, `imk-edge/-2`, `imk-mark`,
  `imk-tilt-l/r`, `imk-tape`, `imk-drift-a/b/c`, `imk-marquee(-track)`, `imk-chev`,
  `imk-march`, `imk-lift`, `imk-cartellino(--r)`, `imk-leader`, `imk-awning(--sole)`,
  `imk-kenburns`, `imk-reveal-clip`, `imk-skel`, `imk-scroll`.

## 6. Struttura HOME (attuale)
1. **Hero** foto + acqua reattiva, H1 cinetico, ricerca, box **"Oggi al mercato"**
   in basso a destra (marquee clippato + contatore su cartellino); l'onda di fondo
   sfocia nel mare della sezione dopo.
2. **#liguria "La Liguria vera"** su MARE: 3 beat (Bandiere Blu, borghi di Savona,
   mercato quotidiano) con cifre a mano giganti e foto in parallasse.
3. **#valori "I Maestri del Banco"** su carta: collage vita di mercato,
   mini-ritratti notte degli operatori, CTA /operatori e /aderisci.
4. **#borghi** su SOLE: 15 card zona con foto curata → pagina zona.
5. **#settimana** su notte: notizie (DB + live da `lib/news/live.ts`) + tabellone
   dei prossimi Mercati tipici.
- Nav "bussola di ritorno" (compare dopo l'hero); skeleton `.imk-skel` sulle route
  principali.

## 7. Mappa & dati
- `/mappa` = explorer (`MarketExplorer` + `MarketPanel`), SOLO mercati "merci
  varie"; i tipici hanno mappa propria su `/tipici`. Parametri: `?q=`, `?zone=`,
  `?d=oggi|lun…dom`, `?vicino=1`.
- Pin unico "banco col tendone" ovunque; aree/poligoni solo sulla mappa di
  sessione della pagina comune. `.leaflet-container` isolato (`isolation:isolate`).
- Notizie vive: `lib/news/live.ts` (Google News RSS, cache 2h, mai throw) —
  bacheca su /notizie, per zona su /{slug}/news, `/api/news/live` per la home.

## 8. Igiene
- Niente laboratori nel repo; il codice obsoleto si elimina al push su main.
- Migrazioni: `npm run migrate` (idempotente). Dev: `npm run dev`.
