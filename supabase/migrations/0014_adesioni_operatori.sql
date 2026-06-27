-- 0014_adesioni_operatori.sql
--
-- Storage delle richieste di adesione da parte di operatori che vogliono entrare
-- nel progetto IMercati. Inviate dalla homepage (form pubblico) o /aderisci.
-- L'email di notifica e separata (Resend) — questa tabella e l'archivio durevole.

create table if not exists adesioni_operatori (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  nome text not null,
  email text not null,
  telefono text,
  attivita text not null,
  mercati_frequentati text,
  messaggio text,

  -- Metadata richiesta
  user_agent text,
  ip_hash text,        -- hash sha256(ip+salt), non IP in chiaro (privacy)
  email_sent boolean default false,
  email_error text,

  -- Stato gestione
  stato text default 'nuovo' check (stato in ('nuovo', 'in_contatto', 'aderito', 'scartato')),
  note_admin text
);

create index if not exists adesioni_operatori_created_idx on adesioni_operatori (created_at desc);
create index if not exists adesioni_operatori_stato_idx on adesioni_operatori (stato);

alter table adesioni_operatori enable row level security;

-- INSERT: pubblico (il form e accessibile a tutti)
drop policy if exists adesioni_insert_public on adesioni_operatori;
create policy adesioni_insert_public on adesioni_operatori
for insert with check (true);

-- SELECT/UPDATE/DELETE: solo super_admin
drop policy if exists adesioni_admin_read on adesioni_operatori;
create policy adesioni_admin_read on adesioni_operatori
for select using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  )
);

drop policy if exists adesioni_admin_write on adesioni_operatori;
create policy adesioni_admin_write on adesioni_operatori
for update using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  )
);

drop policy if exists adesioni_admin_delete on adesioni_operatori;
create policy adesioni_admin_delete on adesioni_operatori
for delete using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  )
);
