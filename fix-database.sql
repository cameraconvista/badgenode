
-- Script per correggere il database esistente
-- Esegui questo se hai già creato la tabella con il setup precedente

-- 1. Rimuovi il constraint problematico se esiste
ALTER TABLE public.timbrature DROP CONSTRAINT IF EXISTS timbrature_ore_check;

-- 2. Aggiungi il constraint corretto
ALTER TABLE public.timbrature ADD CONSTRAINT timbrature_ore_check 
  CHECK (ore >= '00:00:00' AND ore <= '23:59:59');

-- 3. Verifica che non ci siano dati inconsistenti
SELECT id, ore FROM public.timbrature 
WHERE ore < '00:00:00' OR ore > '23:59:59';

-- 4. Se ci sono righe problematiche, cancellale o correggile
-- DELETE FROM public.timbrature WHERE ore < '00:00:00' OR ore > '23:59:59';

SELECT 'Database constraint fixed!' as status;
