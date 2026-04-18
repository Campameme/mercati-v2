-- IMercati: collega gli operatori a una specifica sessione (market_schedules)
-- Un operatore può stare su UNA sessione (es. Imperia martedì Porto Maurizio),
-- oppure restare null e applicarsi all'intera zona (fallback).

alter table operators add column if not exists schedule_id uuid references market_schedules(id) on delete set null;
create index if not exists operators_schedule_id_idx on operators(schedule_id);

-- Vincolo di coerenza: se schedule_id è settato, la sessione deve appartenere
-- allo stesso market_id dell'operatore. (Implementato come trigger perché
-- Postgres non permette subquery dentro i CHECK.)
create or replace function operators_schedule_coherent()
returns trigger
language plpgsql
as $$
begin
  if new.schedule_id is not null then
    perform 1 from market_schedules
    where id = new.schedule_id and market_id = new.market_id;
    if not found then
      raise exception 'operators.schedule_id deve appartenere allo stesso market_id (operator.market_id=%, schedule.market_id mismatch)', new.market_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists operators_schedule_coherent_trg on operators;
create trigger operators_schedule_coherent_trg
  before insert or update on operators
  for each row execute function operators_schedule_coherent();
