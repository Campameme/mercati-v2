-- ============================================================
-- 0027 — Blocca l'auto-promozione di ruolo su profiles (privilege escalation).
-- Idempotente.
--
-- PROBLEMA (introdotto in 0002_rls.sql):
--   create policy "profiles self update" on profiles
--     for update using (auth.uid() = id);
--   La policy non ha WITH CHECK né restrizioni di colonna: in Postgres, quando
--   WITH CHECK è assente, viene riusata la USING. Il vincolo è solo "auth.uid() = id",
--   che resta vero anche dopo aver cambiato il PROPRIO campo `role`. Di conseguenza
--   un qualsiasi utente autenticato (citizen), usando la chiave anon pubblica dal
--   browser, poteva fare:
--     supabase.from('profiles').update({ role: 'super_admin' }).eq('id', <proprio id>)
--   e diventare super_admin — bypassando tutte le altre RLS (che si basano su
--   is_super_admin()) e i gate del middleware.
--
-- TUTTE le promozioni legittime di ruolo passano dal client service-role lato
-- server (createServiceClient): operatori (/api/operators/me, /api/admin/operatori/link),
-- market_admin (/api/markets/[id]/admins), news_editor (SQL manuale). Nessun
-- percorso client legittimo modifica `profiles.role`.
--
-- FIX: un trigger BEFORE UPDATE che rifiuta il cambio di `role` a meno che la
-- richiesta non arrivi dal service_role/ruoli privilegiati del DB, oppure da un
-- super_admin. I client PostgREST girano come 'authenticated'/'anon': per loro il
-- cambio di ruolo è vietato. Gli altri campi (full_name) restano modificabili.
-- ============================================================

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security invoker              -- current_user = ruolo reale che esegue (authenticated/anon/service_role/postgres)
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Le richieste dei client web arrivano come 'authenticated' o 'anon'.
    -- Tutto il resto (service_role, postgres, supabase_admin, …) è fidato.
    if current_user in ('authenticated', 'anon') and not is_super_admin(auth.uid()) then
      raise exception 'Cambio di ruolo non consentito' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_role on public.profiles;
create trigger trg_guard_profile_role
  before update of role on public.profiles
  for each row
  execute function public.guard_profile_role();

-- Ricreo la policy con WITH CHECK esplicito (chiarezza; la difesa reale è il
-- trigger sopra, perché WITH CHECK da solo non può confrontare OLD.role/NEW.role).
drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Difesa aggiuntiva a livello di privilegi di colonna (opzionale ma consigliata):
-- impedisce del tutto ad anon/authenticated di scrivere la colonna `role`.
-- Il service_role mantiene il proprio grant e continua a promuovere i ruoli.
revoke update (role) on public.profiles from anon, authenticated;
