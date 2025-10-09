-- 🔒 SUPABASE POLICIES & INDICI SUGGERITI - BadgeNode
-- ATTENZIONE: NON ESEGUIRE DIRETTAMENTE - SOLO BOZZE E SUGGERIMENTI
-- Data: 09 Ottobre 2025
-- Progetto: BadgeNode - Sistema di timbratura con PIN

-- ============================================================================
-- 🚨 DISCLAIMER
-- ============================================================================
-- Questo file contiene SOLO suggerimenti e bozze di policies/indici.
-- NON eseguire direttamente senza:
-- 1. Backup completo del database
-- 2. Test su ambiente di sviluppo
-- 3. Verifica compatibilità con l'app esistente
-- 4. Approvazione del team

-- ============================================================================
-- 🔧 FUNZIONI HELPER (Da implementare prima delle policies)
-- ============================================================================

-- Funzione per verificare se l'utente corrente è admin
-- NOTA: Implementazione dipende dalla strategia di autenticazione scelta
/*
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Opzione 1: Basata su claim JWT custom
  -- RETURN (auth.jwt() ->> 'role') = 'admin';
  
  -- Opzione 2: Basata su tabella admin separata
  -- RETURN EXISTS (
  --   SELECT 1 FROM admin_users 
  --   WHERE user_id = auth.uid()
  -- );
  
  -- Opzione 3: Per ora, sempre false (solo ANON access)
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Funzione per ottenere il PIN dell'utente corrente
-- NOTA: Richiede mapping tra auth.uid e utenti.pin
/*
CREATE OR REPLACE FUNCTION get_current_pin()
RETURNS INTEGER AS $$
BEGIN
  -- Se implementata autenticazione per utenti
  -- RETURN (
  --   SELECT pin FROM utenti 
  --   WHERE auth_user_id = auth.uid()
  -- );
  
  -- Per ora, null (solo ANON access)
  RETURN null;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- ============================================================================
-- 🔒 POLICIES RLS SUGGERITE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabella: timbrature
-- ----------------------------------------------------------------------------

-- Abilita RLS sulla tabella (se non già attivo)
-- ALTER TABLE timbrature ENABLE ROW LEVEL SECURITY;

-- Policy per lettura timbrature
-- Permette: lettura proprie timbrature (se autenticati) o tutte (se admin)
/*
CREATE POLICY "timbrature_select_policy" ON timbrature
FOR SELECT USING (
  -- Caso 1: Utente autenticato legge le proprie
  (auth.uid() IS NOT NULL AND pin = get_current_pin())
  OR
  -- Caso 2: Admin legge tutto
  is_admin()
  OR
  -- Caso 3: ANON access (comportamento attuale)
  -- ATTENZIONE: Rimuovere questa riga quando si implementa l'auth
  auth.uid() IS NULL
);
*/

-- Policy per inserimento timbrature
-- Permette: inserimento solo per proprio PIN o se admin
/*
CREATE POLICY "timbrature_insert_policy" ON timbrature
FOR INSERT WITH CHECK (
  -- Caso 1: Utente autenticato inserisce per proprio PIN
  (auth.uid() IS NOT NULL AND pin = get_current_pin())
  OR
  -- Caso 2: Admin inserisce per qualsiasi PIN
  is_admin()
);
*/

-- Policy per aggiornamento timbrature
-- Permette: solo admin può modificare
/*
CREATE POLICY "timbrature_update_policy" ON timbrature
FOR UPDATE USING (is_admin());
*/

-- Policy per eliminazione timbrature
-- Permette: solo admin può eliminare
/*
CREATE POLICY "timbrature_delete_policy" ON timbrature
FOR DELETE USING (is_admin());
*/

-- ----------------------------------------------------------------------------
-- Tabella: utenti
-- ----------------------------------------------------------------------------

-- Abilita RLS sulla tabella (se non già attivo)
-- ALTER TABLE utenti ENABLE ROW LEVEL SECURITY;

-- Policy per lettura utenti (anagrafica pubblica)
/*
CREATE POLICY "utenti_select_policy" ON utenti
FOR SELECT USING (true);
*/

-- Policy per inserimento utenti (solo admin)
/*
CREATE POLICY "utenti_insert_policy" ON utenti
FOR INSERT WITH CHECK (is_admin());
*/

-- Policy per aggiornamento utenti (solo admin)
/*
CREATE POLICY "utenti_update_policy" ON utenti
FOR UPDATE USING (is_admin());
*/

-- Policy per eliminazione utenti (solo admin)
-- NOTA: Dovrebbe triggerare archiviazione in ex_dipendenti
/*
CREATE POLICY "utenti_delete_policy" ON utenti
FOR DELETE USING (is_admin());
*/

-- ----------------------------------------------------------------------------
-- Tabella: ex_dipendenti
-- ----------------------------------------------------------------------------

-- Abilita RLS sulla tabella (se non già attivo)
-- ALTER TABLE ex_dipendenti ENABLE ROW LEVEL SECURITY;

-- Policy per lettura ex_dipendenti (solo admin)
/*
CREATE POLICY "ex_dipendenti_select_policy" ON ex_dipendenti
FOR SELECT USING (is_admin());
*/

-- Policy per inserimento ex_dipendenti (solo admin o trigger)
/*
CREATE POLICY "ex_dipendenti_insert_policy" ON ex_dipendenti
FOR INSERT WITH CHECK (is_admin());
*/

-- Policy per aggiornamento ex_dipendenti (negato - immutabile)
/*
CREATE POLICY "ex_dipendenti_update_policy" ON ex_dipendenti
FOR UPDATE USING (false);
*/

-- Policy per eliminazione ex_dipendenti (negato - permanente)
/*
CREATE POLICY "ex_dipendenti_delete_policy" ON ex_dipendenti
FOR DELETE USING (false);
*/

-- ============================================================================
-- 📊 INDICI PERFORMANCE SUGGERITI
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabella: timbrature
-- ----------------------------------------------------------------------------

-- Indice composito per filtri frequenti (pin + giornologico)
-- Ottimizza: SELECT * FROM timbrature WHERE pin = X AND giornologico BETWEEN Y AND Z
/*
CREATE INDEX IF NOT EXISTS idx_timbrature_pin_giornologico 
ON timbrature(pin, giornologico);
*/

-- Indice per ordinamento cronologico
-- Ottimizza: SELECT * FROM timbrature ORDER BY created_at DESC
/*
CREATE INDEX IF NOT EXISTS idx_timbrature_created_at 
ON timbrature(created_at DESC);
*/

-- Indice per filtri realtime
-- Ottimizza: Sottoscrizioni realtime filtrate per PIN
/*
CREATE INDEX IF NOT EXISTS idx_timbrature_pin 
ON timbrature(pin);
*/

-- Indice per range queries su data
-- Ottimizza: Filtri per periodo senza PIN specifico
/*
CREATE INDEX IF NOT EXISTS idx_timbrature_giornologico 
ON timbrature(giornologico);
*/

-- ----------------------------------------------------------------------------
-- Tabella: utenti
-- ----------------------------------------------------------------------------

-- Indice per ricerca per PIN
-- Ottimizza: SELECT * FROM utenti WHERE pin = X
/*
CREATE INDEX IF NOT EXISTS idx_utenti_pin 
ON utenti(pin);
*/

-- Indice per ordinamento alfabetico
-- Ottimizza: SELECT * FROM utenti ORDER BY cognome, nome
/*
CREATE INDEX IF NOT EXISTS idx_utenti_nome_cognome 
ON utenti(cognome, nome);
*/

-- ----------------------------------------------------------------------------
-- Vista: v_turni_giornalieri
-- ----------------------------------------------------------------------------

-- Se la vista è materializzata, indici suggeriti:
/*
-- Indice composito per filtri frequenti
CREATE INDEX IF NOT EXISTS idx_turni_pin_giornologico 
ON v_turni_giornalieri(pin, giornologico);

-- Indice per aggregazioni mensili
CREATE INDEX IF NOT EXISTS idx_turni_giornologico 
ON v_turni_giornalieri(giornologico);
*/

-- ============================================================================
-- 🔄 TRIGGER SUGGERITI
-- ============================================================================

-- Trigger per archiviazione automatica utenti eliminati
/*
CREATE OR REPLACE FUNCTION archive_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserisce l'utente eliminato in ex_dipendenti
  INSERT INTO ex_dipendenti (
    pin, nome, cognome, email, telefono, 
    ore_contrattuali, descrizione_contratto,
    archiviato_at, motivo_archiviazione
  ) VALUES (
    OLD.pin, OLD.nome, OLD.cognome, OLD.email, OLD.telefono,
    OLD.ore_contrattuali, OLD.descrizione_contratto,
    NOW(), 'Eliminazione da pannello admin'
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Associa il trigger alla tabella utenti
CREATE TRIGGER trigger_archive_user
  BEFORE DELETE ON utenti
  FOR EACH ROW
  EXECUTE FUNCTION archive_deleted_user();
*/

-- Trigger per log modifiche timbrature (audit trail)
/*
CREATE TABLE IF NOT EXISTS timbrature_audit (
  id SERIAL PRIMARY KEY,
  operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
  timbratura_id UUID,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_timbrature_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO timbrature_audit (operation, timbratura_id, old_data, changed_by)
    VALUES ('DELETE', OLD.id, to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO timbrature_audit (operation, timbratura_id, old_data, new_data, changed_by)
    VALUES ('UPDATE', NEW.id, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO timbrature_audit (operation, timbratura_id, new_data, changed_by)
    VALUES ('INSERT', NEW.id, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Associa il trigger alla tabella timbrature
CREATE TRIGGER trigger_audit_timbrature
  AFTER INSERT OR UPDATE OR DELETE ON timbrature
  FOR EACH ROW
  EXECUTE FUNCTION audit_timbrature_changes();
*/

-- ============================================================================
-- 🔍 QUERY DI VERIFICA SUGGERITE
-- ============================================================================

-- Verifica policies attive
/*
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('timbrature', 'utenti', 'ex_dipendenti')
ORDER BY tablename, policyname;
*/

-- Verifica indici esistenti
/*
SELECT 
  schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('timbrature', 'utenti', 'ex_dipendenti')
ORDER BY tablename, indexname;
*/

-- Test performance query frequenti
/*
EXPLAIN ANALYZE 
SELECT * FROM timbrature 
WHERE pin = 7 
  AND giornologico BETWEEN '2024-09-01' AND '2024-09-30'
ORDER BY giornologico;
*/

-- ============================================================================
-- 📋 CHECKLIST PRE-IMPLEMENTAZIONE
-- ============================================================================

/*
PRIMA DI APPLICARE QUALSIASI MODIFICA:

1. BACKUP COMPLETO
   □ Backup database completo
   □ Export policies esistenti
   □ Backup configurazione Supabase

2. AMBIENTE TEST
   □ Creare ambiente di test identico
   □ Testare policies su dati di test
   □ Verificare compatibilità app

3. STRATEGIA AUTH
   □ Definire se usare auth.users o solo ANON
   □ Implementare funzioni helper (is_admin, get_current_pin)
   □ Mappare utenti esistenti se necessario

4. IMPLEMENTAZIONE GRADUALE
   □ Applicare una policy alla volta
   □ Testare ogni modifica
   □ Monitorare performance
   □ Rollback plan pronto

5. VERIFICA POST-IMPLEMENTAZIONE
   □ Test funzionalità app completa
   □ Verifica permissions corrette
   □ Controllo performance query
   □ Monitoraggio errori RLS

6. DOCUMENTAZIONE
   □ Aggiornare documentazione policies
   □ Procedure troubleshooting
   □ Guida manutenzione
*/

-- ============================================================================
-- 🚨 NOTE FINALI
-- ============================================================================

/*
IMPORTANTE:
- Questo file contiene SOLO suggerimenti
- NON eseguire senza test approfonditi
- Adattare alle specifiche esigenze del progetto
- Consultare documentazione Supabase per best practices
- Considerare impatto su performance e usabilità

CONTATTI:
- Per domande su implementazione: consultare team database
- Per test policies: usare ambiente di sviluppo dedicato
- Per emergenze: procedure rollback documentate

VERSIONE: 1.0 - 09/10/2025
PROSSIMA REVIEW: Da programmare dopo implementazione
*/
