-- IMercati: ruolo "news_editor" (redazione notizie) + stato bozza/pubblicata.
-- Il redattore gestisce SOLO le notizie (di mercato e globali): le carica come
-- bozza, le prova, le pubblica. Nessun altro potere (mercati, operatori, ecc.).
-- Idempotente.

-- 1. profiles.role: aggiungi 'news_editor' al CHECK
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('super_admin', 'market_admin', 'operator', 'citizen', 'news_editor'));

-- 2. news.status: 'draft' (visibile solo in redazione) | 'published'
alter table news add column if not exists status text not null default 'published';
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'news_status_check') then
    alter table news add constraint news_status_check check (status in ('draft', 'published'));
  end if;
end $$;

-- 3. helper ruolo (stile 0002_rls.sql)
create or replace function is_news_editor(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from profiles
    where id = uid and role = 'news_editor'
  );
$$;

-- 4. policy: il pubblico vede solo le pubblicate nella finestra; il redattore
--    vede e gestisce tutto (anche le globali), il market_admin il suo mercato.
drop policy if exists "news public read"  on news;
drop policy if exists "news admin write"  on news;
drop policy if exists "news admin update" on news;
drop policy if exists "news admin delete" on news;

create policy "news public read"
  on news for select
  using (
    is_super_admin(auth.uid())
    or is_news_editor(auth.uid())
    or (market_id is not null and is_market_admin(auth.uid(), market_id))
    or (
      status = 'published'
      and publish_from <= now()
      and (publish_until is null or publish_until >= now())
    )
  );

create policy "news admin write"
  on news for insert
  with check (
    is_news_editor(auth.uid())
    or (is_global and is_super_admin(auth.uid()))
    or (not is_global and market_id is not null and (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)))
  );

create policy "news admin update"
  on news for update
  using (
    is_news_editor(auth.uid())
    or (is_global and is_super_admin(auth.uid()))
    or (not is_global and market_id is not null and (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)))
  );

create policy "news admin delete"
  on news for delete
  using (
    is_news_editor(auth.uid())
    or (is_global and is_super_admin(auth.uid()))
    or (not is_global and market_id is not null and (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)))
  );

-- Per promuovere un utente a redattore (dopo averlo creato in Auth):
--   update profiles set role = 'news_editor'
--   where id = (select id from auth.users where email = 'redazione@esempio.it');
