-- 0023_analytics_view_security.sql
--
-- Fix del warning "Security Definer View" (linter Supabase, CRITICAL) su
-- operator_stats_30d e market_stats_30d (create in 0015).
--
-- Problema: di default una view gira coi privilegi del PROPRIETARIO -> bypassa
-- la RLS di analytics_events. Col grant a `anon` (0015) chiunque abbia la anon
-- key pubblica (che sta nel bundle client) poteva leggere gli aggregati via REST
-- (/rest/v1/operator_stats_30d), scavalcando la RLS.
--
-- Fix:
--   1. security_invoker = on  -> la view rispetta la RLS del CHIAMANTE.
--   2. revoke da anon         -> niente accesso REST anonimo.
-- Restano leggibili solo da chi passa la RLS di analytics_events (super_admin):
-- e' esattamente la dashboard /admin, che usa il client server RLS-bound e gia'
-- oggi legge analytics_events diretto con la stessa sessione. Un authenticated
-- non-super-admin ottiene 0 righe (innocuo), anon non le vede affatto.
--
-- NB: security_invoker sulle view richiede PostgreSQL >= 15 (tutti i progetti
-- Supabase recenti). Se il progetto e' su PG14 questo ALTER da errore: in quel
-- caso fammelo sapere e converto le view in funzioni security-definer con check
-- di ruolo interno.

alter view public.operator_stats_30d set (security_invoker = on);
alter view public.market_stats_30d  set (security_invoker = on);

revoke select on public.operator_stats_30d from anon;
revoke select on public.market_stats_30d  from anon;

-- La dashboard admin gira come `authenticated` (sessione super_admin): tiene il grant.
grant select on public.operator_stats_30d to authenticated;
grant select on public.market_stats_30d  to authenticated;
