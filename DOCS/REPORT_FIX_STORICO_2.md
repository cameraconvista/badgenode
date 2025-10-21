# REPORT_FIX_STORICO_2 — PIN non registrato + ore 0 nello Storico

## Obiettivi
- Evitare falsi "PIN non registrato" per PIN esistente, senza toccare offline.
- Ripristinare calcolo ore Storico senza dipendere dalla view, con query robusta di fallback.

## Root cause aggiornata
- Mancanza/indisponibilità della view `public.v_turni_giornalieri` → 500 e dataset vuoto.
- Validazione PIN lato client non centralizzata → casi incoerenti tra ambienti.

## Diff principali
- `server/routes/modules/other.ts`
  - Aggiunta rotta `GET /api/pin/validate` (service-role) che risolve `{ pin } → { success, ok, user_id }`.
  - Rafforzato `/api/storico`: validazione input 400/422, logging con `requestId`, fallback robusto su `public.timbrature` con pairing Entrata/Uscita per `giorno_logico` e calcolo `ore/extra`.
- `client/src/services/timbrature.service.ts`
  - Pre-validazione PIN via `/api/pin/validate` in `timbra(pin, tipo)`. In caso 404 → ritorna 0 senza eccezioni; offline → bypass validazione (non bloccare coda).
- `client/src/lib/safeFetch.ts`
  - 4xx: warning in DEV e ritorno oggetto strutturato; 5xx: eccezione.

## Esempi risposte
- `GET /api/pin/validate?pin=11`
```json
{ "success": true, "ok": true, "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }
```
- `GET /api/pin/validate?pin=999`
```json
{ "success": false, "error": "PIN non registrato", "code": "NOT_FOUND" }
```
- `GET /api/storico?pin=11&dal=2025-10-01&al=2025-10-31` (senza view)
```json
{
  "success": true,
  "data": [
    {"pin":11,"giorno_logico":"2025-10-06","entrata":"10:02:00","uscita":"01:28:00","ore":15.43,"extra":7.43,"nome":"","cognome":"","ore_contrattuali":8}
  ]
}
```

## Note di implementazione
- Pairing Entrata/Uscita avviene ordinando per `ora_locale` e sommando sessioni sequenziali nello stesso `giorno_logico`. Se Uscita < Entrata → rollover +24h.
- Nessun dato → `200 { success: true, data: [] }`.
- DEV logging: `requestId` per tracciare richieste; safeFetch 4xx non blocca UI.

## ENV sanity (solo DEV)
- Verificare che client e server puntino allo stesso Supabase (primi 8 char della URL):
```js
console.log('[ENV][client] prefix:', (import.meta.env.VITE_SUPABASE_URL||'').slice(0,8))
```
```ts
console.log('[ENV][server] prefix:', (process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||'').slice(0,8))
```

## Validazione
- Riavviare il server dev e verificare:
  - `GET /api/pin/validate?pin=11` → 200 con `{ ok:true }` (se esiste).
  - `GET /api/storico?...` → 200 con dati o `[]`.
  - Tastierino: `timbra()` effettua validate, 404 → messaggio "PIN non registrato" via log/gestione chiamante; offline → non bloccato.

## Nessun impatto su offline/UI
- Nessuna modifica alla pipeline offline.
- Nessuna modifica layout/UX; solo servizi e API.
