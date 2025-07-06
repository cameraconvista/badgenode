
-- Crea tabella per dipendenti archiviati
CREATE TABLE IF NOT EXISTS public.dipendenti_archiviati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin INTEGER NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  ore_contrattuali DECIMAL(4,2) DEFAULT 8.00,
  descrizione_contratto TEXT,
  data_archiviazione DATE NOT NULL DEFAULT CURRENT_DATE,
  file_excel_path TEXT, -- Path del file Excel generato
  file_excel_name TEXT, -- Nome del file Excel
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per prestazioni
CREATE INDEX IF NOT EXISTS idx_dipendenti_archiviati_pin ON public.dipendenti_archiviati(pin);
CREATE INDEX IF NOT EXISTS idx_dipendenti_archiviati_data ON public.dipendenti_archiviati(data_archiviazione);

-- RLS Policy
ALTER TABLE public.dipendenti_archiviati ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to dipendenti_archiviati" ON public.dipendenti_archiviati;

CREATE POLICY "Allow all access to dipendenti_archiviati" ON public.dipendenti_archiviati
  FOR ALL USING (true) WITH CHECK (true);

SELECT 'Tabella dipendenti_archiviati creata con successo!' as status;
