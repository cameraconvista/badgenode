-- Rollback: 20260713T2300__app_settings_alert_config
-- Rimuove la riga 'alert' e la colonna config. Non tocca le righe PIN né altri dati.

delete from public.app_settings where id = 'alert';
alter table if exists public.app_settings drop column if exists config;
