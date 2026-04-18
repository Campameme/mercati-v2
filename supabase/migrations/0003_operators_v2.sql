-- Mercati-v2 Fase 2: Operatori + Prodotti + Inviti (idempotente)

-- Tabelle
create table if not exists operator_invites (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  operator_id uuid references operators(id) on delete set null,
  email text not null,
  accepted boolean not null default false,
  created_at timestamptz not null default now(),
  invited_by uuid references auth.users(id),
  unique(market_id, email)
);
create index if not exists operator_invites_email_idx on operator_invites(email);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references operators(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2),
  currency text not null default 'EUR',
  photos text[] not null default '{}',
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_operator_id_idx on products(operator_id);

-- RLS
alter table operator_invites enable row level security;
alter table products         enable row level security;

-- operators: self-update (drop+recreate for idempotency)
drop policy if exists "operators self update" on operators;
create policy "operators self update"
  on operators for update
  using (user_id = auth.uid());

-- invites
drop policy if exists "invites admin read"   on operator_invites;
drop policy if exists "invites admin insert" on operator_invites;
drop policy if exists "invites admin update" on operator_invites;
drop policy if exists "invites admin delete" on operator_invites;

create policy "invites admin read"
  on operator_invites for select
  using (
    is_super_admin(auth.uid())
    or is_market_admin(auth.uid(), market_id)
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
create policy "invites admin insert"
  on operator_invites for insert
  with check (
    is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)
  );
create policy "invites admin update"
  on operator_invites for update
  using (
    is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)
  );
create policy "invites admin delete"
  on operator_invites for delete
  using (
    is_super_admin(auth.uid()) or is_market_admin(auth.uid(), market_id)
  );

-- products
drop policy if exists "products public read"   on products;
drop policy if exists "products owner write"   on products;
drop policy if exists "products owner update"  on products;
drop policy if exists "products owner delete"  on products;

create policy "products public read"
  on products for select using (true);
create policy "products owner write"
  on products for insert
  with check (
    exists(select 1 from operators o
      where o.id = operator_id
        and (o.user_id = auth.uid() or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), o.market_id)))
  );
create policy "products owner update"
  on products for update
  using (
    exists(select 1 from operators o
      where o.id = operator_id
        and (o.user_id = auth.uid() or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), o.market_id)))
  );
create policy "products owner delete"
  on products for delete
  using (
    exists(select 1 from operators o
      where o.id = operator_id
        and (o.user_id = auth.uid() or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), o.market_id)))
  );

-- NOTA: nessun trigger su auth.users (Supabase recente lo blocca).
-- L'auto-link invito->operatore è fatto lato app in /api/operators/me.
-- Rimozione di eventuali trigger/funzioni precedenti se erano stati creati.
drop trigger if exists on_auth_user_invite_accept on auth.users;
drop function if exists accept_operator_invite();

-- Storage buckets
insert into storage.buckets (id, name, public)
  values ('operator-photos', 'operator-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('product-photos', 'product-photos', true)
  on conflict (id) do nothing;

-- Storage policies
drop policy if exists "operator-photos public read"   on storage.objects;
drop policy if exists "operator-photos owner upload"  on storage.objects;
drop policy if exists "operator-photos owner delete"  on storage.objects;
drop policy if exists "product-photos public read"    on storage.objects;
drop policy if exists "product-photos owner upload"   on storage.objects;
drop policy if exists "product-photos owner delete"   on storage.objects;

create policy "operator-photos public read"
  on storage.objects for select
  using (bucket_id = 'operator-photos');
create policy "operator-photos owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'operator-photos'
    and exists(select 1 from operators o
      where o.id::text = split_part(storage.objects.name, '/', 1)
        and (o.user_id = auth.uid() or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), o.market_id)))
  );
create policy "operator-photos owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'operator-photos'
    and exists(select 1 from operators o
      where o.id::text = split_part(storage.objects.name, '/', 1)
        and (o.user_id = auth.uid() or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), o.market_id)))
  );

create policy "product-photos public read"
  on storage.objects for select
  using (bucket_id = 'product-photos');
create policy "product-photos owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'product-photos'
    and exists(select 1 from operators o
      where o.id::text = split_part(storage.objects.name, '/', 1)
        and (o.user_id = auth.uid() or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), o.market_id)))
  );
create policy "product-photos owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-photos'
    and exists(select 1 from operators o
      where o.id::text = split_part(storage.objects.name, '/', 1)
        and (o.user_id = auth.uid() or is_super_admin(auth.uid()) or is_market_admin(auth.uid(), o.market_id)))
  );
