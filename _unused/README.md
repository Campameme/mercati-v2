# _unused — quarantena file non utilizzati

File **senza alcun importatore/chiamante** nel progetto (dead code), spostati qui
il 2026-06-30 dopo un audit con agenti su `components/`, `lib/`, `types/`,
`hooks/`, `app/api/` e le pagine. La cartella è **esclusa** da TypeScript/Next
(`tsconfig.json` → `exclude: ["_unused"]`), quindi non viene compilata né inclusa
nel bundle.

I percorsi qui sotto **rispecchiano la posizione originale**: per ripristinare un
file basta rispostarlo da `_unused/<percorso>` a `<percorso>`.

## Componenti orfani (residui di prototipo, 0 import)
- `components/home/DiveLoader.tsx` — loader "apnea" del tuffo, mai importato.
- `components/home/IntroFilm.tsx` — intro-film del tuffo, mai importato.
- `components/home/StoryLoop.tsx` — loop dei 3 valori; scollegato quando la home è passata all'hero "acqua".
- `components/home/StorySection.tsx` — vecchia sezione storia, superata.
- `components/home/ZonesSection.tsx` — vecchie card zone, superate.

## Route/pagina orfane (superate, nessun chiamante)
- `app/api/schedules/[id]/area/route.ts` — sostituita da `/api/places/[id]/area`.
- `app/[marketSlug]/admin/s/[scheduleId]/area/page.tsx` — shim di redirect legacy, non linkato da nessuna UI (l'area si disegna da `…/admin/places/[placeId]/area`). ⚠️ Spostandolo, il vecchio URL non fa più redirect (admin-only, già superato).

## Aggiornamento 2026-07-02 — parcheggi Google + stub redirect
- `app/api/parking/route.ts` — API parcheggi via Google Places (senza billing
  rispondeva sempre errore): sostituita dai parcheggi statici OSM
  (`lib/markets/parkings.ts`) letti direttamente in `UnifiedMap`.
- `lib/parking/crowding.ts` — enrichment "affollamento", usato solo dall'API sopra.
- `app/parcheggi/page.tsx` e `app/[marketSlug]/parking/page.tsx` — pagine-stub di
  solo redirect: ora sono `redirects()` in `next.config.js` (→ `/mappa` e → `/[slug]`).

## Tenuti (NON spostati)
- `/prototipo` e tutta `app/versioni/**` → esplorazioni intenzionali (la galleria è già isolata e cancellabile a parte).
- `lib/`, `types/`, `hooks/` → tutti i file risultano usati.
