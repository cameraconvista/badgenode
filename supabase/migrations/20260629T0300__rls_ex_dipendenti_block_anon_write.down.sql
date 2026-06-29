-- Rollback: RLS ex_dipendenti — annulla 20260629T0300__rls_ex_dipendenti_block_anon_write
-- Date: 2026-06-29
-- Governance: Idempotente. Rimuove SOLO le policy create dalla migrazione "up".
--
-- ATTENZIONE: questo rollback rimuove la policy SELECT esplicita e NON ripristina
--   la precedente policy permissiva di scrittura (che era il buco di sicurezza).
--   Lasciare RLS attiva senza policy = nessun accesso anon (piu' restrittivo).
--   Se serve davvero tornare allo stato pre-migrazione (scrittura anon aperta),
--   farlo manualmente e consapevolmente: NON e' consigliato.

drop policy if exists "ex_dipendenti_select_all" on public.ex_dipendenti;

-- La RLS resta attiva (non la disattiviamo: disattivarla riaprirebbe tutto).
-- alter table public.ex_dipendenti disable row level security;  -- NON eseguire salvo motivo esplicito
