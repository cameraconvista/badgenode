-- ===== SUPABASE FIX: POLICY PER ELIMINAZIONE UTENTI =====
-- Questo file contiene le policy SQL da eseguire in Supabase per risolvere 
-- l'errore "permission denied for table utenti" (codice 42501)

-- 1. VERIFICA POLICIES ESISTENTI
-- Esegui questo per vedere le policy attuali:
-- SELECT * FROM pg_policies WHERE tablename = 'utenti';

-- 2. CREA POLICY PER ELIMINAZIONE ADMIN
-- Permette eliminazione utenti con ANON_KEY (per admin)
CREATE POLICY "Admin can delete utenti" ON public.utenti
    FOR DELETE
    USING (true);  -- Permette a tutti (da restringere se necessario)

-- ALTERNATIVA PIÙ SICURA (se hai un sistema di autenticazione):
-- CREATE POLICY "Admin can delete utenti" ON public.utenti
--     FOR DELETE
--     USING (auth.role() = 'authenticated');

-- 3. ABILITA RLS SE NON ATTIVO
ALTER TABLE public.utenti ENABLE ROW LEVEL SECURITY;

-- 4. VERIFICA POLICY APPLICATE
-- Dopo aver eseguito, verifica con:
-- SELECT * FROM pg_policies WHERE tablename = 'utenti' AND cmd = 'DELETE';

-- ===== ISTRUZIONI =====
-- 1. Vai su https://supabase.com/dashboard
-- 2. Seleziona il progetto BadgeNode  
-- 3. Vai su "SQL Editor"
-- 4. Copia e incolla questo codice
-- 5. Clicca "Run" per eseguire
-- 6. Testa l'eliminazione nell'app

-- ===== SICUREZZA =====
-- ATTENZIONE: Questa policy permette eliminazione a tutti gli utenti anonimi.
-- In produzione, implementa un sistema di autenticazione più robusto.

-- ===== ROLLBACK (se necessario) =====
-- Per rimuovere la policy:
-- DROP POLICY IF EXISTS "Admin can delete utenti" ON public.utenti;
