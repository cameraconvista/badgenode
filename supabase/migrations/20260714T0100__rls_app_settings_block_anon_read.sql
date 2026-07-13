-- Migration: rimuove la lettura pubblica (anon/authenticated) di public.app_settings
-- Date: 2026-07-14
-- Governance: NON distruttiva sui DATI (nessuna riga toccata), modifica solo la policy RLS.
--
-- Scopo (sicurezza): oggi la policy "app_settings_select_all" (using true) permette a
--   CHIUNQUE con la chiave anon (pubblica, inclusa nel bundle del browser) di leggere
--   i PIN in chiaro via REST:
--     GET /rest/v1/app_settings?select=access_pin  ->  { "access_pin": "1909" }, ...
--   Questo espone il PIN admin a chiunque apra il codice della pagina.
--
-- Perché è SICURO rimuoverla:
--   Verificato che il frontend NON legge app_settings direttamente da Supabase:
--   legge PIN e config SOLO via server (client/src/services/settings.service.ts ->
--   safeFetchJson('/api/settings/...')). Il server usa SERVICE_ROLE_KEY, che bypassa
--   la RLS, quindi continuerà a leggere/scrivere normalmente. Nessuna funzionalità
--   dell'app dipende dalla SELECT pubblica.
--
-- Effetto: dopo questa migrazione la chiave anon NON può più leggere app_settings.
--   La lettura resta possibile solo lato server (service-role), come per le scritture.
--   RLS resta attiva; nessuna nuova policy di scrittura viene aggiunta.

-- Rimuove la policy di lettura pubblica. Con RLS attiva e nessuna policy SELECT per
-- anon/authenticated, ogni SELECT non-service_role è negata di default.
drop policy if exists "app_settings_select_all" on public.app_settings;

-- RLS resta attiva (nessuna modifica): confermato esplicitamente per chiarezza.
alter table if exists public.app_settings enable row level security;

-- Verifica manuale attesa dopo l'applicazione (NON parte della migrazione):
--   - SELECT anon su app_settings              -> [] (nessuna riga, RLS nega la lettura)
--   - GET  /api/settings/pin/admin (via server) -> { requirePin, pin } ancora OK
--   - Gate PIN nella Home / area admin          -> funziona come prima
