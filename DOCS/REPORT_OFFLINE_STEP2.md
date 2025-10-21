# BadgeNode — Offline Timbrature (Step 2 • DB & RPC idempotente)

## Scopo
Accettare timbrature offline dal tablet unico senza duplicati, integrandosi con giorno logico e alternanza lato server. Nessuna modifica a UI/UX, rotte o build. RLS/trigger invariati.

## Migrazioni create
- `supabase/migrations/20251021T1315__offline_cols_and_unique_idx.sql`
  - Aggiunge colonne (nullable) su `public.timbrature`:
    - `device_id text`
    - `client_seq bigint`
  - Commenti esplicativi.
  - Indice UNIQUE parziale idempotenza:
    ```sql
    create unique index if not exists uq_timbrature_device_seq
    on public.timbrature (device_id, client_seq)
    where device_id is not null and client_seq is not null;
    ```
- `supabase/migrations/20251021T1320__rpc_insert_timbro_offline.sql`
  - Crea/aggiorna RPC `public.insert_timbro_offline(text, bigint, text, text, timestamptz) returns jsonb`
  - `SECURITY DEFINER` + `search_path=public` (minimo necessario). Grants: `anon, authenticated, service_role`.

## RPC: Firma e flusso
```sql
create or replace function public.insert_timbro_offline(
  p_device_id text,
  p_client_seq bigint,
  p_pin text,
  p_tipo text,              -- 'entrata' | 'uscita' (enum equivalente)
  p_timestamp_raw timestamptz
) returns jsonb
```
- **Risoluzione utente:** `p_pin::integer` → verifica esistenza in `public.utenti`.
- **Giorno logico:** cutoff 05:00 timezone `Europe/Rome` come baseline esistente.
- **Inserimento idempotente:** `INSERT ... (device_id, client_seq) ON CONFLICT DO NOTHING`.
- **Alternanza:** demandata a trigger/regole attuali; errori → `REVIEW_REQUIRED`.

### Output JSON standard
```json
{ "status": "OK|ALREADY_EXISTS|REVIEW_REQUIRED|ERROR", "timbro_id": <id|null>, "reason": "<msg>" }
```

## Sicurezza & RLS
- `SECURITY DEFINER` usato per consentire l'INSERT mantenendo policy; nessuna modifica a RLS esistenti.
- `search_path` fissato a `public` per evitare side effects.
- Indice UNIQUE parziale evita collisioni solo quando `(device_id, client_seq)` sono valorizzati.

## Esempi test manuali
- psql:
```sql
select public.insert_timbro_offline('tablet-123', 1, '11', 'entrata', now() at time zone 'Europe/Rome');
-- Ripeti stesso client_seq → {"status":"ALREADY_EXISTS"}
```
- curl (Supabase REST/RPC):
```bash
curl -s -X POST \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H 'Content-Type: application/json' \
  "$SUPABASE_URL/rest/v1/rpc/insert_timbro_offline" \
  -d '{
    "p_device_id": "tablet-123",
    "p_client_seq": 2,
    "p_pin": "11",
    "p_tipo": "uscita",
    "p_timestamp_raw": "2025-10-21T07:15:00+02:00"
  }'
```

## Note implementative
- Colonne nuove sono nullable: nessun impatto su dati storici e flussi attuali.
- Nessun default su `device_id/client_seq` (evita collisioni).
- Nessuna nuova dipendenza.

## Check finale
- **[x]** Migrazioni idempotenti, file piccoli, commentati.
- **[x]** RPC neutra se non invocata; RLS/trigger invariati.
- **[x]** Output JSON standardizzato.
- **[x]** Esempi test manuali inclusi.
