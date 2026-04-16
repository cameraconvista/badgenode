-- Rollback migration: Rimuove RPC insert_timbro_v2
-- Data: 2025-10-09

-- Rimuovi funzione v2 (mantieni quella originale intatta)
drop function if exists public.insert_timbro_v2(integer, text);
