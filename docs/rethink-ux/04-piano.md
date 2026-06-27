# 04 · Piano di implementazione

Quattro agenti hanno generato in parallelo: file da cancellare, file da unire, nuova struttura, piano di migrazione in fasi.

---

## File da cancellare (30)

| File | Motivo | Rischio |
|------|--------|--------|
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\calendar\page.tsx` | Global /calendar page is merged into /agenda with a new WeekSpread component per the synthesis (single calendar source). | External bookmarks, sitemap entries, SEO inbound links, and any internal <Link href="/calendar"> across components (Navigation, NavMenu, MarketsQuickFinder) will 404 unless a 301 redirect to /agenda is added in next.config.js. Pageview analytics dashboards filtering by /calendar will drop to zero. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\calendar\page.tsx` | Per-zone calendar duplication is folded into the 'Quando' fold of /[marketSlug] plus the global /agenda?zona= filter. | Any deep-link from emails, push notifications, or AdesioneForm confirmations pointing to /sanremo/calendar will break. Server-rendered metadata and OpenGraph cards lose their entry. Need 301 to /agenda?zona=[marketSlug] preserving the slug param. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\operatori\page.tsx` | Global operators listing is replaced by /banchi and inline operator sections on /[marketSlug]; OperatorCard/OperatorFilters paradigm is killed in favor of EditorialOperatorEntry. | Search index entries, sitemap.xml entries, and the Navigation menu link will break. The page may be the canonical SEO surface for operator discovery; losing it without a redirect to /banchi will tank organic traffic. Verify no server actions or revalidate calls reference this path. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\operators\page.tsx` | Per-zone operators list collapses into the 'I banchi' fold of /[marketSlug] as inline EditorialOperatorEntry list (Fold 5). | Direct links from operator share buttons, social cards, and any embedded iframe widgets will 404. Filter state in URL params (?cat=pesce) needs migration to anchors on the parent zone page. SSG/ISR cache keys for this route must be purged. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\operator\page.tsx` | Legacy non-namespaced operator index route — duplicates /operatori and /banchi; no longer in the IA. | May be referenced by old QR codes printed on physical market signage or legacy admin tooling. Check api routes and middleware for hard-coded '/operator' assumptions before deleting. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\operator\[id]\page.tsx` | Legacy operator-by-id route is superseded by /[marketSlug]/banchi/[slug] (named, scoped to zone, slug-based). | Operators identified by numeric id in old links will 404. Need a redirect map from numeric id -> {marketSlug, slug} or a catch-all that resolves ids server-side. FavoriteButton may store operator-id references in localStorage that won't resolve after this change. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\operator\[id]\products\page.tsx` | Products tab is collapsed into the 'Cosa trovi al banco' trattoria-menu fold of the new banco profile page. | Print-friendly product menus, share links, and any deep-links from operator vCards point here. Inline expand pattern replaces a dedicated URL, so any analytics tracking 'product view' as a pageview will need event-based replacement. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\operators\[id]\page.tsx` | Replaced by slug-based /[marketSlug]/banchi/[slug] per the Profilo Banco screen design. | All existing operator detail URLs use numeric id; without an id->slug redirect mapping, every shared link breaks. Database lookups, FavoritesSection persistence, and AdesioneForm confirmation emails likely embed this URL pattern. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\news\page.tsx` | News/avvisi are inlined into 'Da sapere' fold (Fold 6) of /[marketSlug] as italic prose, no separate route. | RSS feeds, redazione push notifications, and any cron job posting 'avviso pubblicato' links to /[slug]/news will break. Global avviso flag still needs a surface — verify Fold 6 actually renders it. SEO loss for time-sensitive news indexing. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\weather\page.tsx` | Weather collapses into the 3-column 'Da sapere' figure on /[marketSlug] using handwritten glyphs. | WeatherWidget is being repurposed inline — verify the new component doesn't lose the 7-day view that this page may have provided. External weather API rate-limit budget assumptions may change if this page was cached separately. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\parking\page.tsx` | Parking is now an inline paragraph in 'Da sapere' col 3 plus olive 'P' marks on the MarketMap; no dedicated route. | Tourists searching 'parcheggio sanremo mercato' on Google land here — SEO loss is real. The MarketMap 'P' hover tooltip must work on mobile (no hover). Verify accessibility for screen readers since data moves from semantic page to map tooltips. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\parcheggi\page.tsx` | Global parking page removed — parking is purely a per-market concern shown on each zone page. | Province-wide parking search/index disappears. If municipalities reference this page in tourism portals it 404s. Confirm no admin dashboard relies on this as the parking-data CRUD surface. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\search\page.tsx` | Per-zone search is replaced by the global StickyFinder placeholder ('cerca un mercato o un banco') in the cream rail. | Scoped search semantics (search only within Sanremo) are lost unless StickyFinder respects current zone context. Search-result share URLs break. Indexed search-result pages drop from SEO. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\privacy\page.tsx` | Privacy merges into /colophon as a right-column entry per the magazine colophon pattern. | GDPR/legal compliance: privacy URL is often referenced in cookie banners, email footers, and consent records — a 301 to /colophon#privacy with stable anchor is mandatory. CookieNotice component very likely hard-codes /privacy. DPO/regulatory filings may cite the URL. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\cookie\page.tsx` | Cookie policy merges into /colophon (right column with privacy and contatti). | Cookie consent platforms (Iubenda/Cookiebot if used) reference this exact URL for the policy link. CookieNotice component will need updating. Hardcoded /cookie in EU compliance audits will fail until redirected. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\OperatorCard.tsx` | Card paradigm is explicitly rejected ('operators are people, not cards'); replaced by EditorialOperatorEntry with portrait + Fraunces name + bio. | Used by /operatori, /[marketSlug]/operators, and FavoritesSection — every consumer must be migrated to EditorialOperatorEntry first or build breaks. Visual regression: card aspect ratios and grid layouts disappear. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\OperatorFilters.tsx` | Replaced by thin sticky filter bar with small-caps category tags inline on the zone page; CAT_LABEL constants move to lib/categories.ts. | Filter URL query-param shape (?cat=pesce&zona=sanremo) must be preserved by the new inline filter or every bookmark dies. AdesioneForm or admin tools may import CAT_LABEL from this file — search before deleting. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\UnifiedMap.tsx` | UnifiedMap/UnifiedMapClient are replaced by the new MarketMap with MapLibre cream-base custom style and numbered serif pins per synthesis. | MarketAreaDrawer (KEEP) may share map primitives with UnifiedMap — deleting could break the admin polygon editor. Check imports carefully. MapLibre style JSON, tile-server config, and pin sprite sheets are non-trivial to replace cleanly. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\UnifiedMapClient.tsx` | Client wrapper for UnifiedMap, obsolete with the new editorial MarketMap component. | Any dynamic import using ssr:false for this client component must be re-pointed to the new MarketMap client wrapper. SSR/hydration issues if the new component is not similarly dynamic-imported. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\Navigation.tsx` | Top-nav chrome is removed in favor of the minimal cover (only 'entra' top-right) plus StickyFinder rail; classic site nav is incompatible with the magazine fold-1 design. | Layout.tsx almost certainly renders <Navigation /> globally — must be replaced with StickyFinder + minimal cover-header simultaneously or every page loses navigation. Accessibility: keyboard nav and skip-links may live here. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\NavMenu.tsx` | Mobile/dropdown menu chrome is rejected — mobile uses bottom sticky bar with jump-menu (☰) scoped per page, not a global nav. | If Navigation imports NavMenu, deleting both simultaneously is fine, but if any standalone page uses NavMenu directly, build breaks. Mobile users lose global navigation until the per-page bottom sticky is shipped — sequence matters. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\MarketsQuickFinder.tsx` | Replaced by the new StickyFinder rail with italic placeholder 'cerca un mercato o un banco', meteo glyph, and ★ preferiti — entirely different visual and behavior. | Likely embedded in Navigation or homepage. Search index integration (Algolia/Meilisearch/in-memory) might live here — confirm StickyFinder replicates the same query plumbing before deletion or search dies. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\DaySelector.tsx` | Day-picker UI is replaced by the typeset 7-day calendar spread (vertical columns) and Inter tabular date inputs in /agenda filter rail — no chip/segmented selector remains. | Used by /calendar and /[marketSlug]/calendar (both being deleted) but may also be used by /[marketSlug] zone page or admin /redazione. Check all imports — if admin scheduling UI depends on it, MarketAreaDrawer flows could break. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\WeatherWidget.tsx` | Replaced by handwritten-style glyphs (sun = circle with rays, rain = three diagonal lines) in the 'Da sapere' 3-column figure; existing widget is icon-based and visually incompatible. | The Open-Meteo / fetch logic likely lives here — must be extracted to a hook/lib before deletion or weather data fetching is lost. Caching headers and ISR keys may depend on this component's data contract. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\ComuneSessionsExplorer.tsx` | Comune-level explorer is folded into the zone-page TypesetTable (Fold 3 'Quando') and prose presences on banco profile (Fold 4); no separate explorer component is needed. | /[marketSlug]/c/[comuneSlug] route (still listed) consumes this — confirm that route also goes away or gets a new component. If municipalities embed this view via iframe, embeds break silently. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\c\[comuneSlug]\page.tsx` | Comune sub-route is not in the new IA — comune information is inlined into /[marketSlug] zone page; ComuneSessionsExplorer is being deleted alongside. | Comuni are 11 distinct municipalities per the synthesis ('undici comuni') — losing per-comune URLs may upset municipal partners with their own marketing pointing here. SEO for 'mercato [comune-name]' queries is gone. Need redirects to /[marketSlug]#comune-[slug] or similar. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\MarketViewer.tsx` | Likely a legacy zone-viewer wrapper duplicated by the new editorial /[marketSlug] page structure (Folds 1-7); the page renders folds directly without a Viewer wrapper. | May contain critical data-fetching logic for sessions/operators that the new page hasn't reimplemented yet. Confirm /[marketSlug]/page.tsx fully replaces all functionality before deletion. Could break SSR if it currently owns the metadata generation. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\Reveal.tsx` | Scroll-reveal animation component conflicts with the slow, editorial, print-magazine tone ('slow, knowledgeable, never breathless') — animations on appearance are out of voice. | If applied broadly across pages, removing it without auditing may leave content with display:none or visibility:hidden inline styles if those were paired. Reduced motion preferences may already be handled here — verify before deleting. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\ZoneImage.tsx` | Zone hero imagery is replaced by full-bleed photographs at golden hour (Fold 1 of /[marketSlug]) handled directly in page.tsx with next/image; no abstraction component needed for the magazine cover treatment. | If this component handles responsive image sources, blurDataURL, or art-direction (different crops per breakpoint), the page must reimplement that. LCP score may regress if next/image isn't configured equivalently. |
| `c:\Users\emanu\Desktop\claude project\mercati-v2\components\decorations.tsx` | OliveSprig/WaveDivider/MountainSea/DoubleRule are SVG decorations superseded by the new ornament system (◆ olive ornament, rose ornament, hand-drawn editorial illustrations) commissioned per synthesis. | Widely imported across pages — every page using these will fail to compile until replacement ornaments are wired. Safer to delete LAST after all consumers migrate. End-marks and dividers are everywhere in the new design (folds, footers, end-of-article). |

**Route da rimuovere/redirect:**

- `/calendar` → 301 redirect *(Merged into unified province-wide agenda.)*
- `/[marketSlug]/calendar` → 301 redirect *(Per-zone calendar folded into agenda filter + zone-page 'Quando' fold.)*
- `/operatori` → 301 redirect *(Operators reframed as 'banchi' (stalls/people) — magazine voice.)*
- `/[marketSlug]/operators` → 301 redirect *(Inlined as Fold 5 of zone page with editorial entries.)*
- `/[marketSlug]/operators/[id]` → 301 redirect *(Slug-based namespaced profile per Profilo Banco screen.)*
- `/operator` → 404 (gone) *(Legacy duplicate of /operatori; no canonical preservation needed.)*
- `/operator/[id]` → 301 redirect *(Old non-namespaced operator detail; preserve link equity via DB lookup.)*
- `/operator/[id]/products` → 301 redirect *(Products inlined as trattoria-menu fold.)*
- `/[marketSlug]/news` → 301 redirect *(Avvisi inlined into 'Da sapere' fold as italic prose.)*
- `/[marketSlug]/weather` → 301 redirect *(Weather collapses into 3-column 'Da sapere' figure.)*
- `/[marketSlug]/parking` → 301 redirect *(Parcheggi inlined as paragraph + 'P' marks on MarketMap.)*
- `/parcheggi` → 404 (gone) *(Province-wide parking index removed; parking is per-market only.)*
- `/[marketSlug]/search` → 301 redirect *(Search unified into StickyFinder rail.)*
- `/privacy` → 301 redirect *(GDPR compliance — preserve anchor to legal text inside colophon.)*
- `/cookie` → 301 redirect *(Cookie consent platforms reference this URL — must redirect, not 404.)*
- `/[marketSlug]/c/[comuneSlug]` → 301 redirect *(Comuni inlined into parent zone page; preserve municipal partner links.)*

---

## File da unire (6)

### `d:/Claude/progettos-community-siti/old project/app/calendar/page.tsx` + `d:/Claude/progettos-community-siti/old project/app/[marketSlug]/calendar/page.tsx` + `d:/Claude/progettos-community-siti/old project/components/calendar/CalItem.tsx` + `d:/Claude/progettos-community-siti/old project/lib/calendar/EVT_LABEL.ts` + `d:/Claude/progettos-community-siti/old project/lib/calendar/EVT_COLOR.ts` → `d:/Claude/progettos-community-siti/old project/app/agenda/page.tsx`

Two parallel calendar pages (province-wide and per-zone) duplicate EVT_LABEL, EVT_COLOR and CalItem constants. Replace with a single /agenda route backed by lib/calendar.ts (single source of truth) and a custom <WeekSpread /> component for the magazine-spread week view; FullCalendar is kept only as the underlying engine for the month-view fallback with chrome hidden via CSS.

**Steps:**

1. Create lib/calendar.ts that exports the unified EVT_LABEL, EVT_COLOR, CalItem type and helpers (groupByDay, isToday, nextOpening); have both legacy callers import from it temporarily so behavior is locked.
2. Build components/WeekSpread.tsx — 7-column magazine layout, each session as typeset block linking to its zone article; empty days render 'riposo' in stone italic.
3. Build components/MonthFallback.tsx wrapping FullCalendar with overrides forcing cream/olive palette (no blue/red defaults), hidden default toolbar, replaced with small-caps 'vista mensile →' toggle.
4. Create app/agenda/page.tsx that reads ?zona= and ?cat= URL params, renders editor's-pick callout, sticky zone TOC filter, then <WeekSpread /> with toggle to <MonthFallback />.
5. Add Next.js redirects in next.config.ts: /calendar → /agenda and /[marketSlug]/calendar → /agenda?zona=[marketSlug] to preserve inbound links.
6. Delete app/calendar/, app/[marketSlug]/calendar/, the old CalItem component, and the duplicated constant files; run typecheck to confirm no remaining imports.

### `d:/Claude/progettos-community-siti/old project/app/operatori/page.tsx` + `d:/Claude/progettos-community-siti/old project/app/[marketSlug]/operators/page.tsx` + `d:/Claude/progettos-community-siti/old project/components/OperatorCard.tsx` + `d:/Claude/progettos-community-siti/old project/components/OperatorFilters.tsx` → `d:/Claude/progettos-community-siti/old project/components/EditorialOperatorEntry.tsx`

Operators are people, not cards. Collapse the province-wide /operatori list, the per-market operators list, OperatorCard and OperatorFilters into a single editorial entry component reused inline on /[marketSlug] and on a thin /banchi index. CAT_LABEL relocates to lib/categories.ts as the single source.

**Steps:**

1. Extract CAT_LABEL (and category type) from OperatorFilters and OperatorCard into lib/categories.ts; switch both legacy components to import from it before deleting them.
2. Author components/EditorialOperatorEntry.tsx: 200px portrait left, Fraunces name + italic '· Banco N° XX · category' + 80-word bio, name links to /[marketSlug]/banchi/[slug]; no card chrome, no shadow.
3. Create app/banchi/page.tsx as a thin province-wide index reusing <EditorialOperatorEntry /> grouped by zone, with the sticky filter bar for categories (small-caps tags) and zone TOC.
4. Update app/[marketSlug]/page.tsx to render the operators section inline (Fold 5 'I volti del sabato') by mapping operators of the zone through <EditorialOperatorEntry /> with the sticky category filter on top.
5. Add redirects /operatori → /banchi and /[marketSlug]/operators → /[marketSlug]#banchi in next.config.ts.
6. Delete the two old pages and OperatorCard/OperatorFilters; run typecheck and grep for any remaining CAT_LABEL imports to confirm migration.

### `d:/Claude/progettos-community-siti/old project/app/privacy/page.tsx` + `d:/Claude/progettos-community-siti/old project/app/cookie/page.tsx` + `d:/Claude/progettos-community-siti/old project/app/about/page.tsx` → `d:/Claude/progettos-community-siti/old project/app/colophon/page.tsx`

Three sparse legal/about pages collapse into one editorial colophon spread, matching the magazine pattern. The 'numero chiuso in tipografia il …' date is build-date driven, killing the per-page hardcoded LAST_UPDATE constants.

**Steps:**

1. Create lib/buildMeta.ts exporting BUILD_DATE (process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().slice(0,10)) and ISSUE_NUMBER; wire it through next.config.ts env at build time.
2. Author app/colophon/page.tsx as a two-column typeset spread on cream: left = chi siamo + fonti + crediti fotografici + contributors; right = privacy + cookie + contatti redazione; bottom = build-date line.
3. Migrate the legal copy from /privacy and /cookie into colophon sections verbatim; have a designer pass restyle into Fraunces 22px/1.6 prose (no card chrome, no LAST_UPDATE).
4. Add redirects /privacy → /colophon#privacy, /cookie → /colophon#cookie, /about → /colophon in next.config.ts.
5. Update footer/colophon link in app/layout.tsx to point to /colophon only.
6. Delete the three old page files and any LAST_UPDATE constants; grep to confirm no stale links remain.

### `d:/Claude/progettos-community-siti/old project/components/UnifiedMap.tsx` + `d:/Claude/progettos-community-siti/old project/components/UnifiedMapClient.tsx` → `d:/Claude/progettos-community-siti/old project/components/MarketMap.tsx`

UnifiedMap and UnifiedMapClient are a server/client split for the same widget. Collapse into one <MarketMap /> with a 'use client' directive that accepts captions, numbered serif pins, cream MapLibre style, and toggles for parcheggi/zones — used on /[marketSlug] (Fold 4) and as the snippet in Fold 6.

**Steps:**

1. Move the MapLibre cream style JSON (land/water/roads/buildings tokens from the brand palette) into lib/mapStyle.ts so it is shared, then import it into the new component.
2. Author components/MarketMap.tsx (client) with props: { center, zoom, pins: {n, lat, lng, slug}[], parcheggi?, zonePolygons?, caption: string }; render numbered serif circle pins matching banco numbers, olive 'P' marks for parking with hover tooltip, zone polygons at 12% opacity / 80% border, and a required <figcaption> in Fraunces small-caps italic below.
3. Replace usages: import { MarketMap } from '@/components/MarketMap' in /[marketSlug] Fold 4 and in the Fold 6 'Da sapere' parcheggi snippet (smaller variant via a compact prop).
4. Hide zoom controls by default; show on hover via CSS, styled as olive serif '+' and '−'; strip Mapbox/Google attribution per brand rules (keep MapLibre attribution where legally required, in small-caps stone).
5. Delete UnifiedMap.tsx and UnifiedMapClient.tsx; run typecheck and grep for old imports.

### `d:/Claude/progettos-community-siti/old project/app/page.tsx` + `d:/Claude/progettos-community-siti/old project/app/[marketSlug]/page.tsx` → `d:/Claude/progettos-community-siti/old project/lib/zones.ts`

ZONE_HERO_COMUNE constants are duplicated between the homepage and the zone page. Centralize into lib/zones.ts as a single registry mapping zone slug → { name, heroPhoto, palette, ornamentGlyph, dek } so the hero, Sommario fold and zone-page hero all read the same source.

**Steps:**

1. Create lib/zones.ts exporting Zone type { slug, name, heroPhoto, paletteAccent, ornamentGlyph, dek, comuni: string[] } and a ZONES array seeded from the existing ZONE_HERO_COMUNE constants in both files.
2. Add helpers getZone(slug) and listZones() with stable ordering matching the issue's sommario sequence (Ventimiglia → Sanremo → Oneglia → Porto Maurizio → Diano).
3. Refactor app/page.tsx Fold 3 'Il sommario' to map listZones() through a <SommarioEntry /> component reading the registry.
4. Refactor app/[marketSlug]/page.tsx to call getZone(params.marketSlug) for hero photo, ornament glyph and accent color; pass them down to MarketMap and EditorialOperatorEntry as needed.
5. Delete the inline ZONE_HERO_COMUNE constants from both pages; grep to confirm no remaining duplicate definitions.
6. Add a typed test/lint guard (or simple unit test) ensuring every ZONES entry has a heroPhoto file present in /public, to prevent regression.

### `d:/Claude/progettos-community-siti/old project/components/QuickFinder.tsx` + `d:/Claude/progettos-community-siti/old project/components/FavoritesSection.tsx` → `d:/Claude/progettos-community-siti/old project/components/StickyFinder.tsx`

Search (QuickFinder) and the favorites homepage block do the same job — utility access — in two places. Merge into one <StickyFinder /> that lives in the thin 56px sticky utility rail and holds both search and favorites, with the rail hidden during Fold 1 and always visible on mobile.

**Steps:**

1. Author components/StickyFinder.tsx as a single client component: left wordmark, center italic search placeholder, right meteo glyph + temp + ★ preferiti popover; cream surface with thin olive bottom-border.
2. Lift the favorites state into lib/favorites.ts (localStorage-backed store with a small React hook useFavorites()), shared between the rail popover and any operator/zone page ★ buttons.
3. Move search query logic from QuickFinder into lib/search.ts (zone + banchi index) so the rail simply consumes it; ensure debounced input and keyboard nav are preserved.
4. Mount <StickyFinder /> in app/layout.tsx with a scroll-aware wrapper that hides it during the first 100vh on desktop and keeps it always visible on mobile (matches Fold 1 hierarchy rule).
5. Remove the FavoritesSection homepage block from app/page.tsx (favorites live in the rail) and delete components/QuickFinder.tsx and components/FavoritesSection.tsx.
6. Run typecheck and a manual smoke test: ★-toggle on a banco profile reflects in the rail popover instantly; search routes correctly to /[marketSlug] and /[marketSlug]/banchi/[slug].

---

## Nuova struttura

```
app/
├── layout.tsx                                    # Root: Fraunces+Inter fonts, cream bg, NotificationProvider
├── page.tsx                                      # / La Copertina (homepage)
├── globals.css                                   # Tokens: cream/ink/olive/ochre/stone, type scale, drop-cap
├── (public)/
│   ├── layout.tsx                                # Public chrome: StickyFinder + Colophon footer
│   ├── agenda/
│   │   └── page.tsx                              # /agenda — WeekSpread + month fallback
│   ├── banchi/
│   │   └── page.tsx                              # /banchi — province-wide operator index
│   ├── aderisci/
│   │   └── page.tsx                              # /aderisci — operator onboarding letter+form
│   ├── colophon/
│   │   └── page.tsx                              # /colophon — privacy+cookie+about merged
│   └── [zoneSlug]/
│       ├── page.tsx                              # /[zoneSlug] — the feature article
│       └── banchi/
│           └── [operatorSlug]/
│               └── page.tsx                      # /[zoneSlug]/banchi/[operatorSlug]
├── login/
│   └── page.tsx                                  # /login — cream restyle
├── operator/
│   ├── layout.tsx                                # Operator auth chrome
│   ├── page.tsx                                  # /operator — la tua rubrica
│   └── [id]/
│       ├── page.tsx                              # /operator/[id] — split edit+preview
│       └── prodotti/
│           └── page.tsx                          # /operator/[id]/prodotti
└── redazione/
    ├── layout.tsx                                # Admin chrome: AdminTOC sticky left
    ├── page.tsx                                  # /redazione — dashboard with KpiPullQuote
    ├── adesioni/
    │   └── page.tsx                              # /redazione/adesioni — letters inbox
    ├── sessioni/
    │   └── page.tsx                              # /redazione/sessioni — global cascade table
    └── zone/
        ├── page.tsx                              # /redazione/zone — all zones list
        └── [id]/
            ├── page.tsx                          # /redazione/zone/[id] — anchored long-page
            ├── avvisi/
            │   └── page.tsx                      # /redazione/zone/[id]/avvisi
            ├── eventi/
            │   └── page.tsx                      # /redazione/zone/[id]/eventi
            ├── banchi/
            │   ├── page.tsx                      # /redazione/zone/[id]/banchi
            │   └── [opId]/
            │       └── page.tsx                  # /redazione/zone/[id]/banchi/[opId]
            └── sessioni/
                └── [sessionId]/
                    └── page.tsx                  # /redazione/zone/[id]/sessioni/[sessionId]

components/
├── editorial/
│   ├── EditorialHero.tsx                         # Full-bleed photo + eyebrow + H1 + dek + ornament
│   ├── DropCap.tsx                               # 5-line drop cap, zone-accent via ZoneIdentity
│   ├── Dateline.tsx                              # Small-caps marginalia line
│   ├── TypesetTable.tsx                          # Schedules/menus as magazine tables
│   ├── PullQuote.tsx                             # Large italic serif quote + attribution
│   ├── EndMark.tsx                               # Zone-specific closing ornament
│   ├── Sommario.tsx                              # Numbered magazine TOC, asymmetric
│   ├── Colophon.tsx                              # Footer + /colophon shared content
│   └── ZoneIdentity.tsx                          # Context provider: accent, ornament, byline
├── navigation/
│   ├── StickyFinder.tsx                          # Top rail: wordmark+search+meteo+favs
│   ├── UtilityRail.tsx                           # Right rail / mobile bottom: open-state+jumps
│   ├── AvvisoBanner.tsx                          # Sticky priority banner, signed+dated
│   └── AdminTOC.tsx                              # Sticky left sidebar for /redazione/*
├── operator/
│   └── EditorialOperatorEntry.tsx                # Portrait+name+role+80-word bio
├── calendar/
│   └── WeekSpread.tsx                            # 7-column editorial week view
├── map/
│   └── MarketMap.tsx                             # Cream MapLibre + numbered serif pins
├── admin/
│   ├── KpiPullQuote.tsx                          # Stats as editorial pull-quotes
│   └── ConfirmDialog.tsx                         # Cream confirm replacing native()
└── ui/
    └── (existing kept: NotificationProvider, AdesioneStatoToggle, MarketAreaDrawer, ExcelOperatorsTools)

lib/
├── editorial/
│   └── copy.ts                                   # Zone ledes, operator templates, agenda intros
├── zones.ts                                      # Zone registry (slug,palette,ornament,byline)
├── calendar.ts                                   # Unified EVT_LABEL/EVT_COLOR (kills dupes)
└── categories.ts                                 # CAT_LABEL (moved from OperatorFilters)
```

### Tabella route complete

| URL | File | Scopo |
|-----|------|-------|
| `/` | `app/page.tsx` | La Copertina — magazine homepage with hero, manifesto, Sommario of 5 zones, questa settimana spread. |
| `/[zoneSlug]` | `app/(public)/[zoneSlug]/page.tsx` | Feature article on one zone/market — merges zone home + operators list + news + weather + parking + search. |
| `/[zoneSlug]/banchi/[operatorSlug]` | `app/(public)/[zoneSlug]/banchi/[operatorSlug]/page.tsx` | Operator profile as magazine personality piece, slug-based and SEO-friendly. |
| `/agenda` | `app/(public)/agenda/page.tsx` | Province-wide unified calendar — merges /calendar + per-zone calendars, with WeekSpread and month fallback. |
| `/banchi` | `app/(public)/banchi/page.tsx` | Province-wide operator directory — replaces /operatori, editorial 'rubrica I volti dei mercati'. |
| `/aderisci` | `app/(public)/aderisci/page.tsx` | Operator onboarding — editor's letter framing + single-question-per-fold form. |
| `/colophon` | `app/(public)/colophon/page.tsx` | Merges /privacy + /cookie + /about + credits into one editorial spread, build-date driven. |
| `/login` | `app/login/page.tsx` | Authentication — cream/olive restyled, centered Fraunces H1 'Entra in redazione'. |
| `/operator` | `app/operator/page.tsx` | Operator's home 'la tua rubrica' — list owned banchi with auto-redirect when single. |
| `/operator/[id]` | `app/operator/[id]/page.tsx` | Self-edit profile with split form + live public-preview pane. |
| `/operator/[id]/prodotti` | `app/operator/[id]/prodotti/page.tsx` | Product CRUD as typeset menu editor with inline editing and ConfirmDialog deletes. |
| `/redazione` | `app/redazione/page.tsx` | Super-admin dashboard with KpiPullQuote editorial stats, zone overview, adesioni preview, sessioni in pausa, top contributors. |
| `/redazione/zone` | `app/redazione/zone/page.tsx` | Gestione zone — all markets CRUD list with on/off cascade toggle and 'Apri un nuovo numero' CTA. |
| `/redazione/zone/[id]` | `app/redazione/zone/[id]/page.tsx` | Per-zone admin home with anchored sections: Dettagli, Admin assegnato, Excel tools, MarketAreaDrawer, Sessioni, Banchi/Avvisi/Eventi links. |
| `/redazione/zone/[id]/sessioni/[sessionId]` | `app/redazione/zone/[id]/sessioni/[sessionId]/page.tsx` | Per-session admin — banchi della sessione with create-new / link-existing cross-market operator and schedule binding. |
| `/redazione/zone/[id]/banchi` | `app/redazione/zone/[id]/banchi/page.tsx` | Per-zone operators list with filter chips, ExcelOperatorsTools, and 'Nuovo banco' CTA with M:N session selector. |
| `/redazione/zone/[id]/banchi/[opId]` | `app/redazione/zone/[id]/banchi/[opId]/page.tsx` | Per-zone operator edit — Profilo, Presenze M:N selector across sessions/markets, Account invite flow. |
| `/redazione/zone/[id]/avvisi` | `app/redazione/zone/[id]/avvisi/page.tsx` | Per-zone avvisi CRUD with global-publish flag visible only to super-admin. |
| `/redazione/zone/[id]/eventi` | `app/redazione/zone/[id]/eventi/page.tsx` | Per-zone events CRUD with category, date range, and photo. |
| `/redazione/sessioni` | `app/redazione/sessioni/page.tsx` | Super-admin all-sessions view including inactive — global Accendi/Spegni cascade table. |
| `/redazione/adesioni` | `app/redazione/adesioni/page.tsx` | Adesioni operatori inbox — 'lettere in arrivo' cards with AdesioneStatoToggle and stato/zona filters. |

### Nuovi file da creare (48)

- **`app/layout.tsx`** — Root layout: Fraunces (variable) + Inter fonts, cream background, NotificationProvider, ZoneIdentity default, AvvisoBanner mount point.
  - *Scaffold*: export const fonts={fraunces:Fraunces({...,variable:'--font-fraunces'}),inter:Inter({...,variable:'--font-inter'})}; wrap body in cream bg + <NotificationProvider><AvvisoBanner/>{children}</NotificationProvider>.
- **`app/globals.css`** — Design tokens: cream/ink/olive/ochre/stone CSS vars; type scale (Fraunces 22/40/56/72/88, Inter 14/16); drop-cap utility; small-caps tracking-widest 0.18em; tabular vs oldstyle figure utilities.
  - *Scaffold*: :root{--cream:#F4EEE2;--ink:#1F1B16;--olive:#5C6B47;--ochre:#B8853A;--stone:#8C8479} .small-caps{font-variant-caps:all-small-caps;letter-spacing:0.18em} .drop-cap::first-letter{float:left;font-size:5em;line-height:.85;...}
- **`app/page.tsx`** — La Copertina homepage — full-bleed hero (100vh), manifesto column (65ch), Sommario with 5 zones, Questa settimana spread.
  - *Scaffold*: import EditorialHero, DropCap, Sommario, WeekSpread; render fold1 hero with eyebrow 'IMERCATI · NUMERO 24 · PRIMAVERA 2026' + Fraunces 72px italic title; fold2 <DropCap>I</DropCap>manifesto; fold3 <Sommario zones={getZones()}/>; fold4 weekly spread + editor's pick.
- **`app/(public)/layout.tsx`** — Public chrome wrapper: mounts StickyFinder (hidden during hero fold) and Colophon footer.
  - *Scaffold*: export default ({children})=><><StickyFinder/>{children}<Colophon variant='footer'/></>
- **`app/(public)/[zoneSlug]/page.tsx`** — The feature article on one zone/market. Merges zone home + operators list + news + weather + parking + search.
  - *Scaffold*: Server component: load zone, sessions, operators, avvisi, meteo. Render <ZoneIdentity zone={zone}><EditorialHero/><DropCap/>lede<TypesetTable rows={sessions}/><MarketMap/><EditorialOperatorEntry/>list<DaSapereSection/><EndMark/></ZoneIdentity>. <UtilityRail/> mounted sticky.
- **`app/(public)/[zoneSlug]/banchi/[operatorSlug]/page.tsx`** — Operator profile as magazine personality piece. Slug-based, SEO-friendly.
  - *Scaffold*: Load operator by slug + zone; render portrait hero (70vh, 60/40 split), <DropCap/>profilo, <TypesetTable variant='menu'/> for prodotti, prose for presenze M:N, three-row Pratica section. <UtilityRail/> with prossima apertura.
- **`app/(public)/agenda/page.tsx`** — Province-wide unified calendar. Replaces /calendar + per-zone calendars.
  - *Scaffold*: Read searchParams for ?zona&cat&from&to; render H1+dek, editor's pick <PullQuote/>, sticky zone-TOC filter rail, <WeekSpread sessions={filtered}/>, link 'vista mensile →' to month view (FullCalendar restyled).
- **`app/(public)/banchi/page.tsx`** — Province-wide operator directory. Replaces /operatori with editorial 'rubrica I volti dei mercati'.
  - *Scaffold*: Featured operator at top (half-page <EditorialOperatorEntry variant='featured'/>), then alphabetical typeset index grouped by zone, sticky filter rail (category, zone) using lib/categories.ts.
- **`app/(public)/aderisci/page.tsx`** — Operator onboarding. Editorial 'lettera dal direttore' framing + single-column form.
  - *Scaffold*: 180-word signed editor's letter with <DropCap/>, then form one-question-per-fold, Fraunces labels + Inter inputs, olive submit button. POST to existing /api/adesioni.
- **`app/(public)/colophon/page.tsx`** — Merges /privacy + /cookie + /about + credits into single editorial spread.
  - *Scaffold*: <Colophon variant='page'/> rendering two-column typeset spread; build-date driven via process.env.BUILD_DATE or fs.statSync. No hardcoded LAST_UPDATE.
- **`app/login/page.tsx`** — Authentication. Restyled to cream/olive.
  - *Scaffold*: Centered card on cream, Fraunces H1 'Entra in redazione', email+password Inter inputs, olive submit, italic 'sei un operatore? aderisci →' secondary link.
- **`app/operator/layout.tsx`** — Authenticated operator chrome — minimal top bar with 'La tua rubrica' + logout.
  - *Scaffold*: Server: enforce role==='operator' via getSession(); render small-caps top bar + {children}.
- **`app/operator/page.tsx`** — Operator's home — list owned banchi. Auto-redirects if single banco.
  - *Scaffold*: Load operator's banchi; if length===1 redirect(`/operator/${id}`); else render editorial cards with pubblicato/bozza state, last-edited timestamp.
- **`app/operator/[id]/page.tsx`** — Self-edit profile. Split view: form left, live preview right.
  - *Scaffold*: Client component with state; left column form fields (Fraunces labels), right column sticky <EditorialOperatorEntry preview={formState}/> rendered as public profile.
- **`app/operator/[id]/prodotti/page.tsx`** — Product CRUD as typeset menu editor.
  - *Scaffold*: Menu-style list with drag handles (dnd-kit), inline editing — no modals. <ConfirmDialog/> for deletes. Save autopersists per row.
- **`app/redazione/layout.tsx`** — Admin chrome: AdminTOC sticky left sidebar, role==='admin'|'super-admin' enforcement.
  - *Scaffold*: Enforce role server-side; render grid: <aside><AdminTOC/></aside><main>{children}</main>.
- **`app/redazione/page.tsx`** — Super-admin dashboard with editorial pull-quote KPIs.
  - *Scaffold*: Four <KpiPullQuote/> tiles, zone cards row with Accendi/Spegni toggle, <AdesioniPreview limit={5}/>, sessioni-in-pausa list, top contributors leaderboard.
- **`app/redazione/zone/page.tsx`** — All zones CRUD list.
  - *Scaffold*: Editorial cards per zone with on/off cascade toggle, session count, Excel tools button (ExcelOperatorsTools), edit link. 'Apri un nuovo numero' CTA.
- **`app/redazione/zone/[id]/page.tsx`** — Per-zone admin home with anchored sub-sections (lazy-loaded).
  - *Scaffold*: Left sticky TOC for anchors; sections: Dettagli, Admin assegnato, ExcelOperatorsTools, MarketAreaDrawer per luogo, Sessioni list, Banchi link, Avvisi link, Eventi link.
- **`app/redazione/zone/[id]/sessioni/[sessionId]/page.tsx`** — Per-session admin — banchi della sessione with schedule binding.
  - *Scaffold*: Session header + on/off toggle + banchi list with 'crea nuovo' / 'collega banco esistente' (cross-market operator picker). Schedule binding inline.
- **`app/redazione/zone/[id]/banchi/page.tsx`** — Per-zone operators list with filters, Excel tools, create new.
  - *Scaffold*: Table view with filter chips (categoria); <ExcelOperatorsTools zoneId={id}/> at top; 'Nuovo banco' CTA opens form with M:N session selector.
- **`app/redazione/zone/[id]/banchi/[opId]/page.tsx`** — Per-zone operator edit — profile, M:N presences, account invite.
  - *Scaffold*: Tabbed/anchored form sections: Profilo, Presenze (M:N selector across sessions/markets), Account (invite email + copy-to-clipboard link flow).
- **`app/redazione/zone/[id]/avvisi/page.tsx`** — Per-zone avvisi CRUD with global flag (super-admin only).
  - *Scaffold*: List + form; global flag toggle gated by role check, publishes across all zones via /api/avvisi?global=true.
- **`app/redazione/zone/[id]/eventi/page.tsx`** — Per-zone events CRUD with category, date range, photo.
  - *Scaffold*: List + form with photo upload; reuse existing /api/eventi.
- **`app/redazione/sessioni/page.tsx`** — Super-admin all-sessions view with global Accendi/Spegni cascade.
  - *Scaffold*: Sortable table: Zona | Sessione | Giorno | Stato (toggle) | Banchi count. Filter inactive checkbox.
- **`app/redazione/adesioni/page.tsx`** — Adesioni operatori inbox — each as 'lettera in arrivo' card.
  - *Scaffold*: Inbox-style list with <AdesioneStatoToggle/>, filter by stato + zona; click opens detail panel with full submission and PATCH/DELETE.
- **`components/editorial/EditorialHero.tsx`** — Full-bleed photo + eyebrow small-caps + Fraunces H1 + italic dek + ornament. Used on /, /[zone], /banchi/[id], /agenda.
  - *Scaffold*: props: {photo, eyebrow, title, dek, ornament?, height='100vh'}; render <section style={{height}} bg-image>{children}</section> with bottom-center title block.
- **`components/editorial/DropCap.tsx`** — 5-line drop cap for lede paragraphs. Color from ZoneIdentity context.
  - *Scaffold*: const {accent}=useZone(); return <span className='drop-cap' style={{color:accent}}>{letter}</span>; consumer pattern: <DropCap/>Resto del paragrafo...
- **`components/editorial/Dateline.tsx`** — Small-caps marginalia: 'Sanremo · sabato mattina · dal 1898'.
  - *Scaffold*: props:{items:string[]}; return <p className='small-caps text-stone'>{items.join(' · ')}</p>
- **`components/editorial/TypesetTable.tsx`** — Schedules and product menus as magazine tables (trattoria-menu style for variant='menu').
  - *Scaffold*: variant:'schedule'|'menu'; rows:[{left:ReactNode,right:ReactNode,note?}]; render two-col flex with Fraunces left + Inter tabular right + dotted leader; footnotes below.
- **`components/editorial/PullQuote.tsx`** — Large italic serif quote with attribution. Used on agenda editor's pick + homepage manifesto.
  - *Scaffold*: props:{children, attribution}; Fraunces 32-40px italic + small-caps attribution prefixed with '— '.
- **`components/editorial/EndMark.tsx`** — Zone-specific ornament closing articles. aria-hidden.
  - *Scaffold*: const {ornament,accent}=useZone(); return <div aria-hidden className='text-center my-12' style={{color:accent}}>{ornament}</div>
- **`components/editorial/Sommario.tsx`** — Magazine TOC with numbered entries, asymmetric alternation, photo + dek.
  - *Scaffold*: props:{entries:[{n,name,dek,photo,href,accent}]}; map to alternating left/right half-width photo + Fraunces 56px name + italic 18px dek + small-caps 'leggi l'articolo →'.
- **`components/editorial/Colophon.tsx`** — Site-wide footer + /colophon page content. Two-column typeset spread, build-date driven.
  - *Scaffold*: variant:'footer'|'page'; left col chi siamo/fonti/crediti, right col privacy/cookie/contatti; bottom 'numero chiuso in tipografia il {BUILD_DATE}'.
- **`components/editorial/ZoneIdentity.tsx`** — Context provider for per-zone accent color, ornament glyph, byline. Deterministic from slug via lib/zones.ts.
  - *Scaffold*: createContext({accent,ornament,byline,name,slug}); export <ZoneIdentity zone={zone}>{children}</ZoneIdentity> + useZone() hook.
- **`components/navigation/StickyFinder.tsx`** — Top sticky rail: wordmark + italic search placeholder + meteo glyph + favorites. Hidden during fold1 hero.
  - *Scaffold*: Use IntersectionObserver on a sentinel at top of page to toggle visibility; 56px cream rail with thin olive bottom-border.
- **`components/navigation/UtilityRail.tsx`** — Sticky right-rail (desktop) / bottom-bar (mobile): open-state, jump-anchors, ★ favorites, ↗ share.
  - *Scaffold*: props:{state:{label,detail,tone},anchors:[{id,label}]}; 200px wide cream with thin olive left-border; useMediaQuery to switch to bottom bar at <768px.
- **`components/navigation/AvvisoBanner.tsx`** — Sticky top banner for high-priority avvisi only, dismissible, dated and signed.
  - *Scaffold*: Fetch /api/avvisi?global=true&priority=high&active=true; localStorage dismissal key per avviso id; ochre left-border, italic prose, signature.
- **`components/navigation/AdminTOC.tsx`** — Sticky left sidebar TOC for /redazione/* — small-caps Fraunces nav.
  - *Scaffold*: Sections: Zone, Sessioni, Adesioni, Avvisi globali, Eventi, Impostazioni; usePathname() to highlight active in olive.
- **`components/operator/EditorialOperatorEntry.tsx`** — Portrait + Fraunces name + italic role + 80-word bio. Replaces OperatorCard everywhere.
  - *Scaffold*: variant:'list'|'featured'|'preview'; props:{operator,bancoNumber?,zoneSlug}; 200px portrait left, Fraunces name + italic '· Banco N° {n} · {role}' + bio; name links to /[zone]/banchi/[slug].
- **`components/calendar/WeekSpread.tsx`** — Custom 7-column week view replacing FullCalendar default week. Editorial typography.
  - *Scaffold*: props:{sessions, weekStart}; render grid-cols-7 with day header in Fraunces small-caps + appointments as small typeset blocks (zone italic + tabular time + link); empty days show italic 'riposo'.
- **`components/map/MarketMap.tsx`** — Cream-styled MapLibre with numbered serif pins, captioned figure wrapping.
  - *Scaffold*: Custom MapLibre style: land=cream, water=#D8DCC8, roads=0.5px ink hairlines; zone polygons at 12% opacity; pins as numbered serif circles ('14'); caption always rendered below in small-caps italic.
- **`components/admin/KpiPullQuote.tsx`** — Admin dashboard stat as editorial pull-quote.
  - *Scaffold*: props:{quote:string,href?}; large Fraunces italic with number written-out ('Duecentoquarantasette banchi · undici comuni'); wrap in <Link> if href.
- **`components/admin/ConfirmDialog.tsx`** — Replaces native confirm(). Cream surface, olive primary, rose secondary destructive.
  - *Scaffold*: Headless dialog (Radix) with cream bg, Fraunces title, Inter body, olive confirm button, rose destructive variant; export imperative useConfirm() hook.
- **`lib/editorial/copy.ts`** — Single source for editorial prose (zone ledes, operator template ledes, agenda intros). Copy-editable without React changes.
  - *Scaffold*: export const ZONE_LEDES:Record<string,string>={sanremo:'Il sabato in piazza Eroi Sanremesi...',...}; export const AGENDA_INTRO=`Tutti i mercati della provincia...`; export const OPERATOR_TEMPLATE=(name,zone,year)=>`${name} arriva al ${zone} alle...`
- **`lib/zones.ts`** — Zone registry — single source of truth for slug, name, hero photo, accent palette, ornament, day-of-week, since-year, byline.
  - *Scaffold*: export type Zone={slug,name,heroPhoto,accent,ornament,dayOfWeek,since,byline}; export const ZONES:Zone[]=[{slug:'sanremo',name:'Sanremo',accent:'#A85C5C',ornament:'❀',dayOfWeek:6,since:1898,...}]; export const getZone=(slug)=>ZONES.find(z=>z.slug===slug).
- **`lib/calendar.ts`** — Unified EVT_LABEL / EVT_COLOR / CalItem — kills duplicate constants between /calendar and /[market]/calendar.
  - *Scaffold*: export const EVT_LABEL:Record<EventType,string>={market:'Mercato',event:'Evento',...}; export const EVT_COLOR:Record<EventType,string>={market:'var(--olive)',event:'var(--ochre)',...}; export type CalItem={...}.
- **`lib/categories.ts`** — Operator category labels — moved out of deleted OperatorFilters.
  - *Scaffold*: export const CAT_LABEL:Record<Cat,string>={pesce:'Pesce',ortaggi:'Ortaggi',formaggi:'Formaggi',fiori:'Fiori',...}; export const CAT_ORDER:Cat[]=[...];

---

## Piano di migrazione · 5 fasi · stima totale 183h

### Fase 1: Phase 1: Design tokens + brand foundation (no visual change in prod) — *18h · rischio low*

**Obiettivo**: Establish the editorial design system (colors, type, tokens) as additive infrastructure that ships to production without altering any rendered page.

**Step**:

1. Create a feature branch `feat/editorial-foundation` and configure a Netlify deploy preview for it so every commit gets a shareable URL.
2. Add Fraunces (variable) and Inter via `next/font/google` in app/layout.tsx, exposing them as CSS variables --font-fraunces and --font-inter; do NOT swap the default font-family yet.
3. In app/globals.css (Tailwind v4 @theme block), register the full palette tokens: --color-cream, --color-ink, --color-olive, --color-ochre, --color-stone, plus zone accents (ventimiglia, sanremo, oneglia, porto-maurizio, diano) and semantic aliases (open-now, closed, warning, error).
4. Add typography tokens (--text-hero, --text-h2, --text-lede, --tracking-smallcaps 0.18em) and a 65ch / 78ch max-width utility set.
5. Build a private route `/_styleguide` (gated by env flag NEXT_PUBLIC_SHOW_STYLEGUIDE so it 404s in prod) that renders every token, type pair, drop cap, ornament, and color swatch — this is the visual contract.
6. Add a `lib/design/` folder with primitive components: `<DropCap>`, `<Ornament>`, `<SmallCaps>`, `<TypesetTable>`, `<UtilityState>` — written but unused by live pages.
7. Run a Lighthouse + visual diff on the existing production routes via the deploy preview to confirm zero rendered change.
8. Merge to main. Production is unchanged; tokens and primitives are now available to import.

**Rollback**: Revert the merge commit. Since no live page consumes the new tokens or fonts (fonts are loaded but not applied as default), reverting removes them with no user-visible impact. Keep the styleguide route gated by env flag so it can be re-enabled instantly.

### Fase 2: Phase 2: Editorial homepage behind a feature flag — *30h · rischio medium*

**Obiettivo**: Ship the new Copertina (homepage) as an A/B-flagged route so editors can review it on prod URLs without exposing it to visitors.

**Step**:

1. Add a lightweight flag system: read `NEXT_PUBLIC_EDITORIAL_HOME` (or a cookie `imercati_preview=1`) in app/page.tsx and conditionally render either the legacy page or the new Copertina.
2. Build the Copertina folds: Fold 1 hero with seasonal photo + masthead, Fold 2 manifesto with drop cap, Fold 3 Sommario (5 zone entries), Fold 4 Questa settimana, Footer Colophon.
3. Implement `<StickyFinder>` as a shared layout component, hidden during fold 1 via IntersectionObserver, always visible on mobile <768px.
4. Wire the Sommario links to placeholder zone routes that still 404 (will be filled in Phase 3) — but visible only when flag is on, so prod users never hit dead links.
5. Add Open Graph + JSON-LD metadata reflecting the new editorial framing; keep the legacy metadata path for the non-flagged render.
6. QA the flagged version on a Netlify deploy preview, then enable the cookie path on production for internal reviewers (set cookie via /preview?on=1 helper route).
7. After a week of internal review, flip `NEXT_PUBLIC_EDITORIAL_HOME=true` on Netlify to make the new homepage the default. Leave the legacy code path in place for one more release for safety.

**Rollback**: Set `NEXT_PUBLIC_EDITORIAL_HOME=false` in Netlify env vars and trigger a redeploy (about 90 seconds). The legacy homepage renders again. The cookie-based preview continues to work for editors regardless of the flag, so investigation can continue without affecting production.

### Fase 3: Phase 3: Zone pages (/sanremo first) + content model migration — *55h · rischio medium*

**Obiettivo**: Ship the first zone page as the canonical pattern (Sanremo), migrating data from the existing projects schema into a market/operator/session model, with the legacy /projects routes still working.

**Step**:

1. Design and apply a Supabase migration that ADDS new tables (markets, market_sessions, operators, operator_presences, avvisi) without altering or dropping existing `projects` tables; new tables get RLS policies from day one.
2. Build a one-off `scripts/migrate-projects-to-markets.ts` that reads from `projects` and seeds the new tables idempotently (safe to re-run). Run it against staging Supabase first, then prod.
3. Implement `/[zona]` dynamic route with `generateStaticParams` for the 5 zones; for now only `sanremo` returns content, the others return a 'in lavorazione, esce nel prossimo numero' editorial empty state — not a 404.
4. Build the seven folds of the Sanremo page per the synthesis (hero, lede, Quando, Dove/MarketMap, Banchi, Da sapere, end-mark), all reading from the new tables.
5. Implement `<MarketMap>` with MapLibre + custom cream style JSON; ship the style file under public/maps/imercati-style.json. Numbered serif pins as inline SVG, not Material icons.
6. Add the sticky right rail with UtilityState computed from market_sessions + Europe/Rome timezone via date-fns-tz; mobile collapses it to a bottom bar.
7. Add 301 redirects in `next.config.ts` from any legacy URLs that semantically map to /sanremo (e.g. /projects/sanremo-market → /sanremo); leave unmapped /projects URLs working untouched.
8. Keep /projects/* routes alive throughout this phase; they read from the (still-populated) legacy tables.
9. Update sitemap.xml and robots.txt to include the new zone URL, but keep legacy URLs in the sitemap until Phase 5 retires them.

**Rollback**: Remove the /[zona] route file and the redirect entries in next.config.ts; legacy /projects routes were never touched and continue serving. New Supabase tables are additive — they can be left in place (zero cost) or dropped after data export. The migration script is idempotent so re-running after a rollback is safe.

### Fase 4: Phase 4: Operator profiles + Agenda (province-wide calendar) — *45h · rischio medium*

**Obiettivo**: Complete the editorial information architecture by shipping operator pages and the unified /agenda, replacing per-zone calendar duplication.

**Step**:

1. Implement `/[zona]/banchi/[slug]` dynamic routes; statically generate the known set at build time via `generateStaticParams` reading operators table.
2. Build the 5 folds of the operator profile (hero portrait, profilo with drop cap, Cosa trovi typeset menu, Quando lo trovi prose presences, Pratica vCard) — all using Phase 1 primitives.
3. Build /agenda with the week-view magazine spread (7 vertical columns) reading from market_sessions across all zones; implement the URL params ?zona=&cat=&from=&to= for deep-linking.
4. Add the month-view fallback using a styled FullCalendar (or a lighter alternative like @fullcalendar/core) — restyle defaults to cream/olive, NEVER blue/red.
5. Wire the editor's pick callout on /agenda from a `weekly_picks` table (one row per ISO week) so editors can author it in Supabase without code changes.
6. Add an ICS export endpoint `/api/agenda.ics` filtered by the same URL params, so users can subscribe in their calendar — extra value, low surface area.
7. Add 301 redirects from any legacy /calendar or /events URLs to /agenda preserving query params where they map cleanly.
8. Roll out behind the same cookie-preview pattern for one week, then promote by enabling the routes for all visitors. Keep the legacy calendar route returning a redirect, not a 404, for at least 60 days.

**Rollback**: Delete the new route files; the 301 redirects in next.config.ts can stay (they just redirect to / instead) or be removed in the same commit. Operator and agenda data in Supabase stays — readable but unrendered. Legacy /projects and /calendar URLs are still alive from Phase 3, so the public site degrades only to the previous architecture, not to a broken state.

### Fase 5: Phase 5: Retire legacy routes + voice/copy audit + production hardening — *35h · rischio low*

**Obiettivo**: Remove the legacy /projects scaffolding, enforce the editorial voice rules across all copy, and lock in performance + accessibility.

**Step**:

1. Audit every string on the public site against the voice rules: ban 'unico/esclusivo/imperdibile/eccezionale', remove exclamation marks, enforce 'a cura di' bylines, replace generic 'mercato del weekend' with real place + weekday. Tracked in a checklist per route.
2. Add an ESLint custom rule or a `scripts/check-copy.ts` CI step that greps for the banned adjectives and exclamation marks in app/**/*.tsx and content/**/*.md, failing the build on hit.
3. Replace remaining Lucide icons in editorial contexts with the commissioned single-line ink illustrations (fish, basket, cheese, etc.); keep Lucide ONLY for utility UI (close, search, calendar arrows) per the synthesis rule.
4. Convert all 301 redirects from Phase 3 and 4 into permanent entries in netlify.toml so they survive even if next.config.ts is refactored.
5. Mark /projects/* routes as `gone` (HTTP 410) or redirect them to the nearest editorial equivalent based on a manually curated map; communicate this in the colophon for one issue.
6. Drop the legacy `projects` Supabase tables AFTER taking a final pg_dump and storing it in Netlify Large Media or a private S3 bucket — keep the dump for 12 months minimum.
7. Run a full Lighthouse pass on the 5 key screens; budget: LCP <2.5s, CLS <0.05, TBT <200ms. Fix regressions caused by hero photos via next/image priority + AVIF.
8. Run an axe-core pass on each key screen; fix any contrast issues (cream + stone may be the riskiest pair) and confirm small-caps tracking does not break screen reader pronunciation.
9. Remove the `NEXT_PUBLIC_EDITORIAL_HOME` flag and the legacy homepage code path; the editorial site is now the only site.

**Rollback**: The legacy tables dump is retained for 12 months; restoring is `psql < dump.sql` into a new schema and pointing a feature branch at it. Redirects in netlify.toml can be reverted in one commit. The flag removal is the only non-reversible step in this phase — mitigate by waiting 30 days after Phase 4 promotion before removing it.

---

## Breaking changes

- /projects/* routes are retired in Phase 5 — replaced by /[zona]/banchi/[slug] with 301 redirects where a semantic mapping exists, and HTTP 410 Gone for the rest. External backlinks to project IDs will break unless mapped.
- Homepage HTML structure changes completely in Phase 2 — any scraper, RSS reader, or third-party embed relying on the legacy DOM selectors will break. No public API contract, but Open Graph image URL changes.
- Supabase `projects` table is dropped in Phase 5 — any external integration (n8n workflows, exports) reading directly from Supabase must switch to the new `markets`/`operators` tables before Phase 5 ships.
- The /calendar or /events legacy routes (if they exist) become 301 redirects to /agenda in Phase 4 — query parameter names change (e.g. ?month= becomes ?from=&to=), so bookmarked deep links may lose their filter state.
- Default font-family for body text switches from system-ui to Fraunces in Phase 2 — any user CSS overrides or print stylesheets relying on the previous default will render differently.
- The editorial voice audit in Phase 5 rewrites visible copy on every page; SEO rankings for queries matching the old wording (e.g. 'mercato weekend Imperia') may shift toward the new wording ('sabato piazza Eroi Sanremesi').

## Sicurezza produzione

"Every phase ships behind either a Netlify env-var flag (NEXT_PUBLIC_EDITORIAL_HOME) or a cookie-based preview (imercati_preview=1 set via a /preview helper route), so changes land on production infrastructure but stay invisible until the editor flips the switch. Netlify deploy previews provide a shareable URL per PR for visual review without touching prod. Supabase changes are strictly additive through Phase 4 — new tables alongside the old, dual-written via a one-off idempotent migration script — and the legacy `projects` table is only dropped in Phase 5 after a pg_dump is archived for 12 months. URL continuity is preserved via a redirect map in next.config.ts (Phases 3-4) that is promoted to netlify.toml in Phase 5 so it survives framework refactors; legacy URLs become 301 redirects rather than 404s, with HTTP 410 reserved only for routes with no semantic equivalent. Each phase has an independent rollback (env var flip, revert commit, or table dump restore) and never depends on the previous phase being un-rollbackable. The solo-dev cadence assumes 15-20h/week, putting the full migration at roughly 10-12 weeks; phases 2-4 each include a one-week internal preview window before public promotion, which doubles as a buffer for life events without stalling production. No phase requires a maintenance window or downtime — Netlify atomic deploys plus additive Supabase migrations keep the site live throughout."

