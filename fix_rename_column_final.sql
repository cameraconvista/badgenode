
-- Rinomina la colonna ore_giornaliere in ore_contrattuali
ALTER TABLE public.utenti RENAME COLUMN ore_giornaliere TO ore_contrattuali;

-- Verifica il risultato
SELECT pin, nome, cognome, ore_contrattuali FROM public.utenti ORDER BY pin;

-- Mostra la struttura della tabella aggiornata
\d public.utenti;
