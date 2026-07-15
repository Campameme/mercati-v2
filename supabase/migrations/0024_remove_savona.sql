-- 0024_remove_savona.sql
--
-- Rimozione COMPLETA e definitiva della provincia di Savona dal database.
-- Il progetto copre ormai solo la provincia di Imperia ("I Mercati della
-- Riviera dei Fiori"): le 7 zone/mercati di Savona seminati con 0019
-- (baia-del-sole, albenganese, loano-pietra, finalese, savonese, val-bormida,
-- beigua) vengono eliminati insieme a tutti i dati collegati.
--
-- Tutte le tabelle figlie referenziano markets(id) con ON DELETE CASCADE, quindi
-- il solo `delete from markets` basterebbe a ripulire tutto; qui procediamo
-- comunque con cancellazioni esplicite e ordinate (figli -> padri) per chiarezza
-- e per lasciare una traccia leggibile di cosa viene toccato.
--
-- IDEMPOTENTE: se i mercati di Savona non esistono più (migrazione già
-- applicata, oppure DB di sola provincia di Imperia) non viene eliminato nulla.
-- Le cancellazioni sono guardate con to_regclass così da restare eseguibili
-- anche se una tabella opzionale non è presente in un dato ambiente.

do $$
declare
  savona_slugs text[] := array[
    'baia-del-sole', 'albenganese', 'loano-pietra', 'finalese',
    'savonese', 'val-bormida', 'beigua'
  ];
  savona_market_ids uuid[];
begin
  select array_agg(id) into savona_market_ids
  from markets
  where slug = any(savona_slugs);

  if savona_market_ids is null then
    raise notice '0024_remove_savona: nessun mercato di Savona presente, niente da rimuovere.';
    return;
  end if;

  -- 1) operator_schedules: legami operatore <-> sessione di mercato.
  --    FK su operators(id) e market_schedules(id) (entrambe ON DELETE CASCADE).
  if to_regclass('public.operator_schedules') is not null then
    delete from operator_schedules
    where operator_id in (select id from operators where market_id = any(savona_market_ids))
       or schedule_id in (select id from market_schedules where market_id = any(savona_market_ids));
  end if;

  -- 2) operator_markets: presenze di un operatore su un mercato.
  if to_regclass('public.operator_markets') is not null then
    delete from operator_markets where market_id = any(savona_market_ids);
  end if;

  -- 3) analytics_events: eventi legati a mercati/sessioni/operatori di Savona.
  if to_regclass('public.analytics_events') is not null then
    delete from analytics_events
    where market_id = any(savona_market_ids)
       or schedule_id in (select id from market_schedules where market_id = any(savona_market_ids))
       or operator_id in (select id from operators where market_id = any(savona_market_ids));
  end if;

  -- 4) news ed eventi di mercato.
  if to_regclass('public.news') is not null then
    delete from news where market_id = any(savona_market_ids);
  end if;
  if to_regclass('public.events') is not null then
    delete from events where market_id = any(savona_market_ids);
  end if;

  -- 5) operatori dei mercati di Savona.
  --    operators.place_id -> market_places(id) è ON DELETE SET NULL, quindi
  --    è sicuro cancellare gli operatori prima dei market_places.
  if to_regclass('public.operators') is not null then
    delete from operators where market_id = any(savona_market_ids);
  end if;

  -- 6) sessioni di mercato e luoghi (piazze) dei mercati di Savona.
  if to_regclass('public.market_schedules') is not null then
    delete from market_schedules where market_id = any(savona_market_ids);
  end if;
  if to_regclass('public.market_places') is not null then
    delete from market_places where market_id = any(savona_market_ids);
  end if;

  -- 7) admin di mercato e aree (poligoni) dei mercati di Savona.
  if to_regclass('public.market_admins') is not null then
    delete from market_admins where market_id = any(savona_market_ids);
  end if;
  if to_regclass('public.market_areas') is not null then
    delete from market_areas where market_id = any(savona_market_ids);
  end if;

  -- 8) infine i mercati stessi. L'ON DELETE CASCADE ripulisce eventuali
  --    figli residui non elencati sopra.
  delete from markets where id = any(savona_market_ids);

  raise notice '0024_remove_savona: rimossi % mercati della provincia di Savona e i relativi dati.',
    array_length(savona_market_ids, 1);
end $$;
