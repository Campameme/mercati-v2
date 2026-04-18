-- Mercati-v2 Fase 1: schema iniziale (idempotente)

create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'citizen'
    check (role in ('super_admin','market_admin','operator','citizen')),
  created_at timestamptz not null default now()
);

create table if not exists markets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text not null,
  description text,
  center_lat double precision not null,
  center_lng double precision not null,
  default_zoom int not null default 15,
  market_day int check (market_day between 0 and 6),
  timezone text not null default 'Europe/Rome',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index if not exists markets_slug_active_idx on markets(slug) where is_active;

create table if not exists market_areas (
  market_id uuid primary key references markets(id) on delete cascade,
  polygon_geojson jsonb not null,
  style jsonb not null default '{"color":"#f97316","fillOpacity":0.2}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists market_admins (
  market_id uuid references markets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (market_id, user_id)
);

create table if not exists operators (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  category text not null,
  description text,
  stall_number text,
  location_lat double precision,
  location_lng double precision,
  photos text[] not null default '{}',
  languages text[] not null default '{}',
  payment_methods text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,
  is_open boolean not null default true,
  rating numeric(2,1),
  created_at timestamptz not null default now()
);
create index if not exists operators_market_id_idx on operators(market_id);

-- Auto-create a profile row on new auth.users
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
