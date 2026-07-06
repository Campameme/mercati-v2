-- ============================================================
-- 0020 — La tessera del mercato: punti fedeltà e coupon
-- Idempotente. Scritture SOLO dal server (service role);
-- RLS: il titolare legge le sue righe, il super admin tutto.
-- I saldi si calcolano dal ledger (niente colonna balance da tenere in sync).
-- ============================================================

create table if not exists point_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists point_events_user_idx
  on point_events (user_id, created_at desc);

-- Il bonus di benvenuto può esistere UNA volta sola per utente,
-- anche con chiamate concorrenti.
create unique index if not exists point_events_welcome_once
  on point_events (user_id) where reason = 'welcome';

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  label text not null,
  kind text not null default 'manual',
  status text not null default 'active' check (status in ('active','used','void')),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null
);

create index if not exists coupons_user_idx on coupons (user_id, created_at desc);

alter table point_events enable row level security;
alter table coupons enable row level security;

drop policy if exists point_events_select_own on point_events;
create policy point_events_select_own on point_events
  for select using (auth.uid() = user_id or is_super_admin(auth.uid()));

drop policy if exists coupons_select_own on coupons;
create policy coupons_select_own on coupons
  for select using (auth.uid() = user_id or is_super_admin(auth.uid()));

-- Nessuna policy di insert/update/delete: le scritture passano tutte dalle
-- route API con service role (guardie in lib/auth/guard.ts).
