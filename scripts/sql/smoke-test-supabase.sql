-- BADGENODE STEP 2: Smoke Test dopo reset Supabase
-- Verifica che tutto funzioni correttamente

-- Seed minimo (idempotente)
insert into public.utenti(pin, nome, cognome)
values (1,'Mario','Rossi'), (2,'Luisa','Bianchi'), (3,'Test','User')
on conflict (pin) do nothing;

-- 1) ENTRATA valida
select 'TEST 1: ENTRATA valida' as test_name;
select * from public.insert_timbro_v2(1,'entrata');

-- 2) Doppia ENTRATA (deve fallire con P0001)
select 'TEST 2: Doppia ENTRATA (deve fallire)' as test_name;
do $$
begin
  begin
    perform public.insert_timbro_v2(1,'entrata');
    raise notice 'ERRORE: doppia entrata NON bloccata!';
  exception when others then
    raise notice 'OK: doppia entrata bloccata (%).', sqlerrm;
  end;
end$$;

-- 3) USCITA valida
select 'TEST 3: USCITA valida' as test_name;
select * from public.insert_timbro_v2(1,'uscita');

-- 4) Verifica giorno_logico coerente (cutoff 05:00)
select 'TEST 4: Verifica giorno_logico' as test_name;
select pin, giorno_logico, tipo, ts_order at time zone 'Europe/Rome' as ts_local
from public.timbrature
where pin=1
order by ts_order;

-- 5) Test PIN inesistente (deve fallire)
select 'TEST 5: PIN inesistente (deve fallire)' as test_name;
do $$
begin
  begin
    perform public.insert_timbro_v2(99,'entrata');
    raise notice 'ERRORE: PIN inesistente NON bloccato!';
  exception when others then
    raise notice 'OK: PIN inesistente bloccato (%).', sqlerrm;
  end;
end$$;

-- 6) Conteggio finale tabelle
select 'CONTEGGIO FINALE' as summary;
select 'utenti' as tabella, count(*) as righe from public.utenti
union all
select 'timbrature' as tabella, count(*) as righe from public.timbrature
union all
select 'ex_dipendenti' as tabella, count(*) as righe from public.ex_dipendenti;
