
-- Aggiunge colonne mancanti alla tabella utenti
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS ore_giornaliere DECIMAL(4,2) DEFAULT 8.00;
ALTER TABLE public.utenti ADD COLUMN IF NOT EXISTS descrizione_contratto TEXT;

-- Assicura che PIN sia la chiave primaria
ALTER TABLE public.utenti DROP CONSTRAINT IF EXISTS utenti_pkey;
ALTER TABLE public.utenti ADD CONSTRAINT utenti_pkey PRIMARY KEY (pin);

-- Aggiunge constraint per PIN
ALTER TABLE public.utenti ADD CONSTRAINT check_pin_range CHECK (pin BETWEEN 1 AND 99);
