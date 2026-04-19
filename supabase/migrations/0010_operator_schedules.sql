-- IMercati: relazione M:N tra operatori e sessioni di mercato.
-- Un operatore può frequentare più sessioni (es. Mario → mercoledì Imperia + sabato Sanremo),
-- ciascuna con posizione e numero banco specifici.
--
-- La vecchia colonna operators.schedule_id resta come fallback legacy.
-- Le nuove feature (profilo/hub/excel) usano operator_schedules.

create table if not exists operator_schedules (
  operator_id uuid not null references operators(id) on delete cascade,
  schedule_id uuid not null references market_schedules(id) on delete cascade,
  location_lat double precision,
  location_lng double precision,
  stall_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (operator_id, schedule_id)
);

create index if not exists operator_schedules_schedule_idx on operator_schedules(schedule_id);
create index if not exists operator_schedules_operator_idx on operator_schedules(operator_id);

-- Coerenza: schedule deve appartenere allo stesso market_id dell'operatore
create or replace function operator_schedules_coherent()
returns trigger
language plpgsql
as $$
declare
  op_market uuid;
  sch_market uuid;
begin
  select market_id into op_market from operators where id = new.operator_id;
  select market_id into sch_market from market_schedules where id = new.schedule_id;
  if op_market is null or sch_market is null then
    raise exception 'operator_schedules: operatore o sessione inesistenti';
  end if;
  if op_market <> sch_market then
    raise exception 'operator_schedules: operatore (market=%) e sessione (market=%) appartengono a mercati diversi', op_market, sch_market;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists operator_schedules_coherent_trg on operator_schedules;
create trigger operator_schedules_coherent_trg
  before insert or update on operator_schedules
  for each row execute function operator_schedules_coherent();

-- RLS
alter table operator_schedules enable row level security;

drop policy if exists op_sched_select_public on operator_schedules;
create policy op_sched_select_public on operator_schedules
  for select using (true);

drop policy if exists op_sched_write_admin on operator_schedules;
create policy op_sched_write_admin on operator_schedules
  for all using (
    exists (
      select 1 from operators o
      where o.id = operator_schedules.operator_id
        and (
          exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'super_admin')
          or exists (select 1 from market_admins ma where ma.market_id = o.market_id and ma.user_id = auth.uid())
        )
    )
  ) with check (
    exists (
      select 1 from operators o
      where o.id = operator_schedules.operator_id
        and (
          exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'super_admin')
          or exists (select 1 from market_admins ma where ma.market_id = o.market_id and ma.user_id = auth.uid())
        )
    )
  );

-- Backfill: migra operators.schedule_id esistenti in operator_schedules
insert into operator_schedules (operator_id, schedule_id, location_lat, location_lng, stall_number)
select id, schedule_id, location_lat, location_lng, stall_number
from operators
where schedule_id is not null
on conflict (operator_id, schedule_id) do nothing;
