-- Migration: Fix Giorno Logico con Cutoff 05:00
-- Data: 2025-10-13
-- Scopo: Implementa calcolo corretto giorno_logico con cutoff 05:00 Europe/Rome

-- Trigger per calcolo automatico giorno_logico con cutoff 05:00 Europe/Rome
CREATE OR REPLACE FUNCTION public.enforce_alternanza_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  ts_local timestamp;
  last_tipo text;
BEGIN
  -- Calcolo giorno_logico/data_locale/ora_locale se mancanti o per ricalcolo forzato
  -- AUTORITÀ FINALE: il trigger ricalcola sempre per garantire coerenza
  ts_local := (NEW.ts_order AT TIME ZONE 'Europe/Rome');
  
  -- CUTOFF 05:00: timbrature 00:00-04:59 → giorno precedente
  -- Questo risolve il problema delle sessioni notturne spezzate
  IF (ts_local::time < TIME '05:00') THEN
    NEW.giorno_logico := (ts_local::date - INTERVAL '1 day')::date;
  ELSE
    NEW.giorno_logico := ts_local::date;
  END IF;
  
  NEW.data_locale := ts_local::date;
  NEW.ora_locale  := ts_local::time(0);

  -- Alternanza per (pin, giorno_logico): entrata -> uscita -> entrata ...
  SELECT t.tipo
    INTO last_tipo
  FROM public.timbrature t
  WHERE t.pin = NEW.pin
    AND t.giorno_logico = NEW.giorno_logico
  ORDER BY t.ts_order DESC
  LIMIT 1;

  IF last_tipo IS NULL THEN
    -- Primo timbro del giorno: deve essere ENTRATA
    IF NEW.tipo <> 'entrata' THEN
      RAISE EXCEPTION 'Alternanza violata: il primo timbro del giorno deve essere ENTRATA'
        USING ERRCODE = 'P0001';
    END IF;
  ELSE
    -- Esige alternanza
    IF last_tipo = NEW.tipo THEN
      RAISE EXCEPTION 'Alternanza violata: timbro uguale al precedente nello stesso giorno_logico'
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END
$$;

-- Ricrea il trigger per garantire che sia attivo
DROP TRIGGER IF EXISTS trg_enforce_alternanza ON public.timbrature;
CREATE TRIGGER trg_enforce_alternanza
  BEFORE INSERT ON public.timbrature
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_alternanza_fn();

-- Commento per tracking
COMMENT ON FUNCTION public.enforce_alternanza_fn() IS 'Fix giorno_logico con cutoff 05:00 Europe/Rome - risolve sessioni notturne spezzate';

-- Correzione dati esistenti con giorno_logico errato
-- Identifica e corregge record con timbrature 00:00-04:59 assegnate al giorno sbagliato
UPDATE public.timbrature 
SET 
  giorno_logico = (
    CASE 
      WHEN ((ts_order AT TIME ZONE 'Europe/Rome')::time < TIME '05:00') 
      THEN ((ts_order AT TIME ZONE 'Europe/Rome')::date - INTERVAL '1 day')::date
      ELSE (ts_order AT TIME ZONE 'Europe/Rome')::date
    END
  ),
  data_locale = (ts_order AT TIME ZONE 'Europe/Rome')::date
WHERE 
  -- Solo record che hanno giorno_logico diverso da quello calcolato correttamente
  giorno_logico != (
    CASE 
      WHEN ((ts_order AT TIME ZONE 'Europe/Rome')::time < TIME '05:00') 
      THEN ((ts_order AT TIME ZONE 'Europe/Rome')::date - INTERVAL '1 day')::date
      ELSE (ts_order AT TIME ZONE 'Europe/Rome')::date
    END
  );
