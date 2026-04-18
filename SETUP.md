# Setup Mercati-v2 (Fase 1)

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
3. Copia `.env.local.example` → `.env.local` e riempi i valori.
4. Applica le migrazioni: nel SQL Editor di Supabase esegui in ordine
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/seed.sql`

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
- Aggiungi le stesse env vars nel dashboard Netlify (*Site settings → Environment variables*).
- Push su `main`: il plugin `@netlify/plugin-nextjs` costruisce automaticamente.

## 5. Cosa c'è in Fase 1
- Auth reale via Supabase (no più password hard-coded).
- Multi-mercato: super-admin crea mercati da `/admin/markets` e assegna admin.
- Market-admin disegna l'area mercato in `/{slug}/admin/area` (Leaflet + Geoman).
- Parcheggi, meteo e operatori scoped al mercato corrente.
- Area disegnata visualizzata automaticamente sulla mappa pubblica dei parcheggi.

## 6. Roadmap Fase 2/3
- CMS news/eventi con tabelle DB e UI admin.
- Dashboard operatore con prodotti e Storage Supabase per immagini.
- AI Vision (Gemini Flash) per classificare pieno/vuoto dei parcheggi da webcam pubbliche.
