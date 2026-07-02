> ⚠️ **ARCHIVIO STORICO — direzione MAI implementata.** Questo documento descrive
> la proposta "Slow Compass / magazine editoriale" (Fraunces+Inter, cream/olive,
> route /agenda /banchi /colophon) generata dal workflow del 2026-05-14 e poi
> **scartata**. Il sito reale è un'altra cosa: vedi `../brand-system.md` e
> `../brand-voice.md`. Non usare questi file come riferimento di implementazione.

# 01 · Discovery — stato attuale

Output dei 7 agenti che hanno mappato il codice in parallelo. Numeri concreti per dare la base alla discussione di design.

---

## Route pubbliche · 20 totali

IMercati exposes 17 public-facing routes split into 4 layers: marketing/legal pages (/, /aderisci, /privacy, /cookie, /login), province-wide aggregators (/operatori, /calendar), the [marketSlug] zone hierarchy ([marketSlug]/, news, calendar, operators, operators/[id], weather, c/[comuneSlug]), 2 thin redirect-only stubs (/parcheggi, /[marketSlug]/parking), and an operator-self-serve area (/operator, /operator/[id], /operator/[id]/products) that auth-guards via redirect to /login. The codebase shows clear overlap between the province-level /calendar and the zone-level /[marketSlug]/calendar (large copy-pasted FullCalendar setups), and between /operatori (province hub) and /[marketSlug]/operators (zone-scoped list) — same data model, different shells, two style systems. Two pages are entirely vestigial (/parcheggi, /[marketSlug]/parking) — they 1-line redirect because the map is now embedded in the zone page, so they only exist for backward compatibility. One page is broken: /[marketSlug]/search renders hard-coded MOCK operator data from 2024 (Milan coords, Mario/Moda/Libri) and is reachable but not linked from any nav. Styling is bimodal: about half the pages use the curated cream/olive design system, the other half (search, news, login, operator/*) still use generic gray Tailwind cards, suggesting an unfinished design refactor.

**Route ridondanti rilevate:**

- /calendar  vs  /[marketSlug]/calendar  — same FullCalendar component, same color maps, same modal, same upcoming-list logic; only the data scope (province-wide vs marketId-filtered) differs. ~80% duplicated code; should be one <UnifiedCalendar scope={...} /> consumed by both routes.
- /operatori  vs  /[marketSlug]/operators  — both render a card grid of operators with category/search filters; province-level just lacks the 'pin to map' affordance and adds a comune filter. Could merge into one parametric page with an optional marketSlug filter.
- /parcheggi  and  /[marketSlug]/parking  — two redirect-only files. Both should be removed and replaced by redirects() in next.config.js so they don't ship as React pages.
- /[marketSlug]/search  — overlaps with /[marketSlug]/operators (which already has a search input). The dedicated /search page would only make sense if it included products, but products search is explicitly deferred ('Fase 2') and the operators search query also forwards to /operators?operator=ID. Recommend deleting the page until products search lands.
- /operator  hub  vs  immediate redirect to /operator/[id] when only one operator exists  — the auto-redirect produces a brief 'Caricamento…' flash on every login for single-stall operators; either redirect server-side in middleware or skip the hub entirely for single-owner accounts.

| Path | Purpose | Complessità | Visibile | Issues |
|------|---------|-------------|----------|--------|
| `/` | Province-level homepage with hero, MarketsQuickFinder, unified pin map, favorites, manifesto, editorial zone list, and operator CTA. | high | ✓ | Inline ZONE_HERO_COMUNE constant duplicated verbatim in /[marketSlug]/page.tsx — should live in lib/.; Pings supabase twice on every render with force-dynamic and no cache headers.; Mixes anchor links |
| `/aderisci` | Marketing landing for operator onboarding, hosts the AdesioneForm component. | low | ✓ | — |
| `/privacy` | Static GDPR-style privacy policy. | low | ✓ | LAST_UPDATE date '14 maggio 2026' is a hard-coded string — easy to forget on real changes. |
| `/cookie` | Static cookie policy describing the cookieless analytics and localStorage usage. | low | ✓ | Same hard-coded LAST_UPDATE pattern as /privacy — drift risk. |
| `/login` | Email/password Supabase auth (signin + signup toggle), then role-based redirect to operator/admin areas. | medium | ✓ | Uses generic primary-600/gray Tailwind classes, not the cream/olive design system used elsewhere.; Sign-up flow doesn't redirect after confirmation email — user is left on the same screen with only a  |
| `/calendar` | Province-wide FullCalendar showing all schedule occurrences + events with market/category filter sidebar. | high | ✓ | EVT_LABEL, EVT_COLOR, ALL_EVT_CATS, ALL_SCH_CATS and the entire CalItem modal duplicate /[marketSlug]/calendar/page.tsx — ~80% identical code.; No loading skeleton; shows raw 'Caricamento…' text insid |
| `/operatori` | Province-wide hub listing every operator across all zones with filters for market/comune/category and free-text search. | medium | ✓ | CAT_LABEL map duplicated identically in /[marketSlug]/operators/page.tsx.; Operator links degrade to href='#' when op.market is null — silent dead links instead of disabling the card.; Uses <img> inst |
| `/parcheggi` | Pure redirect to / (parking map was merged into the home/zone page). | low | ✗ | Dead route kept only for backward compatibility — should be a Next.js redirects() rule in next.config.js to avoid bundling a page.; No metadata, no 308 status hint. |
| `/operator` | Authenticated operator hub: lists the operator's owned stalls, auto-redirects when exactly one is owned. | low | ✓ | Still uses primary-600/gray Tailwind not the cream/olive system.; Triggers a re-fetch + redirect on every mount; if user has 1 operator they always pass through this page briefly (flash of 'Caricament |
| `/operator/[id]` | Operator self-edit dashboard: name, description, photos, languages, payment methods, social links. | medium | ✓ | msg state used for both success and error — same gray text style for both; no semantic feedback.; No optimistic UI; user has to wait then read 'Salvato'.; Generic Tailwind palette inconsistent with pu |
| `/operator/[id]/products` | CRUD for operator products with photo upload, price, availability toggle, edit modal. | medium | ✓ | Uses native confirm() for delete — non-styled OS dialog.; Modal lacks focus trap and escape-to-close.; addProduct creates a placeholder ('Nuovo prodotto') row server-side before the user has typed any |
| `/[marketSlug]` | Zone homepage: hero photo, map of all sessions, shortcut grid (operators/calendar/news/weather), comuni cards, schedules list, prev/next zone nav. | high | ✓ | ZONE_HERO_COMUNE constant duplicated from app/page.tsx.; Loads ALL markets just to find prev/next index — could be a single ordered query against the current slug.; Layout already calls notFound() if  |
| `/[marketSlug]/news` | Per-zone news/notices feed (market_id OR global) with priority styling. | low | ✓ | Still uses the OLD generic Tailwind palette (gray-900, bg-blue-50, bg-red-50) — clashes with cream/olive design used in sibling pages.; No nav back to the zone homepage (no breadcrumb), unlike other [ |
| `/[marketSlug]/calendar` | Zone-scoped FullCalendar showing only this market's occurrences + events with category sidebar. | high | ✓ | Heavy duplication with /calendar — same EVT_LABEL/EVT_COLOR/CalItem modal, same FullCalendar config, same upcoming list logic, same toggle helpers. Should factor a shared <UnifiedCalendar /> component |
| `/[marketSlug]/search` | Per-zone search box for operators/categories — intended UX but currently demoware. | medium | ✗ | CRITICAL: Operators list is hard-coded MOCK data ('Frutti Freschi di Mario', 'Moda & Stile', 'Libri Usati') with Milan coordinates (45.46xx, 9.19xx) — clearly forgotten from initial scaffolding.; Not  |
| `/[marketSlug]/weather` | Weather for a comune within the zone with hourly+daily forecast, severe-weather notifications via NotificationProvider. | medium | ✓ | First render flashes 'Caricamento meteo…' as plain text instead of skeleton.; useEffect dep is currentComune?.comune string only — if lat/lng change for the same comune name it won't refetch (unlikely |
| `/[marketSlug]/parking` | Pure redirect to /[marketSlug] (parking layer was merged into the zone map). | low | ✗ | Dead route — should become a next.config.js redirect rule.; Mirrors /parcheggi pattern, so two places to remember when refactoring. |
| `/[marketSlug]/operators` | Zone-scoped operator list with category/search/favorites filters and an interactive 'pin to map' feature. | high | ✓ | CAT_LABEL duplicated from /operatori.; Two separate useEffects fetching market info and operators — could be a single endpoint.; pinAllVisible() resets pinned to only currently-filtered ops — if user  |
| `/[marketSlug]/operators/[id]` | Public operator detail page: photos, sessions (where/when), languages, payments, socials, products. | medium | ✓ | Loads operator and validates market slug client-side via .markets!inner — if slug case differs from URL, falls through to notFound() even for valid operators.; Photos shown via <img> in horizontal scr |
| `/[marketSlug]/c/[comuneSlug]` | Comune detail within a zone: photo hero, sessions explorer, operator subset, prev/next comune nav. | medium | ✓ | Fetches all schedules for the market then filters by slugifyName client-side — should query by a normalized comune_slug column.; Loads all operators of the market without filtering by schedule_id — wa |

---

## Componenti · 27 totali

Mapped all 27 .tsx files under mercati-v2/components/. The codebase has 25 single-purpose components plus the decorations.tsx barrel of 4 SVG decorations and one admin/, one analytics/ component. The architecture is cleanly Next.js App Router: app/* pages import directly from @/components/*. Most components are leaf UI (FavoriteButton, Reveal, ZoneImage, DaySelector, CookieNotice, decorations) with a handful of larger interactive screens (UnifiedMap, NavMenu, ComuneSessionsExplorer, WeatherWidget, ExcelOperatorsTools, MarketAreaDrawer). The map subsystem is layered (UnifiedMap → UnifiedMapClient → MarketViewer) and a single non-trivial dead-code duplicate exists: OperatorCard.tsx is never imported and is functionally replaced by an inline render in app/[marketSlug]/operators/page.tsx. MarketViewer is a thin convenience alias of UnifiedMapClient (showParkingNearby=true). LocationPicker is used only by LocationFields. Role/auth logic is duplicated between Navigation and NavMenu.

**Duplicati / sovrapposizioni:**

- OperatorCard.tsx vs the inline operator card markup in app/[marketSlug]/operators/page.tsx — same responsibility (render one operator: name/description/category/stall/social/payments/navigate). OperatorCard is currently DEAD CODE (no importers).
- MarketViewer.tsx vs UnifiedMapClient.tsx — MarketViewer is a 23-line wrapper that just calls UnifiedMapClient with showParkingNearby=true and a default mapHeight; both [marketSlug]/page.tsx and ComuneSessionsExplorer go through MarketViewer while app/page.tsx and [marketSlug]/operators/page.tsx use UnifiedMapClient directly, so the same 'map with parking pins' use case has two entry points.
- LocationPicker.tsx vs MarketAreaDrawer.tsx — partial overlap: both are Leaflet maps that capture geometry. LocationPicker handles single point + optional read-only polygon; MarketAreaDrawer handles polygon draw/edit. Not a strict duplicate but they re-implement very similar Leaflet/icon boilerplate and could share a base map config.
- Navigation.tsx + NavMenu.tsx — not duplicates per se but tightly coupled: both independently call supabase.auth.getUser() and fetch the profile.role; the role-loading logic is duplicated across the two.

<details><summary><b>Lista completa componenti</b></summary>

| Nome | Scopo | Used by | Complessità | Duplicato di |
|------|-------|---------|-------------|--------------|
| `AdesioneForm` | Client form for operators to send a membership/join request (POST /api/adesioni) with status states idle/sending/success/error and a honeypot field. | app/aderisci/page.tsx | medium | — |
| `ComuneSessionsExplorer` | Interactive viewer for a comune's market sessions: lists sessions per market, classifies schedules, renders the MarketViewer map and operator list, with query-string driven selection. | app/[marketSlug]/c/[comuneSlug]/page.tsx | high | — |
| `CookieNotice` | Non-blocking dismissible privacy banner persisted via localStorage; informs about no tracking cookies and Supabase admin cookies. | app/layout.tsx | low | — |
| `DaySelector` | Multi-select day-of-week toggle buttons (Lun..Dom) used in admin market editors. Also re-exports formatMarketDays helper. | app/admin/markets/page.tsx, app/admin/markets/[id]/page.tsx | low | — |
| `ExcelOperatorsTools` | Admin toolbar for Excel export/template/import of operators with dry-run preview, error reporting and confirm step; scoped to a market or global. | app/admin/markets/page.tsx, app/[marketSlug]/admin/operators/page.tsx | high | — |
| `FavoriteButton` | Star toggle button for adding/removing a market or operator from favorites via the useFavorites hook. | app/page.tsx, app/[marketSlug]/page.tsx, app/[marketSlug]/operators/page.tsx (+1) | low | — |
| `FavoritesSection` | Homepage section that resolves favorite market/operator IDs to display names via API and renders them as links; hidden when empty. | app/page.tsx | medium | — |
| `LocationFields` | Reusable form fields combining numeric lat/lng inputs, a Geolocation API 'Sono qui' button, and an optional dynamically-loaded LocationPicker map. | app/[marketSlug]/admin/operators/page.tsx, app/[marketSlug]/admin/operators/[id]/page.tsx, app/[marketSlug]/admin/s/[scheduleId]/page.tsx | medium | — |
| `LocationPicker` | Leaflet map with click-to-place + draggable marker for picking a single coordinate; optionally renders a polygon area overlay. | components/LocationFields.tsx | medium | — |
| `MarketAreaDrawer` | Leaflet+Geoman map for drawing/editing a single market-area polygon (GeoJSON Feature<Polygon>); used in admin place area editor. | app/[marketSlug]/admin/places/[placeId]/area/page.tsx | high | — |
| `MarketViewer` | Thin wrapper that renders UnifiedMapClient with showParkingNearby=true and a fixed default height. Replaces the old Google-Maps based market viewer. | app/[marketSlug]/page.tsx, components/ComuneSessionsExplorer.tsx | low | UnifiedMapClient |
| `MarketsQuickFinder` | Homepage search/filter widget over market session rows with text search + day filter (today/weekend/specific weekday). | app/page.tsx | medium | — |
| `NavMenu` | Slide-out navigation drawer listing all markets and their comuni, with search, role-aware admin links and auth login link. | components/Navigation.tsx | high | — |
| `Navigation` | Sticky top navigation bar: logo, menu button (opens NavMenu), weather widget, admin shortcut and auth state via Supabase. | components/Providers.tsx | medium | — |
| `NotificationProvider` | React context provider wrapping the Web Notifications API (requestPermission, sendNotification, current permission) with useNotifications hook. | components/Providers.tsx, app/[marketSlug]/weather/page.tsx | low | — |
| `OperatorCard` | Card UI for an operator (stall number, rating, languages, payment methods, social links, navigate-to-stall button). Currently UNUSED — not imported anywhere. |  | medium | app/[marketSlug]/operators/page.tsx (inline operator card render) |
| `OperatorFilters` | Search input + category buttons (all/food/clothing/…) used to filter operators on the per-market operators listing. | app/[marketSlug]/operators/page.tsx | low | — |
| `PhotoUploader` | Multi-file image uploader to a Supabase storage bucket (operator-photos or product-photos), returning public URLs and supporting removal. | app/operator/[id]/page.tsx, app/operator/[id]/products/page.tsx | medium | — |
| `Providers` | Root client wrapper that mounts NotificationProvider and the Navigation bar around app children. Used by app/layout.tsx. | app/layout.tsx | low | — |
| `Reveal` | Wrapper that applies a fade-up-on-scroll animation using the useReveal hook, with optional element tag and stagger delay. | app/page.tsx, app/aderisci/page.tsx, app/[marketSlug]/page.tsx (+1) | low | — |
| `UnifiedMap` | Core react-leaflet map handling market/parking/operator pins, custom div icons, polygon overlays, nearby-parking fetch (/api/parking), fitBounds and CARTO Voyager tiles. Exports UnifiedMapPin type. | components/UnifiedMapClient.tsx, components/MarketViewer.tsx (type import), app/page.tsx (type import) (+1) | high | — |
| `UnifiedMapClient` | Tiny next/dynamic ssr:false wrapper around UnifiedMap with a 'Caricamento mappa…' loading placeholder. | app/page.tsx, app/[marketSlug]/operators/page.tsx, components/MarketViewer.tsx | low | — |
| `WeatherWidget` | Compact weather widget for the current market: fetches current/hourly/daily forecast + alerts via API, maps conditions to lucide icons, renders inside the top navbar. | components/Navigation.tsx | high | — |
| `ZoneImage` | Image component that fetches a representative image for a comune via /api/comune-image with fallback query and a Liguria-themed SVG placeholder; optional hover zoom. | app/page.tsx, app/[marketSlug]/page.tsx, app/[marketSlug]/c/[comuneSlug]/page.tsx | low | — |
| `decorations (OliveSprig, WaveDivider, MountainSea, DoubleRule)` | Set of decorative inline-SVG components (olive sprig, wave divider, mountain+sea silhouette, double rule line) used as visual accents across the editorial UI. | app/cookie/page.tsx, app/privacy/page.tsx, app/aderisci/page.tsx (+8) | low | — |
| `admin/AdesioneStatoToggle` | Admin <select> control that PATCHes /api/admin/adesioni/[id] to change the state of a membership request (nuovo/in_contatto/aderito/scartato). | app/admin/adesioni/page.tsx | low | — |
| `analytics/PageviewTracker` | Side-effect-only component that POSTs a cookieless pageview event to /api/analytics/track on mount (type: market/operator/comune/homepage). | app/page.tsx, app/[marketSlug]/page.tsx, app/[marketSlug]/c/[comuneSlug]/page.tsx (+1) | low | — |

</details>

---

## API · 34 endpoint

Mapped 34 route.ts files in mercati-v2/app/api. Endpoints fall into three groups: public read-only data (parking/weather/news/events/markets/operators/schedules/places/products/comune-image), admin-write operations (POST/PUT/PATCH/DELETE on markets, operators, news, events, products, schedules, places, admins, adesioni, admin/sessions — protected via Supabase RLS + checks like `auth.getUser()` and `market_admins`/`super_admin` lookups, not middleware), and operator/citizen flows (adesioni form, analytics tracker, operator self-service via operators/me, operators/[id]/invite). Three endpoints appear orphaned: `/api/parking/nearby`, `/api/parking/osm`, and `/api/schedules/[id]/area` (the latter is replaced by `/api/places/[id]/area`). All other routes have at least one client caller in `app/` or `components/`. Note: middleware (`middleware.ts` + `lib/supabase/middleware.ts`) protects `/admin/*` pages with super_admin role, but does NOT gate `/api/*` paths — admin-only API enforcement is done in-route (RLS + explicit profile/market_admins checks).

**Endpoint apparentemente non usati:**

- `/api/parking/nearby`
- `/api/parking/osm`
- `/api/schedules/[id]/area`

<details><summary><b>Lista completa API</b></summary>

| Path | Metodi | Scopo | Admin only | Chiamato da |
|------|--------|-------|------------|-------------|
| `/api/parking` | GET | Find parkings near a market via Google Places (supports multi-point ?points=lat,lng\|... or single market via slug/coords), enriched with crowding. | — | components/UnifiedMap.tsx |
| `/api/parking/nearby` | GET | Legacy Ventimiglia-only parking search via Google Places with detailed pricing/availability estimation. | — | (none found — unused) |
| `/api/parking/osm` | GET | Legacy Ventimiglia parking fetcher from OpenStreetMap/Overpass API. | — | (none found — unused) |
| `/api/markets` | GET, POST | List all markets (GET) or create a new market zone (POST, admin). | — | app/admin/markets/page.tsx, app/admin/sessions/page.tsx, app/calendar/page.tsx, components/NavMenu.tsx, components/FavoritesSection.tsx |
| `/api/markets/[id]` | GET, PUT, DELETE | Read, update (with is_active cascade to schedules), or delete a single market. | ✓ | app/admin/markets/[id]/page.tsx, app/admin/sessions/page.tsx |
| `/api/markets/[id]/admins` | GET, POST, DELETE | List market admins, assign a user (by email) as market_admin, or revoke them. | ✓ | app/admin/markets/[id]/page.tsx |
| `/api/markets/[id]/places` | GET | List physical places (market_places) belonging to a market with their schedules. | — | app/[marketSlug]/admin/s/[scheduleId]/page.tsx, app/[marketSlug]/admin/places/[placeId]/area/page.tsx |
| `/api/markets/by-slug/[slug]` | GET | Resolve a market (plus its area) by slug for public market pages. | — | app/[marketSlug]/calendar/page.tsx, app/[marketSlug]/operators/page.tsx, app/[marketSlug]/admin/news/page.tsx, app/[marketSlug]/admin/events/page.tsx, app/[marketSlug]/admin/operators/page.tsx, app/[marketSlug]/admin/operators/[id]/page.tsx, app/[marketSlug]/admin/s/[scheduleId]/page.tsx |
| `/api/operators` | GET, POST | List operators (filterable by market/schedule/category/search, ?all=1 returns all) or create a new operator. | — | app/operatori/page.tsx, app/[marketSlug]/operators/page.tsx, app/[marketSlug]/admin/operators/page.tsx, app/[marketSlug]/admin/s/[scheduleId]/page.tsx, components/FavoritesSection.tsx |
| `/api/operators/me` | GET | Return the operator records linked to the logged-in user; auto-claims pending invites by email on first call. | — | app/login/page.tsx, app/operator/page.tsx, app/operator/[id]/page.tsx, app/operator/[id]/products/page.tsx |
| `/api/operators/[id]` | GET, PUT, DELETE | Read, update, or delete a single operator. | ✓ | app/operator/[id]/page.tsx, app/[marketSlug]/admin/operators/page.tsx, app/[marketSlug]/admin/operators/[id]/page.tsx, app/[marketSlug]/admin/s/[scheduleId]/page.tsx |
| `/api/operators/[id]/invite` | POST | Invite a user (by email) to claim an operator record; sends Supabase signup invite if email not yet registered. | ✓ | app/[marketSlug]/admin/operators/[id]/page.tsx |
| `/api/operators/[id]/products` | GET, POST | List or create products for an operator's catalog. | — | app/operator/[id]/products/page.tsx |
| `/api/operators/[id]/schedules` | GET, POST, DELETE | Manage operator presences (upsert/list/remove) in market_schedules via the M:N operator_schedules table. | ✓ | app/[marketSlug]/admin/operators/[id]/page.tsx, app/[marketSlug]/admin/s/[scheduleId]/page.tsx |
| `/api/operators/search` | GET | Cross-market operator search by text (name/code/description/stall) for assigning to sessions of other markets. | ✓ | app/[marketSlug]/admin/s/[scheduleId]/page.tsx |
| `/api/operators/export` | GET | Export operators+sessions to an .xlsx workbook (per-market or province-wide). | ✓ | components/ExcelOperatorsTools.tsx |
| `/api/operators/template` | GET | Download an empty .xlsx template for bulk operator import. | ✓ | components/ExcelOperatorsTools.tsx |
| `/api/operators/import` | POST | Import operators+presences from uploaded .xlsx (supports ?dryRun=1 preview); enforces super_admin or market_admin role. | ✓ | components/ExcelOperatorsTools.tsx |
| `/api/products/[id]` | PUT, DELETE | Update or delete a single product. | — | app/operator/[id]/products/page.tsx |
| `/api/schedules/[id]` | GET, PATCH | Read a market session or PATCH editable fields (is_active toggle with parent-zone consistency check). | ✓ | app/admin/sessions/page.tsx |
| `/api/schedules/[id]/area` | GET, PUT | Read or update the polygon/area_style of a market session (per-schedule areas). | ✓ | (none found — unused; places/[id]/area is used instead) |
| `/api/schedules/list` | GET | Flat list of active market_schedules (filterable by market id/slug) with parent market info and polygon. | — | app/[marketSlug]/weather/page.tsx, app/[marketSlug]/admin/s/[scheduleId]/page.tsx, app/[marketSlug]/admin/operators/[id]/page.tsx |
| `/api/schedules/occurrences` | GET | Expand recurring market_schedules into concrete date occurrences over a from/to window (defaults to -1mo..+13mo). | — | app/calendar/page.tsx, app/[marketSlug]/calendar/page.tsx, app/[marketSlug]/admin/operators/page.tsx, components/NavMenu.tsx |
| `/api/places/[id]/area` | GET, PUT | Read or update the polygon/area_style for a market_place (preferred over per-schedule areas). | ✓ | app/[marketSlug]/admin/places/[placeId]/area/page.tsx |
| `/api/events` | GET, POST | List events (by market or ?all=1) or create a new event. | — | app/calendar/page.tsx, app/[marketSlug]/calendar/page.tsx, app/[marketSlug]/admin/events/page.tsx |
| `/api/events/[id]` | PUT, DELETE | Update or delete a single event. | ✓ | app/[marketSlug]/admin/events/page.tsx |
| `/api/weather` | GET | Open-Meteo forecast (current + 12h hourly + 3-day daily) for a market's coords; localized WMO mapping and basic temperature alerts. | — | app/[marketSlug]/weather/page.tsx, components/WeatherWidget.tsx |
| `/api/news` | GET, POST | List news for a market or globally (?all=1 / ?admin=1 disables publish-window filter) or create a news item. | — | app/[marketSlug]/admin/news/page.tsx |
| `/api/news/[id]` | PUT, DELETE | Update or delete a news item. | ✓ | app/[marketSlug]/admin/news/page.tsx |
| `/api/admin/sessions` | GET | Admin-only flat list of ALL market_schedules (including is_active=false) for the global toggle dashboard. | ✓ | app/admin/sessions/page.tsx |
| `/api/admin/adesioni/[id]` | PATCH, DELETE | Admin updates the stato/note_admin on an adesioni_operatori row or deletes it. | ✓ | components/admin/AdesioneStatoToggle.tsx |
| `/api/adesioni` | POST | Public form submission: stores operator adhesion request (with honeypot + rate-limit + hashed IP) and emails the admin. | — | components/AdesioneForm.tsx |
| `/api/analytics/track` | POST | Records an analytics event (pageview/click/submit) with daily-rotated visitor hash and device-type detection. | — | components/analytics/PageviewTracker.tsx |
| `/api/comune-image` | GET | Returns a representative photo for an Italian comune from Wikipedia (filtering out coats of arms/maps); cached 12h. | — | components/ZoneImage.tsx |

</details>

---

## Superficie admin — da preservare

IMercati v2 has two admin surfaces: a super-admin area under `app/admin/**` (4 pages + 2 API routes) and a per-zone admin area under `app/[marketSlug]/admin/**` (6 pages). The super-admin dashboard centralizes stats, on/off toggles (zones cascade to sessions), Excel import/export, and the form-submission inbox (adesioni). Per-zone admin handles operators (with cross-market linking, M:N presences, and account invites), news (with global option for super-admin), events, drawing the polygon area per place, and per-session operator configuration. Only two components are exclusive to admin: `ExcelOperatorsTools` (Excel import/export) and `components/admin/AdesioneStatoToggle`. `MarketAreaDrawer` is referenced only from the admin places/area page. Shared form components (LocationFields, DaySelector, PhotoUploader, LocationPicker) are used by both admin and the operator dashboard.

**MUST preserve (17 feature critiche):**

- Super-admin dashboard (stats, KPI, top zones/operators, recent adesioni)
- Toggle on/off zones and sessions (Accendi/Spegni with cascade)
- Super-admin sessions API (all sessions including inactive)
- Gestione zone (CRUD markets, list + new + Excel tools)
- Market edit + market admin assignment
- Adesioni operatori inbox (super-admin)
- Adesione status PATCH/DELETE API
- AdesioneStatoToggle component (admin-only)
- Per-zone admin home (gestione zona + places + sessions overview)
- Per-zone operators list + Excel tools + create (with schedule binding)
- Per-zone operator edit (profile, M:N presences, account invite)
- Per-zone news/avvisi (with global flag for super-admin)
- Per-zone events CRUD
- Place area drawer (polygon per luogo, shared across sessions)
- Per-session admin (banchi della sessione: create, link existing cross-market)
- ExcelOperatorsTools component (export, template, import with dry-run preview)
- MarketAreaDrawer component (admin-only polygon editor)

| Feature | Entry path | Importanza | Descrizione |
|---------|------------|------------|-------------|
| Super-admin dashboard (stats, KPI, top zones/operators, recent adesioni) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\admin\page.tsx` | critical | Server-rendered dashboard aggregating counts (markets, sessions, operators, 7d views, new adesioni) plus tables of top markets/operators (last 30d) from market_stats_30d / operator_stats_30d views, and the 5 most recent adesioni. |
| Toggle on/off zones and sessions (Accendi/Spegni with cascade) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\admin\sessions\page.tsx` | critical | Filterable list of all sessions grouped by zone, with per-session and per-zone on/off toggle. Switching a zone cascades to all its sessions; hidden items disappear from calendar/map/search. |
| Super-admin sessions API (all sessions including inactive) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\api\admin\sessions\route.ts` | critical | GET endpoint returning ALL market_schedules (including is_active=false) for the toggle dashboard. Distinct from the public /api/schedules/list. |
| Gestione zone (CRUD markets, list + new + Excel tools) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\admin\markets\page.tsx` | critical | List of markets with create form (slug, name, city, center coordinates, default zoom, market_days, active flag) and embedded global ExcelOperatorsTools (super-admin import/export across all zones). |
| Market edit + market admin assignment | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\admin\markets\[id]\page.tsx` | critical | Edit market fields (slug, name, city, market_days, coords, zoom, active, description), delete market, and manage market admins (invite by email, remove). Calls /api/markets/[id]/admins. |
| Adesioni operatori inbox (super-admin) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\admin\adesioni\page.tsx` | critical | Lists submissions from the public /aderisci form with stato filter (nuovo/in_contatto/aderito/scartato), shows email warning if notification failed, embeds AdesioneStatoToggle for inline status changes. |
| Adesione status PATCH/DELETE API | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\api\admin\adesioni\[id]\route.ts` | critical | PATCH (update stato or note_admin, with allow-list) and DELETE for adesioni_operatori rows. Used by AdesioneStatoToggle. |
| AdesioneStatoToggle component (admin-only) | `c:\Users\emanu\Desktop\claude project\mercati-v2\components\admin\AdesioneStatoToggle.tsx` | critical | Inline select for changing an adesione stato, calls /api/admin/adesioni/[id]. Only used by app/admin/adesioni/page.tsx. |
| Per-zone admin home (gestione zona + places + sessions overview) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\admin\page.tsx` | critical | Server-rendered hub per zone: shortcut cards (operators / news / events), and per-place breakdown of sessions with counts of bound operators, links to draw area per place and configure each session. |
| Per-zone operators list + Excel tools + create (with schedule binding) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\admin\operators\page.tsx` | critical | Lists all operators of the zone, embeds ExcelOperatorsTools scoped to marketSlug, and provides a create form with optional schedule binding and LocationFields (map picker). |
| Per-zone operator edit (profile, M:N presences, account invite) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\admin\operators\[id]\page.tsx` | critical | Edit operator profile (name, category, code, stall, description), manage M:N presences across sessions (add/remove/edit position per session via LocationFields), and invite the operator user account via email. |
| Per-zone news/avvisi (with global flag for super-admin) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\admin\news\page.tsx` | critical | CRUD for news_items with title, content, type (schedule/notice/event/emergency), priority, publish_from/until window, and is_global checkbox (gated to super_admin role) to broadcast across all markets. |
| Per-zone events CRUD | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\admin\events\page.tsx` | critical | CRUD for market events with title, description, category (market/fair/food/music/art/sport/other), location, start_at/end_at, and free-text recurrence_rule. |
| Place area drawer (polygon per luogo, shared across sessions) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\admin\places\[placeId]\area\page.tsx` | critical | Loads/saves polygon_geojson for a market_place via /api/places/[id]/area, lists which session days share the area, uses MarketAreaDrawer component. |
| Schedule area redirect (legacy → place area) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\admin\s\[scheduleId]\area\page.tsx` | nice-to-have | Server redirect from schedule-level area URL to the place-level area page (or back to session if no place). Compatibility shim — could be inlined but keeps old URLs working. |
| Per-session admin (banchi della sessione: create, link existing cross-market) | `c:\Users\emanu\Desktop\claude project\mercati-v2\app\[marketSlug]\admin\s\[scheduleId]\page.tsx` | critical | Manage operators bound to a single market_schedule: create new banco with LocationFields, link existing operator (cross-market search via /api/operators/search), shows shared-area info from place, deep-link to draw place area. |
| ExcelOperatorsTools component (export, template, import with dry-run preview) | `c:\Users\emanu\Desktop\claude project\mercati-v2\components\ExcelOperatorsTools.tsx` | critical | Used in super-admin /admin/markets (global, all=1) and per-zone /[marketSlug]/admin/operators (scoped). Calls /api/operators/export, /api/operators/template, /api/operators/import (with dryRun preview showing willCreate/willUpdate/errors before commit). |
| MarketAreaDrawer component (admin-only polygon editor) | `c:\Users\emanu\Desktop\claude project\mercati-v2\components\MarketAreaDrawer.tsx` | critical | Leaflet-based polygon drawer, dynamically imported. Referenced only from the admin places/area page. |

---

## Brand audit · coerenza 7/10

IMercati has a genuinely distinctive, well-considered brand identity on its public surface: a 'Palette Ligure' of cream/ink/olive with sea+terra accents (all hex-locked in tailwind.config.js and reinforced in globals.css body and leaflet filters), a Fraunces+Inter pairing applied with editorial restraint (uppercase 0.22em eyebrows, italic olive accents, serif headings, tabular numerals), three semantically meaningful SVG marks (OliveSprig=land, MountainSea=territory, WaveDivider=water), and a remarkably consistent intimate, formal-'voi', place-rooted Italian voice that actively refuses tech buzzwords ('Senza promesse miracolose — un passo alla volta', 'Diventano persone, non solo banchi'). The system breaks down sharply once you leave the marketing/visitor pages: admin/operator/CRUD surfaces revert to default Tailwind gray + red + the legacy 'primary' scale, drop the serif, and switch voice register, making the back-office feel like a different product. Secondary weak spots: amber-tinted favorites chip on the operators page, two different error styles (terra vs red), MountainSea used only on the homepage, hardcoded 'Inter' literal in leaflet CSS, an orphan DoubleRule decoration, and uncontrolled Wikipedia thumbnail styling. Coherence on the brand-facing surface alone is ~9/10; weighted across the whole product including admin/operator areas it lands at 7/10. Key files: c:\\Users\\emanu\\Desktop\\claude project\\mercati-v2\\tailwind.config.js, app\\globals.css, app\\page.tsx, app\\[marketSlug]\\page.tsx, app\\aderisci\\page.tsx, components\\decorations.tsx, components\\MarketsQuickFinder.tsx, components\\AdesioneForm.tsx, app\\[marketSlug]\\operators\\page.tsx, app\\admin\\markets\\page.tsx, app\\operator\\page.tsx."

**Palette**

```json
{
  "tokens": {
    "cream-50": "#FCFAF5",
    "cream-100": "#F7F2E7",
    "cream-200": "#EDE4CE",
    "cream-300": "#E1D5B5",
    "ink": "#1F2813",
    "ink-soft": "#4A4F3B",
    "ink-muted": "#7A7968",
    "olive-100": "#EAEDDA",
    "olive-400": "#8FA05A",
    "olive-500": "#6B7F3A",
    "olive-600": "#54662B",
    "olive-700": "#3E4C1F",
    "sea-100": "#DCEAF0",
    "sea-500": "#2A5A75",
    "sea-600": "#1F4A62",
    "terra-100": "#F4DFD4",
    "terra-500": "#B75A40",
    "terra-600": "#9A4733"
  },
  "source": "tailwind.config.js (NOT tailwind.config.ts — that file does not exist; theme is declared in the .js config). Label in code: 'Palette Ligure'.",
  "usage": "Cream = page background + cards + dividers. Ink trio = text hierarchy (DEFAULT/soft/muted). Olive = brand accent for headings italic, CTAs, hover, OliveSprig, map polygons category 'alimentare'. Sea = wave divider + map polygons 'artigianato'. Terra = error state in AdesioneForm + map polygons 'antiquariato'.",
  "coherence": "Strong on public-facing pages (home, marketSlug, aderisci, MarketsQuickFinder, AdesioneForm). The body bg #F7F2E7 + body color #1F2813 are hard-coded in globals.css, reinforcing palette discipline. Leaflet tiles are filtered (saturate 0.78, sepia 0.06) to harmonize OSM with cream/olive — a thoughtful touch.",
  "breaks": "Admin and operator areas (app/operator/page.tsx, app/admin/markets/page.tsx, app/admin/markets/[id]/page.tsx, app/[marketSlug]/admin/*) use raw Tailwind gray-100/200/500/600/700/900 and red-600 instead of cream/ink/terra. The [marketSlug]/operators/page.tsx mixes brand tokens with amber-100/300/500/800 for 'preferiti' and red-50/200/700/800 for errors — off-palette. 271 occurrences of generic Tailwind palette across 23 files indicate the brand system is enforced only on the marketing/visitor surface.",
  "legacyShim": "Retains a 'primary' scale (50..900) for retrocompat — used in admin pages (focus:ring-primary-500, hover:text-primary-600). Functional but conceptually duplicates olive/ink and dilutes the named palette."
}
```

**Tipografia**

```json
{
  "families": {
    "serif": "Fraunces (CSS var --font-serif, fallback Georgia)",
    "sans": "Inter (CSS var --font-sans, fallback system-ui)"
  },
  "usage": {
    "font-serif": "Display + section headings (h1/h2/h3), italic for poetic accents (e.g. 'terra e di mare', 'IMercati', 'Entrate nel progetto.'), brand mark in footer, FullCalendar toolbar title, market card titles.",
    "font-sans": "Body, labels, UI chrome, leaflet popups & attribution (hardcoded 'Inter' literal in globals.css)."
  },
  "scale": "h1 5xl→7xl with leading-[1.02]/[1.04] and tracking-tight — strong editorial display. Eyebrows use uppercase text-[0.72rem] / text-xs with custom letterSpacing 'tracking-widest-plus' (0.22em). Tabular-nums applied to numerals (counts, times) — a subtle but consistent typographic detail.",
  "consistency": "Excellent on the public surface: every section opens with an uppercase eyebrow + serif H2, often with OliveSprig and a thin olive rule below. The pattern (eyebrow → serif title → italic olive accent → sprig+rule) repeats verbatim across home, market page, and aderisci — visually distinctive.",
  "breaks": "Admin pages drop the serif and use Tailwind defaults (text-3xl font-bold text-gray-900) — they look like a different product. Leaflet popup/control CSS hardcodes literal 'Inter' instead of var(--font-sans), so a future font swap at layout level would not propagate to the map chrome."
}
```

**Voce**

- Tono: *Intimate, editorial, place-rooted Italian. Anti-corporate, anti-buzzword. Uses 'voi' (formal/respectful 2nd person plural) when addressing operators — a deliberate, almost old-shop register. Short declarative lines with poetic pauses. Avoids 'piattaforma', 'soluzione', 'AI', 'innovativo'.*
- Registro: *Italian, formal-plural with operators ('Avete un banco', 'Entrate nel progetto', 'Vi accompagniamo', 'Raccontateci di voi'), neutral 3rd-person when describing the project. Cadence is editorial: clauses separated by em-dashes and periods, never exclamation marks. Numbers are concrete promises ('Risposta entro 48 ore', 'Cinque minuti').*

Esempi di copy che funziona:

> Mercati di terra e di mare.
>
> IMercati raccoglie in un unico posto i mercati settimanali della provincia di Imperia. Dove sono, quando, chi c'è. Per i cittadini, per i turisti, e per gli operatori che li fanno vivere.
>
> Un volto per chi sta dietro al banco. Ogni operatore ha la sua scheda: foto, storia, prodotti, dove e quando lo trovate. Diventano persone, non solo banchi.
>
> Un progetto indipendente, fatto sul territorio. Stiamo accompagnando i primi operatori a costruire la propria identità online. Senza promesse miracolose — un passo alla volta.
>
> Avete un banco al mercato? Entrate nel progetto.
>
> Stiamo cercando i primi operatori della provincia. Vi accompagniamo nei primi mesi a costruire la vostra presenza online, gratis. In cambio, vi chiediamo tempo e qualche storia da raccontare.
>
> Cinque minuti. Le risposte non hanno bisogno di essere perfette.
>
> Raccontateci qualcosa di voi — Da quanto lavorate, cosa vi rende diversi, cosa vi aspettate dal progetto…
>

**Incoerenze:**

- Admin page copy: 'Non risulta nessuna scheda operatore associata al tuo account. Chiedi all'amministratore del mercato di invitarti.' — switches to bureaucratic 'tu' + administrative tone; collides with the 'voi' editorial register established everywhere else.
- Quick finder utility strings ('Tutti', 'Weekend', 'Affina la ricerca o usa i filtri.') are functional but flat — the surrounding manifesto sets a higher bar; opportunity to keep micro-copy in voice.
- Footer line 'Dati aggiornati in tempo reale.' is borderline buzzword in an otherwise anti-buzzword voice. 'Aggiornati ogni giorno' would stay in tone.
- Mixed punctuation conventions: typographic ellipsis '…' appears in placeholders next to straight ASCII quotes ('Es. "Sanremo", "Mercoledì", "Piazza Goito"…') — Italian guillemets «» or curly quotes would match the editorial register.
- Apostrophes are correctly typeset via &apos; in most places ('c'è', 'Cos'è', 'd'idea') but the pattern relies on per-author discipline; a lint rule would lock it.

**Illustrazioni**

- **OliveSprig**: 
- **MountainSea**: 
- **WaveDivider**: 
- **DoubleRule**: 
- **System-level note**: 

**Punti deboli del brand:**

- Admin surfaces (app/admin/markets/*, app/operator/*, app/[marketSlug]/admin/*) use raw Tailwind gray + red palette and lose the serif. They feel like a generic CRUD app bolted onto an editorial site. Grep counted 271 off-palette utility uses across 23 files. This is the single biggest break in brand identity.
- Voice register switches inside admin/operator flows: shifts from formal 'voi' to clipped 'tu' or to flat administrative phrasing ('Non risulta nessuna scheda…') — breaks the intimate, place-rooted tone established on the marketing pages.
- Legacy 'primary' color scale in tailwind.config.js is still referenced by admin pages (focus:ring-primary-500, hover:text-primary-600). It duplicates olive/ink semantically and signals an incomplete migration from the old palette to 'Palette Ligure'.
- Error state styling is inconsistent: AdesioneForm uses bg-terra/10 border-terra/30 text-terra (brand-aligned), but [marketSlug]/operators/page.tsx uses bg-red-50 border-red-200 text-red-800 (generic). Same semantic, two visual languages.
- Favorites: [marketSlug]/operators/page.tsx uses amber-100/300/500/800 for the 'solo preferiti' chip — amber is not in the palette. A muted olive or terra accent would stay in family.
- tailwind.config.ts referenced in the audit prompt does not exist — the project uses tailwind.config.js. Minor, but suggests the team has not standardized config tooling.
- MountainSea illustration appears only on the homepage hero. The [marketSlug] page hero and the aderisci hero use only OliveSprig — they could carry a zone-specific atmospheric mark (mountain vs sea variant) to reinforce the 'terra e di mare' tagline at every entry point.
- DoubleRule decoration is defined but unused in the audited surfaces — orphan asset.
- Leaflet popup and zoom-control CSS hardcodes the literal string 'Inter' instead of var(--font-sans). A future font swap would skip these surfaces and create a visible inconsistency on the map (which is brand-critical territory since the map is described in code as 'identità IMercati').
- Footer microcopy 'Dati aggiornati in tempo reale' is a mild buzzword inside an otherwise carefully anti-buzzword voice — easy fix ('Dati aggiornati ogni giorno').
- MarketsQuickFinder placeholder mixes straight quotes with typographic ellipsis: 'Es. "Sanremo", "Mercoledì", "Piazza Goito"…' — Italian guillemets «» or curly quotes would match the editorial register elsewhere.
- ZoneImage cards (Wikipedia photos) are not stylistically controlled — they can read as generic stock thumbnails and dilute the bespoke editorial feel established by Fraunces + OliveSprig. A subtle duotone/sepia filter consistent with the leaflet tile filter (saturate 0.78, sepia 0.06) would tie them into the system.

---

## Pain point UX · 15 identificati

IMercati has a polished editorial brand voice (cream/olive/ink palette, Fraunces serif, OliveSprig decorations) that is consistently applied on public-facing pages but collapses entirely in the authenticated areas (operator dashboard, OperatorCard component) where generic Tailwind defaults (white cards, gray-700 labels, primary-600 buttons, blue/pink social links) clash with the rest. There are at least four divergent "operator card" implementations and three "stat/feature card" patterns that should be unified into shared components. Common citizen journeys (Home → Operatore detail) require 4 clicks despite the rich nesting under [marketSlug]/c/[comuneSlug]. Every page uses `export const dynamic = 'force-dynamic'` (44 files) with zero `loading.tsx` files and no skeletons — users see blank pages or inline "Caricamento…" text on every navigation. The market home page packs 7+ scroll sections (hero, finder, favorites, map, manifesto, zones, CTA, footer) onto a single screen, and the comune page nests a hero, sticky tabs, dettaglio card, map, operators list and prev/next nav inside an already-deep route. Admin uses native `confirm()` dialogs and `alert()` for destructive cascade operations, breaking visual continuity with the rest of the surface.

### Alta gravità

**Three+ competing 'operator card' implementations with conflicting styles**

- Dove: `components/OperatorCard.tsx:18-122 vs app/operatori/page.tsx:167-214 vs app/[marketSlug]/operators/page.tsx:213-252 vs app/operator/page.tsx:66-86`
- OperatorCard.tsx uses white bg, rounded-lg, shadow-lg, gray-900 text, blue-100/pink-600 social pills, primary-600 button — pure Tailwind generic. The /operatori hub renders its own cream-50 / olive-500 card inline with a 40px photo header. The market-scoped /[marketSlug]/operators page renders a third variant (bg-white border, olive-300 hover, with a 'Vedi sulla mappa' pill). The /operator hub renders a fourth variant (bg-white shadow rounded-xl, primary-50 placeholder, gray-100 chip). None share a component. Maintaining/restyling operator presentation requires touching four files and reasoning about four different visual languages.
- Impatta: Citizen browsing operators, Tourist scanning a market, Operator logging into their dashboard

**Operator dashboard breaks the editorial brand voice entirely**

- Dove: `app/operator/[id]/page.tsx:87-179 and app/operator/page.tsx:42-87`
- Public site is cream-100 / olive-500 / Fraunces serif with widest-plus tracking. The authenticated operator area switches to bg-white, text-gray-900, primary-100/primary-600 buttons, rounded-xl shadow, gray-300 inputs, generic 'Caricamento…' fallback. No OliveSprig, no serif headings, no cream palette. An operator who just clicked through a beautifully editorial site lands on what looks like a different product.
- Impatta: Operator onboarding after invite, Operator editing their stall profile, Operator uploading photos

**Every page is force-dynamic with zero loading skeletons**

- Dove: `44 files use 'export const dynamic = "force-dynamic"'; no app/**/loading.tsx exists`
- Server pages opt out of caching entirely (force-dynamic on app/page.tsx:15, app/[marketSlug]/page.tsx:15, app/[marketSlug]/c/[comuneSlug]/page.tsx:12, etc.) but provide no Suspense boundaries or loading.tsx files. Client pages fall back to a plain text 'Caricamento…' (operator/page.tsx:43, operator/[id]/page.tsx:87, operatori/page.tsx:152) or one centered spinner (app/[marketSlug]/operators/page.tsx:182-186). Users on slower connections see a blank or jumpy white screen on every route change and no perceived-performance buffer for the map, photos, or operator lists.
- Impatta: First page load from search/social, Navigating between zone/comune pages, Filtering operators

**Market home page is a 7-section scroll wall (cognitive overload)**

- Dove: `app/[marketSlug]/page.tsx:79-277`
- Above-the-fold has: back-to-Provincia link, hero photo (4/5 aspect), title block, OliveSprig + comuni count, description, market_days, AND a 460px MarketViewer map. Then a 4-up 'shortcut' grid (Banchi/Calendario/Notizie/Meteo), then 'I borghi' grid of comune cards with photos, then 'Mercati di questa zona' table-like list, then prev/next zone navigation. Five competing visual hierarchies (hero, shortcut nav, photo grid, list, prev/next) on one route. Users opening the page from a search link are immediately bombarded.
- Impatta: Tourist landing from Google, Citizen checking 'what's at my zone this week', Mobile users with limited viewport

**Common journey (Home → Operatore) takes 4 clicks minimum**

- Dove: `Routes: / → /[marketSlug] → /[marketSlug]/c/[comuneSlug] → operator link → /[marketSlug]/operators/[id]`
- From the homepage the only direct paths to a specific operator are: (a) /operatori hub (1 click but no map context), or (b) Zone card → Comune card → ComuneSessionsExplorer tab → Operator link = 4 clicks, with the operator list only visible after picking the right session tab inside ComuneSessionsExplorer (components/ComuneSessionsExplorer.tsx:192-226). The 'Banchi' shortcut on the zone page (app/[marketSlug]/page.tsx:73) takes you to the operators list but loses the comune/session context that the user was navigating toward.
- Impatta: Citizen looking for 'my baker at the Tuesday Camporosso market', Operator sharing their own profile URL, Discoverability of operators via map pins

### Media gravità

**ComuneSessionsExplorer hides operators behind an extra tab interaction**

- Dove: `components/ComuneSessionsExplorer.tsx:114-226`
- When a comune has multiple session days, the operators list is filtered by the selected tab (operatorsForSession = operators.filter(o => o.schedule_id === active.id), line 92-95). A user landing on /val-nervia/c/camporosso only sees the operators of the currently active tab, not all operators in the comune — with no affordance signaling that switching tabs reveals a different set of stalls. The empty-state copy 'Nessun operatore ancora registrato per questo mercato' (line 202) doesn't hint that they may exist under another tab.
- Impatta: Citizen searching for a specific seller, Tourist scanning what's available across the week

**Inconsistent button language: pill, rounded-full, rounded-md, rounded-sm in the same surface**

- Dove: `app/page.tsx:124-135 (rounded-full pills), app/[marketSlug]/operators/page.tsx:150-180 (rounded-full chips), app/operator/[id]/page.tsx:102-107 (rounded-md), components/OperatorCard.tsx:115 (rounded-md), app/admin/page.tsx:256-273 (rounded-sm)`
- Public hero CTAs and chips use rounded-full ink/olive. Admin uses rounded-sm cream cards. Operator dashboard uses rounded-md primary-600. Within the same /[marketSlug]/operators page, the favorites toggle is rounded-full while operator cards are rounded-sm and 'Indicazioni' is rounded-full ink. There is no shared Button primitive — every page invents its own.
- Impatta: All visual cohesion, Any future redesign work

**Stat / ActionCard / FeatureCard duplicated inline across admin pages**

- Dove: `app/admin/page.tsx:235-275 (Stat + ActionCard locally defined), app/[marketSlug]/admin/page.tsx:57-93 (similar cards inline), app/[marketSlug]/page.tsx:149-167 (features shortcut also a card grid)`
- The super-admin dashboard defines local Stat and ActionCard components. The market admin page reinvents nearly identical 'icon + title + desc + arrow' cards inline using the same olive/cream palette but with slightly different padding (p-5 vs p-4), different icon size (w-8 vs w-3.5), and different hover treatment. The zone home page renders yet another variant (the 4-up shortcut). Three almost-identical patterns, three implementations.
- Impatta: Admin task selection, Zone discovery on home, Brand consistency

**Native browser confirm() and alert() in admin destructive flows**

- Dove: `app/admin/sessions/page.tsx:62-82 (toggleMarket and toggleSession use confirm() and alert())`
- Cascade operations that turn off/on all sessions of a zone use the browser's confirm() dialog with a multi-line message ('Tutte le N sessioni... verranno SPENTE in cascata...') and report errors via alert(). This breaks the editorial visual continuity for the most consequential admin action and offers no styling, no undo, no consistent error surface. Users who manage many zones train themselves to dismiss the dialog quickly.
- Impatta: Super-admin seasonal market toggling, Bulk activation at the start of summer fairs

**Inconsistent hero treatment across page types**

- Dove: `app/page.tsx:101-139 (no photo, MountainSea decoration); app/[marketSlug]/page.tsx:82-145 (4/5 photo left + map right); app/[marketSlug]/c/[comuneSlug]/page.tsx:67-96 (smaller 220px photo left, no map in hero); app/operatori/page.tsx:94-111 (no photo, OliveSprig only); app/admin/page.tsx:83-89 (label + h1 + p, no decoration)`
- Five page templates, five different hero treatments. The provincia hero has no image but a huge MountainSea SVG. The zone hero has a portrait photo plus a map. The comune hero has a smaller portrait photo and no map. The operatori hub has no photo. The admin dashboards have a compact label + heading. There's no shared Hero component; aspect ratios (5/4, 4/5, 3/2) and decoration density vary by page, making the site feel like a collection of microsites rather than one product.
- Impatta: First impressions across all entry points, Hierarchy/wayfinding

**Two parallel admin information architectures: per-market vs super-admin**

- Dove: `app/admin/* (super-admin: dashboard, sessions, markets, adesioni) and app/[marketSlug]/admin/* (zone admin: places, schedules, operators, news, events)`
- Identical concerns (manage sessions, operators) live in two separate route trees with overlapping but non-identical menus. The super-admin dashboard at /admin lists 'Accendi/Spegni', 'Gestione zone', 'Adesioni'. The market-scoped admin at /[marketSlug]/admin lists 'Tutti i banchi', 'News', 'Eventi', plus a 'Gestione per luogo' section with per-place schedule rows. A user with both roles needs to learn two mental models. There is also no breadcrumb from /[marketSlug]/admin back to /admin.
- Impatta: Super-admin daily ops, Zone admin who is also super-admin

**OperatorCard.tsx component is defined but not used by the operators list**

- Dove: `components/OperatorCard.tsx (orphaned), Grep shows zero imports anywhere`
- The OperatorCard component (with the most complete UI: payment icons, social links, languages, rating, navigation CTA) is not imported anywhere — Grep for 'OperatorCard' returns only the file itself. Meanwhile /[marketSlug]/operators/page.tsx, /operatori/page.tsx, and /operator/page.tsx each roll their own minimal card. The richer, designed component sits dead in the tree while the pages render less informative versions.
- Impatta: Citizen evaluating an operator (sees less info than designed), Maintenance / future cleanup

**Schedule/session admin page mixes 4 unrelated tasks in one screen**

- Dove: `app/[marketSlug]/admin/s/[scheduleId]/page.tsx (state for: session info, place info with sibling schedules, area positions, operators list, create-operator form, link-existing-operator search)`
- Per-session admin manages: editing session fields, drawing a polygon area (linked to place), listing operators on the session, creating a new operator inline (showCreate state), and searching/linking an existing cross-market operator (showLink state with searchQ/searchResults). Five tasks behind two modal toggles on one page, fetched through three different API endpoints (markets/by-slug, schedules/list, markets/{id}/places). Cognitive load for the zone admin is high and discoverability of features (link existing operator) depends on the user knowing to click 'Link2'.
- Impatta: Zone admin onboarding new operators, Cross-market operator linking

### Bassa gravità

**Inconsistent container widths and paddings cause visual jumps between routes**

- Dove: `app/page.tsx:141 (no max-w), app/[marketSlug]/page.tsx:84 (max-w-6xl) then :147 (max-w-5xl); app/[marketSlug]/c/[comuneSlug]/page.tsx:69 (max-w-6xl) then :98 (max-w-5xl); app/[marketSlug]/operators/page.tsx:127 (max-w-6xl); app/[marketSlug]/operators/[id]/page.tsx:50 (max-w-4xl); app/operator/[id]/page.tsx:90 (max-w-3xl); app/admin/page.tsx:82 (max-w-6xl)`
- Six different max-width tokens across the app (no max-w, 6xl, 5xl, 4xl, 3xl, 2xl). Worse, within the same /[marketSlug]/page.tsx, the hero is max-w-6xl and the rest of the page is max-w-5xl, so content visibly shifts inward when scrolling past the hero. There's no Container primitive enforcing a system.
- Impatta: Reading flow, Visual continuity between hero and body sections

**Empty / error states have no shared visual language**

- Dove: `app/[marketSlug]/operators/page.tsx:188-191 (red-50/red-200/red-800), components/ComuneSessionsExplorer.tsx:200-203 (cream-50 border), app/operatori/page.tsx:154-159 (cream-50 border), app/operator/page.tsx:44-51 (centered text-2xl bold), app/admin/page.tsx:133 ('Nessun dato ancora' as italic text)`
- Error blocks use bright red Tailwind defaults; empty states alternate between cream-bordered boxes, plain italic text, and centered titles. No EmptyState / ErrorState primitive. The bright red error block in particular reads like a different application popped in.
- Impatta: Slow-network or filtering interactions, Admin pages with no rows yet

---

## User journeys · 4 personas

### Citizen — *Voglio sapere dove c'è il mercato sabato vicino a me*

**Step attuali:**

1. Atterra su / (HomePage) — vede hero 'Mercati di terra e di mare' con CTA 'Trova un mercato'
2. Clicca 'Trova un mercato' (anchor #trova) oppure scorre fino alla sezione MarketsQuickFinder
3. Clicca il chip 'Sabato' (uno dei 7 Chip in MarketsQuickFinder)
4. Scorre la lista di max 24 card filtrate (sorted alfabeticamente per comune) cercando un comune che conosce — non c'è ordinamento per distanza geografica
5. Per capire se è 'vicino' deve aprire ciascuna card (Link verso /[marketSlug]/c/[comuneSlug]) per vedere la mappa, oppure tornare alla home e usare la UnifiedMap nella sezione 'Dove sono i mercati'
6. Sulla ComunePage vede ComuneSessionsExplorer con la mappa del singolo comune, e finalmente capisce dove andare

**Punti di frizione:**

- Nessuna geolocalizzazione: 'vicino a me' non è una feature — il citizen deve sapere a memoria quali comuni sono vicini
- Il chip 'Sabato' filtra correttamente ma la lista è ordinata alfabeticamente, non per prossimità (sort in MarketsQuickFinder.tsx riga 73-82)
- La mappa principale (UnifiedMap) e il finder a chip sono due sezioni separate non sincronizzate: filtrare 'Sabato' nel finder non filtra i pin della mappa sotto
- La sigla del giorno è scritta in stringa libera ('ogni Sabato', '1° sabato del mese') quindi il filtro 'Sabato' può includere mercati che NON ci sono questo sabato (logica weekdayOf in MarketsQuickFinder)
- Tutti i 24+ risultati hanno la stessa gerarchia visiva: niente badge 'oggi' / 'questo weekend' / 'più vicino'
- Per vedere distanza/percorso bisogna fare almeno 3 click (home → chip Sabato → apri card comune) e poi serve uscire dal sito verso Google Maps

**Step ideali (target):**

1. Atterra su / — il sistema chiede permesso geolocalizzazione e mostra di default i 3 mercati di sabato più vicini (card con distanza in km e bottone 'Indicazioni')
2. Clicca direttamente la card del mercato preferito
3. Vede mappa + indicazioni stradali integrate (deep link a Google/Apple Maps con un solo tap)

### Tourist — *Sono in vacanza a Diano, c'è un mercato di prodotti tipici questa settimana?*

**Step attuali:**

1. Atterra su / e vede hero generico 'Provincia di Imperia' — non sa che 'Diano' corrisponde alla zona 'golfo-dianese'
2. Scorre alla sezione 'Un territorio, tappa per tappa' (lista zone editoriale) e cerca con gli occhi un nome che assomigli a 'Diano'
3. Trova la card 'Golfo Dianese' (con foto di Diano Marina come ZONE_HERO_COMUNE) e clicca → naviga a /golfo-dianese (MarketHomePage)
4. Sulla MarketHomePage vede l'hero zona, mappa e 4 feature link (Banchi, Calendario, Notizie, Meteo)
5. Per capire i 'prodotti tipici' deve cliccare /golfo-dianese/operators (lista banchi) oppure aprire una singola sessione /golfo-dianese/c/diano-marina per vedere la classifica per settori (settori field: alimentare/antiquariato/artigianato/varie)
6. Per sapere se c'è 'questa settimana' deve aprire /golfo-dianese/calendar oppure /calendar globale e cercare nelle prossime 7 giornate
7. In alternativa può usare il finder in homepage e digitare 'Diano' nella search — ma 5+ click totali sono necessari per arrivare alla risposta completa

**Punti di frizione:**

- Il sito non rileva la lingua/origine del visitatore: niente segnale 'sei turista, eccoti i mercati tipici della settimana'
- Il concetto 'prodotti tipici' non è un filtro pubblico: settori esiste nel DB (classifySchedule alimentare/antiquariato/artigianato/varie) ma la home non offre un chip 'Alimentare/Tipico'
- 'Questa settimana' non è un filtro nel finder: solo 'Oggi' e 'Weekend' come scorciatoie
- La mappatura comune→zona è implicita (Diano Marina = golfo-dianese): un turista non sa che deve cliccare 'Golfo Dianese'
- Nessuna pagina di tipo /diano-marina con sintesi 'tutto quello che succede qui questa settimana'
- Le card zone in homepage mostrano foto bella ma niente indicazione 'specialità: ortofrutta, fiori, antiquariato'

**Step ideali (target):**

1. Atterra su / e digita 'Diano' nel finder (o usa geolocalizzazione) — appare subito una card 'A Diano questa settimana'
2. Clicca la card e arriva su una pagina aggregata che lista le 2-3 sessioni dei prossimi 7 giorni filtrabili per 'Alimentare/Tipico'
3. Clicca il giorno desiderato e vede mappa + orari + foto dei banchi tipici

### Operator — *Voglio aderire al progetto e capire cosa devo fare*

**Step attuali:**

1. Atterra su / e vede in alto-destra dell'hero il CTA secondario 'Sei un operatore? Aderisci →' (Link a /aderisci) — oppure scorre fino in fondo alla sezione 'Per gli operatori' con CTA 'Aderisci al progetto →'
2. Clicca → naviga a /aderisci (AderisciPage)
3. Legge il manifesto ('Entra nel progetto IMercati', 'percorso gratuito', 'tempo e qualche storia')
4. Scorre fino al form AdesioneForm (sezione 'Raccontateci di voi')
5. Compila 6 campi: nome, email, telefono, attivita, mercatiFrequentati, messaggio + invia
6. Vede schermata di conferma 'Richiesta ricevuta — risposta entro 48 ore' — il flusso pubblico finisce qui. Per accedere alla dashboard operatore (/operator) deve aspettare che un admin lo censisca e gli mandi credenziali via email (login a /login?next=/operator)

**Punti di frizione:**

- Il copy spiega il 'perché' ma non il 'cosa succede dopo': niente roadmap visiva (passo 1 invio form → passo 2 ti chiamiamo → passo 3 scheda banco online)
- Nessun esempio di scheda operatore da vedere prima di iscriversi: l'operatore non sa che riceverà /operator/[id] con foto, descrizione, prodotti — manca un 'vedi una scheda esempio'
- Il form chiede 'mercati frequentati' come campo libero invece che multi-select sulle zone esistenti — operatore non sa se basta scrivere 'Diano' o serve essere precisi
- Tempo stimato implicito ('Cinque minuti') ma 6 campi liberi sono troppi al primo touch — basterebbe nome+email+telefono+attività
- Niente FAQ inline: 'è davvero gratis?', 'devo essere ambulante registrato?', 'posso togliere la scheda?'
- Nessun riferimento al portale /operator esistente per chi è già stato censito — un operatore che torna sul sito non sa che esiste un'area riservata

**Step ideali (target):**

1. Clicca 'Sei un operatore?' nell'hero
2. Vede una pagina che spiega in 3 step grafici + un mini-form 3 campi (nome, telefono, mercato dove lavori da dropdown) + 'guarda un esempio di scheda' (link a /operator/demo)
3. Compila e invia — riceve subito email con riepilogo e prossimi passi, e un link per pre-caricare 1 foto del banco se vuole

### Admin — *Devo spegnere temporaneamente le sessioni della prossima settimana per maltempo*

**Step attuali:**

1. Va su / (se non loggato) e naviga manualmente a /admin (non c'è link pubblico verso admin nella home/footer — middleware.ts protegge la rotta)
2. Se non loggato: redirect a /login → inserisce credenziali → torna su /admin (AdminRoot dashboard)
3. Sulla dashboard vede 5 stat + 3 ActionCard — clicca 'Accendi / Spegni' (ActionCard verso /admin/sessions)
4. Su /admin/sessions (AdminSessionsPage) vede in alto la griglia 'Zone aggregate' (toggle market-level con cascade) e sotto 'Sessioni singole' con filtri q/marketFilter/statusFilter
5. Non esiste filtro 'data': l'admin deve mentalmente identificare quali sessioni cadono nella prossima settimana guardando il campo `giorno` (stringa libera tipo 'ogni mercoledì')
6. Per ogni sessione da spegnere clicca il bottone Power → chiama PATCH /api/schedules/[id] con is_active=false — un click per sessione, no bulk action, no scheduling temporale
7. Per riaccenderle dopo la settimana di maltempo deve tornare e cliccare ON una per una (o spegnere/riaccendere la zona intera, ma il cascade riaccende anche sessioni che erano già OFF prima — il confirm avverte)

**Punti di frizione:**

- Nessuna selezione multipla / bulk toggle: per spegnere 20 sessioni servono 20 click + 20 round-trip API
- Nessun toggle 'temporaneo con data di riaccensione': il flag is_active è binario, l'admin deve ricordarsi di riaccendere manualmente lunedì prossimo
- Il modello dati 'giorno' è una stringa libera ('ogni martedì', '1° sabato del mese') — non c'è il concetto di occurrence-per-data, quindi non si può spegnere 'solo il sabato 14 giugno'
- Nessuna motivazione/log visibile per lo spegnimento: chi guarda il toggle OFF non sa se è maltempo, cancellazione, errore di import
- Il cascade zona→sessioni è all-or-nothing: utile per spegnere una zona intera ma pericoloso perché riaccendendo riaccende anche sessioni che erano OFF per altri motivi (il confirm() avverte ma non offre 'salva stato precedente')
- Nessuna comunicazione automatica verso il pubblico: spegnere una sessione la nasconde dalla mappa/calendario ma non genera banner 'mercato sospeso per maltempo'
- Nessuna preview 'cosa vedrà il cittadino dopo': l'admin deve aprire /[marketSlug] in un'altra tab per verificare

**Step ideali (target):**

1. Da /admin clicca 'Spegni per maltempo' (shortcut nuovo nella dashboard)
2. Seleziona range di date (lun-dom prossima settimana) + zone/sessioni con multi-select e motivo (preset 'Maltempo')
3. Conferma — il sistema applica is_active=false con data di riaccensione automatica e pubblica un banner 'Sospeso per maltempo dal X al Y' sulle pagine pubbliche interessate

