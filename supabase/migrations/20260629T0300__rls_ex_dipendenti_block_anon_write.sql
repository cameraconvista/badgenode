-- Migration: RLS ex_dipendenti — blocca scritture anonime (allinea a utenti/timbrature)
-- Date: 2026-06-29
-- Governance: Idempotente, NON distruttivo. Non tocca dati, non droppa colonne.
--   Allinea le policy di public.ex_dipendenti a quelle gia' attive su public.utenti:
--   la chiave pubblica (anon) puo' LEGGERE (comportamento attuale invariato), ma
--   NON puo' piu' INSERT/UPDATE/DELETE. Le scritture restano possibili solo lato
--   server con SERVICE_ROLE_KEY (che bypassa la RLS), come gia' avviene per l'app.
--
-- Contesto (audit 2026-06-29): il catalogo (pg_tables.rowsecurity) ha rivelato che
--   public.ex_dipendenti aveva la RLS DISATTIVATA (rls_attiva = false), percio' una
--   INSERT anonima diretta riusciva (201). Su utenti/timbrature la RLS e' attiva e
--   le scritture anon sono negate (401, codice 42501). Questa migrazione attiva la
--   RLS su ex_dipendenti replicando ESATTAMENTE il pattern di utenti:
--     RLS ON + una sola policy "<tabella>_select_all" SELECT using(true), nessuna
--     policy di write -> letture consentite, scritture anon negate di default.
--
-- IMPORTANTE: applicare SOLO previa conferma, in sessione dedicata. Verificare dopo
--   l'applicazione che l'app (lettura archivio ex-dipendenti via backend) funzioni.

-- 1) Assicura che la RLS sia attiva sulla tabella.
alter table if exists public.ex_dipendenti enable row level security;

-- 2) Rimuove eventuali policy permissive note che consentono scritture a chiunque.
--    (idempotente: 'if exists' non fallisce se la policy non c'e').
--    NB: i nomi coprono le convenzioni piu' comuni generate dalla dashboard Supabase.
drop policy if exists "Enable insert for anon" on public.ex_dipendenti;
drop policy if exists "Enable insert access for all users" on public.ex_dipendenti;
drop policy if exists "Allow anonymous insert" on public.ex_dipendenti;
drop policy if exists "ex_dipendenti_insert_anon" on public.ex_dipendenti;
drop policy if exists "Enable all access" on public.ex_dipendenti;
drop policy if exists "Enable all for all users" on public.ex_dipendenti;

-- 3) Policy di LETTURA esplicita (mantiene il comportamento attuale: SELECT consentita).
--    Se gia' esiste una policy SELECT equivalente, questa e' ridondante ma innocua;
--    la ricreiamo con un nome noto per chiarezza/manutenibilita'.
drop policy if exists "ex_dipendenti_select_all" on public.ex_dipendenti;
create policy "ex_dipendenti_select_all"
  on public.ex_dipendenti
  for select
  to anon, authenticated
  using (true);

-- 4) NESSUNA policy di INSERT/UPDATE/DELETE per i ruoli pubblici (anon/authenticated):
--    in assenza di policy permissive, con RLS attiva, ogni scrittura non-service_role
--    e' negata di default. Le scritture lato server usano SERVICE_ROLE_KEY (bypassa RLS).

-- Verifica manuale attesa dopo l'applicazione (NON parte di questa migrazione):
--   - INSERT anon su ex_dipendenti  -> 401 (42501) come su utenti
--   - SELECT anon su ex_dipendenti  -> 200 (invariato)
--   - archivio/ripristino dipendente dall'app (via backend) -> funzionante
