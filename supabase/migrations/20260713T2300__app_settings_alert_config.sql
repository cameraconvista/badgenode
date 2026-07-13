-- Migration: app_settings — config JSON per l'avviso timbrature anomale (scope 'alert')
-- Date: 2026-07-13
-- Governance: ADDITIVA/idempotente, NON distruttiva. Non tocca dati esistenti.
--   Aggiunge una colonna JSON opzionale a app_settings e una riga 'alert' con la
--   configurazione delle fasce orarie dell'avviso anomalie (finora hardcoded nel
--   frontend). L'avviso è puramente VISIVO: non altera timbrature/ore/totali.
--
-- Colonna:
--   config jsonb (nullable) — usata solo dalla riga 'alert'; le righe PIN la lasciano null.
--
-- Riga 'alert' (default = fasce ATTUALI del frontend):
--   enabled        : avviso attivo (default true, come oggi)
--   e1_start/e1_end: 1ª finestra entrata standard (16:45–17:15)
--   e2_start/e2_end: 2ª finestra entrata standard (19:15–19:45)
--   u_evening_from : uscita "sera" valida da (22:45)
--   u_night_until  : uscita "notte" valida fino a (03:45)
--
-- RLS: eredita quella di app_settings (SELECT pubblica, write solo service-role).

-- 1) Colonna config (idempotente).
alter table if exists public.app_settings
  add column if not exists config jsonb;

-- 2) Riga 'alert' coi default = valori attuali (idempotente).
insert into public.app_settings (id, require_pin, access_pin, config)
  values (
    'alert',
    false,
    '0000',
    jsonb_build_object(
      'enabled', true,
      'e1_start', '16:45',
      'e1_end',   '17:15',
      'e2_start', '19:15',
      'e2_end',   '19:45',
      'u_evening_from', '22:45',
      'u_night_until',  '03:45'
    )
  )
  on conflict (id) do nothing;

-- Verifica manuale attesa:
--   select id, config from public.app_settings where id = 'alert';
