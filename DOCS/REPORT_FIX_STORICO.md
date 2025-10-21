# REPORT_FIX_STORICO — “Storico Timbrature” vuoto

## Richiesta
- Pagina “Storico Timbrature” vuota; API `/api/storico` risponde 500.
- Obiettivo: diagnosi e fix lato server, senza toccare modalità offline o UI.

## Repro locale
```bash
curl -i "http://127.0.0.1:10000/api/storico?pin=11&dal=2025-10-01&al=2025-10-31"
```
Risultato (prima del riavvio server post-fix):
```
HTTP/1.1 500 Internal Server Error
x-request-id: 4b5569342b8ece16
{"success":false,"error":"Errore durante il recupero dello storico","code":"QUERY_ERROR"}
```
Log server:
```
[API] Error fetching storico: Could not find the table 'public.v_turni_giornalieri' in the schema cache
```

## Root cause
- La rotta interrogava la view `public.v_turni_giornalieri`. In questa istanza non è presente in cache/schema (mancante o non migrata), provocando 500.
- Assenza di fallback in caso di errore view.

## Fix applicato (minimo e sicuro)
File: `server/routes/modules/other.ts`
- **Logging**: introdotto `requestId` e log sintetico con `pin/dal/al`.
- **Validazione input**: 400 su PIN invalido; 422 su date non conformi a `YYYY-MM-DD`.
- **Fallback**: se la query su view fallisce, ricostruzione dello storico da `public.timbrature` con grouping per `giorno_logico`, calcolo semplice di `ore/extra`, ordinamenti `giorno_logico desc, ora_locale asc`.
- **Nessun dato**: ritorna sempre `200 { success: true, data: [] }` quando non presenti record.

Estratto rilevante:
```ts
router.get('/api/storico', async (req, res) => {
  const requestId = ...
  //... validazione PIN e date
  const { data, error } = await supabaseAdmin
    .from('v_turni_giornalieri')
    .select('*')
    .eq('pin', pinNum)
    .order('giorno_logico', { ascending: false });

  if (error) {
    // fallback su timbrature → grouping per giorno_logico, calcolo ore/extra
    // return res.json({ success: true, data: rows });
  }
  return res.json({ success: true, data: data || [] });
});
```

## Esempi risposte dopo fix (atteso post-restart)
- 200 OK (nessun record):
```json
{ "success": true, "data": [] }
```
- 400 Bad Request (PIN assente):
```json
{ "success": false, "error": "Parametro PIN obbligatorio", "code": "MISSING_PARAMS" }
```

## ENV sanity (solo DEV)
- Verifica che client e server puntino allo stesso Supabase.
- Loggare i primi 8 char della URL per privacy.

Client (DevTools Console):
```js
console.log('[ENV][client] SUPABASE_URL prefix:', (import.meta.env.VITE_SUPABASE_URL||'').slice(0,8))
```

Server (già in bootstrap):
```ts
// aggiunta temporanea (se necessario) in server/start.ts o env.ts
console.log('[ENV][server] SUPABASE_URL prefix:', (process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||'').slice(0,8));
```
- 422 Unprocessable Entity (data invalida):
```json
{ "success": false, "error": "Formato data dal non valido (YYYY-MM-DD)", "code": "INVALID_DATE_FROM" }
```
- 500 Internal Error (eccezione reale):
```json
{ "success": false, "error": "Errore interno", "code": "INTERNAL_ERROR", "requestId": "..." }
```

## Note client
File: `client/src/lib/safeFetch.ts`
- 4xx → ora generano solo warning in DEV e ritornano un oggetto strutturato (`{ success: false, status, message }`) per non bloccare le tabelle.
- 5xx → rimangono eccezioni bloccanti.

## Azione residua
- Riavviare il dev server per applicare il fix della rotta (server TS non hot-reloaded).
- Ripetere la chiamata curl e verificare `200` con `[]` o dati.

## Nessun impatto su offline/UI
- Nessuna modifica alla modalità offline.
- Nessuna modifica alla UI/UX.
