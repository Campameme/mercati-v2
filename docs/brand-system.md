# Mercati della Riviera di Ponente — Brand & Motion System

> Documento canonico, aggiornato al **2026-07-02** (riscritto: le versioni
> precedenti citavano Quattrocento/Fraunces, la home pre-acqua e il vecchio nome).
> Per **voce e contenuti** vedi [`brand-voice.md`](./brand-voice.md).
> La direzione "Slow Compass / magazine" in `rethink-ux/` NON è mai stata
> implementata: è archivio storico.

## 1. Identità
- **Nome ufficiale:** **Mercati della Riviera di Ponente** (i mercati settimanali della provincia di Imperia). *"Riviera dei Fiori"* resta come **descrittore geografico/heritage** (metadati SEO, storia, pun "La Riviera è dei Fiori, davvero").
- **Logo:** emblema vettoriale **borgo sul promontorio + due onde + sole** (`components/Logo.tsx` → `LogoMark`, `LogoMonogram`, wordmark in Italiana su due righe). Favicon = stessa scena su fondo notte (`public/favicon.svg`).
- **Direzione:** **"imperfetto-pop" marittimo** — rurale, autentico, caldo, un po' imperfetto, MA pop e coraggioso. Identità doppia: **mare** (costa) e **borghi dell'entroterra**. Non da sito-vetrina, non corporate.
- **Promessa:** *"Il mercato che profuma di mare."* · gli **ambulanti sono il prodotto** · la Liguria è la **cornice**.

## 2. Tipografia (due caratteri, non commerciale)
- **Display: Italiana** (Google Fonts, **solo peso 400** → mai `font-bold` sui titoli, farebbe un finto-grassetto; il corsivo è faux via classe `italic`). Token `font-display` / `font-serif` (`--font-display`).
- **Tutto il resto: Figtree** (variabile) — corpo, UI e accenti con gerarchia di pesi. Token `font-sans`, `font-alt`, `font-accent` (tutti `--font-alt`).
- Setup in `app/layout.tsx`; mapping in `tailwind.config.js`.

## 3. Palette (token Tailwind canonici)
- **Mare** `#15607C` (400 `#2E84A3`, 600, 700) — primario/azioni · **Sole** `#F4B62C` (600) — oggi/aperto/luce · **Fiore** `#EC6A5E` (100 `#FBE0D9`, 600) — accento/errori · **Carta/paper** `#F7EFDD` — fondo · **Notte** `#0E3040` — sezioni scure · **Marel** `#DCEBEC` — fondi tenui · **Ink** `#1A1714` /soft /muted.
- **Tipologie mercato** (`lib/schedules/classify.ts`): generale=mare · alimentare=verde orto `#4C8B3F` · antiquariato=terracotta `#C2502E` · artigianato=viola `#8E5BB5`.
- **Categorie evento** (`lib/events/labels.ts`, UNICA fonte per /calendar, /[slug]/calendar, card eventi): market=mare · fair=terracotta · food=verde orto · music=viola · art=fiore · sport=notte · other=ink-soft.
- **Alias legacy:** `paper`/`night`/`cream-*`/`primary-*` ancora validi (stessi hex); gli alias-metafora (pesto, riviera, mimosa, coral, olive, sea, terra) sono stati **rimappati sui canonici** — non usarli nel codice nuovo.

## 4. Le TRE firme visive (e basta)
La coerenza nasce dal ripetere poche firme, non dall'aggiungerne:
1. **Acqua** — `lib/home/aqua.ts` (`mountAqua`: bollicine + increspature al mouse, canvas trasparente sopra la foto) per l'hero della home; `components/motion/WaterCard.tsx` (caustica + ripple hover) per le card. Motore storico del "tuffo": `lib/home/seaCanvas.ts` (`mountSea`, usato nei lab).
2. **DriftBackdrop** — `components/motion/DriftBackdrop.tsx`: silhouette liguri in deriva (borghi, mare, sole, limone, banco, fiore, pesce in `silhouettes.tsx`). `tone="dark|light"`, `variant="hero|section"`. Layer assoluto: sezione `relative overflow-hidden`, contenuto `relative z-10`.
3. **PhotoFx** — `components/home/PhotoFx.tsx`: foto reali dei comuni via `/api/comune-image` (Wikipedia, **nomi bare**: "Sanremo", non "Sanremo Liguria"; cache client con dedup e max 4 fetch concorrenti in `lib/home/comuneImage.ts`), reveal a clip, duotone `tint`, kenBurns/hoverZoom.

## 5. Motion — regole d'oro
- Anima **solo transform/opacity**; mai opacità su testo critico senza `clearProps` (testo invisibile se il tween muore). MAI `background-clip:text` su testo animato da GSAP/anime (glifi trasparenti).
- Reveal **secchi one-shot** (ScrollTrigger `once`); scrub solo per set-piece dedicati. Hover = lift + freccia `imk-march`.
- **Lenis** smooth-scroll globale (`components/motion/SmoothScroll.tsx`, singleton in `lib/motion/lenisInstance.ts`); i pannelli con scroll interno vogliono `data-lenis-prevent`.
- Coordinate SVG calcolate (cos/sin) vanno **arrotondate** (hydration mismatch Node/browser): vedi `silhouettes.tsx`.
- **reduced-motion:** ogni effetto è disattivato via `prefersReduced()` e nelle utility CSS.
- Preview headless: `window.innerHeight` può essere 0 → guardie tipo `winH < 100` prima di pin/scrub.
- **Classi utility firmate** (`app/globals.css`): `imk-water`, `imk-edge/-2`, `imk-mark`, `imk-tilt-l/r`, `imk-tape`, `imk-drift-a/b/c`, `imk-marquee`, `imk-chev`, `imk-march`, `imk-lift`, `imk-sun`, `bg-paper-grain`, `imk-scroll`, `imk-kenburns`, `imk-reveal-clip`, `imk-vp`, `imk-skel` (skeleton loading).

## 6. Struttura HOME (attuale)
1. **Hero** full-screen `bg-notte`: foto Sanremo (PhotoFx `fill`) + velo gradiente mare + **canvas acqua** (`mountAqua`) + logo inline + lingue; H1 kinetic per-parola (ultima in `italic text-sole`); sottotitolo; CTA "Apri la mappa" + "Scopri il progetto"; **chip pratici** `Oggi al mercato · Vicino a me · Sabato` → `/mappa?d=oggi | ?vicino=1 | ?d=sab`; marquee prodotti; scroll-cue → `#storia`.
2. **"Il progetto, in tre righe"** (`copy.story`): storytelling con **CTA per attività** — Guarda la mappa (/mappa) · Prova la ricerca (#cerca) · Conosci gli ambulanti (/operatori).
3. **Borghi** — `components/home/BorghiSection.tsx` (8 tessere foto → dettaglio in situ).
4. **Il meglio del Ponente + operatori** — categorie WaterCard + **chip operatori cliccabili** → `/[slug]/operators/[id]`.
5. **Recap + ricerca** (`id="cerca"`, sezione notte): manifesto + search typewriter → `/mappa?q=`.
6. **Notizie dai comuni** (`/api/news?all=1`).
7. **Eventi** (teaser → `/eventi`).
- **Nav "bussola di ritorno"**: `components/Navigation.tsx` è nascosta sull'hero della home e **ricompare fissa dopo ~70% viewport**; sulle altre pagine è sticky normale.
- **Skeleton**: `loading.tsx` brandizzati per `/`, `/mappa`, `/[marketSlug]`, `/operatori`, `/eventi` (utility `.imk-skel`).

## 7. Mappa & dati
- `/mappa` = destinazione (explorer `components/home/MarketExplorer.tsx` + pannello `MarketPanel.tsx`). Parametri: `?q=` (ricerca, auto-select), `?zone=`, `?d=oggi|lun…dom(,)`, `?vicino=1` (geoloca e ordina).
- Leaflet: marker "banco" per tipologia + poligoni zona; `.leaflet-container` isolato (`isolation:isolate; z-index:0`).
- **Parcheggi: statici OSM** (`lib/markets/parkings.ts` → `nearestParkings`), niente Google (API quarantenata in `_unused`).
- Typewriter ricerca: `lib/useTypewriter.ts` (parte da stringa vuota, mai flash del placeholder).

## 8. Laboratori & igiene
- **Lab intenzionali:** `/versioni` (galleria isolata di tutte le home ipotizzate + mix, cancellabile eliminando `app/versioni/`) e `/prototipo` (HeroDive+Costa). Non sono produzione.
- **Quarantena:** `_unused/` (escluso da tsconfig) con README che spiega ogni file; ripristino = rispostare il file.
- **Dev:** SEMPRE `npm run dev:nomigrate` (la predev-migrate crasha su 0016); migrazioni SQL applicate a mano su Supabase.

## 9. Da fare / aperti
- OG image con l'emblema (oggi solo favicon.svg; `favicon.ico` è ancora il vecchio monogramma "M").
- Restyle semantico badge `EventCard` sui colori di `lib/events/labels.ts`.
- Foto reali di banchi/ambulanti (oggi Wikipedia via PhotoFx/Cartolina).
- Eventuali transizioni di pagina firmate.
