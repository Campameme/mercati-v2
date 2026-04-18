-- IMercati: news con scope globale (visibile su tutti i mercati)

alter table news alter column market_id drop not null;
alter table news add column if not exists is_global boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'news_scope_check') then
    alter table news add constraint news_scope_check check (is_global or market_id is not null);
  end if;
end $$;

create index if not exists news_global_idx on news(is_global) where is_global;

drop policy if exists "news public read"  on news;
drop policy if exists "news admin write"  on news;
drop policy if exists "news admin update" on news;
drop policy if exists "news admin delete" on news;

create policy "news public read"
  on news for select
  using (
    is_super_admin(auth.uid())
    or (market_id is not null and is_market_admin(auth.uid(), market_id))
    or (
      publish_from <= now()
      and (publish_until is null or publish_until >= now())
    )
  );

create policy "news admin write"
  on news for insert
  with check (
    (is_global and is_super_admin(auth.uid()))
    or (not is_global and market_id is not null and (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)))
  );

create policy "news admin update"
  on news for update
  using (
    (is_global and is_super_admin(auth.uid()))
    or (not is_global and market_id is not null and (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)))
  );

create policy "news admin delete"
  on news for delete
  using (
    (is_global and is_super_admin(auth.uid()))
    or (not is_global and market_id is not null and (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)))
  );
