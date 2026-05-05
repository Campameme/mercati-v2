-- IMercati: introduzione di market_places (luogo fisico del mercato)
-- Un place rappresenta un luogo (comune + luogo) con polygon condiviso.
-- Le market_schedules (giorni) referenziano un place; gli operatori restano legati alle schedules.

create table if not exists market_places (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  comune text not null,
  luogo text not null,
  lat double precision,
  lng double precision,
  polygon_geojson jsonb,
  area_style jsonb not null default '{"color":"#7d8f4e","fillOpacity":0.25}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (market_id, comune, luogo)
);
create index if not exists market_places_market_idx on market_places(market_id);

alter table market_schedules
  add column if not exists place_id uuid references market_places(id) on delete set null;

-- Backfill: per ogni distinct (market_id, comune, luogo) crea un place,
-- copia polygon dalla prima schedule che ce l'ha, riempi place_id su tutte.
do $$
declare r record;
  pid uuid;
begin
  for r in (
    select market_id, comune, luogo,
           min(lat) as lat, min(lng) as lng,
           (array_agg(polygon_geojson) filter (where polygon_geojson is not null))[1] as poly
    from market_schedules
    where comune is not null and luogo is not null
    group by market_id, comune, luogo
  ) loop
    insert into market_places (market_id, comune, luogo, lat, lng, polygon_geojson)
    values (r.market_id, r.comune, r.luogo, r.lat, r.lng, r.poly)
    on conflict (market_id, comune, luogo) do update set polygon_geojson = coalesce(market_places.polygon_geojson, excluded.polygon_geojson)
    returning id into pid;
    update market_schedules
      set place_id = pid
      where market_id = r.market_id and comune = r.comune and luogo = r.luogo;
  end loop;
end $$;

-- RLS market_places: stessi pattern di market_areas (public read, write super_admin o market_admin)
alter table market_places enable row level security;
drop policy if exists places_select on market_places;
create policy places_select on market_places for select using (true);
drop policy if exists places_write on market_places;
create policy places_write on market_places for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'super_admin')
  or exists (select 1 from market_admins ma where ma.market_id = market_places.market_id and ma.user_id = auth.uid())
) with check (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'super_admin')
  or exists (select 1 from market_admins ma where ma.market_id = market_places.market_id and ma.user_id = auth.uid())
);
