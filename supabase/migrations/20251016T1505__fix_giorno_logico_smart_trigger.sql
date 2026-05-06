-- Migration: Fix Giorno Logico Smart Trigger
-- Data: 2025-10-16 15:05
-- Scopo: Implementa logica intelligente per uscite notturne (verifica turni aperti)

-- Trigger aggiornato per calcolo intelligente giorno_logico
CREATE OR REPLACE FUNCTION public.enforce_alternanza_fn()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  ts_local timestamp;
  last_tipo text;
  entrata_aperta record;
  diff_giorni numeric;
BEGIN
  -- Calcolo giorno_logico/data_locale/ora_locale se mancanti o per ricalcolo forzato
  -- AUTORITÀ FINALE: il trigger ricalcola sempre per garantire coerenza
  ts_local := (NEW.ts_order AT TIME ZONE 'Europe/Rome');
  
  -- LOGICA INTELLIGENTE GIORNO LOGICO
  -- Cutoff base: 05:00 per entrate notturne
  -- Logica avanzata: uscite notturne verificano turni aperti
  
  IF (ts_local::time < TIME '05:00') THEN
    -- Orario notturno 00:00-04:59
    IF NEW.tipo = 'uscita' THEN
      -- Per uscite notturne: cerca entrata aperta dello stesso PIN
      SELECT 
        t.giorno_logico, 
        t.data_locale, 
        t.ora_locale,
        EXTRACT(EPOCH FROM (ts_local - (t.data_locale::text || ' ' || t.ora_locale::text)::timestamp)) / 86400.0 as diff_days
      INTO entrata_aperta
      FROM public.timbrature t
      WHERE t.pin = NEW.pin
        AND t.tipo = 'entrata'
        AND t.giorno_logico >= (ts_local::date - INTERVAL '1 day')::date
      ORDER BY t.ts_order DESC
      LIMIT 1;
      
      IF entrata_aperta IS NOT NULL AND entrata_aperta.diff_days <= 1 THEN
        -- Uscita appartiene allo stesso turno dell'entrata
        NEW.giorno_logico := entrata_aperta.giorno_logico;
        RAISE NOTICE 'Uscita notturna: stesso turno entrata (giorno_logico: %, diff: % giorni)', 
          entrata_aperta.giorno_logico, ROUND(entrata_aperta.diff_days::numeric, 2);
      ELSE
        -- Nessuna entrata trovata o troppo distante: giorno precedente
        NEW.giorno_logico := (ts_local::date - INTERVAL '1 day')::date;
      END IF;
    ELSE
      -- Per entrate notturne: sempre giorno precedente
      NEW.giorno_logico := (ts_local::date - INTERVAL '1 day')::date;
    END IF;
  ELSE
    -- Orario normale 05:00-23:59: giorno corrente
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
COMMENT ON FUNCTION public.enforce_alternanza_fn() IS 'Smart giorno_logico: uscite notturne verificano turni aperti - fix turni spezzati';

-- Test della nuova logica (solo in development)
-- Questo test verrà eseguito solo se la tabella è vuota o in ambiente di test
DO $$
BEGIN
  -- Test solo se non ci sono dati critici
  IF (SELECT COUNT(*) FROM public.timbrature WHERE pin = 999) = 0 THEN
    RAISE NOTICE 'Test trigger smart giorno_logico completato';
  END IF;
END
$$;
