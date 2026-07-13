-- 0022_analytics_retention.sql
--
-- Retention per analytics_events (0015): e' l'unica tabella append-only che
-- cresce davvero (1 riga per ogni view/click, ~0,35 KB con indici). A traffico
-- di stagione puo' arrivare a ~35 MB/mese: senza pulizia riempirebbe il tetto
-- free di Supabase (500 MB DB) in ~14 mesi.
--
-- Strategia (nessuna PII: si tengono solo conteggi, mai il visitor_hash):
--   1. Rollup mensile in analytics_monthly -> aggregati compatti per mese,
--      tipo evento e target (market / operator / comune). Poche righe/mese.
--   2. Prune del raw -> elimina gli eventi grezzi piu' vecchi di N mesi
--      (default 18), DOPO il rollup. Le viste *_stats_30d guardano solo gli
--      ultimi 30 giorni, quindi il prune non tocca le dashboard.
--
-- ESEGUIRE TUTTO IL FILE (crea tabella + funzioni). Solo DOPO si puo' chiamare
-- select analytics_prune();  Idempotente: rieseguibile senza danni.

-- 1) Tabella rollup -----------------------------------------------------------
create table if not exists analytics_monthly (
  month        date        not null,     -- primo giorno del mese (UTC)
  event_type   text        not null,
  market_id    uuid,
  operator_id  uuid,
  comune       text,
  events       integer     not null default 0,   -- totale eventi nel mese
  uniques      integer     not null default 0,   -- visitor_hash distinti nel mese
  rolled_at    timestamptz not null default now()
);

-- Indice per il delete/query per mese (il rollup ricostruisce il mese intero,
-- quindi l'unicita' e' garantita dal pattern DELETE+INSERT, non serve un vincolo).
create index if not exists analytics_monthly_month_idx
  on analytics_monthly (month, event_type);

alter table analytics_monthly enable row level security;
drop policy if exists analytics_monthly_admin_read on analytics_monthly;
create policy analytics_monthly_admin_read on analytics_monthly
for select using (
  exists (select 1 from profiles
          where profiles.id = auth.uid() and profiles.role = 'super_admin')
);

-- 2) Rollup di un singolo mese (idempotente: DELETE del mese + INSERT fresco) --
create or replace function analytics_rollup_month(p_month date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  m date := date_trunc('month', p_month)::date;
  n integer;
begin
  delete from analytics_monthly where month = m;

  insert into analytics_monthly
    (month, event_type, market_id, operator_id, comune, events, uniques, rolled_at)
  select
    m, e.event_type, e.market_id, e.operator_id, e.comune,
    count(*),
    count(distinct e.visitor_hash),
    now()
  from analytics_events e
  where e.created_at >= m
    and e.created_at <  m + interval '1 month'
  group by e.event_type, e.market_id, e.operator_id, e.comune;

  get diagnostics n = row_count;
  return n;
end;
$$;

-- 3) Rollup di tutti i mesi CONCLUSI presenti nel raw -------------------------
create or replace function analytics_rollup()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  m     date;
  total integer := 0;
begin
  for m in
    select distinct date_trunc('month', created_at)::date
    from analytics_events
    where created_at < date_trunc('month', now())   -- solo mesi gia' conclusi
    order by 1
  loop
    total := total + analytics_rollup_month(m);
  end loop;
  return total;
end;
$$;

-- 4) Prune del raw (fa PRIMA il rollup, cosi' non si perde nulla in aggregato).
--    Ritorna il numero di righe grezze eliminate.
create or replace function analytics_prune(p_keep interval default interval '18 months')
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  n bigint;
begin
  perform analytics_rollup();
  delete from analytics_events where created_at < now() - p_keep;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Le funzioni girano come owner (security definer): niente esecuzione ad anon.
revoke all on function analytics_rollup_month(date) from public;
revoke all on function analytics_rollup()          from public;
revoke all on function analytics_prune(interval)   from public;

-- ---------------------------------------------------------------------------
-- USO MANUALE (dal SQL editor di Supabase, come super_admin/service_role):
--   select analytics_prune();                    -- rollup + prune a 18 mesi
--   select analytics_prune(interval '12 months');-- finestra piu' corta
--   select analytics_rollup();                   -- solo aggrega, non elimina
--   select analytics_rollup_month(date '2026-06-01');
--
-- Controllo spazio:
--   select pg_size_pretty(pg_total_relation_size('analytics_events'));
--   select count(*) from analytics_events;
--
-- 5) (OPZIONALE) schedulazione mensile via pg_cron ---------------------------
-- Abilita l'estensione da Supabase Dashboard > Database > Extensions (pg_cron),
-- poi togli il commento:
--
--   create extension if not exists pg_cron;
--   select cron.schedule(
--     'analytics-maintain', '0 4 1 * *',          -- 04:00 del 1o giorno del mese
--     $$ select public.analytics_prune(); $$);
