-- BadgeNode - Verifica retention 6 mesi per dipendente (read-only)
-- Eseguire su Supabase SQL Editor. Non modifica dati.

WITH dipendenti AS (
  SELECT pin, nome, cognome, 'attivo'::text AS stato
  FROM public.utenti
  UNION ALL
  SELECT pin, COALESCE(nome, '') AS nome, COALESCE(cognome, '') AS cognome, 'ex'::text AS stato
  FROM public.ex_dipendenti
),
timbrature_norm AS (
  SELECT
    t.pin,
    COALESCE(t.giorno_logico, t.giornologico, t.data_locale, (t.ts_order AT TIME ZONE 'Europe/Rome')::date) AS data_evento
  FROM public.timbrature t
),
agg AS (
  SELECT
    d.pin,
    d.nome,
    d.cognome,
    d.stato,
    COUNT(tn.*)::int AS tot_eventi,
    COUNT(*) FILTER (
      WHERE tn.data_evento >= (CURRENT_DATE - INTERVAL '6 months')
        AND tn.data_evento < CURRENT_DATE
    )::int AS eventi_ultimi_6_mesi,
    COUNT(*) FILTER (
      WHERE tn.data_evento < (CURRENT_DATE - INTERVAL '6 months')
    )::int AS eventi_fuori_retention,
    COUNT(*) FILTER (
      WHERE tn.data_evento > CURRENT_DATE
    )::int AS eventi_futuri_anomali,
    MIN(tn.data_evento) AS prima_data,
    MAX(tn.data_evento) AS ultima_data
  FROM dipendenti d
  LEFT JOIN timbrature_norm tn ON tn.pin = d.pin
  GROUP BY d.pin, d.nome, d.cognome, d.stato
)
SELECT *
FROM agg
ORDER BY stato, pin;

-- Check sintetico globale
WITH timbrature_norm AS (
  SELECT COALESCE(t.giorno_logico, t.giornologico, t.data_locale, (t.ts_order AT TIME ZONE 'Europe/Rome')::date) AS data_evento
  FROM public.timbrature t
)
SELECT
  COUNT(*) FILTER (WHERE data_evento < (CURRENT_DATE - INTERVAL '6 months'))::int AS fuori_retention_6m,
  COUNT(*) FILTER (WHERE data_evento > CURRENT_DATE)::int AS future_anomale,
  MIN(data_evento) AS prima_data_residua,
  MAX(data_evento) AS ultima_data_residua
FROM timbrature_norm;
