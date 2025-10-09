-- =====================================================
-- SEED GIORNO LOGICO V5 - BadgeNode
-- =====================================================
-- ATTENZIONE: Eseguire SOLO in ambiente di test/sviluppo
-- NON eseguire in produzione senza backup completo
-- =====================================================

-- Creazione viste v5 per giorno logico con cutoff 05:00 Europe/Rome

-- Vista per sessioni accoppiate (dettaglio)
CREATE OR REPLACE VIEW public.v_turni_giornalieri_v5 AS
WITH sessioni_accoppiate AS (
  SELECT 
    t1.pin,
    u.nome,
    u.cognome,
    t1.giornologico as giorno_logico,
    t1.id as entrata_id,
    t1.ore as entrata_ore,
    t2.id as uscita_id,
    t2.ore as uscita_ore,
    CASE 
      WHEN t1.ore IS NOT NULL AND t2.ore IS NOT NULL THEN
        EXTRACT(EPOCH FROM (t2.ore - t1.ore)) / 3600.0
      ELSE 0
    END as ore_sessione,
    ROW_NUMBER() OVER (
      PARTITION BY t1.pin, t1.giornologico 
      ORDER BY t1.ore, t1.created_at
    ) as sessione_num
  FROM timbrature t1
  JOIN utenti u ON t1.pin = u.pin
  LEFT JOIN timbrature t2 ON (
    t2.pin = t1.pin 
    AND t2.giornologico = t1.giornologico
    AND t2.tipo = 'uscita'
    AND t2.ore > t1.ore
    AND t2.id = (
      SELECT MIN(t3.id)
      FROM timbrature t3
      WHERE t3.pin = t1.pin
        AND t3.giornologico = t1.giornologico
        AND t3.tipo = 'uscita'
        AND t3.ore > t1.ore
    )
  )
  WHERE t1.tipo = 'entrata'
)
SELECT 
  pin,
  nome,
  cognome,
  giorno_logico,
  entrata_id,
  entrata_ore,
  uscita_id,
  uscita_ore,
  ore_sessione,
  sessione_num
FROM sessioni_accoppiate
ORDER BY giorno_logico, entrata_ore;

-- Vista per totali per giorno logico
CREATE OR REPLACE VIEW public.v_turni_giornalieri_totali_v5 AS
SELECT 
  pin,
  nome,
  cognome,
  giorno_logico,
  SUM(CASE WHEN uscita_id IS NOT NULL THEN ore_sessione ELSE 0 END) as ore_totali_chiuse,
  COUNT(CASE WHEN uscita_id IS NOT NULL THEN 1 END) as sessioni_chiuse,
  COUNT(*) as sessioni_totali
FROM public.v_turni_giornalieri_v5
GROUP BY pin, nome, cognome, giorno_logico
ORDER BY giorno_logico, pin;

-- =====================================================
-- DATI DI TEST (solo per sviluppo)
-- =====================================================

-- Inserimento utente di test (se non esiste)
INSERT INTO public.utenti (pin, nome, cognome, ore_contrattuali)
VALUES (1, 'Mario', 'Rossi', 8.00)
ON CONFLICT (pin) DO UPDATE SET
  nome = EXCLUDED.nome,
  cognome = EXCLUDED.cognome,
  ore_contrattuali = EXCLUDED.ore_contrattuali;

-- Pulizia dati esistenti per PIN 1 nel range di test
DELETE FROM public.timbrature 
WHERE pin = 1 AND giornologico BETWEEN '2025-10-08' AND '2025-10-11';

-- Dataset di test per validazione logica giorno logico
-- Scenario: turni che attraversano la mezzanotte con cutoff 05:00

-- 2025-10-08: Turno diurno normale (4.00 ore)
INSERT INTO public.timbrature (pin, tipo, data, ore, giornologico, created_at) VALUES
(1, 'entrata', '2025-10-08', '09:00:00', '2025-10-08', '2025-10-08 09:00:00+02:00'),
(1, 'uscita', '2025-10-08', '13:00:00', '2025-10-08', '2025-10-08 13:00:00+02:00');

-- 2025-10-09: Multi-sessione (2.00 + 4.00 = 6.00 ore)
INSERT INTO public.timbrature (pin, tipo, data, ore, giornologico, created_at) VALUES
(1, 'entrata', '2025-10-09', '09:00:00', '2025-10-09', '2025-10-09 09:00:00+02:00'),
(1, 'uscita', '2025-10-09', '11:00:00', '2025-10-09', '2025-10-09 11:00:00+02:00'),
(1, 'entrata', '2025-10-09', '13:00:00', '2025-10-09', '2025-10-09 13:00:00+02:00'),
(1, 'uscita', '2025-10-09', '17:00:00', '2025-10-09', '2025-10-09 17:00:00+02:00');

-- 2025-10-10: Turno notturno che attraversa mezzanotte (≈8.48 ore)
-- Entrata 22:00 del 10/10, uscita 06:29 del 11/10 → giorno logico 2025-10-10
INSERT INTO public.timbrature (pin, tipo, data, ore, giornologico, created_at) VALUES
(1, 'entrata', '2025-10-10', '22:00:00', '2025-10-10', '2025-10-10 22:00:00+02:00'),
(1, 'uscita', '2025-10-11', '06:29:00', '2025-10-10', '2025-10-11 06:29:00+01:00');

-- 2025-10-11: Sessione aperta (non conteggiata nei totali)
INSERT INTO public.timbrature (pin, tipo, data, ore, giornologico, created_at) VALUES
(1, 'entrata', '2025-10-11', '08:00:00', '2025-10-11', '2025-10-11 08:00:00+01:00');

-- =====================================================
-- QUERY DI VERIFICA
-- =====================================================

-- Verifica sessioni dettagliate
-- SELECT * FROM public.v_turni_giornalieri_v5 
-- WHERE pin = 1 AND giornologico BETWEEN '2025-10-08' AND '2025-10-11'
-- ORDER BY giornologico, entrata_ore;

-- Verifica totali per giorno
-- SELECT giornologico, ore_totali_chiuse, sessioni_chiuse, sessioni_totali
-- FROM public.v_turni_giornalieri_totali_v5 
-- WHERE pin = 1 AND giornologico BETWEEN '2025-10-08' AND '2025-10-11'
-- ORDER BY giornologico;

-- Risultati attesi:
-- 2025-10-08: 4.00 ore (1 sessione chiusa)
-- 2025-10-09: 6.00 ore (2 sessioni chiuse) 
-- 2025-10-10: ~8.48 ore (1 sessione chiusa, turno notturno)
-- 2025-10-11: 0.00 ore (1 sessione aperta, non conteggiata)
