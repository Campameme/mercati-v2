-- Mercati-v2 Fase 2: supporto multi-giorno per i mercati (idempotente)

alter table markets
  add column if not exists market_days int[] not null default '{}';

update markets
  set market_days = array[market_day]
  where market_day is not null
    and (market_days is null or array_length(market_days, 1) is null);

-- Validazione tramite trigger (i CHECK constraint non ammettono subquery)
create or replace function validate_market_days()
returns trigger
language plpgsql
as $$
begin
  if new.market_days is not null then
    if exists (select 1 from unnest(new.market_days) d where d < 0 or d > 6) then
      raise exception 'market_days contiene un valore fuori 0-6';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists validate_market_days_trigger on markets;
create trigger validate_market_days_trigger
  before insert or update of market_days on markets
  for each row execute function validate_market_days();

alter table markets drop column if exists market_day;
