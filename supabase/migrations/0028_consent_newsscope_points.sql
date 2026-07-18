-- ============================================================
-- 0028 — Consenso marketing · News editor per-mercato · Punti da scontrino
-- Idempotente. Tre blocchi indipendenti.
-- ============================================================

-- ---------- 1. CONSENSO MARKETING su profiles ----------
-- Raccolto alla registrazione (opt-in esplicito, GDPR). Non pre-selezionato.
alter table profiles add column if not exists marketing_consent boolean not null default false;
alter table profiles add column if not exists marketing_consent_at timestamptz;

-- ---------- 2. NEWS EDITOR PER-MERCATO ----------
-- Il news_editor NON ha più potere globale: genera notizie solo per i mercati
-- che il super admin gli assegna. Tabella ponte come market_admins, ma separata
-- (mettere un news_editor in market_admins gli darebbe poteri da market_admin).
create table if not exists news_editor_markets (
  user_id uuid not null references auth.users(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, market_id)
);
alter table news_editor_markets enable row level security;

drop policy if exists "news_editor_markets read" on news_editor_markets;
create policy "news_editor_markets read" on news_editor_markets
  for select using (user_id = auth.uid() or is_super_admin(auth.uid()));
drop policy if exists "news_editor_markets write" on news_editor_markets;
create policy "news_editor_markets write" on news_editor_markets
  for all using (is_super_admin(auth.uid())) with check (is_super_admin(auth.uid()));

create or replace function is_news_editor_of(uid uuid, mid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from news_editor_markets where user_id = uid and market_id = mid);
$$;

-- RLS news riscritta: il news_editor scrive SOLO i mercati assegnati (mai globali);
-- super_admin tutto (incl. globali); market_admin il suo mercato.
drop policy if exists "news public read"  on news;
drop policy if exists "news admin write"  on news;
drop policy if exists "news admin update" on news;
drop policy if exists "news admin delete" on news;

create policy "news public read" on news for select using (
  is_super_admin(auth.uid())
  or (market_id is not null and (is_market_admin(auth.uid(), market_id) or is_news_editor_of(auth.uid(), market_id)))
  or (status = 'published' and publish_from <= now() and (publish_until is null or publish_until >= now()))
);
create policy "news admin write" on news for insert with check (
  (is_global and is_super_admin(auth.uid()))
  or (not is_global and market_id is not null and (
        is_super_admin(auth.uid())
        or is_market_admin(auth.uid(), market_id)
        or is_news_editor_of(auth.uid(), market_id)))
);
create policy "news admin update" on news for update using (
  (is_global and is_super_admin(auth.uid()))
  or (not is_global and market_id is not null and (
        is_super_admin(auth.uid())
        or is_market_admin(auth.uid(), market_id)
        or is_news_editor_of(auth.uid(), market_id)))
);
create policy "news admin delete" on news for delete using (
  (is_global and is_super_admin(auth.uid()))
  or (not is_global and market_id is not null and (
        is_super_admin(auth.uid())
        or is_market_admin(auth.uid(), market_id)
        or is_news_editor_of(auth.uid(), market_id)))
);

-- ---------- 3. PUNTI DA SCONTRINO con approvazione super admin ----------
-- Il cliente accumula punti comprando dai banchi: 1 € = 10 punti. L'operatore
-- scansiona il QR del cliente, registra l'importo dello scontrino → nasce una
-- RICHIESTA in attesa. Il super admin approva → i punti vengono accreditati.
-- Lo sconto della tessera è funzione del saldo (calcolato lato app: 5k/10k/15k/20k
-- punti → 5/10/15/20%).
create table if not exists point_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  operator_id uuid not null references operators(id) on delete cascade,
  market_id uuid references markets(id) on delete set null,
  amount_cents int not null check (amount_cents > 0),   -- totale scontrino in centesimi
  points int not null check (points > 0),               -- = euro arrotondati * 10
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  decided_by uuid references auth.users(id),
  decided_at timestamptz
);
create index if not exists point_requests_status_idx on point_requests(status) where status = 'pending';
create index if not exists point_requests_user_idx on point_requests(user_id);
alter table point_requests enable row level security;

-- Lettura: l'utente le proprie, il super admin tutte. Scritture solo via RPC service-role.
drop policy if exists "point_requests read" on point_requests;
create policy "point_requests read" on point_requests
  for select using (user_id = auth.uid() or is_super_admin(auth.uid()));

-- L'operatore apre una richiesta scansionando il token QR del cliente.
create or replace function points_request_create(
  p_operator uuid, p_token uuid, p_amount_cents int, p_note text default null
) returns point_requests language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_market uuid; v_points int; v_row point_requests;
begin
  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'Importo non valido'; end if;
  select user_id into v_user from tessera_cards where token = p_token;
  if v_user is null then raise exception 'Tessera non trovata'; end if;
  select market_id into v_market from operators where id = p_operator;
  -- 1 € = 10 punti; l'euro si arrotonda al più vicino (es. 12,40 € → 12 € → 120 punti)
  v_points := round(p_amount_cents / 100.0) * 10;
  if v_points <= 0 then raise exception 'Importo troppo basso'; end if;
  insert into point_requests(user_id, operator_id, market_id, amount_cents, points, note)
    values (v_user, p_operator, v_market, p_amount_cents, v_points, nullif(btrim(p_note), ''))
    returning * into v_row;
  return v_row;
end $$;

-- Il super admin approva o rifiuta. All'approvazione i punti entrano nel ledger.
create or replace function points_request_decide(
  p_request uuid, p_approve boolean, p_decider uuid
) returns point_requests language plpgsql security definer set search_path = public as $$
declare v_row point_requests;
begin
  select * into v_row from point_requests where id = p_request for update;
  if v_row.id is null then raise exception 'Richiesta non trovata'; end if;
  if v_row.status <> 'pending' then raise exception 'Richiesta già gestita'; end if;
  if p_approve then
    insert into point_events(user_id, points, reason, kind, operator_id, market_id, created_by)
      values (v_row.user_id, v_row.points,
              'Scontrino ' || to_char(v_row.amount_cents / 100.0, 'FM999990.00') || ' €',
              'earn', v_row.operator_id, v_row.market_id, p_decider);
    update point_requests set status = 'approved', decided_by = p_decider, decided_at = now()
      where id = p_request returning * into v_row;
  else
    update point_requests set status = 'rejected', decided_by = p_decider, decided_at = now()
      where id = p_request returning * into v_row;
  end if;
  return v_row;
end $$;

-- 'earn' è un nuovo tipo di movimento: allargo il CHECK di point_events.
do $$ begin
  alter table point_events drop constraint if exists point_events_kind_check;
  alter table point_events add constraint point_events_kind_check
    check (kind in ('welcome','give','redeem','shop','admin','recharge','adjust','earn'));
exception when others then null; end $$;

revoke all on function points_request_create(uuid, uuid, int, text) from public;
revoke all on function points_request_decide(uuid, boolean, uuid) from public;
