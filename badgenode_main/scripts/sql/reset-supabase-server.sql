-- BADGENODE STEP 2: Reset Supabase lato server (idempotente)
-- Obiettivo: Preparare da zero stato server con enum, tabelle, trigger, RPC, RLS
-- Guardrail: Tutto in una transazione, solo IF NOT EXISTS / CREATE OR REPLACE

begin;

-- Sicurezza: lavoriamo nello schema public
set search_path = public;

-- 1) Enum
create type if not exists public.timbro_tipo as enum ('entrata','uscita');

-- 2) Tabelle

-- 2.1 utenti
create table if not exists public.utenti (
  pin int primary key,
  nome text,
  cognome text,
  created_at timestamptz not null default now()
);

-- 2.2 ex_dipendenti
create table if not exists public.ex_dipendenti (
  pin int primary key,
  nome text,
  cognome text,
  archiviato_il timestamptz not null default now()
);

-- 2.3 timbrature
create table if not exists public.timbrature (
  id bigserial primary key,
  pin int not null,
  tipo public.timbro_tipo not null,
  ts_order timestamptz not null default now(),  -- istante evento (UTC)
  created_at timestamptz not null default now(),
  giorno_logico date,                            -- valorizzato server-side
  data_locale date,                              -- opzionale
  ora_locale time,                               -- opzionale
  client_event_id uuid                           -- opzionale (idempotenza offline)
);

-- Indici utili
create index if not exists idx_timbrature_pin_giorno on public.timbrature(pin, giorno_logico);
create index if not exists idx_timbrature_pin_ts on public.timbrature(pin, ts_order desc);
create unique index if not exists ux_timbrature_client_event_id
  on public.timbrature(client_event_id) where client_event_id is not null;

-- 3) Trigger di sicurezza: calcolo giorno_logico + alternanza
create or replace function public.enforce_alternanza_fn()
returns trigger
language plpgsql
as $$
declare
  ts_local timestamp;        -- timestamp in Europe/Rome
  last_tipo public.timbro_tipo;
begin
  -- Calcolo giorno_logico/data/ora se mancanti
  if NEW.giorno_logico is null or NEW.data_locale is null or NEW.ora_locale is null then
    -- Convertiamo a Europe/Rome partendo da ts_order (già UTC)
    ts_local := (NEW.ts_order at time zone 'Europe/Rome');
    if (ts_local::time < time '05:00') then
      NEW.giorno_logico := (ts_local::date - 1);
    else
      NEW.giorno_logico := ts_local::date;
    end if;
    NEW.data_locale := ts_local::date;
    NEW.ora_locale  := ts_local::time(0);
  end if;

  -- Alternanza per (pin, giorno_logico): entrata -> uscita -> entrata ...
  select t.tipo
    into last_tipo
  from public.timbrature t
  where t.pin = NEW.pin
    and t.giorno_logico = NEW.giorno_logico
  order by t.ts_order desc
  limit 1;

  if last_tipo is null then
    -- Primo timbro del giorno: deve essere ENTRATA
    if NEW.tipo <> 'entrata' then
      raise exception using
        errcode = 'P0001',
        message = 'Alternanza violata: il primo timbro del giorno deve essere ENTRATA';
    end if;
  else
    -- Esige alternanza
    if last_tipo = NEW.tipo then
      raise exception using
        errcode = 'P0001',
        message = 'Alternanza violata: timbro uguale al precedente nello stesso giorno_logico';
    end if;
  end if;

  return NEW;
end
$$;

drop trigger if exists trg_enforce_alternanza on public.timbrature;
create trigger trg_enforce_alternanza
before insert on public.timbrature
for each row
execute procedure public.enforce_alternanza_fn();

-- 4) RPC: insert_timbro_v2
create or replace function public.insert_timbro_v2(p_pin int, p_tipo public.timbro_tipo, p_client_event_id uuid default null)
returns public.timbrature
language plpgsql
security invoker
as $$
declare
  r public.timbrature;
  exists_pin boolean;
begin
  -- Verifica PIN
  select exists(select 1 from public.utenti u where u.pin = p_pin) into exists_pin;
  if not exists_pin then
    raise exception using errcode='P0001', message='PIN inesistente';
  end if;

  -- Inserimento: il trigger calcola giorno_logico + controlla alternanza
  insert into public.timbrature(pin, tipo, ts_order, client_event_id)
  values (p_pin, p_tipo, now(), p_client_event_id)
  returning * into r;

  return r;
end
$$;

-- 5) RLS + Grants
-- Abilitazione RLS
alter table public.utenti enable row level security;
alter table public.timbrature enable row level security;

-- Policy: lettura utenti per tutti (anon + authenticated)
drop policy if exists "utenti_select_all" on public.utenti;
create policy "utenti_select_all"
on public.utenti
for select
to anon, authenticated
using (true);

-- Policy: lettura timbrature per tutti (storici pubblici per kiosk)
drop policy if exists "timbrature_select_all" on public.timbrature;
create policy "timbrature_select_all"
on public.timbrature
for select
to anon, authenticated
using (true);

-- Policy: inserimento timbrature solo se il PIN esiste
drop policy if exists "timbrature_insert_if_valid_pin" on public.timbrature;
create policy "timbrature_insert_if_valid_pin"
on public.timbrature
for insert
to anon, authenticated
with check (exists(select 1 from public.utenti u where u.pin = pin));

-- Grants minimi
grant usage on schema public to anon, authenticated;
grant select on public.utenti to anon, authenticated;
grant select, insert on public.timbrature to anon, authenticated;
grant usage on type public.timbro_tipo to anon, authenticated;
grant execute on function public.insert_timbro_v2(int, public.timbro_tipo, uuid) to anon, authenticated;

commit;
