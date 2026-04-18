-- Mercati-v2 Fase 2: News + Eventi (idempotente)

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  title text not null,
  content text not null,
  type text not null default 'notice'
    check (type in ('schedule','notice','event','emergency')),
  priority text not null default 'medium'
    check (priority in ('low','medium','high')),
  publish_from timestamptz not null default now(),
  publish_until timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index if not exists news_market_pub_idx on news(market_id, publish_from desc);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'other',
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  is_recurring boolean not null default false,
  recurrence_rule text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index if not exists events_market_start_idx on events(market_id, start_at);

alter table news   enable row level security;
alter table events enable row level security;

-- NEWS
drop policy if exists "news public read"  on news;
drop policy if exists "news admin write"  on news;
drop policy if exists "news admin update" on news;
drop policy if exists "news admin delete" on news;

-- Pubblico: vede solo news attualmente pubblicate (admin vede tutto via proprio override)
create policy "news public read"
  on news for select
  using (
    is_super_admin(auth.uid())
    or is_market_admin(auth.uid(), market_id)
    or (
      publish_from <= now()
      and (publish_until is null or publish_until >= now())
    )
  );
create policy "news admin write"
  on news for insert
  with check (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "news admin update"
  on news for update
  using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "news admin delete"
  on news for delete
  using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));

-- EVENTS
drop policy if exists "events public read"  on events;
drop policy if exists "events admin write"  on events;
drop policy if exists "events admin update" on events;
drop policy if exists "events admin delete" on events;

create policy "events public read" on events for select using (true);
create policy "events admin write"
  on events for insert
  with check (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "events admin update"
  on events for update
  using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "events admin delete"
  on events for delete
  using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
