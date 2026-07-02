> ⚠️ **ARCHIVIO STORICO — direzione MAI implementata.** Questo documento descrive
> la proposta "Slow Compass / magazine editoriale" (Fraunces+Inter, cream/olive,
> route /agenda /banchi /colophon) generata dal workflow del 2026-05-14 e poi
> **scartata**. Il sito reale è un'altra cosa: vedi `../brand-system.md` e
> `../brand-voice.md`. Non usare questi file come riferimento di implementazione.

# 03 · Sintesi — Vicino, ma da scoprire

> **AGGIORNATO 14 maggio 2026.** Il framing originale del workflow ("Slow Compass — slow editorial magazine") è stato rigettato dall'utente: *"il progetto non è un editoriale, piuttosto è l'esperienza premium al mercato, non valorizzata come esclusiva, ma di qualità e autentica."*
>
> La nuova direzione è **"Vicino, ma da scoprire"**: la cura premium dell'esperienza-mercato in Riviera ligure di Ponente, trattata come merita ma mai venduta come esclusiva — leva di **turismo di prossimità** per ogni comune.
>
> Il **brand system canonico** vive in [`docs/brand-system.md`](../brand-system.md). Quello che segue è la sintesi UX **strutturale** (route map, componenti, fasi): resta valida. Le sezioni di copy/voce sono state riallineate. Le sezioni "magazine" che dicevano "editorial article", "byline", "feature" vanno lette nel nuovo registro: **scheda autentica**, **firma di chi ci vive**, **guida concreta**.

---

## USP scelto

> **Vicino. Ma da scoprire.**
> *I mercati settimanali della Riviera ligure di Ponente — quelli buoni, raccontati da chi ci va davvero.*

Tre formulazioni alternative discusse in [`docs/brand-system.md`](../brand-system.md).

---

## Rationale (rilegge col nuovo registro)

Slow Compass beats a pure-editorial direction because it refuses to treat utility as a second-class citizen: the sticky UtilityRail, captioned MarketMap, typeset Quando table and StickyFinder ensure a tourist gets 'is it open Saturday?' in under two seconds, while the prose-first treatment preserves the slow-magazine soul that differentiates this from every other civic directory. It beats a pure-utility direction because cream + olive + Fraunces + signed bylines + place-rooted Italian voice solve the brand-strength constraint that generic Tailwind dashboards never could — IMercati becomes a returnable ritual ('La scelta della settimana'), not a one-off lookup. The synthesis collapses 17 public routes to 8 by folding parcheggi, weather, news, search, operators-list, per-zone-calendar, privacy and cookie into the zone article or unified /agenda — yet preserves every admin feature verbatim under /redazione with a single long per-zone admin page (anchored TOC, lazy-loaded sections) so MarketAreaDrawer, ExcelOperatorsTools, M:N presences, global avviso flag, schedule binding, AdesioneStatoToggle and accendi/spegni cascade all survive intact. Every persona reaches their primary goal in <=3 clicks: citizen finds their market (cover → zone), tourist finds Saturday's markets (cover → agenda), operator edits profile (login → /operator → /operator/[id]), super-admin toggles a zone off (login → /redazione → toggle on the zone card).

---

## Principi

1. One image per fold, one column of prose, one decision per scroll. No carousels, no thumbnail grids above the fold, no above-the-fold filter walls.
2. Prose before chrome. Every zone, operator, agenda and form leads with 60-180 words of signed editorial copy before any control appears.
3. Fraunces for reading, Inter for doing. The typographic split itself signals mode — narrative vs utility — so the eye knows what kind of moment it's in.
4. Utility is a margin, not a hero. Open-state, weather, jump-anchors, favorites and share live in a thin sticky rail (right on desktop, bottom on mobile) that follows the scroll. The article remains the main column.
5. One canonical answer, one canonical URL. No duplicate calendars, no duplicate operator lists, no parcheggi/weather/news standalone routes — everything folds into the zone article it belongs to.
6. Place identity over generic chrome. Every zone earns its own accent color, ornament glyph and byline. Cream + olive is the constant; the zone accent is the marginal ink.
7. Admin is editorial too. The redazione dashboard speaks the same magazine language as the public site — pull-quote KPIs, lettere in arrivo, accendi/spegni un numero — so power users stay in one mental model and zero features are lost.

---

## Nuova mappa route

### Pubbliche

_8 route_

### `/`

La copertina. Magazine cover with manifesto, sommario of 5 zones, and questa settimana spread.

**Layout**: Full-bleed hero (100vh) → manifesto column (65ch) → numbered sommario (5 zones, asymmetric alternation) → questa settimana spread → colophon footer. StickyFinder appears after fold 1.

**primaryGoal**: Citizen/tourist finds their zone in 1 click; finds open market this week in 1 click.

### `/[zoneSlug]`

The feature article on one market. Replaces zone home + operators list + news + weather + parking + search.

**Layout**: Hero → lede → Quando (typeset table) → Dove (MarketMap) → I banchi (inline EditorialOperatorEntry list with filter) → Da sapere (meteo + avvisi + parcheggi) → end-mark + prev/next. Sticky UtilityRail throughout.

**primaryGoal**: Citizen/tourist answers 'when, where, who' in 1 scroll. Sticky rail gives 'open?' instantly.

### `/[zoneSlug]/banchi/[operatorSlug]`

Operator profile as magazine personality piece. Slug-based, SEO-friendly, shareable.

**Layout**: Portrait hero → profilo prose → Cosa trovi (menu table) → Quando lo trovi (M:N as prose) → Pratica (lingue + pagamenti + contatti). Sticky UtilityRail.

**primaryGoal**: Citizen finds 'what does Antonio sell, when, how to pay' in 1 click from zone page.

### `/agenda`

Province-wide unified calendar. Merges /calendar + per-zone calendars.

**Layout**: H1 + dek + editor's pick → sticky zone-TOC filter rail → WeekSpread (7 vertical columns) → toggle to month view. Deep-linkable via query params.

**primaryGoal**: Tourist finds 'which markets are open Saturday' in 1 click.

### `/banchi`

Province-wide operator directory. Replaces /operatori. Editorial 'rubrica I volti dei mercati'.

**Layout**: Featured operator (half-page) → alphabetical typeset index by zone. Sticky filter rail (category, zone).

**primaryGoal**: Citizen finds operator by name across zones in 1 click.

### `/aderisci`

Operator onboarding. Editorial 'lettera dal direttore' framing.

**Layout**: Editor's letter (180 words, signed) → single-column form, one question per fold, Fraunces labels.

**primaryGoal**: Operator submits adesione in <=3 fold-scrolls.

### `/colophon`

Merges /privacy + /cookie + /about + credits.

**Layout**: Two-column typeset spread. Build-date driven.

**primaryGoal**: Compliance + transparency.

### `/login`

Authentication. Restyled to cream/olive.

**Layout**: Centered card on cream, Fraunces H1 'Entra in redazione', single-column form, olive submit, 'sei un operatore? aderisci' secondary link.

**primaryGoal**: Operator/admin logs in in 1 click.


### Admin

_10 route_

- `/redazione` — Super-admin dashboard. KPI as editorial pull-quotes, zones overview, recent adesioni inbox preview, top contributors, sessions in pausa.
- `/redazione/zone` — Gestione zone — all markets CRUD list.
- `/redazione/zone/[id]` — Per-zone admin home: market edit + admin assignment + Excel tools + MarketAreaDrawer + sessions overview + avvisi + eventi access.
- `/redazione/zone/[id]/sessioni/[sessionId]` — Per-session admin — banchi della sessione.
- `/redazione/zone/[id]/banchi` — Per-zone operators list with filters, Excel tools, create new with schedule binding.
- `/redazione/zone/[id]/banchi/[opId]` — Per-zone operator edit — profile, M:N presences, account invite.
- `/redazione/zone/[id]/avvisi` — Per-zone avvisi CRUD. Global flag visible only to super-admin.
- `/redazione/zone/[id]/eventi` — Per-zone events CRUD with category, date range, photo.
- `/redazione/sessioni` — Super-admin all-sessions view including inactive — global Accendi/Spegni cascade table.
- `/redazione/adesioni` — Adesioni operatori inbox. Each as editorial 'lettera in arrivo' card with AdesioneStatoToggle + PATCH/DELETE.

---

## Inventario componenti

### Da mantenere (6)

- **`MarketAreaDrawer`** — Admin polygon editor — feature-locked, no change. Restyle outline to olive.
- **`ExcelOperatorsTools`** — Export/template/import with dry-run preview — preserve verbatim, restyle buttons to olive Inter.
- **`AdesioneStatoToggle`** — Admin-only status PATCH — preserve, restyle pill states (in-attesa = stone, accettata = olive, rifiutata = rose).
- **`NotificationProvider`** — Toast system stays — restyle to cream surface with olive border, Fraunces small-caps.
- **`middleware.ts (auth)`** — Route protection logic unchanged.
- **`FullCalendar (under Agenda)`** — Keep as underlying engine for month-view fallback only; default view is custom <WeekSpread />. Hide default chrome with CSS overrides.

### Da unire (6)

- **`?`** — Kills duplicate EVT_LABEL/EVT_COLOR/CalItem constants. Single source of truth in lib/calendar.ts.
- **`?`** — Operators are people, not cards. CAT_LABEL moves to lib/categories.ts.
- **`?`** — Magazine colophon pattern — one editorial spread, build-date driven (no hardcoded LAST_UPDATE).
- **`?`** — Single component, accepts captions, numbered serif pins, cream-styled MapLibre.
- **`?`** — One source for zone slug, name, hero photo, palette, ornament glyph.
- **`?`** — Search and favorites live in the sticky utility rail — one component, two functions.

### Da cancellare (9)

- `/parcheggi province-wide page — parking is inline on each zone page as a 'Da sapere' column; redirect via next.config.ts`
- `/[marketSlug]/parking page — inline on zone page; redirect`
- `/[marketSlug]/search page — mock-data demoware, replaced by StickyFinder global search`
- `/[marketSlug]/news standalone page — avvisi inline as 'Da sapere' figure; high-priority surface as sticky AvvisoBanner`
- `/[marketSlug]/weather standalone page — meteo lives in sticky right-rail + 'Da sapere' figure`
- `/[marketSlug]/operators standalone list page — merged inline as 'I banchi' section`
- `Native confirm() dialogs — replace with <ConfirmDialog /> in cream/olive system`
- `Tailwind primary-600 / blue-50 / gray-900 palette tokens — purge entirely, cream/olive/ink only`
- `Generic AppHero / generic CardGrid components — replaced by EditorialHero + Sommario`

### Da creare (20)

- **`<EditorialHero />`** — Full-bleed photo + eyebrow small-caps + Fraunces H1 + italic dek + ornament. Used on /, /[zone], /banchi/[id], /agenda.
- **`<DropCap />`** — 5-line drop cap for lede paragraphs. Zone-accent color via context.
- **`<Dateline />`** — Small-caps marginalia line: 'Sanremo · sabato mattina · dal 1898'.
- **`<TypesetTable />`** — Schedules and product menus as magazine tables. Tabular-figure prices, Fraunces names.
- **`<UtilityRail />`** — Sticky right-rail (desktop) / bottom-bar (mobile) showing open-state, jump-anchors, favorites, share.
- **`<StickyFinder />`** — Top sticky rail with wordmark + search + meteo + favorites. Hidden during hero fold.
- **`<EditorialOperatorEntry />`** — Portrait + Fraunces name + italic role + 80-word bio. Replaces OperatorCard everywhere.
- **`<ZoneIdentity />`** — Context provider for per-zone accent color, ornament glyph, byline. Deterministic from slug.
- **`<Sommario />`** — Magazine TOC with numbered entries, asymmetric alternation, photo + dek.
- **`<Colophon />`** — Site-wide footer + /colophon page content. Two-column typeset spread.
- **`<WeekSpread />`** — Custom 7-column week view replacing FullCalendar's default week. Editorial typography.
- **`<MarketMap />`** — Cream-styled MapLibre with numbered serif pins, captioned figure wrapping.
- **`<PullQuote />`** — Large italic serif quote with author attribution. Used on agenda editor's pick and homepage manifesto.
- **`<EndMark />`** — Zone-specific ornament closing articles. aria-hidden.
- **`<AvvisoBanner />`** — Sticky top banner for high-priority avvisi only, dismissible, dated and signed.
- **`lib/editorial/copy.ts`** — Single source for editorial prose (zone ledes, operator template ledes, agenda intros) — copy editable without React changes.
- **`lib/zones.ts`** — Registry: { slug, name, heroPhoto, paletteAccent, ornament, dayOfWeek, since, byline }.
- **`<KpiPullQuote />`** — Admin dashboard stat as editorial pull-quote (replaces card-stat). 'Duecentoquarantasette banchi · undici comuni.'
- **`<AdminTOC />`** — Sticky left sidebar TOC for /redazione/* pages — small-caps Fraunces nav.
- **`<ConfirmDialog />`** — Replaces native confirm(). Cream surface, olive primary, rose secondary destructive.

---

## Sistema brand

### Palette

```json
{
  "core": {
    "cream": "#F4EEE2 — primary surface, the page of the magazine",
    "ink": "#1F1B16 — body text, near-black with warm undertone",
    "olive": "#5C6B47 — primary accent, fountain-pen ink for CTAs, links, marginalia",
    "ochre": "#B8853A — secondary accent, used for utility highlights (open now, sticky rails)",
    "stone": "#8C8479 — muted text, captions, metadata"
  },
  "zoneAccents": {
    "ventimiglia": "#C08A2E — ochre, citrus and frontiera",
    "sanremo": "#A85C5C — dusty rose, flowers",
    "oneglia": "#6F8A8C — sea-glass, sailors and brine",
    "portoMaurizio": "#3F5B7A — cobalt, deep harbor",
    "diano": "#A0644A — terracotta, hill villages"
  },
  "semantic": {
    "openNow": "#5C6B47 olive (calm positive)",
    "closed": "#8C8479 stone (muted, not red)",
    "warning": "#B8853A ochre",
    "error": "#A85C5C rose (zone-accent reused — no harsh red)"
  },
  "rules": [
    "Cream is the only background. No white panels, no gray cards.",
    "Olive replaces every Tailwind primary/blue. Ochre replaces every yellow/amber. Rose replaces every red.",
    "Zone accents appear ONLY as ornaments, drop caps, and end-marks — never as full backgrounds or buttons.",
    "Maximum 2 colors per fold. No gradients."
  ]
}
```

### Typography

```json
{
  "narrative": "Fraunces (variable) — H1 72-88px italic on hero, H2 40px upright with optical sizing, body lede 22px/1.6 with drop cap",
  "utility": "Inter — buttons, form inputs, data tables, sticky-rail labels at 14-16px",
  "metadata": "Fraunces small-caps tracking-widest (0.18em) for datelines, eyebrows, captions, byline credits",
  "rules": [
    "Fraunces for everything the reader READS. Inter for everything the reader DOES. The split itself communicates mode.",
    "Ban ALL CAPS. Only Fraunces small-caps is allowed for uppercase treatment.",
    "Drop caps on every lede paragraph (zone page, operator profile, agenda intro). 5-line tall, in zone accent color.",
    "Numbers in editorial context use old-style figures (Fraunces feature); numbers in tables use tabular figures (Inter feature).",
    "Line-length capped at 65ch for prose, 78ch for utility tables. No edge-to-edge text."
  ]
}
```

### Voce

**tone**: Place-rooted, slow, knowledgeable. Like a local journalist who has covered the markets for a decade — never touristic, never breathless.

**person**: Third person for profiles ('Antonio arriva al banco alle 5 del mattino'). First person plural ('noi') only in editor's letter. Second person ('tu') for utility CTAs only.

**tense**: Present indicative for descriptions; passato prossimo for history; future for schedules ('apre sabato', not 'aprirà').

**rules**:
- No marketing adjectives: ban 'unico', 'esclusivo', 'imperdibile', 'eccezionale'.
- No exclamation marks anywhere on the public site.
- Italian first. English subtitle only on hero. No EN/IT toggle in v1.
- Use real place-names and weekdays: 'il sabato di piazza Eroi Sanremesi' not 'il mercato del weekend'.
- Every editorial block signed: 'a cura di [Nome]' or 'testo di [Nome]'.

### Map style

Custom MapLibre style on cream base. Land = cream #F4EEE2, water = pale olive #D8DCC8, roads = thin ink #1F1B16 hairlines (0.5px), buildings = stone #E8E2D4. Zone polygons in zone-accent color at 12% opacity with 1px solid border in same color at 80%. Pins are hand-drawn-style ornaments — not Material Design droplets — drawn as small numbered serif circles ('14') matching the banco number in the typeset list. Labels in Fraunces small-caps. No Mapbox/Google logos visible. Zoom controls hidden, appear on hover only, styled as olive serif '+' and '−'. Map captions ALWAYS present beneath: 'Mappa del mercato di Sanremo. Cliccare un numero per aprire la scheda del banco.'

### Iconografia

Editorial illustrations over icons wherever possible: a hand-drawn fish for pesce, a basket for ortaggi, a wheel of cheese for formaggi — commissioned single-line drawings in ink, NOT Material/Lucide icons. For utility-only UI (close, search, calendar arrows) use Lucide at 1.5px stroke in olive. NEVER mix Lucide and editorial illustrations in the same component. Weather: handwritten-style glyphs (sun = circle with rays, rain = three diagonal lines), not emoji. Payment methods on operator pages: typeset abbreviations in small-caps ('CONTANTI · BANCOMAT · SATISPAY'), not credit-card icons.

### Esempi copy

> Hero (homepage): 'IMercati — una guida ai mercati della provincia di Imperia. Numero 24, primavera 2026.'
>
> Zone dek (Sanremo): 'Il sabato in piazza Eroi Sanremesi, dal 1898. Centoquaranta banchi, undici comuni che vi convergono, due chiese che lo guardano.'
>
> Operator lede: 'Antonio Bertolino arriva al porto di Sanremo alle cinque del mattino. A mezzogiorno è già al banco numero quattordici, con quattro casse di sarde e un cartello scritto a mano.'
>
> Sticky rail (open state): 'Apre sabato · tra 3 giorni · 7:00–13:00'
>
> Sticky rail (open now): 'Aperto ora · chiude alle 13:00'
>
> Avviso (priority): 'Il mercato di sabato 14 giugno è anticipato alle 6:30 per la festa patronale. — la redazione, 9 giugno'
>
> Editor's pick: 'La scelta della settimana: il banco di Antonio Bertolino, perché la sarda di Sanremo a giugno è una stagione che dura tre settimane.'
>
> Onboarding CTA: 'Diventa un volto di IMercati. Scrivici la tua storia, la pubblicheremo nel prossimo numero.'
>
> Empty state (no markets today): 'Oggi è lunedì, riposo. I mercati riaprono domani a Oneglia.'
>
> Error state (404): 'Questa pagina non esiste nell'archivio. Torna al sommario.'
>

---

## Schermate chiave (dettaglio)

### La Copertina (Homepage /)

**viewport**: 1440px desktop, with 375px mobile notes

**purpose**: First impression: this is a magazine about Liguria's markets, not a directory.

**hierarchy**:
- Fold 1 (100vh): Full-bleed seasonal photograph (current: citrus crates on stone at dawn, Ventimiglia). Top-left in Fraunces small-caps tracking-widest 14px: 'IMERCATI · NUMERO 24 · PRIMAVERA 2026'. Top-right: thin olive 'entra' link (login) — no other nav chrome. Bottom-center: Fraunces 72px italic 'Una guida ai mercati di Imperia'. Single olive ornament ◆ below.
- Fold 2 (Manifesto): Cream background. Single 65ch column centered. Olive 5-line drop cap 'I'. 180-word manifesto in Fraunces 22px/1.6. Signed italic 'La redazione, Imperia'. Ornament end-mark.
- Fold 3 (Il Sommario): Fraunces 40px H2 'Il sommario' left-aligned. Five numbered entries vertically stacked, 40vh each, asymmetric alternation. Each: eyebrow small-caps 'N° 02' + Fraunces 56px 'Sanremo' + italic 18px dek 'Il sabato di piazza Eroi Sanremesi, dal 1898' + small-caps 'leggi l'articolo →' in zone-accent. Half-width photograph alternates left/right.
- Fold 4 (Questa settimana): Magazine spread. Left 2/3: 7-day calendar as vertical columns, each appointment a small typeset block 'Sanremo · sabato 7:00 · piazza Eroi Sanremesi'. Right 1/3: 'La scelta della settimana' — operator portrait + 60-word editor recommendation + signature.
- Sticky after fold 1 (StickyFinder): Thin 56px cream rail with thin olive bottom-border. Left: 'IMercati' wordmark in Fraunces small-caps. Center: italic placeholder 'cerca un mercato o un banco'. Right: meteo glyph + 'oggi · 22°' + ★ preferiti icon. Hidden during fold 1.
- Footer (Colophon): Two-column typeset spread on cream. Left column: chi siamo, fonti, crediti fotografici, contributors by name. Right column: privacy, cookie, contatti redazione. Bottom: 'numero chiuso in tipografia il 9 giugno 2026' (build-date driven).
- Mobile (375px): Cover photo at 70vh (not 100vh to preserve thumb-reach). StickyFinder always visible (no hide). Sommario entries stack vertically, no asymmetry, photo always above text.

### Il Mercato di Sanremo (/sanremo)

**viewport**: 1440px desktop

**purpose**: Single source of truth for one market — replaces zone home + operators list + news + weather + parking + search.

**hierarchy**:
- Fold 1 (100vh): Full-bleed market photograph at golden hour, banchi visible. Bottom-left overlay: small-caps eyebrow 'N° 02 · SANREMO' in white. Centered Fraunces 88px italic 'Il mercato di Sanremo'. Italic 32px dek 'Sabato, dal 1898, in piazza Eroi Sanremesi'. Rose-accent ornament at bottom.
- Fold 2 (Lede): 65ch column, rose drop cap, 200-word editorial introduction. Signed 'a cura di Giulia M.'.
- Fold 3 (Quando): H2 'Quando' + TypesetTable showing sessions as typeset timetable. Footnotes for exceptions ('¹ chiuso ad agosto'). NOT a FullCalendar widget. Link to /agenda for full month view.
- Fold 4 (Dove): Full-bleed MarketMap with numbered serif pins matching banco numbers below. Caption small-caps italic: 'Mappa del mercato. Cliccare un numero per aprire la scheda.' Parcheggi appear as olive 'P' marks with hover tooltip — NO separate parking page.
- Fold 5 (I banchi): H2 'I volti del sabato'. Thin sticky filter bar with category small-caps tags ('PESCE · ORTAGGI · FORMAGGI · FIORI'). Two-column list of EditorialOperatorEntry: 200px portrait + Fraunces name + italic '· Banco N° 14 · pesce fresco' + 80-word bio. Names link to /sanremo/banchi/[slug].
- Fold 6 (Da sapere): Three-column figure. Col 1: meteo 3-day forecast with handwritten glyphs. Col 2: avvisi as italic prose, signed and dated (no card chrome, no badges). Col 3: parcheggi paragraph with map snippet thumbnail.
- Fold 7 (End-mark + navigation): Rose ornament + 'N° 01 ← Ventimiglia · Oneglia → N° 03' small-caps.
- Sticky right rail (after fold 1, 200px wide, cream with thin olive left-border): UtilityState 'Apre sabato · tra 3 giorni · 7:00' in olive. Jump-anchors below: Quando · Dove · Banchi · Da sapere. Bottom: ★ salva tra i preferiti. Bottom: ↗ condividi (copies clean URL).
- Mobile: Right rail collapses to bottom sticky bar showing only utility state + jump menu (☰).

### Profilo Banco (/sanremo/banchi/antonio-bertolino)

**viewport**: 1440px desktop

**purpose**: Operator as a magazine personality piece, with all utility (when, where, products, contacts) inline.

**hierarchy**:
- Fold 1 (70vh): Portrait photograph right 60%. Left 40% cream: small-caps eyebrow 'SANREMO · BANCO N° 14'. Fraunces 64px 'Antonio Bertolino'. Italic 24px dek 'Pesce fresco dal porto di Sanremo, dal 1987'. Hand-written signature ornament.
- Fold 2 (Profilo): 60ch column, rose drop cap, 150-word third-person profile. Signed 'testo di Marco P.'.
- Fold 3 (Cosa trovi): H2 'Cosa trovi al banco'. Trattoria-menu TypesetTable: left = Fraunces product name + italic short description, right = Inter small-caps tabular price '€ 18 al kg'. Category headers in italic Fraunces ('Pesce azzurro', 'Crostacei'). Tap product = inline photo expand, no modal.
- Fold 4 (Quando lo trovi): M:N presences as prose, not grid: 'Sabato a Sanremo · 7:00–13:00. Mercoledì a Ventimiglia · 8:00–13:00.' Each session is a link to its zone article.
- Fold 5 (Pratica): Three-row figure. Lingue (small-caps). Pagamenti (small-caps abbreviations). Contatti (vCard block).
- Sticky right rail: 'Prossima apertura: sabato 13 giugno · Sanremo'. ★ salva. ↗ condividi.
- End: rose ornament + 'Torna al sommario di Sanremo →'.

### L'Agenda (/agenda)

**viewport**: 1440px desktop

**purpose**: Province-wide unified calendar, replaces /calendar and per-zone calendar duplication.

**hierarchy**:
- Fold 1: Fraunces 56px H1 'L'agenda'. Italic 24px dek 'Tutti i mercati della provincia, settimana per settimana.' Signed 'a cura della redazione'.
- Editor's pick callout: olive-bordered cream block with 'La scelta della settimana' + 60-word recommendation.
- Filter rail (sticky, thin): Zone TOC as small-caps 'IN QUESTO NUMERO: VENTIMIGLIA · SANREMO · ONEGLIA · PORTO MAURIZIO · DIANO'. Categories as italic tags. Date-range as two typeset date inputs (Inter), no calendar popup.
- Week view: Magazine spread, 7 vertical columns. Each appointment a small typeset block: zone name in italic Fraunces, time in Inter tabular, link to zone article. Empty days: 'riposo' in stone italic.
- Toggle to month view: small-caps link top-right 'vista mensile →'. Month view = simplified FullCalendar but styled in cream/olive (no blue/red defaults).
- URL params: /agenda?zona=sanremo&cat=pesce — bookmarkable, deep-linkable.

### Redazione Dashboard (/redazione)

**viewport**: 1440px desktop, super-admin only

**purpose**: All admin power in one editorial frame — no UX loss, full feature preservation.

**hierarchy**:
- Fold 1: Fraunces 48px 'La redazione'. Date and admin name in small-caps eyebrow.
- Pull-quote KPI tiles (replace card stats): Four large typeset blocks on cream — 'Duecentoquarantasette banchi · undici comuni · una provincia.' / 'Tremiladuecentoquattordici lettori questa settimana.' / 'Quarantasette nuove adesioni.' / 'Due zone in pausa.' — each clickable to drill-down.
- Sezione 'Le zone': horizontal list of 5 zone cards with on/off toggle (Accendi/Spegni), session count, last-edit timestamp, edit link to /redazione/zone/[id].
- Sezione 'Adesioni': last 5 adesioni as 'lettere in arrivo' editorial cards with AdesioneStatoToggle (in-attesa · accettata · rifiutata), link to /redazione/adesioni for full inbox.
- Sezione 'Sessioni in pausa': list of any off-toggle sessions, link to /redazione/sessioni for full all-sessions table.
- Sezione 'Top contributors': leaderboard of operators by views/edits, typeset like a magazine credits page.
- Left sidebar (sticky): TOC navigation — Zone · Sessioni · Adesioni · Avvisi globali · Eventi · Impostazioni. Small-caps Fraunces, olive on hover.
- All admin functionality preserved: Excel tools, MarketAreaDrawer, M:N presences, global avviso flag, schedule binding — accessed via /redazione/zone/[id].

---

## Idee scartate (e perche)

- Five distinct per-zone palettes used as full backgrounds — kept only as accents/ornaments/drop caps. Full zone backgrounds would shatter cream-canvas consistency and double QA per new zone.
- Hand-set custom wordmark per zone — rejected. Single Fraunces wordmark with zone-accent ornament is enough identity; custom wordmarks bloat design debt.
- Parallax scrolling on hero photographs — rejected. Slows LCP, motion-sickness concern, and conflicts with 'nothing flashes, nothing pulses' principle.
- EN/IT language toggle in v1 — rejected. Italian-first with English subtitle on hero only. Toggle adds chrome and copy maintenance burden.
- Standalone /parcheggi province-wide page — rejected. Parking is always local to a market; province-wide parking has no real user goal.
- Separate /[zone]/news, /[zone]/weather, /[zone]/parking pages — rejected as duplication. Inline as 'Da sapere' figure on zone article. High-priority avvisi surface as a sticky AvvisoBanner.
- FullCalendar month/week toggle as primary calendar UI — rejected as default. Custom <WeekSpread /> is default; FullCalendar is fallback for month view only, heavily restyled.
- Drop caps on every paragraph — rejected. Only lede paragraphs (one per article). Excessive drop caps fragment reading.
- Numbered issue covers ('NUMERO 24') tied to literal weekly publication — rejected as commitment but kept as visual treatment driven by build-date. We won't promise weekly editions we can't sustain.
- Native confirm() and generic gray Tailwind palette — rejected entirely. Replaced by <ConfirmDialog /> and full cream/olive purge.
- Admin dashboard as a separate visual language (utilitarian Material-style) — rejected. Same editorial language with pull-quote KPIs keeps the brand coherent for admins who context-switch hourly.
- Bylines on every avviso AND every product — rejected as too much. Bylines on zone ledes, operator profiles, avvisi, and agenda editor's pick only.
- Carousels of operator photos on homepage — rejected. Operators appear only as 'La scelta della settimana' single feature on cover + inline list on zone page.
- Generic stat cards on /redazione — rejected. Replaced by <KpiPullQuote /> editorial tiles.
- FavoritesSection as homepage block — rejected. Favorites live in StickyFinder rail only.
- Searching mock-data via /[zone]/search — rejected. Real search via StickyFinder, indexed against real zones + banchi + products.

