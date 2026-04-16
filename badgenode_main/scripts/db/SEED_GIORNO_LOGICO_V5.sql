-- =====================================================
-- SEED GIORNO LOGICO V5 - BadgeNode
-- =====================================================
-- ATTENZIONE: Eseguire SOLO in ambiente di test/sviluppo
-- NON eseguire in produzione senza backup completo
-- =====================================================

-- Creazione viste v5 per giorno logico con cutoff 05:00 Europe/Rome

-- Vista DETTAGLIO sessioni accoppiate con alias coerenti
create or replace view public.v_turni_giornalieri_v5 as
with base as (
  select
    t.id,
    t.pin,
    t.tipo::text            as tipo,
    t.giornologico          as giorno_logico,
    t.ore                   as ore_local,
    t.created_at,
    -- Ordine robusto: applica offset al mattino <05:00
    (t.giornologico::timestamp
      + t.ore
      + case when t.ore < time '05:00' then interval '1 day' else interval '0' end
    ) as ts_order
  from public.timbrature t
),
seq as (
  select
    b.*,
    lead(b.tipo)     over (partition by b.pin, b.giorno_logico order by b.ts_order, b.id) as next_tipo,
    lead(b.id)       over (partition by b.pin, b.giorno_logico order by b.ts_order, b.id) as next_id,
    lead(b.ore_local)over (partition by b.pin, b.giorno_logico order by b.ts_order, b.id) as next_ore_local,
    lead(b.ts_order) over (partition by b.pin, b.giorno_logico order by b.ts_order, b.id) as next_ts_order
  from base b
),
pairs as (
  select
    s.pin,
    s.giorno_logico,
    s.id           as entrata_id,
    s.ore_local    as entrata_ore,
    s.ts_order     as entrata_ts_order,
    s.next_id      as uscita_id,
    s.next_ore_local as uscita_ore,
    s.next_ts_order  as uscita_ts_order
  from seq s
  where s.tipo = 'entrata'
    and s.next_tipo = 'uscita'
)
select
  p.pin,
  p.giorno_logico,
  p.entrata_id,
  p.entrata_ore,
  p.uscita_id,
  p.uscita_ore,
  (extract(epoch from (p.uscita_ts_order - p.entrata_ts_order))/3600.0)::numeric(6,2) as ore_sessione
from pairs p
order by p.giorno_logico, p.entrata_ore, p.entrata_id;

-- Vista TOTALI per giorno logico (somma solo sessioni chiuse)
create or replace view public.v_turni_giornalieri_totali_v5 as
select
  pin,
  giorno_logico,
  sum(ore_sessione)::numeric(6,2) as ore_totali_chiuse
from public.v_turni_giornalieri_v5
group by pin, giorno_logico
order by giorno_logico, pin;

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
