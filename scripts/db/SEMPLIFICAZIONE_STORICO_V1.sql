-- ✅ CREA una vista "aperta+chiusa" senza toccare nulla di esistente
-- Dettaglio sessioni, includendo anche le ENTRATE senza Uscita (uscita_* NULL, ore_sessione=0.00)
-- NON modifica v_turni_giornalieri_v5, né i totali v5

create or replace view public.v_turni_giornalieri_v5_open as
with base as (
  select
    t.id,
    t.pin,
    t.tipo::text            as tipo,
    t.giornologico          as giorno_logico,
    t.ore                   as ore_local,
    (t.giornologico::timestamp
      + t.ore
      + case when t.ore < time '05:00' then interval '1 day' else interval '0' end
    ) as ts_order
  from public.timbrature t
),
seq as (
  select
    b.*,
    lead(b.tipo)       over (partition by b.pin, b.giorno_logico order by b.ts_order, b.id) as next_tipo,
    lead(b.id)         over (partition by b.pin, b.giorno_logico order by b.ts_order, b.id) as next_id,
    lead(b.ore_local)  over (partition by b.pin, b.giorno_logico order by b.ts_order, b.id) as next_ore_local,
    lead(b.ts_order)   over (partition by b.pin, b.giorno_logico order by b.ts_order, b.id) as next_ts_order
  from base b
),
pairs_chiuse as (
  select
    s.pin,
    s.giorno_logico,
    s.id              as entrata_id,
    s.ore_local       as entrata_ore,
    s.next_id         as uscita_id,
    s.next_ore_local  as uscita_ore,
    (extract(epoch from (s.next_ts_order - s.ts_order))/3600.0)::numeric(5,2) as ore_sessione
  from seq s
  where s.tipo = 'entrata' and s.next_tipo = 'uscita'
),
aperte as (
  select
    s.pin,
    s.giorno_logico,
    s.id              as entrata_id,
    s.ore_local       as entrata_ore,
    null::bigint      as uscita_id,
    null::time        as uscita_ore,
    0.00::numeric(5,2) as ore_sessione
  from seq s
  where s.tipo = 'entrata' and s.next_tipo is null
)
select * from pairs_chiuse
union all
select * from aperte
order by giorno_logico, entrata_ore, entrata_id;
