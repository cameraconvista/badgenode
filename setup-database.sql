-- SETUP DATABASE BADGEBOX - Versione corretta senza constraint problematici
-- Solo per tabelle: utenti e timbrature
CREATE TABLE IF NOT EXISTS public.utenti (
  pin INTEGER PRIMARY KEY CHECK (pin BETWEEN 1 AND 99),
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL, 
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  ore_contrattuali DECIMAL(4,2) DEFAULT 8.00,
  descrizione_contratto TEXT,
  ruolo TEXT DEFAULT 'dipendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.timbrature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin INTEGER NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrata', 'uscita')),
  data DATE NOT NULL,
  ore TEXT NOT NULL,
  giornologico DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_timbrature_utenti 
    FOREIGN KEY (pin) REFERENCES public.utenti(pin) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_utenti_pin ON public.utenti(pin);
CREATE INDEX IF NOT EXISTS idx_timbrature_pin ON public.timbrature(pin);
CREATE INDEX IF NOT EXISTS idx_timbrature_data ON public.timbrature(data);
CREATE INDEX IF NOT EXISTS idx_timbrature_giornologico ON public.timbrature(giornologico);

INSERT INTO public.utenti (pin, nome, cognome, email, telefono, ore_contrattuali, descrizione_contratto) 
VALUES
(1, 'Mario', 'Rossi', 'mario.rossi@example.com', '+39 123 456 7890', 8.00, 'Contratto a tempo indeterminato'),
(2, 'Luigi', 'Verdi', 'luigi.verdi@example.com', '+39 098 765 4321', 6.00, 'Contratto part-time'),
(99, 'Admin', 'System', 'admin@example.com', '+39 000 000 0000', 8.00, 'Amministratore di sistema')
ON CONFLICT (pin) DO NOTHING;

ALTER TABLE public.utenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timbrature ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to utenti" ON public.utenti;
DROP POLICY IF EXISTS "Allow all access to timbrature" ON public.timbrature;

CREATE POLICY "Allow all access to utenti" ON public.utenti
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to timbrature" ON public.timbrature  
  FOR ALL USING (true) WITH CHECK (true);

SELECT 'Setup completato - Solo tabelle utenti e timbrature!' as status;