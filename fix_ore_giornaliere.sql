-- Modifica tipo colonna ore_giornaliere da TEXT a DECIMAL
ALTER TABLE public.utenti ALTER COLUMN ore_giornaliere TYPE DECIMAL(4,2) USING ore_giornaliere::DECIMAL(4,2);

-- Imposta valore di default
ALTER TABLE public.utenti ALTER COLUMN ore_giornaliere SET DEFAULT 8.00;

-- Aggiorna record con valori NULL
UPDATE public.utenti SET ore_giornaliere = 8.00 WHERE ore_giornaliere IS NULL;

-- Verifica il risultato
SELECT pin, nome, cognome, ore_giornaliere FROM public.utenti;
