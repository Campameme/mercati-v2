-- IMercati: area disegnabile per ogni sessione + operatori cross-market + codice mnemonico.

-- 1) Area (poligono) per singola sessione di mercato
alter table market_schedules
  add column if not exists polygon_geojson jsonb,
  add column if not exists area_style jsonb default '{"color":"#7d8f4e","fillOpacity":0.18}'::jsonb,
  add column if not exists area_updated_at timestamptz,
  add column if not exists area_updated_by uuid references auth.users(id);

-- 2) Codice mnemonico operatore (univoco per gestione import Excel cross-market)
alter table operators
  add column if not exists code text;

-- Codice univoco se presente (case-insensitive)
create unique index if not exists operators_code_unique_idx
  on operators (lower(code))
  where code is not null;

-- 3) Operatori cross-market: rimuovo il vincolo di coerenza market_id su operator_schedules
--    in modo che un operatore "registrato" su un market possa avere presenze in altre zone.
--    Manteniamo il trigger per sincronizzare updated_at ma senza il check di coerenza.
create or replace function operator_schedules_coherent()
returns trigger
language plpgsql
as $$
begin
  -- valida solo che entrambi gli ID esistano
  if not exists (select 1 from operators where id = new.operator_id) then
    raise exception 'operator_schedules: operatore inesistente';
  end if;
  if not exists (select 1 from market_schedules where id = new.schedule_id) then
    raise exception 'operator_schedules: sessione inesistente';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- 4) RLS: aggiorno write su operator_schedules così che possa scriverlo
--    chi è admin del market dell'operatore OPPURE del market della sessione.
drop policy if exists op_sched_write_admin on operator_schedules;
create policy op_sched_write_admin on operator_schedules
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'super_admin')
    or exists (
      select 1 from operators o
      join market_admins ma on ma.market_id = o.market_id and ma.user_id = auth.uid()
      where o.id = operator_schedules.operator_id
    )
    or exists (
      select 1 from market_schedules s
      join market_admins ma on ma.market_id = s.market_id and ma.user_id = auth.uid()
      where s.id = operator_schedules.schedule_id
    )
  ) with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'super_admin')
    or exists (
      select 1 from operators o
      join market_admins ma on ma.market_id = o.market_id and ma.user_id = auth.uid()
      where o.id = operator_schedules.operator_id
    )
    or exists (
      select 1 from market_schedules s
      join market_admins ma on ma.market_id = s.market_id and ma.user_id = auth.uid()
      where s.id = operator_schedules.schedule_id
    )
  );
