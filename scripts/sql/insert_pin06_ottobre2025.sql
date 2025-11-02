-- ============================================================================
-- INSERIMENTO TIMBRATURE PIN 06 (Lucrezia Grimaldi) - OTTOBRE 2025
-- ============================================================================
-- Data: 2025-11-02T03:27:00+01:00
-- Regole giorno logico: cutoff 05:00
-- Timezone: Europe/Rome (UTC+2 fino 26 ott, UTC+1 dal 27 ott)
-- ============================================================================

-- STEP 1: Pulizia timbrature esistenti (opzionale)
-- Decommentare se si vuole ripartire da zero
-- DELETE FROM timbrature WHERE pin = 6 AND giorno_logico >= '2025-10-01' AND giorno_logico <= '2025-10-31';

-- ============================================================================
-- INSERIMENTI
-- ============================================================================

-- 1. 08 Ottobre (Mercoledì): 17:05 → 00:05 (giorno dopo)
-- giorno_logico: 2025-10-08
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-08T17:05:00+02:00', '2025-10-08', '2025-10-08', '17:05:00', NOW()),
  (6, 'uscita', '2025-10-09T00:05:00+02:00', '2025-10-08', '2025-10-09', '00:05:00', NOW());

-- 2. 10 Ottobre (Venerdì): 16:57 → 02:14 (giorno dopo)
-- giorno_logico: 2025-10-10
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-10T16:57:00+02:00', '2025-10-10', '2025-10-10', '16:57:00', NOW()),
  (6, 'uscita', '2025-10-11T02:14:00+02:00', '2025-10-10', '2025-10-11', '02:14:00', NOW());

-- 3. 11 Ottobre (Sabato): 16:58 → 02:20 (giorno dopo)
-- giorno_logico: 2025-10-11
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-11T16:58:00+02:00', '2025-10-11', '2025-10-11', '16:58:00', NOW()),
  (6, 'uscita', '2025-10-12T02:20:00+02:00', '2025-10-11', '2025-10-12', '02:20:00', NOW());

-- 4. 15 Ottobre (Mercoledì): 16:58 → 00:21 (giorno dopo)
-- giorno_logico: 2025-10-15
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-15T16:58:00+02:00', '2025-10-15', '2025-10-15', '16:58:00', NOW()),
  (6, 'uscita', '2025-10-16T00:21:00+02:00', '2025-10-15', '2025-10-16', '00:21:00', NOW());

-- 5. 17 Ottobre (Venerdì): 17:04 → 02:18 (giorno dopo)
-- giorno_logico: 2025-10-17
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-17T17:04:00+02:00', '2025-10-17', '2025-10-17', '17:04:00', NOW()),
  (6, 'uscita', '2025-10-18T02:18:00+02:00', '2025-10-17', '2025-10-18', '02:18:00', NOW());

-- 6. 23 Ottobre (Giovedì): 16:58 → 02:10 (giorno dopo)
-- giorno_logico: 2025-10-23
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-23T16:58:00+02:00', '2025-10-23', '2025-10-23', '16:58:00', NOW()),
  (6, 'uscita', '2025-10-24T02:10:00+02:00', '2025-10-23', '2025-10-24', '02:10:00', NOW());

-- 7. 24 Ottobre (Venerdì): 18:56 → 03:05 (giorno dopo)
-- giorno_logico: 2025-10-24
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-24T18:56:00+02:00', '2025-10-24', '2025-10-24', '18:56:00', NOW()),
  (6, 'uscita', '2025-10-25T03:05:00+02:00', '2025-10-24', '2025-10-25', '03:05:00', NOW());

-- 8. 26 Ottobre (Domenica): 02:03 → 02:03 (stesso giorno)
-- ⚠️ CASO SPECIALE: Entrata 02:03 (00:00-04:59) → giorno_logico = 2025-10-25 (giorno precedente)
-- Uscita 02:03 stesso timestamp → giorno_logico = 2025-10-25
-- NOTA: Durata 0 minuti (possibile errore dati o turno brevissimo)
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-26T02:03:00+02:00', '2025-10-25', '2025-10-26', '02:03:00', NOW()),
  (6, 'uscita', '2025-10-26T02:03:00+02:00', '2025-10-25', '2025-10-26', '02:03:00', NOW());

-- 9. 29 Ottobre (Mercoledì): 18:54 → 00:35 (giorno dopo)
-- giorno_logico: 2025-10-29
-- ⚠️ NOTA: Cambio ora solare nella notte 26-27 ottobre (UTC+2 → UTC+1)
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-29T18:54:00+01:00', '2025-10-29', '2025-10-29', '18:54:00', NOW()),
  (6, 'uscita', '2025-10-30T00:35:00+01:00', '2025-10-29', '2025-10-30', '00:35:00', NOW());

-- 10. 31 Ottobre (Venerdì): 16:50 → 03:08 (giorno dopo)
-- giorno_logico: 2025-10-31
INSERT INTO timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale, created_at)
VALUES 
  (6, 'entrata', '2025-10-31T16:50:00+01:00', '2025-10-31', '2025-10-31', '16:50:00', NOW()),
  (6, 'uscita', '2025-11-01T03:08:00+01:00', '2025-10-31', '2025-11-01', '03:08:00', NOW());

-- ============================================================================
-- VERIFICA INSERIMENTI
-- ============================================================================

SELECT 
  pin,
  tipo,
  giorno_logico,
  data_locale,
  ora_locale,
  to_char(ts_order, 'YYYY-MM-DD HH24:MI:SS') as timestamp_completo
FROM timbrature
WHERE pin = 6 
  AND giorno_logico >= '2025-10-08' 
  AND giorno_logico <= '2025-10-31'
ORDER BY ts_order;

-- ============================================================================
-- RIEPILOGO GIORNI LAVORATI
-- ============================================================================

SELECT 
  giorno_logico,
  COUNT(*) FILTER (WHERE tipo = 'entrata') as entrate,
  COUNT(*) FILTER (WHERE tipo = 'uscita') as uscite,
  MIN(CASE WHEN tipo = 'entrata' THEN ora_locale END) as prima_entrata,
  MAX(CASE WHEN tipo = 'uscita' THEN ora_locale END) as ultima_uscita
FROM timbrature
WHERE pin = 6 
  AND giorno_logico >= '2025-10-08' 
  AND giorno_logico <= '2025-10-31'
GROUP BY giorno_logico
ORDER BY giorno_logico;

-- ============================================================================
-- FINE SCRIPT
-- ============================================================================
