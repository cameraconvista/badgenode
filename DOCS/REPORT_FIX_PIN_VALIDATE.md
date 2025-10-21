# REPORT_FIX_PIN_VALIDATE — Schema-agnostic PIN Validation

## Root cause
- La rotta `/api/pin/validate` selezionava `utenti.id`, ma nel progetto corrente la colonna non esiste → 500 `QUERY_ERROR`.

## Fix
- Server `server/routes/modules/other.ts`:
  - Lookup schema-agnostico su `public.utenti` selezionando solo `pin`.
  - Risposte:
    - 200 `{ success:true, ok:true, user_key:"<pin>", pin:"<pin>" }`
    - 404 `{ success:false, code:"NOT_FOUND" }` su assenza righe (gestione PGRST116/0 rows)
    - 500 `{ success:false, code:"QUERY_ERROR", message }` su errori diversi.
  - Log DEV sintetici: `starting | table_check_error | not_found | ok | query_error`.
- Client `client/src/services/timbrature.service.ts`:
  - `timbra()` usa `/api/pin/validate` solo per sapere se il PIN esiste; non dipende più da `user_id`.
  - Offline: bypass validazione per non bloccare la coda.

## Esempi risposta
- 200 OK:
```json
{"success":true,"ok":true,"user_key":"11","pin":"11"}
```
- 404 Not Found:
```json
{"success":false,"code":"NOT_FOUND"}
```
- 500 Query Error:
```json
{"success":false,"code":"QUERY_ERROR","message":"<errore>"}
```

## Test DEV
```bash
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=11"  # atteso 200 se esiste
```

## Note
- Nessuna modifica a RLS, schema o migrazioni.
- Nessuna modifica UI/UX o modalità offline.
