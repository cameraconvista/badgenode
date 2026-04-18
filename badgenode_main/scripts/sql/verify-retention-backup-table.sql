-- BadgeNode - Check tabella backup retention (read-only)
-- Non modifica dati.

-- 1) Esistenza tabella backup
SELECT
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'timbrature_retention_backup'
  ) AS backup_table_exists;

-- 2) Statistiche base backup (se esiste)
SELECT
  COUNT(*)::int AS backup_rows_total,
  MIN(COALESCE(giorno_logico, giornologico, data_locale, (ts_order AT TIME ZONE 'Europe/Rome')::date)) AS min_data,
  MAX(COALESCE(giorno_logico, giornologico, data_locale, (ts_order AT TIME ZONE 'Europe/Rome')::date)) AS max_data
FROM public.timbrature_retention_backup;

-- 3) Sovrapposizione tra backup e tabella operativa (controllo coerenza)
SELECT
  COUNT(*)::int AS overlap_rows
FROM public.timbrature t
JOIN public.timbrature_retention_backup b ON b.id = t.id;
