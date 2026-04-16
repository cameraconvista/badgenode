-- Migration: Aggiunge campi extra alla tabella utenti
-- Data: 2025-11-02
-- Scopo: Rendere modificabili email, telefono, ore_contrattuali, note

-- Aggiungi colonne se non esistono
ALTER TABLE utenti 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS ore_contrattuali NUMERIC(4,2) DEFAULT 8.00,
ADD COLUMN IF NOT EXISTS note TEXT;

-- Commenti per documentazione
COMMENT ON COLUMN utenti.email IS 'Email dipendente (opzionale)';
COMMENT ON COLUMN utenti.telefono IS 'Numero telefono dipendente (opzionale)';
COMMENT ON COLUMN utenti.ore_contrattuali IS 'Ore massime giornaliere da contratto (default 8.00)';
COMMENT ON COLUMN utenti.note IS 'Note amministrative (opzionale)';
