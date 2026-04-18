-- Mercati-v2: zoom separato per la mappa operatori
alter table markets
  add column if not exists default_zoom_operators int not null default 17;
