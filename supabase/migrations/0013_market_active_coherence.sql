-- 0013_market_active_coherence.sql
--
-- Coerenza is_active tra markets (zone) e market_schedules (sessioni).
-- Regola: una sessione non puo essere attiva se la zona parent e spenta.
-- Il toggle di zona in cascata e gia gestito da app/api/markets/[id]/route.ts (PUT)
-- ma serve un'invariante DB-level per evitare divergenze (import, query manuali, ecc.).
--
-- Implementazione: trigger BEFORE INSERT/UPDATE che forza is_active=false
-- quando il market parent e is_active=false. Non solleva errore — silenzia il
-- valore in modo idempotente, cosi import bulk e patch parziali non falliscono.

create or replace function enforce_schedule_active_under_market()
returns trigger
language plpgsql
as $$
declare
  parent_active boolean;
begin
  if new.is_active is true then
    select is_active into parent_active
    from markets
    where id = new.market_id;

    if parent_active is false then
      new.is_active := false;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_schedule_active_under_market on market_schedules;
create trigger trg_schedule_active_under_market
before insert or update of is_active, market_id on market_schedules
for each row
execute function enforce_schedule_active_under_market();

-- Backfill: se per qualche motivo esistono sessioni attive con zona spenta,
-- correggile ora.
update market_schedules s
set is_active = false
from markets m
where s.market_id = m.id
  and m.is_active = false
  and s.is_active = true;
