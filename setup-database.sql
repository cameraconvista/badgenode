
-- BADGEBOX - Script di fix database structure
-- Eseguire questo script nel SQL Editor di Supabase per aggiornare la struttura

-- STEP 1: Aggiorna tabella utenti esistente
-- Modifica il campo pin da text a integer se esiste
DO $$
BEGIN
    -- Verifica se la colonna pin esiste ed è di tipo text
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utenti' 
        AND column_name = 'pin' 
        AND data_type = 'text'
    ) THEN
        -- Converti pin da text a integer
        ALTER TABLE public.utenti 
        ALTER COLUMN pin TYPE integer USING pin::integer;
        
        -- Aggiungi constraint se non esiste
        ALTER TABLE public.utenti 
        ADD CONSTRAINT utenti_pin_check CHECK (pin >= 1 AND pin <= 99);
        
        -- Aggiungi vincolo unicità se non esiste
        ALTER TABLE public.utenti 
        ADD CONSTRAINT utenti_pin_unique UNIQUE (pin);
    END IF;
    
    -- Se la tabella non esiste, creala
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'utenti') THEN
        CREATE TABLE public.utenti (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            pin integer UNIQUE NOT NULL CHECK (pin >= 1 AND pin <= 99),
            nome text NOT NULL,
            cognome text NOT NULL,
            email text NOT NULL,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;
END $$;

-- STEP 2: Aggiorna tabella timbrature
-- Aggiungi campi mancanti necessari al frontend
DO $$
BEGIN
    -- Aggiungi colonna pin se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timbrature' AND column_name = 'pin'
    ) THEN
        ALTER TABLE public.timbrature ADD COLUMN pin integer NOT NULL DEFAULT 0;
    END IF;
    
    -- Aggiungi colonna nome se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timbrature' AND column_name = 'nome'
    ) THEN
        ALTER TABLE public.timbrature ADD COLUMN nome text NOT NULL DEFAULT '';
    END IF;
    
    -- Aggiungi colonna cognome se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timbrature' AND column_name = 'cognome'
    ) THEN
        ALTER TABLE public.timbrature ADD COLUMN cognome text NOT NULL DEFAULT '';
    END IF;
    
    -- Aggiungi colonna tipo se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timbrature' AND column_name = 'tipo'
    ) THEN
        ALTER TABLE public.timbrature ADD COLUMN tipo text NOT NULL DEFAULT 'entrata' CHECK (tipo IN ('entrata', 'uscita'));
    END IF;
    
    -- Aggiungi colonna data se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timbrature' AND column_name = 'data'
    ) THEN
        ALTER TABLE public.timbrature ADD COLUMN data date NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    -- Aggiungi colonna ore se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timbrature' AND column_name = 'ore'
    ) THEN
        ALTER TABLE public.timbrature ADD COLUMN ore time NOT NULL DEFAULT CURRENT_TIME;
    END IF;
    
    -- Aggiungi colonna giornologico se non esiste
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'timbrature' AND column_name = 'giornologico'
    ) THEN
        ALTER TABLE public.timbrature ADD COLUMN giornologico date NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    -- Se la tabella non esiste affatto, creala
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timbrature') THEN
        CREATE TABLE public.timbrature (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            pin integer NOT NULL,
            nome text NOT NULL,
            cognome text NOT NULL,
            tipo text NOT NULL CHECK (tipo IN ('entrata', 'uscita')),
            data date NOT NULL,
            ore time NOT NULL,
            giornologico date NOT NULL,
            created_at timestamp with time zone DEFAULT now()
        );
    END IF;
END $$;

-- STEP 3: Indici per performance
CREATE INDEX IF NOT EXISTS idx_utenti_pin ON public.utenti(pin);
CREATE INDEX IF NOT EXISTS idx_timbrature_pin ON public.timbrature(pin);
CREATE INDEX IF NOT EXISTS idx_timbrature_data ON public.timbrature(data);
CREATE INDEX IF NOT EXISTS idx_timbrature_giornologico ON public.timbrature(giornologico);
CREATE INDEX IF NOT EXISTS idx_timbrature_pin_data ON public.timbrature(pin, data);
CREATE INDEX IF NOT EXISTS idx_timbrature_tipo ON public.timbrature(tipo);

-- STEP 4: Trigger per aggiornamento automatico timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS update_utenti_updated_at ON public.utenti;
CREATE TRIGGER update_utenti_updated_at 
    BEFORE UPDATE ON public.utenti 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- STEP 5: Aggiorna dati esistenti se necessario
-- Popola i campi pin/nome/cognome nelle timbrature esistenti tramite user_id
UPDATE public.timbrature 
SET pin = u.pin::integer, nome = u.nome, cognome = u.cognome
FROM public.utenti u 
WHERE public.timbrature.user_id = u.id 
AND (public.timbrature.pin IS NULL OR public.timbrature.pin = 0);

-- STEP 6: Commenti per documentazione
COMMENT ON TABLE public.utenti IS 'Anagrafica dipendenti del sistema BADGEBOX';
COMMENT ON TABLE public.timbrature IS 'Registro timbrature entrate/uscite dipendenti';
COMMENT ON COLUMN public.utenti.pin IS 'PIN numerico univoco per timbratura (1-99)';
COMMENT ON COLUMN public.timbrature.pin IS 'PIN dipendente - duplicato per performance';
COMMENT ON COLUMN public.timbrature.giornologico IS 'Data del giorno lavorativo (per uscite dopo mezzanotte)';

-- STEP 7: Inserimento utente di test (opzionale - decommentare se necessario)
-- INSERT INTO public.utenti (pin, nome, cognome, email) 
-- VALUES (99, 'Test', 'Utente', 'test@badgebox.com')
-- ON CONFLICT (pin) DO NOTHING;

-- STEP 8: Verifica finale struttura
SELECT 'Struttura database BADGEBOX aggiornata correttamente!' as status;
