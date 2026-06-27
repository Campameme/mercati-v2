-- 0016_perf_indexes.sql
--
-- Indici aggiuntivi per query frequenti su homepage e pagina zona.
-- Prima di questo, le query di omogeneo SELECT ... WHERE is_active=true
-- con JOIN su markets!inner facevano scan completi.

-- Hot path: homepage carica TUTTE le sessions attive con join markets.is_active=true.
create index if not exists market_schedules_active_market_idx
  on market_schedules (market_id, is_active);

-- Operator detail: pagina operatore filtra spesso per market_id + is_active.
create index if not exists operators_market_active_idx
  on operators (market_id, is_active);

-- Analytics: lookup veloce per visitor_hash dedup (giornaliero).
-- L'indice esiste gia su (event_type, created_at desc) in 0015,
-- aggiungo qui un indice composito utile per la check is_unique.
create index if not exists analytics_events_dedup_idx
  on analytics_events (visitor_hash, event_type, created_at desc);
