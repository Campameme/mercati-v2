-- Mercati-v2: seed provincia di Savona (da Andora a Varazze, costa e valli)
-- Generato dal foglio "Mercatini Savona" (mercatini_della_provincia_di_savona.xls).
-- Coordinate = centro comune (affinabili con scripts/geocode-schedules.mjs).

insert into markets (slug, name, city, description, center_lat, center_lng, default_zoom, market_days, timezone)
values
  ('baia-del-sole', 'Baia del Sole', 'Andora · Laigueglia · Alassio', null, 43.9885, 8.163, 13, array[1,5,6], 'Europe/Rome'),
  ('albenganese', 'Piana di Albenga', 'Albenga · Ceriale · Borghetto Santo Spirito · Toirano', null, 44.08, 8.22, 13, array[0,1,2,3,4,5,6], 'Europe/Rome'),
  ('loano-pietra', 'Loano e Pietra', 'Loano · Pietra Ligure · Borgio Verezzi', null, 44.145, 8.28, 13, array[0,1,2,3,4,5,6], 'Europe/Rome'),
  ('finalese', 'Finalese', 'Finale Ligure · Noli · Spotorno', null, 44.19, 8.38, 13, array[0,1,2,3,4,5,6], 'Europe/Rome'),
  ('savonese', 'Savona e le Albisole', 'Savona · Vado · Albisole · Celle · Varazze', null, 44.325, 8.505, 12, array[0,1,2,3,5,6], 'Europe/Rome'),
  ('val-bormida', 'Val Bormida', 'Cairo Montenotte · Millesimo · Carcare e le valli', null, 44.36, 8.25, 11, array[2,3,4,5,6], 'Europe/Rome'),
  ('beigua', 'Beigua e valle Orba', 'Sassello · Urbe · Pontinvrea', null, 44.47, 8.5, 12, array[0,3,4], 'Europe/Rome')
on conflict (slug) do nothing;

do $$
declare
  id_baia_del_sole uuid := (select id from markets where slug = 'baia-del-sole');
  id_albenganese uuid := (select id from markets where slug = 'albenganese');
  id_loano_pietra uuid := (select id from markets where slug = 'loano-pietra');
  id_finalese uuid := (select id from markets where slug = 'finalese');
  id_savonese uuid := (select id from markets where slug = 'savonese');
  id_val_bormida uuid := (select id from markets where slug = 'val-bormida');
  id_beigua uuid := (select id from markets where slug = 'beigua');
begin
  insert into market_schedules (market_id, comune, giorno, orario, settori, luogo, lat, lng) values
    -- Alassio
    (id_baia_del_sole, 'Alassio', 'Sabato', '08.00 - 14.00', 'Merci Varie', 'Via Pera e adiacenze', 44.0049, 8.1729),
    (id_baia_del_sole, 'Alassio', 'Date singole da febbraio a ottobre (tutto maggio)', '10.00 - 19.00', 'Artigianato', 'P.zza della Libertà (giardini comunali)', 44.0049, 8.1729),
    -- Albenga
    (id_albenganese, 'Albenga', 'Mercoledì', '8.00 / 18.00', 'Merci varie', 'Via Dalmazia Via Isonzo Viale Liguria Piazza Panizza Piazza Parcheggio Peter Pan', 44.0494, 8.2131),
    (id_albenganese, 'Albenga', 'tutti', '7.30 / 13.00', 'Produttori agricoli', 'Piazza del Popolo', 44.0494, 8.2131),
    (id_albenganese, 'Albenga', 'Venerdì, sabato e domenica dal 24/7 al 30/8', '9.00 / 19.00', 'Mercatino dell''Antiquariato e hobbistico', 'Lungomare C. Colombo', 44.0494, 8.2131),
    (id_albenganese, 'Albenga', 'Un fine settimana a febbraio, aprile, giugno, settembre, novembre e dicembre', null, 'Expo Gustitalia - mostra mercato di prodotti alimentari tipivi regionali e dell''artigianato artistico', 'Viale dei Mille', 44.0494, 8.2131),
    -- Albisola Superiore
    (id_savonese, 'Albisola Superiore', 'Mercoledì', '8.00 / 13.00', 'Merci varie / Alimentari', 'Via del Grosso / Via dei Conradi / P.zza dei Mille / Via dei Seirullo / Via Nino Bixio', 44.3391, 8.5115),
    (id_savonese, 'Albisola Superiore', 'Mercoledì', '8.00 / 13.00', 'Agricoltura/ Allevamento', 'Via dei Conradi', 44.3391, 8.5115),
    (id_savonese, 'Albisola Superiore', '1° Sabato del mese', '8.00 / 13.00', 'Collezionismo - Artigianato- Merci Varie', 'Passeggiata Eugenio Montale', 44.3391, 8.5115),
    (id_savonese, 'Albisola Superiore', '3^ Domenica del mese', '8.00 / 13.00', 'Collezionismo Artigianato', 'Passeggiata Eugenio Montale', 44.3391, 8.5115),
    -- Albissola Marina
    (id_savonese, 'Albissola Marina', 'Martedì / Mercoledì', '8.00 / 12.00', 'Alimentari / Non Alimentari / Fiori', 'P.zza Vittorio Veneto', 44.3286, 8.5029),
    (id_savonese, 'Albissola Marina', '4° Sabato', '9.00 / 17.00', 'Merci varie / Artigianato', 'Centro storico', 44.3286, 8.5029),
    (id_savonese, 'Albissola Marina', 'Sabato', '9.00 / 17.00', 'Mercato Riviere delle Palme - Merci varie', 'Piazza Lam', 44.3286, 8.5029),
    (id_savonese, 'Albissola Marina', 'Domenica', '9.00 / 17.00', 'Chrismas market / Merci varie', 'Centro storico', 44.3286, 8.5029),
    -- Altare
    (id_val_bormida, 'Altare', 'Venerdì', '07.00 / 13.00', 'Merci varie', 'Via Restagno', 44.3346, 8.3437),
    -- Andora
    (id_baia_del_sole, 'Andora', '1° sabato del mese da aprile a ottobre', null, 'Antiquariato / artigianato / hobbysti', 'P.zza Santa Maria (portici)', 43.9522, 8.142),
    (id_baia_del_sole, 'Andora', 'Lunedi', '8.00 / 13.00', 'Merci varie', 'Via Cavour / Piazza Nassiriya', 43.9522, 8.142),
    (id_baia_del_sole, 'Andora', 'Lunedi dal 15/06 al 15/9', '8.00 / 13.00', 'Artigianato artistico', 'Via Cavour / Piazza Nassiriya', 43.9522, 8.142),
    (id_baia_del_sole, 'Andora', 'periodo pasquale + dal 1/06 al 15/09', '9.00 / 24.00', 'Artigianato artistico', 'Parco degli Aviatori', 43.9522, 8.142),
    -- Bardineto
    (id_val_bormida, 'Bardineto', 'Giovedì', '7.30 / 13.00 estivo', 'Merci varie', 'P.zza G. Grascheri', 44.1907, 8.1338),
    (id_val_bormida, 'Bardineto', 'Giovedì', '7.30 / 13.00 invernale', 'Merci varie', 'Loc. Suercà', 44.1907, 8.1338),
    -- Borghetto Santo Spirito
    (id_albenganese, 'Borghetto Santo Spirito', 'Tutti i giorni', '8.00 / 13.00', 'Ortofrutticolo', 'Piazza caduti sul lavoro', 44.1114, 8.2422),
    (id_albenganese, 'Borghetto Santo Spirito', 'Tutti i giorni', '8.00 / 13.00', 'Ortofrutticolo', 'Via Milano', 44.1114, 8.2422),
    (id_albenganese, 'Borghetto Santo Spirito', 'Martedì', '7.30 / 14.00', 'Merci varie', 'Piazza E. Fermi / V.le Verdi', 44.1114, 8.2422),
    (id_albenganese, 'Borghetto Santo Spirito', '3° sabato del mese', '8.00 / 20.00', 'Mercatino antiquariato e vintage', 'Piazza Libertà', 44.1114, 8.2422),
    (id_albenganese, 'Borghetto Santo Spirito', '2^ sabato del mese', '8.00 / 20.00', 'Mercatino dell''artigianato', 'Piazza Libertà', 44.1114, 8.2422),
    -- Borgio Verezzi
    (id_loano_pietra, 'Borgio Verezzi', 'Martedì', '1/6-30/9 7.00-14.00 1/10-31/5 8.00-13.00', 'Merci Varie', 'Via IV Novembre', 44.1601, 8.3057),
    (id_loano_pietra, 'Borgio Verezzi', 'Lunedì, mercoledì e venerdì dal 1/6 al 31/10; sabato dal 1/11 al 31/5', '1/6-31/10 14.00-17.30 1/11-31/5 16.00-19.30', 'Merci ortofrutticole', 'Piazzetta inters.Viale Colombo Via IV Novembre', 44.1601, 8.3057),
    -- Cairo Montenotte
    (id_val_bormida, 'Cairo Montenotte', 'Giovedì', '8.00 / 13.00', 'Merci varie / Agricoltura', 'P.zza della Vittoria - P.zza Abba - Viale Vittorio Veneto - Via F.lli Francia - C.so di Vittorio', 44.3987, 8.277),
    (id_val_bormida, 'Cairo Montenotte', '2° Sabato del mese', '8.00 / 13.00', 'Mercati della Terra / Agricoltura / Allevamento / Biologico', 'P.zza della Vittoria', 44.3987, 8.277),
    -- Calizzano
    (id_val_bormida, 'Calizzano', 'Martedì', '8.00 / 13.00', 'Merci varie', 'P.zza Vittorio Veneto Via 5 Martiri', 44.2358, 8.1112),
    -- Carcare
    (id_val_bormida, 'Carcare', 'Mercoledì', '7.30 / 13.00', 'Alimentare / Non alimentare / Agricoltori', 'P.zza Caravadossi', 44.3585, 8.2907),
    (id_val_bormida, 'Carcare', '1° Sabato del mese', '7.00 / 14.00', 'Mercato dei Produttori Locali', 'P.zza Caravadossi', 44.3585, 8.2907),
    -- Celle Ligure
    (id_savonese, 'Celle Ligure', 'venerdì', '8.00 / 13.00', 'Merci varie / Alimentari', 'via Boagno piazza del Popolo via Montegrappa piazza Sisto IV', 44.3419, 8.5457),
    -- Cengio
    (id_val_bormida, 'Cengio', 'Martedì', '8.00 / 15.00', 'Merci varie', 'Piazza S. Giuseppe', 44.3877, 8.1958),
    -- Ceriale
    (id_albenganese, 'Ceriale', 'Lunedì', '8.00 / 13.00', 'Merci varie', 'Lungomare A. Diaz nel tratto compreso tra l’intersezione con Via Giardini e il Molo S. Sebastiano', 44.093, 8.2311),
    (id_albenganese, 'Ceriale', 'dal 1 luglio al 31 agosto', '19.00 / 24. 00', 'Merci varie', 'Lungomare A. Diaz', 44.093, 8.2311),
    (id_albenganese, 'Ceriale', 'mar - gio - sab', '8.00 / 12.30', 'agricoltura', 'Archivolti ferroviari (Via Aurelia)', 44.093, 8.2311),
    (id_albenganese, 'Ceriale', '2^ domenica del mese', null, 'Antiquariato', 'Cenro storico / Piazza della Vittoria', 44.093, 8.2311),
    -- Dego
    (id_val_bormida, 'Dego', 'Mercoledì', '8.00 / 12.30', 'Merci varie', 'P.zza Panevino', 44.4479, 8.3095),
    (id_val_bormida, 'Dego', 'Da giugno a novembre ogni primo sabato del mese', '8.00 / 13.00', 'Manifestazioni per la promozione di arte, tradizioni e prodotti tipici Merci varie / alimentari / artigianato', 'P.zza Panevino e vie del centro', 44.4479, 8.3095),
    -- Finale Ligure
    (id_finalese, 'Finale Ligure', 'Giovedì', '08.00 / 14.00', 'Alimentare / Non alimentare', 'Marina', 44.1691, 8.3437),
    (id_finalese, 'Finale Ligure', 'Lunedì', '08.00 / 14.00', 'Alimentare / Non alimentare', 'Borgo', 44.1691, 8.3437),
    (id_finalese, 'Finale Ligure', 'Mercoledì stagionale (dal 15/6 al 15/9)', '08.00 / 14.00', 'Alimentare / Non alimentare', 'Varigotti', 44.1691, 8.3437),
    (id_finalese, 'Finale Ligure', 'estivo', '18.00 / 24.00', 'Mercatino dell''artigianato serale', 'Rioni di Marina-Borgo-Pia-Varigotti', 44.1691, 8.3437),
    (id_finalese, 'Finale Ligure', '1° Sabato e Domenica di ogni mese', '8.00 / 20.00', 'Antiquariato / Hobbistica', 'Centro Storico - rione Borgo', 44.1691, 8.3437),
    (id_finalese, 'Finale Ligure', 'Mercoledì e sabato dal 1/10 al 15/5; anche lunedì dal 16/5 al 30/9', '15.00 / 19.00 16.00 / 20.00', 'Ortoflorofrutticolo', 'Lungomare Migliorini', 44.1691, 8.3437),
    (id_finalese, 'Finale Ligure', 'Venerdì dal 15/5 al 30/9', '16.00 / 20.00', 'Ortoflorofrutticolo', 'Varigotti Via Aurelia', 44.1691, 8.3437),
    -- Giusvalla
    (id_val_bormida, 'Giusvalla', 'sabato', '8.00 / 12.00', 'Merci varie', 'P.zza del Municipio', 44.4489, 8.3934),
    -- Laigueglia
    (id_baia_del_sole, 'Laigueglia', 'Venerdì', '8.00 / 13.00', 'Merci varie', 'Centro Storico', 43.9743, 8.1585),
    -- Loano
    (id_loano_pietra, 'Loano', 'Venerdì', '08.00 / 13.00', 'Merci varie', 'Via delle Caselle', 44.1288, 8.2591),
    (id_loano_pietra, 'Loano', 'tutti i giorni', '08.00 / 13.00', 'Mercatino degli Agricoltori', 'Piazza S. Francesco', 44.1288, 8.2591),
    (id_loano_pietra, 'Loano', '2^ Domenica del mese', '08.00 / 19.00', 'Hobbistico / Antiquariato / Oggetti da rigattiere', 'Corso Europa', 44.1288, 8.2591),
    (id_loano_pietra, 'Loano', 'Martedì luglio e agosto', '08.00 / 13.00', 'Libri', 'Giardino del Principe', 44.1288, 8.2591),
    -- Mallare
    (id_val_bormida, 'Mallare', 'Martedì', '8.00 / 13.00', 'Merci varie', 'Piazza Odorico del Carretto', 44.2917, 8.2966),
    -- Millesimo
    (id_val_bormida, 'Millesimo', 'Sabato', '8.00 / 13.00', 'Merci varie / Alimentari', 'Centro storico', 44.3646, 8.2039),
    (id_val_bormida, 'Millesimo', 'Primo Sabato di ogni mese', '8.00 / 13.00', 'Artigianato - Antiquariato - Arte', 'Centro storico', 44.3646, 8.2039),
    -- Murialdo
    (id_val_bormida, 'Murialdo', 'Mercoledì', '8.00 - 13.00', 'Merci Varie', 'Borg. Piano', 44.3175, 8.162),
    -- Noli
    (id_finalese, 'Noli', 'Giovedì', '8.00 / 14.00', 'Merci Varie', 'Viale Marconi / C.so Italia', 44.2054, 8.4159),
    (id_finalese, 'Noli', '1^ Domenica del mese', '9.00 / 20.00', 'Artigianato', 'Capoluogo', 44.2054, 8.4159),
    (id_finalese, 'Noli', '3^ Domenica del mese', '9.00 / 20.00', 'Antiquariato', 'Capoluogo', 44.2054, 8.4159),
    -- Pietra Ligure
    (id_loano_pietra, 'Pietra Ligure', 'Sabato', '8.00/13.00 estivo 8.30/13.00 invernale', 'Merci varie / Alimentare / Non alimentare', 'Piazza San Nicolò', 44.149, 8.283),
    (id_loano_pietra, 'Pietra Ligure', 'Sabato', '8.00/13.00 estivo 8.30/13.00 invernale', 'Alimentare / Non alimentare / Fiori e piante', 'Viale della Repubblica', 44.149, 8.283),
    (id_loano_pietra, 'Pietra Ligure', 'Lunedì / Mercoledì / Venerdì', 'ora solare 15.30 / 18.30 ora legale 8.30 / 19.30', 'Mercatino ortofrutticolo', 'Piazza San Nicolò', 44.149, 8.283),
    (id_loano_pietra, 'Pietra Ligure', 'Lunedì / Mercoledì / Venerdì', 'ora solare 15.30 / 18.30 ora legale 8.30 / 19.30', 'Mercatino ortofrutticolo', 'Piazza Einaudi', 44.149, 8.283),
    (id_loano_pietra, 'Pietra Ligure', 'Sabato', 'ora solare 15.30 / 18.30 ora legale 8.30 / 19.30', 'Mercatino ortofrutticolo', 'Piazza San Rocco', 44.149, 8.283),
    (id_loano_pietra, 'Pietra Ligure', 'ultima Domenica del mese e il Sabato precedente', 'ora solare 9.00 /20.00 ora legale 9.00 / 23.00', 'Antiquariato / Modernariato / Collezionismo / Hobbistica', 'Lungomare (Sabato) Piazze e vie del centro storico (Domenica)', 44.149, 8.283),
    -- Pontinvrea
    (id_beigua, 'Pontinvrea', 'Ferragosto', '9.00 / 19.00', 'Antiquariato', 'Piazza Indipendenza', 44.4441, 8.4363),
    (id_beigua, 'Pontinvrea', 'mercatini di Natale week end di dicembre', '9.00 / 22.00', 'Merci varie', 'Loc. Giovo Ligure Via Giovo', 44.4441, 8.4363),
    -- Sassello
    (id_beigua, 'Sassello', 'Mercoledì', '8.00 / 13.00', 'Alimentare - Merci varie', 'P.zza San Rocco', 44.4801, 8.4893),
    (id_beigua, 'Sassello', 'ultime Domeniche del mese esclusi Gen / Feb', '8.00 / 13.00', 'Alimentare - Merci varie', 'P.zza San Rocco', 44.4801, 8.4893),
    -- Savona
    (id_savonese, 'Savona', 'Lunedì', '8.00 / 19.00', 'Merci varie / Alimentare / Non alimentare / Fiori e piante', 'Vie del Centro', 44.308, 8.481),
    (id_savonese, 'Savona', '1° Sabato e Domenica di ogni mese (tranne gennaio e agosto)', '8.00 / 19.00', 'Antiquariato', 'Via Paleocapa', 44.308, 8.481),
    -- Spotorno
    (id_finalese, 'Spotorno', 'Martedì', '08.00 /13.00', 'Alimentare Non alimentare Produttori agricoli', 'Via Aurelia', 44.2277, 8.4179),
    -- Toirano
    (id_albenganese, 'Toirano', 'Giovedì', '8.00 / 12.00', 'Alimentare / Merci varie', 'Piazzetta Agenore Fabbri', 44.1276, 8.2075),
    -- Urbe
    (id_beigua, 'Urbe', 'Giovedì', '8.00 / 12.30', 'Merci varie', 'P.zza S. Pietro', 44.4869, 8.5893),
    (id_beigua, 'Urbe', 'Giovedì', '8.00 / 12.30', 'Merci varie', 'Piazza Vara inf.', 44.4869, 8.5893),
    -- Vado Ligure
    (id_savonese, 'Vado Ligure', 'Mercoledì (non festivo)', '8.00 / 13.00', 'Merci varie', 'Via Maestri del Lavoro', 44.268, 8.436),
    (id_savonese, 'Vado Ligure', '2° Sabato del mese', '09.00 / 18.00', 'Antiquariato', 'Piazza Cavour / Via Gramsci', 44.268, 8.436),
    (id_savonese, 'Vado Ligure', '3° domenica del mese', '09.00 / 18.00', 'Merci varie', 'Piazza Cavour / Via Gramsci', 44.268, 8.436),
    -- Varazze
    (id_savonese, 'Varazze', 'Sabato', '08.00 / 13.00', 'Alimentari / Non Alimentari / Fiori', 'Viale Nazioni Unite / Piazza Dalla Chiesa', 44.3591, 8.577),
    (id_savonese, 'Varazze', '3^ domenica del mese da marzo a ottobre', '08.00 / 20.00', 'Artigianato / Collezionismo', 'Centro storico Quartiere S. Nazario', 44.3591, 8.577),
    (id_savonese, 'Varazze', 'Venerdì dal 26/6 al 4/9', '15.00 / 24.00', 'Artigianato / Collezionismo', 'Centro storico Quartiere S. Nazario', 44.3591, 8.577)
  on conflict (market_id, comune, giorno, luogo) do nothing;
end $$;

-- attiva le nuove zone (coerenza con 0017)
update markets set is_active = true where slug in ('baia-del-sole', 'albenganese', 'loano-pietra', 'finalese', 'savonese', 'val-bormida', 'beigua');
