
-- Script per rimuovere definitivamente il constraint problematico
-- Esegui questo in Supabase SQL Editor

-- 1. Rimuovi il constraint problematico se esiste
ALTER TABLE public.timbrature DROP CONSTRAINT IF EXISTS timbrature_ore_check;

-- 2. Modifica la colonna ore per essere TEXT (compatibile con formato HH:MM:SS)
ALTER TABLE public.timbrature ALTER COLUMN ore TYPE TEXT;

-- 3. Verifica struttura finale
SELECT 'Constraint rimosso, colonna ore convertita in TEXT!' as status;
