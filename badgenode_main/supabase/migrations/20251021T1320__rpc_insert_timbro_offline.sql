-- Migration: RPC insert_timbro_offline (idempotente via device_id+client_seq)
-- Date: 2025-10-21
-- Governance: Idempotent, small, preserves RLS/trigger logic

-- Nota: richiede l'unique parziale (device_id, client_seq) creato nella migrazione precedente.

create or replace function public.insert_timbro_offline(
  p_device_id text,
  p_client_seq bigint,
  p_pin text,
  p_tipo text,              -- usa valori esistenti: 'entrata' | 'uscita'
  p_timestamp_raw timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pin_int integer;
  v_now_ts timestamptz := coalesce(p_timestamp_raw, now());
  v_local_date date := (v_now_ts at time zone 'Europe/Rome')::date;
  v_local_time time := (v_now_ts at time zone 'Europe/Rome')::time;
  v_giorno_logico date;
  v_id bigint;
  v_status text := 'OK';
  v_reason text := '';
begin
  -- Validazione minima input
  if p_device_id is null or p_client_seq is null then
    return jsonb_build_object('status','ERROR','timbro_id',null,'reason','device_id/client_seq mancanti');
  end if;

  -- Cast PIN (input testuale compatibile con ecosistema esistente)
  begin
    v_pin_int := p_pin::integer;
  exception when others then
    return jsonb_build_object('status','ERROR','timbro_id',null,'reason','PIN non numerico');
  end;

  -- Verifica utente esistente
  if not exists (select 1 from public.utenti u where u.pin = v_pin_int) then
    return jsonb_build_object('status','ERROR','timbro_id',null,'reason','PIN inesistente');
  end if;

  -- Giorno logico conforme baseline (cutoff 05:00 Europe/Rome)
  if v_local_time >= time '00:00' and v_local_time < time '05:00' then
    v_giorno_logico := v_local_date - interval '1 day';
  else
    v_giorno_logico := v_local_date;
  end if;

  -- Inserimento idempotente: si affida a trigger/regole esistenti per alternanza.
  begin
    insert into public.timbrature (
      tipo, pin, data, ore, giornologico, created_at, device_id, client_seq
    ) values (
      p_tipo, v_pin_int, v_local_date, v_local_time, v_giorno_logico, v_now_ts, p_device_id, p_client_seq
    )
    on conflict (device_id, client_seq) do nothing
    returning id into v_id;

    if v_id is null then
      -- Conflitto su (device_id, client_seq)
      return jsonb_build_object('status','ALREADY_EXISTS','timbro_id',null,'reason','Duplicato idempotente');
    end if;

    return jsonb_build_object('status', v_status, 'timbro_id', v_id, 'reason', v_reason);

  exception
    when unique_violation then
      return jsonb_build_object('status','ALREADY_EXISTS','timbro_id',null,'reason','Duplicato idempotente');
    when others then
      -- Errori da trigger/alternanza o altre policy → review required, non blocca l ecosistema
      return jsonb_build_object('status','REVIEW_REQUIRED','timbro_id',null,'reason', substring(sqlerrm from 1 for 140));
  end;
end
$$;

comment on function public.insert_timbro_offline(text, bigint, text, text, timestamptz)
  is 'RPC idempotente per inserimenti offline. Usa unique parziale (device_id, client_seq); alternanza demandata ai trigger esistenti; cutoff 05:00 Europe/Rome.';

grant execute on function public.insert_timbro_offline(text, bigint, text, text, timestamptz) to anon, authenticated, service_role;
