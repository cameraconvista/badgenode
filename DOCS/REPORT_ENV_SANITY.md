# REPORT_ENV_SANITY — Supabase ENV & PIN Validate

## Obiettivo
Verificare che server e client puntino allo stesso progetto Supabase e diagnosticare il 500 su `/api/pin/validate`.

## Evidenze raccolte
- **/api/pin/validate** (curl):
```
HTTP/1.1 500 Internal Server Error
{"success":false,"error":"Errore lookup PIN","code":"QUERY_ERROR"}
```
- **/api/storico** (curl): OK con 200 e dati/fallback.

## Log attesi lato server (DEV)
- All’avvio: `[ENV][server] prefix: <first20> role: service`
- Alla chiamata validate:
  - `[API][pin.validate] starting pin=<pin>`
  - eventuale `[API][pin.validate] table_check_error: <message>`
  - eventuale `[API][pin.validate] query error: <message>` o `[API][pin.validate] query_error: <message>`

Annota qui l’output reale (incollare dalla console server):
```
[ENV][server] prefix: __________________ role: service
[API][pin.validate] starting pin=11
[API][pin.validate] table_check_error: __________________
[API][pin.validate] query error: __________________
```

## Lettura ENV lato client (DEV)
In DevTools Console:
```js
window.__BADGENODE_DIAG__?.supabase
// { url: "https://__________", anonKeyPrefix: "________" }
```
Annota qui il prefisso client:
```
[ENV][client] url prefix: __________________
```

## Interpretazione
- **ENV mismatch**: i prefissi (server vs client) differiscono → server e client puntano a progetti diversi.
- **Errore SQL**: prefissi uguali ma `table_check_error`/`query error` indicano problemi DB (es. `relation "public.utenti" does not exist`, permessi, schema non migrato).

## Prossimi passi minimi
- **Se mismatch**:
  - Allinea `.env.local` sia lato server (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) sia lato Vite (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
  - Riavvia dev server.
- **Se errore SQL**:
  - Su Supabase SQL Editor esegui: `select 1 from public.utenti limit 1;`
    - Se fallisce: crea/applica migrazioni per la tabella `public.utenti` o seleziona il progetto corretto.
    - Se ok ma 500 persiste: controlla service-role key valida per quel progetto.

## Esempi comando
```bash
# Validate pin
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=11"
# Storico
curl -i "http://127.0.0.1:10000/api/storico?pin=11&dal=2025-10-01&al=2025-10-31"
```

## Stato
- Diagnostica DEV aggiunta a `server/start.ts`, `server/routes/modules/other.ts`, `client/src/lib/supabaseClient.ts`.
- Endpoint `/api/pin/validate` ancora 500 → richiede verifica ENV/DB come sopra.

## Log catturati (sessione corrente)
```
[ENV][server] prefix: N/D (non presente nel buffer recente)
[API][pin.validate] starting pin=11  // N/D (non stampato nel buffer recente)
[API][pin.validate] table_check_error: N/D
[API][pin.validate] query error: N/D
GET /api/pin/validate 500 :: {"success":false,"error":"Errore lookup PIN","code":"QUERY_ERROR"}
```

## Log catturati (refresh con riavvio)
```
[ENV][server] prefix: https://tutllgsjrbxk role: service
[API][pin.validate] starting pin=11
[API][pin.validate] table_check_error: { message: '' }
[API][pin.validate] query error: column utenti.id does not exist
GET /api/pin/validate 500 :: {"success":false,"error":"Errore lookup PIN","code":"QUERY_ERROR"}
```
