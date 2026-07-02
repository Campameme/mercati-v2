-- Mercati-v2: coordinate precise dei mercati (provincia di Imperia)
-- Geocodifica via Nominatim (OSM) sulle vie/piazze reali di ciascun
-- mercato + verifica web per i casi ambigui (Taggia, Sanremo Foce).
-- Aggiorna market_schedules.lat/lng per (comune, giorno, luogo).

update market_schedules set lat = 43.7899734, lng = 7.6076489 where comune = 'Ventimiglia' and giorno = 'Venerdì' and luogo = 'Centro città';
update market_schedules set lat = 43.7923671, lng = 7.6064719 where comune = 'Ventimiglia' and giorno = '2° sabato del mese' and luogo = 'Via Aprosio';
update market_schedules set lat = 43.7923671, lng = 7.6064719 where comune = 'Ventimiglia' and giorno = '3° sabato del mese' and luogo = 'Via Aprosio';
update market_schedules set lat = 43.7923671, lng = 7.6064719 where comune = 'Ventimiglia' and giorno = '1° e 4° sabato del mese' and luogo = 'Via Aprosio e Via Ruffini';
update market_schedules set lat = 43.8152789, lng = 7.6284419 where comune = 'Camporosso' and giorno = 'Mercoledì' and luogo = 'P.zza Garibaldi';
update market_schedules set lat = 43.7845348, lng = 7.6316528 where comune = 'Camporosso' and giorno = 'Sabato e domenica' and luogo = 'Lungomare';
update market_schedules set lat = 43.7829452, lng = 7.6413472 where comune = 'Vallecrosia' and giorno = 'Lunedì' and luogo = 'Solettone Sud';
update market_schedules set lat = 43.8671859, lng = 7.6709954 where comune = 'Perinaldo' and giorno = 'Mercoledì' and luogo = 'Piazza S. Croce';
update market_schedules set lat = 43.7805508, lng = 7.653359 where comune = 'Bordighera' and giorno = '1ª domenica del mese' and luogo = 'Lungomare Argentina';
update market_schedules set lat = 43.7805508, lng = 7.653359 where comune = 'Bordighera' and giorno = 'Giovedì' and luogo = 'Lungomare Argentina';
update market_schedules set lat = 43.801457, lng = 7.7117075 where comune = 'Ospedaletti' and giorno = 'Mercoledì' and luogo = 'Via XX Settembre / Via Malta / P.zza Nassiriya';
update market_schedules set lat = 43.8014092, lng = 7.7098017 where comune = 'Ospedaletti' and giorno = '3° sabato del mese' and luogo = 'Passeggiata C.so Regina Margherita';
update market_schedules set lat = 43.7999833, lng = 7.7205824 where comune = 'Ospedaletti' and giorno = 'Martedì di luglio, agosto e sabato 29 agosto' and luogo = 'Pista ciclabile';
update market_schedules set lat = 43.8168034, lng = 7.7736612 where comune = 'Sanremo' and giorno = '1° e 2° sabato del mese' and luogo = 'Piazza San Siro';
update market_schedules set lat = 43.8162405, lng = 7.7752213 where comune = 'Sanremo' and giorno = '1ª domenica del mese' and luogo = 'P.zza San Sebastiano / Via Umberto';
update market_schedules set lat = 43.8186334, lng = 7.7780958 where comune = 'Sanremo' and giorno = '2ª domenica del mese' and luogo = 'Piazza Colombo · Palafiori';
update market_schedules set lat = 43.8116459, lng = 7.731232 where comune = 'Sanremo' and giorno = 'Sabato' and luogo = 'Frazione Coldirodi · Parcheggio Via Umberto';
update market_schedules set lat = 43.8185539, lng = 7.7729895 where comune = 'Sanremo' and giorno = 'Martedì e sabato' and luogo = 'Via Martiri · Via Adolfo Rava';
update market_schedules set lat = 43.8310177, lng = 7.8138689 where comune = 'Sanremo' and giorno = 'Mercoledì' and luogo = 'Frazione Poggio · Piazza della Libertà';
update market_schedules set lat = 43.825476, lng = 7.8411899 where comune = 'Sanremo' and giorno = 'Giovedì' and luogo = 'Frazione Bussana · Piazza Chiappe';
update market_schedules set lat = 43.809141, lng = 7.7612247 where comune = 'Sanremo' and giorno = 'Mercoledì e venerdì' and luogo = 'Foce · Via Barabino';
update market_schedules set lat = 43.8308228, lng = 7.8511225 where comune = 'Taggia' and giorno = '3ª domenica del mese (da aprile a ottobre)' and luogo = 'Ex mercato coperto · Via Lungo Argentina';
update market_schedules set lat = 43.8380341, lng = 7.8889898 where comune = 'Santo Stefano al Mare' and giorno = 'Venerdì' and luogo = 'Lungomare';
update market_schedules set lat = 43.8372744, lng = 7.881566 where comune = 'Riva Ligure' and giorno = 'Lunedì' and luogo = 'Piazza Ughetto';
update market_schedules set lat = 43.852795, lng = 7.9628879 where comune = 'San Lorenzo al Mare' and giorno = 'Martedì' and luogo = 'Piazza Mauna';
update market_schedules set lat = 43.8777888, lng = 8.0151581 where comune = 'Imperia' and giorno = 'Martedì' and luogo = 'Porto Maurizio · Via XX Settembre';
update market_schedules set lat = 43.8883718, lng = 8.0446535 where comune = 'Imperia' and giorno = 'Mercoledì' and luogo = 'Oneglia · Piazza Goito / Via Palestro';
update market_schedules set lat = 43.8765355, lng = 8.0143756 where comune = 'Imperia' and giorno = 'Giovedì' and luogo = 'Porto Maurizio · Via San Maurizio / Via Cascione';
update market_schedules set lat = 43.8883718, lng = 8.0446535 where comune = 'Imperia' and giorno = 'Sabato' and luogo = 'Oneglia · Piazza Goito / Via Palestro';
update market_schedules set lat = 43.9110702, lng = 8.0837136 where comune = 'Diano Marina' and giorno = 'Martedì' and luogo = 'C.so Roma · P.zza Virgilio · Viale Kennedy';
update market_schedules set lat = 43.9096632, lng = 8.082301 where comune = 'Diano Marina' and giorno = 'Venerdì' and luogo = 'Via Genala · Lato mare';
update market_schedules set lat = 43.9097891, lng = 8.0817451 where comune = 'Diano Marina' and giorno = '1ª domenica del mese' and luogo = 'Centro storico';
update market_schedules set lat = 43.9083341, lng = 8.0858296 where comune = 'Diano Marina' and giorno = 'Dal 30/05 al 13/09' and luogo = 'Solettone del porto turistico';
update market_schedules set lat = 43.9215111, lng = 8.1047289 where comune = 'San Bartolomeo al Mare' and giorno = 'Lunedì' and luogo = 'Piazza A. Doria';
update market_schedules set lat = 43.9209695, lng = 8.1063046 where comune = 'San Bartolomeo al Mare' and giorno = 'Domeniche (dal 07/06 al 13/09)' and luogo = 'Lungomare delle Nazioni · Ponente';
update market_schedules set lat = 43.9209695, lng = 8.1063046 where comune = 'San Bartolomeo al Mare' and giorno = 'Sere (dal 20/06 al 20/09)' and luogo = 'Lungomare delle Nazioni · Levante';
update market_schedules set lat = 43.9247, lng = 8.1126 where comune = 'Cervo' and giorno = 'Giovedì' and luogo = 'Piazzale adiacente ex stazione ferroviaria';
update market_schedules set lat = 44.0471948, lng = 7.9161344 where comune = 'Pieve di Teco' and giorno = 'Martedì' and luogo = 'Piazza Benso';
update market_schedules set lat = 44.0464365, lng = 7.9161754 where comune = 'Pieve di Teco' and giorno = 'Ultima domenica del mese' and luogo = 'Corso M. Ponzoni · Piazza Carenzi · Piazza Cavour';
update market_schedules set lat = 43.9318, lng = 7.9979 where comune = 'Pontedassio' and giorno = 'Venerdì' and luogo = 'Piazza Vittorio Emanuele II';
update market_schedules set lat = 44.0849042, lng = 7.8728783 where comune = 'Pornassio' and giorno = 'Domenica' and luogo = 'Fraz. Colle di Nava · Piazzale Croce Bianca';
