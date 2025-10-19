# 🟣 BADGENODE — DIAGNOSI BLOCCO “AGGIUNGI NUOVO DIPENDENTE”

## Problema
- In UI, al salvataggio nel modale “Aggiungi Nuovo Dipendente”, la richiesta `POST /api/utenti` restituisce `400 Bad Request`.
- Console: `safeFetch.ts` → `utenti.service.ts` → `ModaleNuovoDipendente.tsx`.

## Riproduzione
- Percorso: Archivio Dipendenti → Aggiungi → compila dati validi → Salva.
- Network: `POST http://localhost:3001/api/utenti` → 400.
- Test CLI:
```bash
curl -sS -X POST http://localhost:3001/api/utenti -H 'Content-Type: application/json' -d '{"pin":25,"nome":"RGS","cognome":"AGR","ore_contrattuali":8}' -i
```
Risposta:
```json
{"success":false,"error":"Could not find the 'ore_contrattuali' column of 'utenti' in the schema cache","code":"CREATE_ERROR"}
```

## Cause individuate
- La tabella `utenti` (Supabase) non ha la colonna `ore_contrattuali`.
- Il server (endpoint `POST /api/utenti` in `server/routes.ts`) includeva `ore_contrattuali` nel payload dell’`upsert`, causando errore dal lato Supabase.

## Fix applicato (minimo, senza toccare schema DB)
- File: `server/routes.ts`, handler `POST /api/utenti`.
- Modifica: rimosso `ore_contrattuali` dal payload inviato a `.from('utenti').upsert(...)`.
- Nessuna modifica a UI/layout/feature.

Diff concettuale:
```diff
- const payload = { pin, nome, cognome, ore_contrattuali: ..., created_at }
+ const payload = { pin, nome, cognome, created_at }
```

## Verifiche
- Build OK: `npm run build`.
- L’endpoint continua a rispondere 400 finché il processo server non viene riavviato (il dev server in esecuzione non ha caricato la modifica).
- Health/env OK: `/api/version`, `/api/debug/env` mostrano config valida (service role presente).

## Piano test post-riavvio
1. Riavviare il dev server (`npm run dev`) e assicurarsi che riparta su `:3001`.
2. Ritestare:
```bash
curl -sS -X POST http://localhost:3001/api/utenti -H 'Content-Type: application/json' -d '{"pin":25,"nome":"RGS","cognome":"AGR"}' -i
curl -sS http://localhost:3001/api/utenti | jq .
```
3. Verificare da UI la creazione senza errori.

## Miglioramenti consigliati (opzionali, nessun impatto su layout)
- Client: in `safeFetchJson`, propagare `error`/`code` del server per messaggi più chiari nel modale.
- Server: validazione payload e messaggi più dettagliati (esporre `code` e `message` originali);
- Read-Only Mode: restituire `503` con `code: READ_ONLY_MODE_ACTIVE` se attivo, e mappare in UI.

## Stato
- Fix server applicato nel codice.
- Serve riavvio del dev server per renderlo effettivo.
