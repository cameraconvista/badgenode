-- Migration: Nuova RPC insert_timbro_v2 con alternanza corretta su giorno logico
-- Data: 2025-10-09
-- Scopo: Fix alternanza timbrature senza modificare RPC esistente

-- Nuova funzione: alternanza basata sull'ULTIMO timbro del giorno logico (Europe/Rome)
create or replace function public.insert_timbro_v2(p_pin integer, p_tipo text)
returns table (id bigint, tipo text, pin integer, data date, ore time, giornologico date, created_at timestamptz)
language plpgsql
security definer
as $$
declare
  v_now_ts timestamptz := now();
  v_local_date date := (v_now_ts at time zone 'Europe/Rome')::date;
  v_local_time time := (v_now_ts at time zone 'Europe/Rome')::time;
  v_giorno_logico date;
  v_last_tipo text;
begin
  -- Giorno logico conforme documentazione BadgeNode
  -- 00:00-04:59 → giorno precedente, 05:00-23:59 → giorno corrente
  if v_local_time >= time '00:00' and v_local_time < time '05:00' then
    v_giorno_logico := v_local_date - interval '1 day';
  else
    v_giorno_logico := v_local_date;
  end if;

  -- Ultimo timbro del giorno logico per questo PIN (ordinamento stabile)
  select t.tipo
    into v_last_tipo
  from public.timbrature t
  where t.pin = p_pin and t.giornologico = v_giorno_logico
  order by t.giornologico desc, t.ore desc, t.created_at desc
  limit 1;

  -- Alternanza corretta: entrata ↔ uscita
  if v_last_tipo is null then
    -- Primo timbro del giorno: deve essere ENTRATA
    if p_tipo <> 'entrata' then
      raise exception 'Primo timbro del giorno deve essere ENTRATA (PIN %, giorno logico %)', p_pin, v_giorno_logico
      using errcode = 'P0001';
    end if;
  else
    -- Alternanza obbligatoria basata su ultimo timbro
    if v_last_tipo = 'entrata' and p_tipo <> 'uscita' then
      raise exception 'Ultimo timbro = ENTRATA, ora deve essere USCITA (PIN %, giorno logico %)', p_pin, v_giorno_logico
      using errcode = 'P0001';
    elsif v_last_tipo = 'uscita' and p_tipo <> 'entrata' then
      raise exception 'Ultimo timbro = USCITA, ora deve essere ENTRATA (PIN %, giorno logico %)', p_pin, v_giorno_logico
      using errcode = 'P0001';
    end if;
  end if;

  -- Validazione PIN esistente (mantieni logica esistente se presente)
  if not exists (select 1 from public.utenti where utenti.pin = p_pin) then
    raise exception 'PIN % inesistente', p_pin
    using errcode = 'P0002';
  end if;

  -- Insert con timezone Europe/Rome coerente
  insert into public.timbrature (tipo, pin, data, ore, giornologico, created_at)
  values (p_tipo, p_pin, v_local_date, v_local_time, v_giorno_logico, v_now_ts)
  returning timbrature.id, timbrature.tipo, timbrature.pin, timbrature.data, timbrature.ore, timbrature.giornologico, timbrature.created_at
  into id, tipo, pin, data, ore, giornologico, created_at;

  return next;
end
$$;

-- Permessi analoghi alla funzione precedente
grant execute on function public.insert_timbro_v2(integer, text) to anon, authenticated, service_role;

-- Commento per tracking
comment on function public.insert_timbro_v2(integer, text) is 'RPC v2: Alternanza timbrature corretta su giorno logico Europe/Rome - Fix multi-sessione';
