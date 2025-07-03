-- SETUP DATABASE BADGEBOX - Versione corretta per il frontend
-- Data: 2025-01-03

-- 1. Elimina tabelle esistenti se presenti
DROP TABLE IF EXISTS public.timbrature CASCADE;
DROP TABLE IF EXISTS public.utenti CASCADE;

-- 2. Crea tabella utenti con PIN numerico come chiave primaria
CREATE TABLE public.utenti (
  pin INTEGER PRIMARY KEY CHECK (pin BETWEEN 1 AND 99),
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL, 
  email TEXT UNIQUE NOT NULL,
  ruolo TEXT DEFAULT 'dipendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crea tabella timbrature compatibile con il frontend
CREATE TABLE public.timbrature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin INTEGER NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrata', 'uscita')),
  data DATE NOT NULL,
  ore TIME NOT NULL,
  giornologico DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Foreign key verso utenti
  CONSTRAINT fk_timbrature_utenti 
    FOREIGN KEY (pin) REFERENCES public.utenti(pin) 
    ON DELETE CASCADE
);

-- 4. Crea indici per performance
CREATE INDEX idx_timbrature_pin ON public.timbrature(pin);
CREATE INDEX idx_timbrature_data ON public.timbrature(data);
CREATE INDEX idx_timbrature_giornologico ON public.timbrature(giornologico);
CREATE INDEX idx_timbrature_pin_data ON public.timbrature(pin, data);

-- 5. Crea trigger per calcolo automatico giornologico
CREATE OR REPLACE FUNCTION calcola_giorno_logico()
RETURNS TRIGGER AS $$
BEGIN
  -- Se l'ora è tra 00:00 e 04:59, il giorno logico è il giorno precedente
  IF EXTRACT(HOUR FROM NEW.ore) BETWEEN 0 AND 4 THEN
    NEW.giornologico := NEW.data - INTERVAL '1 day';
  ELSE
    NEW.giornologico := NEW.data;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_giorno_logico
  BEFORE INSERT OR UPDATE ON public.timbrature
  FOR EACH ROW
  EXECUTE FUNCTION calcola_giorno_logico();

-- 6. Inserisci utenti di esempio
INSERT INTO public.utenti (pin, nome, cognome, email) VALUES
(1, 'Mario', 'Rossi', 'mario.rossi@example.com'),
(2, 'Luigi', 'Verdi', 'luigi.verdi@example.com'),
(99, 'Admin', 'System', 'admin@example.com');

-- 7. Inserisci timbrature di esempio per test
INSERT INTO public.timbrature (pin, nome, cognome, tipo, data, ore) VALUES
(1, 'Mario', 'Rossi', 'entrata', CURRENT_DATE, '08:00:00'),
(1, 'Mario', 'Rossi', 'uscita', CURRENT_DATE, '17:00:00'),
(2, 'Luigi', 'Verdi', 'entrata', CURRENT_DATE, '09:00:00'),
(2, 'Luigi', 'Verdi', 'uscita', CURRENT_DATE, '18:00:00');

-- 8. Abilita RLS (Row Level Security) per sicurezza
ALTER TABLE public.utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timbrature ENABLE ROW LEVEL SECURITY;

-- 9. Crea policy per accesso pubblico (temporaneo per sviluppo)
CREATE POLICY "Allow all access to utenti" ON public.utenti
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to timbrature" ON public.timbrature  
  FOR ALL USING (true) WITH CHECK (true);

-- 10. Verifica finale
SELECT 'Setup completato!' as status;
SELECT 'Utenti creati:', COUNT(*) FROM public.utenti;
SELECT 'Timbrature create:', COUNT(*) FROM public.timbrature;

-- Note per il debugging:
-- Per visualizzare la struttura: \d+ utenti \d+ timbrature
-- Per testare le timbrature: SELECT * FROM timbrature WHERE pin = 1;