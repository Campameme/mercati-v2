-- ============================================================
-- 0026 — Tessera: QR personale, budget punti operatori, riscatti atomici,
--        shop a punti, tracciabilità e GDPR. Idempotente.
--
-- Modello: i saldi restano il LEDGER (point_events, niente colonna balance).
-- Tutte le scritture di punti passano da funzioni SECURITY DEFINER atomiche
-- (lock riga carta + verifica saldo), chiamate SOLO dalle route API service-role
-- già guardate (lib/auth/guard.ts). I punti non si creano dal nulla: l'operatore
-- dà attingendo dal PROPRIO budget; riscuote (scala) solo se l'utente li ha.
-- ============================================================

-- 1. Audit sul ledger: chi (operatore) e dove (mercato) ha mosso i punti + tipo
alter table point_events add column if not exists operator_id uuid references operators(id) on delete set null;
alter table point_events add column if not exists market_id uuid references markets(id) on delete set null;
alter table point_events add column if not exists kind text not null default 'admin';
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'point_events_kind_check') then
    alter table point_events add constraint point_events_kind_check
      check (kind in ('welcome','give','redeem','shop','admin','recharge','adjust'));
  end if;
end $$;

-- 2. La carta: token opaco per il QR — NON l'id utente (minimizzazione PII).
--    consent_at = consenso esplicito dell'utente ad avere la tessera (GDPR).
create table if not exists tessera_cards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table tessera_cards enable row level security;
drop policy if exists tessera_cards_select_own on tessera_cards;
create policy tessera_cards_select_own on tessera_cards
  for select using (auth.uid() = user_id or is_super_admin(auth.uid()));

-- 3. Budget punti dell'operatore: può DARE punti solo finché ne ha.
create table if not exists operator_point_budgets (
  operator_id uuid primary key references operators(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);
alter table operator_point_budgets enable row level security;
drop policy if exists opb_select on operator_point_budgets;
create policy opb_select on operator_point_budgets
  for select using (
    is_super_admin(auth.uid())
    or exists (select 1 from operators o where o.id = operator_id and o.user_id = auth.uid())
  );

-- 4. Catalogo premi dello shop (riscatto a PUNTI, nessun pagamento reale).
create table if not exists shop_rewards (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  description text,
  cost_points integer not null check (cost_points > 0),
  stock integer,                    -- null = illimitato
  market_id uuid references markets(id) on delete cascade,  -- null = tutta la rete
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table shop_rewards enable row level security;
drop policy if exists shop_rewards_public on shop_rewards;
create policy shop_rewards_public on shop_rewards
  for select using (is_active or is_super_admin(auth.uid()));

-- Il coupon emesso dallo shop porta il legame al premio e il costo pagato.
alter table coupons add column if not exists reward_id uuid references shop_rewards(id) on delete set null;
alter table coupons add column if not exists cost_points integer;

-- ============ Funzioni atomiche (SECURITY DEFINER) ============
-- Chiamate solo dalle route service-role guardate. Revocate a public: nessun
-- client anon/authenticated le invoca direttamente.

create or replace function tessera_balance(p_user uuid)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(sum(points),0)::int from point_events where user_id = p_user;
$$;

-- Token del QR → utente + saldo. Per lo scanner dell'operatore.
create or replace function tessera_card_lookup(p_token uuid)
returns table(user_id uuid, balance integer)
language sql stable security definer set search_path = public as $$
  select c.user_id, coalesce((select sum(points) from point_events pe where pe.user_id = c.user_id),0)::int
  from tessera_cards c where c.token = p_token;
$$;

-- OPERATORE DÀ punti: scala dal proprio budget (lock), accredita l'utente.
create or replace function tessera_give(p_operator uuid, p_user uuid, p_points integer, p_reason text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_budget integer; v_market uuid;
begin
  if p_points is null or p_points <= 0 then raise exception 'points_positive'; end if;
  perform 1 from tessera_cards where user_id = p_user for update;      -- serializza per-utente
  select balance into v_budget from operator_point_budgets where operator_id = p_operator for update;
  if v_budget is null then raise exception 'operator_no_budget'; end if;
  if v_budget < p_points then raise exception 'operator_insufficient_budget'; end if;
  select market_id into v_market from operators where id = p_operator;
  update operator_point_budgets set balance = balance - p_points, updated_at = now() where operator_id = p_operator;
  insert into point_events(user_id, points, reason, kind, operator_id, market_id)
    values (p_user, p_points, coalesce(nullif(btrim(p_reason),''),'Punti al banco'), 'give', p_operator, v_market);
  return tessera_balance(p_user);
end;
$$;

-- OPERATORE RISCUOTE/SCALA punti: solo se il saldo dell'utente li contiene davvero.
create or replace function tessera_redeem(p_operator uuid, p_user uuid, p_points integer, p_reason text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_balance integer; v_market uuid;
begin
  if p_points is null or p_points <= 0 then raise exception 'points_positive'; end if;
  perform 1 from tessera_cards where user_id = p_user for update;      -- serializza per-utente
  select coalesce(sum(points),0)::int into v_balance from point_events where user_id = p_user;
  if v_balance < p_points then raise exception 'user_insufficient_balance'; end if;
  select market_id into v_market from operators where id = p_operator;
  insert into point_events(user_id, points, reason, kind, operator_id, market_id)
    values (p_user, -p_points, coalesce(nullif(btrim(p_reason),''),'Riscatto al banco'), 'redeem', p_operator, v_market);
  return v_balance - p_points;
end;
$$;

-- ACQUISTO nello shop (a punti): verifica saldo e stock, scala punti, emette coupon.
create or replace function shop_purchase(p_user uuid, p_reward uuid)
returns table(new_balance integer, coupon_code text)
language plpgsql security definer set search_path = public as $$
declare v_cost integer; v_stock integer; v_active boolean; v_label text; v_balance integer; v_code text;
begin
  perform 1 from tessera_cards where user_id = p_user for update;      -- serializza per-utente
  select cost_points, stock, is_active, label into v_cost, v_stock, v_active, v_label
    from shop_rewards where id = p_reward for update;
  if v_cost is null then raise exception 'reward_not_found'; end if;
  if not v_active then raise exception 'reward_inactive'; end if;
  if v_stock is not null and v_stock <= 0 then raise exception 'reward_out_of_stock'; end if;
  select coalesce(sum(points),0)::int into v_balance from point_events where user_id = p_user;
  if v_balance < v_cost then raise exception 'insufficient_balance'; end if;
  v_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into point_events(user_id, points, reason, kind) values (p_user, -v_cost, v_label, 'shop');
  if v_stock is not null then update shop_rewards set stock = stock - 1 where id = p_reward; end if;
  insert into coupons(user_id, code, label, kind, reward_id, cost_points)
    values (p_user, v_code, v_label, 'shop', p_reward, v_cost);
  return query select v_balance - v_cost, v_code;
end;
$$;

-- GDPR: cancellazione self-serve di TUTTA la tessera dell'utente (diritto all'oblio).
create or replace function tessera_erase(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from coupons where user_id = p_user;
  delete from point_events where user_id = p_user;
  delete from tessera_cards where user_id = p_user;
end;
$$;

revoke all on function tessera_balance(uuid) from public;
revoke all on function tessera_card_lookup(uuid) from public;
revoke all on function tessera_give(uuid, uuid, integer, text) from public;
revoke all on function tessera_redeem(uuid, uuid, integer, text) from public;
revoke all on function shop_purchase(uuid, uuid) from public;
revoke all on function tessera_erase(uuid) from public;
