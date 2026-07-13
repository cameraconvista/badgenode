-- Rollback: 20260713T2200__app_settings_dual_pin
-- Riporta alla singola riga 'pin': rimuove 'general' e rinomina 'admin'->'pin'.
-- Non distruttivo oltre alla riga 'general' (config PIN app, non dati operativi).

delete from public.app_settings where id = 'general';

update public.app_settings
  set id = 'pin'
  where id = 'admin'
    and not exists (select 1 from public.app_settings where id = 'pin');
