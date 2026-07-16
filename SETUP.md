# Setup — I Mercati della Riviera dei Fiori

Guida ai mercati settimanali della **provincia di Imperia, da Ventimiglia a
Diano/Cervo**: 8 zone, pagine comune con descrizioni curate, mercati tematici
con ricorrenze, mappa unificata con calendario.

## 1. Installazione
```
git clone https://github.com/Campameme/mercati-v2.git
cd mercati-v2
npm install
```

## 2. Supabase
1. Crea un progetto su https://supabase.com (free tier va bene).
2. Dalle impostazioni del progetto recupera:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (sezione *API → service_role*)
   - `SUPABASE_DB_URL` (*Project Settings → Database → Connection string → URI*)
3. Copia `.env.local.example` → `.env.local` e riempi i valori.
4. Applica le migrazioni: `npm run migrate` (idempotente: applica in ordine
   `supabase/migrations/0001…` e poi `supabase/seed.sql`).
   - `0007` seeda le 8 zone della provincia di Imperia (41 sessioni).
   - `0024` rimuove la provincia di Savona (presente solo storicamente).
   - `0025` aggiunge il ruolo `news_editor` (la redazione) e lo stato
     bozza/pubblicata delle notizie.
5. (Opzionale) Affina le coordinate dei luoghi: `node scripts/geocode-schedules.mjs --dry`
   e poi senza `--dry`. Richiede una chiave Google con **Geocoding API** abilitata
   (`GOOGLE_PLACES_API_KEY` o `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`).

## 3. Primo super-admin
1. Avvia `npm run dev` → apri `http://localhost:3000/login`, crea un account (Registrati).
2. Conferma l'email dal link Supabase (o disattiva la conferma email dalle Auth settings in dev).
3. Nel SQL Editor esegui:
   ```sql
   update profiles set role = 'super_admin' where id = (
     select id from auth.users where email = 'tuo@email.it'
   );
   ```
4. Rientra da `/login` → verrai reindirizzato a `/admin/markets`.

Per un **redattore notizie** (accesso solo alla redazione `/redazione`):
stesso giro, ma `role = 'news_editor'`.

## 4. Deploy
- **Produzione = Vercel** (mercatidiponente.it): push su `main` → deploy
  automatico. Env vars nel dashboard Vercel.
- Netlify (mercati-fiere.netlify.app) è collegato ma **legacy**.

## 5. Contenuti curati (dove si modificano)
- **Zone** (nome, borghi, carattere, racconto): `lib/markets/zones.ts`
- **Comuni** (descrizione con le peculiarità): `lib/markets/comuni.ts`
- **Copy della home** (claim, sezioni, 4 lingue): `lib/i18n/homeCopy.ts`
- **Fotografie dei borghi** (selezione curata + crediti): `lib/zonePhotos.ts` + `public/zone/`
- **Regole operative**: `CLAUDE.md` · **voce**: `docs/brand-voice.md` · **grafica**: `docs/brand-system.md`

## 6. Sezioni del sito
- `/` home · `/mappa` tutti i mercati (principali + tematici) con toggle
  Mappa ⇄ Calendario (`/eventi`, `/calendar` e il vecchio `/tipici`
  reindirizzano qui)
- `/{zona}` pagina zona (con parcheggi) · `/{zona}/c/{comune}` pagina comune
- `/notizie` avvisi ufficiali dei mercati e dei comuni (dal DB, via la redazione)
- `/operatori` i banchi di fiducia · `/aderisci` entra nella rete · `/crediti` crediti foto
- `/redazione` gestione notizie (news_editor / super_admin)
