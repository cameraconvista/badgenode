-- Migration: app_settings — due PIN distinti (admin + general)
-- Date: 2026-07-13
-- Governance: ADDITIVA/idempotente, NON distruttiva sui dati operativi.
--
-- Contesto: la migrazione precedente (20260713T2100) ha creato app_settings con
--   una sola riga id='pin' (PIN di accesso all'area admin). Ora servono DUE PIN:
--     - id='admin'   -> PIN per accedere all'area amministrazione (ex 'pin')
--     - id='general' -> PIN per accedere all'app in generale (schermata all'avvio)
--   Entrambi con require_pin=false di default (disattivati) e access_pin='1909'.
--
-- Idempotente: la rinomina 'pin'->'admin' avviene solo se 'admin' non esiste già;
--   l'inserimento di 'general' usa on conflict do nothing.

-- 1) Rinomina la riga storica 'pin' in 'admin' (solo se 'admin' non c'è ancora).
update public.app_settings
  set id = 'admin'
  where id = 'pin'
    and not exists (select 1 from public.app_settings where id = 'admin');

-- 2) Garantisce la riga 'admin' (se la 1 non ha trovato 'pin', crea il default).
insert into public.app_settings (id, require_pin, access_pin)
  values ('admin', false, '1909')
  on conflict (id) do nothing;

-- 3) Nuova riga 'general' (PIN accesso app), default disattivato.
insert into public.app_settings (id, require_pin, access_pin)
  values ('general', false, '1909')
  on conflict (id) do nothing;

-- Verifica manuale attesa dopo l'applicazione:
--   select id, require_pin, access_pin from public.app_settings order by id;
--   -> 'admin'   | f | 1909
--   -> 'general' | f | 1909
