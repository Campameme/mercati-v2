-- ============================================================
-- 0021 — Operatori multi-mercato con posizione per mercato
-- Un Maestro può stare in PIÙ mercati (zone); per ciascuno ha una posizione
-- sulla mappa e un numero di banco. `operators.market_id` resta come mercato
-- "principale" (il primo assegnato) per compatibilità con RLS e query esistenti.
-- Idempotente.
-- ============================================================

-- Email di contatto/accesso dell'operatore (per inviare il link di accesso).
alter table operators add column if not exists email text;

create table if not exists operator_markets (
  operator_id uuid not null references operators(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  location_lat double precision,
  location_lng double precision,
  stall_number text,
  created_at timestamptz not null default now(),
  primary key (operator_id, market_id)
);

create index if not exists operator_markets_market_idx on operator_markets(market_id);
create index if not exists operator_markets_operator_idx on operator_markets(operator_id);

alter table operator_markets enable row level security;

drop policy if exists op_markets_select_public on operator_markets;
create policy op_markets_select_public on operator_markets
  for select using (true);

drop policy if exists op_markets_write_admin on operator_markets;
create policy op_markets_write_admin on operator_markets
  for all using (
    is_super_admin(auth.uid()) or is_market_admin(auth.uid(), operator_markets.market_id)
  ) with check (
    is_super_admin(auth.uid()) or is_market_admin(auth.uid(), operator_markets.market_id)
  );

-- Backfill: ogni operatore esistente entra nel suo mercato principale con la
-- posizione che aveva su operators.
insert into operator_markets (operator_id, market_id, location_lat, location_lng, stall_number)
select id, market_id, location_lat, location_lng, stall_number
from operators
where market_id is not null
on conflict (operator_id, market_id) do nothing;
