-- Rollback: 20260713T2100__create_app_settings_pin
-- Rimuove la policy e la tabella app_settings create dalla migrazione up.
-- NB: distruttivo per la sola tabella app_settings (config PIN), che non contiene
--   dati operativi critici. Non tocca nessun'altra tabella.

drop policy if exists "app_settings_select_all" on public.app_settings;
drop table if exists public.app_settings;
