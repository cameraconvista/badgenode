
-- Aggiunge solo colonne essenziali alle tabelle esistenti

-- Per tabella utenti
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS ore_contrattuali DECIMAL(4,2) DEFAULT 8.00;
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS descrizione_contratto TEXT;
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS ruolo TEXT DEFAULT 'dipendente';
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Per tabella timbrature (assicura che ore sia TEXT)
ALTER TABLE public.timbrature ALTER COLUMN ore TYPE TEXT;
ALTER TABLE public.timbrature ADD COLUMN IF NOT EXISTS giornologico DATE;
ALTER TABLE public.timbrature ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Rimuovi qualsiasi constraint problematico
ALTER TABLE public.timbrature DROP CONSTRAINT IF EXISTS timbrature_ore_check;

SELECT 'Colonne aggiornate!' as status;
