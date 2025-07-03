
-- BADGEBOX - Script di creazione database
-- Eseguire questo script nel SQL Editor di Supabase

-- Creazione tabella utenti
CREATE TABLE IF NOT EXISTS public.utenti (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pin integer UNIQUE NOT NULL CHECK (pin >= 1 AND pin <= 99),
    nome text NOT NULL,
    cognome text NOT NULL,
    email text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Creazione tabella timbrature
CREATE TABLE IF NOT EXISTS public.timbrature (
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

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_utenti_pin ON public.utenti(pin);
CREATE INDEX IF NOT EXISTS idx_timbrature_pin ON public.timbrature(pin);
CREATE INDEX IF NOT EXISTS idx_timbrature_data ON public.timbrature(data);
CREATE INDEX IF NOT EXISTS idx_timbrature_giornologico ON public.timbrature(giornologico);
CREATE INDEX IF NOT EXISTS idx_timbrature_pin_data ON public.timbrature(pin, data);

-- Trigger per aggiornamento automatico timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_utenti_updated_at 
    BEFORE UPDATE ON public.utenti 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Commenti per documentazione
COMMENT ON TABLE public.utenti IS 'Anagrafica dipendenti del sistema BADGEBOX';
COMMENT ON TABLE public.timbrature IS 'Registro timbrature entrate/uscite dipendenti';
COMMENT ON COLUMN public.utenti.pin IS 'PIN numerico univoco per timbratura (1-99)';
COMMENT ON COLUMN public.timbrature.giornologico IS 'Data del giorno lavorativo (per uscite dopo mezzanotte)';

-- Inserimento utente di test (opzionale)
-- INSERT INTO public.utenti (pin, nome, cognome, email) 
-- VALUES (99, 'Test', 'Utente', 'test@badgebox.com');
