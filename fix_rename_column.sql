-- Rinomina colonna ore_contrattuali in ore_giornaliere
ALTER TABLE public.utenti RENAME COLUMN ore_contrattuali TO ore_giornaliere;

-- Verifica il risultato
SELECT pin, nome, cognome, ore_giornaliere FROM public.utenti;
