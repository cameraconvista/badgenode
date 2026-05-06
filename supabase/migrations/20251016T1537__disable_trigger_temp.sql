-- Migration: Disabilita temporaneamente il trigger per permettere al server di gestire giorno_logico
-- Data: 2025-10-16 15:37
-- Scopo: Il server calcola correttamente giorno_logico, il trigger interferisce

-- Disabilita il trigger esistente
DROP TRIGGER IF EXISTS trg_enforce_alternanza ON public.timbrature;

-- Crea una versione semplificata che gestisce solo alternanza, non giorno_logico
CREATE OR REPLACE FUNCTION public.enforce_alternanza_simple_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  last_tipo text;
BEGIN
  -- NON toccare giorno_logico, data_locale, ora_locale (gestiti dal server)
  -- Solo validazione alternanza
  
  SELECT t.tipo::text INTO last_tipo
  FROM public.timbrature t
  WHERE t.pin = NEW.pin AND t.giorno_logico = NEW.giorno_logico
  ORDER BY t.ts_order DESC LIMIT 1;

  IF last_tipo IS NULL THEN
    -- Primo timbro del giorno: deve essere ENTRATA
    IF NEW.tipo::text <> 'entrata' THEN
      RAISE EXCEPTION 'Alternanza violata: il primo timbro del giorno deve essere ENTRATA';
    END IF;
  ELSE
    -- Esige alternanza
    IF last_tipo = NEW.tipo::text THEN
      RAISE EXCEPTION 'Alternanza violata: timbro uguale al precedente nello stesso giorno_logico';
    END IF;
  END IF;

  RETURN NEW;
END
$$;

-- Ricrea il trigger con la funzione semplificata
CREATE TRIGGER trg_enforce_alternanza_simple
  BEFORE INSERT ON public.timbrature
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_alternanza_simple_fn();

-- Commento per tracking
COMMENT ON FUNCTION public.enforce_alternanza_simple_fn() IS 'Trigger semplificato: solo alternanza, giorno_logico gestito dal server';
