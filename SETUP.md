# Setup Mercati della Riviera di Ponente

Guida ai mercati da **Ventimiglia a Varazze** (province di Imperia e Savona): 15 zone,
pagine comune con descrizioni curate, mercati tipici con ricorrenze, mappa unificata.

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
   `supabase/migrations/0001…0019` e poi `supabase/seed.sql`).
   - `0007` seeda le 8 zone della provincia di Imperia (41 sessioni).
   - `0019` seeda le 7 zone della provincia di Savona (83 sessioni, generate da
     `mercatini_della_provincia_di_savona.xls`).
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

## 4. Deploy su Netlify
- Aggiungi le stesse env vars nel dashboard Netlify (*Site settings → Environment variables*),
  anche per il contesto **branch deploy** se usi i branch.
- Push su `main`: il plugin `@netlify/plugin-nextjs` costruisce automaticamente.

## 5. Contenuti curati (dove si modificano)
- **Zone** (nome, borghi, carattere, racconto): `lib/markets/zones.ts`
- **Comuni** (descrizione con le peculiarità): `lib/markets/comuni.ts`
- **Copy della home** (claim, sezioni, 4 lingue): `lib/i18n/homeCopy.ts`
- **Fotografie dei borghi** (selezione curata + crediti): `lib/zonePhotos.ts` + `public/zone/`
- **Regole operative**: `CLAUDE.md` · **voce**: `docs/brand-voice.md` · **grafica**: `docs/brand-system.md`

## 6. Sezioni del sito
- `/` home · `/mappa` esplora (solo merci varie) · `/tipici` mercati tipici con
  mappa e calendario propri (`/eventi` e `/calendar` reindirizzano qui)
- `/{zona}` pagina zona · `/{zona}/c/{comune}` pagina comune ("Scegli un giorno" + vicini)
- `/notizie` bacheca (DB + stampa live) · `/operatori` i Maestri · `/crediti` crediti foto
