-- Migration: Offline columns + unique partial index for idempotency (device_id, client_seq)
-- Date: 2025-10-21
-- Governance: Idempotent, non-breaking (nullable columns), no defaults

-- 1) Add columns if missing (nullable to avoid impacting historical data)
alter table if exists public.timbrature
  add column if not exists device_id text;

alter table if exists public.timbrature
  add column if not exists client_seq bigint;

comment on column public.timbrature.device_id is 'Client device identifier (tablet unico). Nullable per backward compatibility.';
comment on column public.timbrature.client_seq is 'Sequenza locale client per idempotenza. Nullable per backward compatibility.';

-- 2) Create unique partial index to enforce (device_id, client_seq) uniqueness only when both are not null
create unique index if not exists uq_timbrature_device_seq
on public.timbrature (device_id, client_seq)
where device_id is not null and client_seq is not null;
