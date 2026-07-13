-- Migration: crea public.app_settings — configurazione PIN di accesso alle impostazioni
-- Date: 2026-07-13
-- Governance: ADDITIVA, NON distruttiva, idempotente. Non tocca tabelle/dati esistenti.
--
-- Scopo: spostare la config del "PIN per accedere all'area admin" (prima hardcoded
--   client-side come '1909') su DB, così è persistente e condivisa tra dispositivi.
--   Tabella key/value con una sola riga logica (id = 'pin').
--
-- Colonne:
--   id          : identificatore riga (default 'pin', unico record usato dall'app)
--   require_pin : se true, il tastierino chiede il PIN prima di entrare in admin
--                 (default false = disattivato, come richiesto)
--   access_pin  : PIN a 4 cifre (default '1909')
--   updated_at  : timestamp ultimo aggiornamento
--
-- RLS (stesso pattern di utenti/ex_dipendenti):
--   RLS attiva + policy SELECT pubblica (anon/authenticated) perché il gate lato
--   user (Home, non autenticato) deve poter leggere require_pin/access_pin.
--   NESSUNA policy di INSERT/UPDATE/DELETE per i ruoli pubblici: le scritture
--   avvengono solo lato server con SERVICE_ROLE_KEY (bypassa la RLS).
--
-- NOTA sicurezza: il PIN è una protezione UI (gate leggero), non un segreto forte;
--   essendo leggibile lato client resta by-design a bassa criticità.

-- 1) Tabella (idempotente).
create table if not exists public.app_settings (
  id          text primary key default 'pin',
  require_pin boolean not null default false,
  access_pin  text    not null default '1909',
  updated_at  timestamptz not null default now()
);

-- 2) Riga di default 'pin' (idempotente: non sovrascrive se già presente).
insert into public.app_settings (id, require_pin, access_pin)
  values ('pin', false, '1909')
  on conflict (id) do nothing;

-- 3) RLS attiva.
alter table if exists public.app_settings enable row level security;

-- 4) Policy di sola LETTURA per i ruoli pubblici (serve al gate user non autenticato).
drop policy if exists "app_settings_select_all" on public.app_settings;
create policy "app_settings_select_all"
  on public.app_settings
  for select
  to anon, authenticated
  using (true);

-- 5) NESSUNA policy INSERT/UPDATE/DELETE per anon/authenticated: con RLS attiva ogni
--    scrittura non-service_role è negata di default. Le scritture (toggle, cambio PIN)
--    passano dal backend con SERVICE_ROLE_KEY.

-- Verifica manuale attesa dopo l'applicazione (NON parte della migrazione):
--   - SELECT anon su app_settings           -> 200 con la riga 'pin'
--   - UPDATE anon su app_settings           -> negato (42501)
--   - GET  /api/settings/pin (app)          -> { requirePin:false, pin:'1909' }
--   - PUT  /api/settings/pin (app, backend) -> aggiorna riga 'pin'
