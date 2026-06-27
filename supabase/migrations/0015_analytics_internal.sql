-- 0015_analytics_internal.sql
--
-- Tracking interno cookieless per IMercati. Niente PII, niente cookie analytics.
-- Salviamo view + interazione su contenuti pubblici (mercati, operatori).
-- Privacy by design: solo hash visitor (sha256(ip + ua + salt)) per dedup;
-- nessun IP in chiaro, nessun ID utente cross-session a meno che logged-in.

create table if not exists analytics_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),

  event_type text not null check (event_type in (
    'view_market',     -- visualizzato profilo zona/mercato
    'view_operator',   -- visualizzato profilo operatore
    'view_comune',     -- visualizzata pagina comune
    'view_homepage',
    'click_market',    -- click su un mercato dalla mappa/lista
    'click_operator',
    'click_adesione',  -- click sul bottone aderisci
    'submit_adesione'  -- form adesione inviato con successo
  )),

  -- Target dell'evento (uno solo dovrebbe essere valorizzato per evento)
  market_id uuid references markets(id) on delete cascade,
  operator_id uuid references operators(id) on delete cascade,
  schedule_id uuid references market_schedules(id) on delete cascade,
  comune text,
  path text,                       -- URL path raw, per audit

  -- Dimensioni privacy-safe
  visitor_hash text,               -- sha256(ip+ua+salt+day), ruota ogni giorno
  referrer_host text,              -- solo hostname referrer (no path con query)
  device_type text check (device_type in ('mobile', 'tablet', 'desktop')),
  is_unique boolean default true   -- false se stesso visitor_hash ha gia visto stesso target oggi
);

create index if not exists analytics_events_type_idx on analytics_events (event_type, created_at desc);
create index if not exists analytics_events_market_idx on analytics_events (market_id, created_at desc) where market_id is not null;
create index if not exists analytics_events_operator_idx on analytics_events (operator_id, created_at desc) where operator_id is not null;
create index if not exists analytics_events_created_idx on analytics_events (created_at desc);

alter table analytics_events enable row level security;

-- INSERT: pubblico ma solo via service-role (API server-side).
-- Anon non puo inserire direttamente — l'API e l'unico path.
drop policy if exists analytics_insert_service on analytics_events;
-- Nessuna policy INSERT per ruolo anon/authenticated: solo service_role bypassa RLS.

-- SELECT: solo super_admin
drop policy if exists analytics_admin_read on analytics_events;
create policy analytics_admin_read on analytics_events
for select using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  )
);

-- View aggregata: per ogni operatore, totale views + unique per ultimi N giorni.
-- Materializza nulla; e una vista on-the-fly che la dashboard interroga.
create or replace view operator_stats_30d as
select
  o.id as operator_id,
  o.name as operator_name,
  o.market_id,
  coalesce(count(*) filter (where e.created_at > now() - interval '30 days'), 0) as views_30d,
  coalesce(count(distinct e.visitor_hash) filter (where e.created_at > now() - interval '30 days'), 0) as unique_visitors_30d,
  coalesce(count(*) filter (where e.created_at > now() - interval '7 days'), 0) as views_7d,
  max(e.created_at) as last_view_at
from operators o
left join analytics_events e
  on e.operator_id = o.id
  and e.event_type in ('view_operator', 'click_operator')
group by o.id, o.name, o.market_id;

-- Stesso per markets
create or replace view market_stats_30d as
select
  m.id as market_id,
  m.slug as market_slug,
  m.name as market_name,
  coalesce(count(*) filter (where e.created_at > now() - interval '30 days'), 0) as views_30d,
  coalesce(count(distinct e.visitor_hash) filter (where e.created_at > now() - interval '30 days'), 0) as unique_visitors_30d,
  coalesce(count(*) filter (where e.created_at > now() - interval '7 days'), 0) as views_7d,
  max(e.created_at) as last_view_at
from markets m
left join analytics_events e
  on e.market_id = m.id
  and e.event_type in ('view_market', 'click_market')
group by m.id, m.slug, m.name;

grant select on operator_stats_30d to authenticated, anon;
grant select on market_stats_30d to authenticated, anon;
-- Anche se grant a anon, RLS sotto blocca: views derivano da analytics_events
-- ma operators/markets sono pubbliche. Le views espongono solo aggregati per id pubblico.
