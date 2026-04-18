-- Mercati-v2 Fase 1: Row-Level Security (idempotente)

create or replace function is_super_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from profiles
    where id = uid and role = 'super_admin'
  );
$$;

create or replace function is_market_admin(uid uuid, mid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from market_admins
    where user_id = uid and market_id = mid
  );
$$;

alter table profiles        enable row level security;
alter table markets         enable row level security;
alter table market_areas    enable row level security;
alter table market_admins   enable row level security;
alter table operators       enable row level security;

-- profiles
drop policy if exists "profiles self select" on profiles;
drop policy if exists "profiles self update" on profiles;
create policy "profiles self select" on profiles
  for select using (auth.uid() = id or is_super_admin(auth.uid()));
create policy "profiles self update" on profiles
  for update using (auth.uid() = id);

-- markets
drop policy if exists "markets public read active"   on markets;
drop policy if exists "markets super admin write"    on markets;
drop policy if exists "markets super admin update"   on markets;
drop policy if exists "markets super admin delete"   on markets;
create policy "markets public read active" on markets
  for select using (is_active or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), id));
create policy "markets super admin write" on markets
  for insert with check (is_super_admin(auth.uid()));
create policy "markets super admin update" on markets
  for update using (is_super_admin(auth.uid()));
create policy "markets super admin delete" on markets
  for delete using (is_super_admin(auth.uid()));

-- market_areas
drop policy if exists "market_areas public read"   on market_areas;
drop policy if exists "market_areas admin insert"  on market_areas;
drop policy if exists "market_areas admin update"  on market_areas;
drop policy if exists "market_areas admin delete"  on market_areas;
create policy "market_areas public read" on market_areas for select using (true);
create policy "market_areas admin insert" on market_areas
  for insert with check (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "market_areas admin update" on market_areas
  for update using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "market_areas admin delete" on market_areas
  for delete using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));

-- market_admins
drop policy if exists "market_admins self read"          on market_admins;
drop policy if exists "market_admins super admin write"  on market_admins;
drop policy if exists "market_admins super admin delete" on market_admins;
create policy "market_admins self read" on market_admins
  for select using (user_id = auth.uid() or is_super_admin(auth.uid()));
create policy "market_admins super admin write" on market_admins
  for insert with check (is_super_admin(auth.uid()));
create policy "market_admins super admin delete" on market_admins
  for delete using (is_super_admin(auth.uid()));

-- operators
drop policy if exists "operators public read"   on operators;
drop policy if exists "operators admin insert"  on operators;
drop policy if exists "operators admin update"  on operators;
drop policy if exists "operators admin delete"  on operators;
create policy "operators public read" on operators for select using (true);
create policy "operators admin insert" on operators
  for insert with check (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "operators admin update" on operators
  for update using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
create policy "operators admin delete" on operators
  for delete using (is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id));
