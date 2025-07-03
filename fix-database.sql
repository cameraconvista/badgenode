
-- Script per correggere il constraint del database
-- Esegui questo in Supabase SQL Editor

-- 1. Rimuovi il constraint problematico
ALTER TABLE public.timbrature DROP CONSTRAINT IF EXISTS timbrature_ore_check;

-- 2. Modifica la colonna ore per accettare il formato corretto
ALTER TABLE public.timbrature ALTER COLUMN ore TYPE TEXT;

-- 3. Aggiungi un constraint più flessibile per il formato HH:MM:SS
ALTER TABLE public.timbrature ADD CONSTRAINT timbrature_ore_format_check 
  CHECK (ore ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$');

-- 4. Verifica
SELECT 'Database constraint fixed!' as status;
