-- Mercati-v2 Fase 1.5: market_schedules (sessioni multiple per mercato) + seed provincia di Imperia

create table if not exists market_schedules (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  comune text not null,
  giorno text not null,
  orario text,
  settori text,
  luogo text,
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (market_id, comune, giorno, luogo)
);
create index if not exists market_schedules_market_id_idx on market_schedules(market_id);
create index if not exists market_schedules_comune_idx on market_schedules(comune);

alter table market_schedules enable row level security;
drop policy if exists "schedules public read"   on market_schedules;
drop policy if exists "schedules admin insert"  on market_schedules;
drop policy if exists "schedules admin update"  on market_schedules;
drop policy if exists "schedules admin delete"  on market_schedules;
create policy "schedules public read" on market_schedules for select using (is_active or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "schedules admin insert" on market_schedules for insert with check (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "schedules admin update" on market_schedules for update using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "schedules admin delete" on market_schedules for delete using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));

-- Seed 8 mercati aggregati della provincia di Imperia (ON CONFLICT DO NOTHING per preservare modifiche manuali)
insert into markets (slug, name, city, description, center_lat, center_lng, default_zoom, market_days, timezone)
values
  ('ventimiglia',             'Ventimiglia',               'Ventimiglia',                                                               null, 43.7903, 7.6084, 15, array[5,6],           'Europe/Rome'),
  ('val-nervia',              'Val Nervia',                'Camporosso · Vallecrosia · Perinaldo',                                      null, 43.8203, 7.6443, 13, array[0,1,3,6],       'Europe/Rome'),
  ('bordighera-ospedaletti',  'Bordighera e Ospedaletti',  'Bordighera · Ospedaletti',                                                  null, 43.7916, 7.6918, 14, array[0,2,3,4,6],     'Europe/Rome'),
  ('sanremo',                 'Sanremo',                   'Sanremo',                                                                   null, 43.8158, 7.7761, 14, array[0,2,3,4,5,6],   'Europe/Rome'),
  ('taggia-e-costa',          'Taggia e Costa',            'Taggia · Santo Stefano al Mare · Riva Ligure · San Lorenzo al Mare',        null, 43.8443, 7.8900, 13, array[0,1,2,5],       'Europe/Rome'),
  ('imperia',                 'Imperia',                   'Imperia',                                                                   null, 43.8877, 8.0288, 14, array[2,3,4,6],       'Europe/Rome'),
  ('golfo-dianese',           'Golfo Dianese',             'Diano Marina · San Bartolomeo al Mare · Cervo',                             null, 43.9216, 8.1000, 14, array[0,1,2,4,5],     'Europe/Rome'),
  ('entroterra',              'Entroterra',                'Pontedassio · Pieve di Teco · Pornassio',                                   null, 43.9828, 7.9295, 12, array[0,2,5],         'Europe/Rome')
on conflict (slug) do nothing;

-- Seed 41 sessioni (comune/giorno/orario/settori/luogo/lat/lng)
do $$
declare
  id_ventimiglia            uuid := (select id from markets where slug = 'ventimiglia');
  id_val_nervia             uuid := (select id from markets where slug = 'val-nervia');
  id_bordighera_ospedaletti uuid := (select id from markets where slug = 'bordighera-ospedaletti');
  id_sanremo                uuid := (select id from markets where slug = 'sanremo');
  id_taggia_costa           uuid := (select id from markets where slug = 'taggia-e-costa');
  id_imperia                uuid := (select id from markets where slug = 'imperia');
  id_golfo_dianese          uuid := (select id from markets where slug = 'golfo-dianese');
  id_entroterra             uuid := (select id from markets where slug = 'entroterra');
begin
  insert into market_schedules (market_id, comune, giorno, orario, settori, luogo, lat, lng) values
    -- Ventimiglia
    (id_ventimiglia,            'Ventimiglia',            'Venerdì',                                         '08.00 / 16.00', 'Merci varie',                                                                              'Centro città',                                  43.7903, 7.6084),
    (id_ventimiglia,            'Ventimiglia',            '2° sabato del mese',                              '07.00 / 20.00', 'Antiquariato · Collezionismo · Vintage',                                                    'Via Aprosio',                                   43.7910, 7.6075),
    (id_ventimiglia,            'Ventimiglia',            '3° sabato del mese',                              '07.00 / 20.00', 'Artigianato',                                                                               'Via Aprosio',                                   43.7910, 7.6075),
    (id_ventimiglia,            'Ventimiglia',            '1° e 4° sabato del mese',                         '07.00 / 20.00', 'Artigianato',                                                                               'Via Aprosio e Via Ruffini',                     43.7908, 7.6072),
    -- Val Nervia
    (id_val_nervia,             'Camporosso',             'Mercoledì',                                       '08.00 / 13.00', 'Merci varie',                                                                               'P.zza Garibaldi',                               43.8067, 7.6286),
    (id_val_nervia,             'Camporosso',             'Sabato e domenica',                               '08.00 / 14.00', 'Hobbysti · Usato',                                                                          'Lungomare',                                     43.7897, 7.6259),
    (id_val_nervia,             'Vallecrosia',            'Lunedì',                                          '07.30 / 13.30', 'Merci varie',                                                                               'Solettone Sud',                                 43.7881, 7.6351),
    (id_val_nervia,             'Perinaldo',              'Mercoledì',                                       '07.00 / 13.00', 'Merci varie',                                                                               'Piazza S. Croce',                               43.8656, 7.6705),
    -- Bordighera e Ospedaletti
    (id_bordighera_ospedaletti, 'Bordighera',             '1ª domenica del mese',                            '08.00 / 18.00', 'Antiquariato · Collezionismo · Hobbysti',                                                   'Lungomare Argentina',                           43.7810, 7.6674),
    (id_bordighera_ospedaletti, 'Bordighera',             'Giovedì',                                         '08.00 / 13.00', 'Alimentare · Non alimentare · Produttori agricoli',                                         'Lungomare Argentina',                           43.7810, 7.6674),
    (id_bordighera_ospedaletti, 'Ospedaletti',            'Mercoledì',                                       '08.00 / 14.00', 'Alimentare · Non alimentare · Produttori agricoli',                                         'Via XX Settembre / Via Malta / P.zza Nassiriya', 43.8020, 7.7155),
    (id_bordighera_ospedaletti, 'Ospedaletti',            '3° sabato del mese',                              '08.00 / 19.00', 'Antiquariato',                                                                              'Passeggiata C.so Regina Margherita',            43.8025, 7.7140),
    (id_bordighera_ospedaletti, 'Ospedaletti',            'Martedì di luglio, agosto e sabato 29 agosto',    '17.00 / 24.00', 'Artigianato · Opere dell''ingegno',                                                         'Pista ciclabile',                               43.8010, 7.7160),
    -- Sanremo
    (id_sanremo,                'Sanremo',                '1° e 2° sabato del mese',                         '07.00 / 20.00', 'Piccolo brocante · Antiquariato',                                                           'Piazza San Siro',                               43.8167, 7.7761),
    (id_sanremo,                'Sanremo',                '1ª domenica del mese',                            '07.00 / 20.00', 'Antiquariato · Artigianato',                                                                'P.zza San Sebastiano / Via Umberto',            43.8161, 7.7755),
    (id_sanremo,                'Sanremo',                '2ª domenica del mese',                            '07.00 / 20.00', 'Antiquariato',                                                                              'Piazza Colombo · Palafiori',                    43.8152, 7.7748),
    (id_sanremo,                'Sanremo',                'Sabato',                                          '07.30 / 13.30', 'Merci varie',                                                                               'Frazione Coldirodi · Parcheggio Via Umberto',   43.8058, 7.7533),
    (id_sanremo,                'Sanremo',                'Martedì e sabato',                                '07.30 / 13.30', 'Merci varie',                                                                               'Via Martiri · Via Adolfo Rava',                 43.8165, 7.7790),
    (id_sanremo,                'Sanremo',                'Mercoledì',                                       '07.30 / 13.30', 'Merci varie',                                                                               'Frazione Poggio · Piazza della Libertà',        43.8267, 7.8050),
    (id_sanremo,                'Sanremo',                'Giovedì',                                         '07.30 / 13.30', 'Merci varie',                                                                               'Frazione Bussana · Piazza Chiappe',             43.8266, 7.8317),
    (id_sanremo,                'Sanremo',                'Mercoledì e venerdì',                             '07.30 / 13.30', 'Merci varie',                                                                               'Foce · Via Barabino',                           43.8094, 7.7707),
    -- Taggia e Costa
    (id_taggia_costa,           'Taggia',                 '3ª domenica del mese (da aprile a ottobre)',      '07.00 / 19.00', 'Antiquariato · Piccolo collezionismo',                                                      'Ex mercato coperto · Via Lungo Argentina',      43.8457, 7.8516),
    (id_taggia_costa,           'Santo Stefano al Mare',  'Venerdì',                                         '08.00 / 14.00', 'Merci varie',                                                                               'Lungomare',                                     43.8402, 7.8943),
    (id_taggia_costa,           'Riva Ligure',            'Lunedì',                                          '08.00 / 14.00', 'Merci varie · Alimentare · Agricoltura',                                                    'Piazza Ughetto',                                43.8374, 7.8776),
    (id_taggia_costa,           'San Lorenzo al Mare',    'Martedì',                                         '07.00 / 13.00', 'Alimentare · Agricoltura · Merci varie',                                                    'Piazza Mauna',                                  43.8498, 7.9591),
    -- Imperia
    (id_imperia,                'Imperia',                'Martedì',                                         '08.00 / 13.00', 'Produttori agricoli · Alimentare',                                                          'Porto Maurizio · Via XX Settembre',             43.8869, 8.0269),
    (id_imperia,                'Imperia',                'Mercoledì',                                       '08.00 / 13.00', 'Alimentare · Non alimentare',                                                               'Oneglia · Piazza Goito / Via Palestro',         43.8877, 8.0329),
    (id_imperia,                'Imperia',                'Giovedì',                                         '08.00 / 13.00', 'Alimentare · Non alimentare',                                                               'Porto Maurizio · Via San Maurizio / Via Cascione', 43.8869, 8.0269),
    (id_imperia,                'Imperia',                'Sabato',                                          '08.00 / 13.00', 'Alimentare · Non alimentare',                                                               'Oneglia · Piazza Goito / Via Palestro',         43.8877, 8.0329),
    -- Golfo Dianese
    (id_golfo_dianese,          'Diano Marina',           'Martedì',                                         '08.00 / 13.00 (invernale) · 08.00 / 14.00 (estivo)', 'Merci varie',                                                  'C.so Roma · P.zza Virgilio · Viale Kennedy',    43.9098, 8.0833),
    (id_golfo_dianese,          'Diano Marina',           'Venerdì',                                         '08.00 / 13.00', 'Prodotti agricoli KM 0 · Farmer market',                                                    'Via Genala · Lato mare',                        43.9087, 8.0841),
    (id_golfo_dianese,          'Diano Marina',           '1ª domenica del mese',                            '06.00 / 20.00 (inv.) · 15.00 / 24.00 (lug-set)', 'Collezionismo · Vecchi oggetti · Piccolo antiquariato',         'Centro storico',                                43.9100, 8.0830),
    (id_golfo_dianese,          'Diano Marina',           'Dal 30/05 al 13/09',                              '20.00 / 24.00', 'Artigianato creativo · Opere dell''ingegno',                                                'Solettone del porto turistico',                 43.9080, 8.0800),
    (id_golfo_dianese,          'San Bartolomeo al Mare', 'Lunedì',                                          '08.30 / 13.00', 'Merci varie',                                                                               'Piazza A. Doria',                               43.9231, 8.1058),
    (id_golfo_dianese,          'San Bartolomeo al Mare', 'Domeniche (dal 07/06 al 13/09)',                  '08.00 / 19.00', 'Merci varie',                                                                               'Lungomare delle Nazioni · Ponente',             43.9221, 8.1042),
    (id_golfo_dianese,          'San Bartolomeo al Mare', 'Sere (dal 20/06 al 20/09)',                       '18.00 / 24.00', 'Merci varie',                                                                               'Lungomare delle Nazioni · Levante',             43.9240, 8.1075),
    (id_golfo_dianese,          'Cervo',                  'Giovedì',                                         '08.00 / 13.00', 'Alimentare',                                                                                'Piazzale adiacente ex stazione ferroviaria',    43.9296, 8.1128),
    -- Entroterra
    (id_entroterra,             'Pieve di Teco',          'Martedì',                                         '07.30 / 13.00', 'Merci varie',                                                                               'Piazza Benso',                                  44.0484, 7.9122),
    (id_entroterra,             'Pieve di Teco',          'Ultima domenica del mese',                        '07.30 / 18.00', 'Antiquariato · Artigianato · Arte',                                                         'Corso M. Ponzoni · Piazza Carenzi · Piazza Cavour', 44.0490, 7.9115),
    (id_entroterra,             'Pontedassio',            'Venerdì',                                         '07.00 / 13.00', 'Merci varie',                                                                               'Piazza Vittorio Emanuele II',                   43.9318, 7.9979),
    (id_entroterra,             'Pornassio',              'Domenica',                                        '08.00 / 18.00', 'Merci varie',                                                                               'Fraz. Colle di Nava · Piazzale Croce Bianca',   44.0720, 7.8776)
  on conflict (market_id, comune, giorno, luogo) do nothing;
end $$;
