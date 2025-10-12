-- Crea RPC per inserire utenti (bypassa RLS)
-- Simile a insert_timbro_v2 ma per utenti

CREATE OR REPLACE FUNCTION public.insert_utente_v1(
  p_pin INTEGER,
  p_nome TEXT,
  p_cognome TEXT
)
RETURNS TABLE(
  pin INTEGER,
  nome TEXT,
  cognome TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- Esegue con privilegi del proprietario (bypassa RLS)
AS $$
BEGIN
  -- Validazione PIN (1-99)
  IF p_pin IS NULL OR p_pin < 1 OR p_pin > 99 THEN
    RAISE EXCEPTION 'PIN deve essere tra 1 e 99' USING ERRCODE = 'P0001';
  END IF;

  -- Validazione nome e cognome
  IF p_nome IS NULL OR trim(p_nome) = '' THEN
    RAISE EXCEPTION 'Nome obbligatorio' USING ERRCODE = 'P0001';
  END IF;

  IF p_cognome IS NULL OR trim(p_cognome) = '' THEN
    RAISE EXCEPTION 'Cognome obbligatorio' USING ERRCODE = 'P0001';
  END IF;

  -- Upsert utente (insert o update se PIN esiste)
  INSERT INTO public.utenti (pin, nome, cognome)
  VALUES (p_pin, trim(p_nome), trim(p_cognome))
  ON CONFLICT (pin) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    cognome = EXCLUDED.cognome;

  -- Ritorna il record inserito/aggiornato
  RETURN QUERY
  SELECT u.pin, u.nome, u.cognome, u.created_at
  FROM public.utenti u
  WHERE u.pin = p_pin;
END;
$$;

-- Commento per documentazione
COMMENT ON FUNCTION public.insert_utente_v1(INTEGER, TEXT, TEXT) IS 
'Inserisce o aggiorna un utente. Bypassa RLS per permettere inserimenti con anon key.';
