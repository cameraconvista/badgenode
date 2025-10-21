# REPORT_SYNC_VALIDATE_FINAL — Sincronizzazione & PIN (Diagnosi + Fix)

## Contesto
- App attiva e stabile, offline Step 1–6 completati (nessun cambiamento a tale pipeline).
- `/api/storico` ora risponde 200 con fallback robusto (pair Entrata/Uscita, cutoff 05:00). Alcune righe restano con ore=0 dove non c'è coppia completa.
- Tastierino mostrava “PIN non registrato” per PIN esistente a causa di validazione server dipendente da colonna `utenti.id` non presente nell'istanza corrente.

## Diagnosi (ENV + Schema)
- ENV server DEV: log prefix emesso da `server/start.ts` con `[ENV][server] prefix: <first20> role: service`.
- ENV client DEV: disponibile in `window.__BADGENODE_DIAG__.supabase` (url e anonKeyPrefix). Prefissi coerenti → stesso progetto Supabase.
- Schema variabile: `public.utenti` privo di `id` → errore `column utenti.id does not exist` durante validate.

## Fix applicati (chirurgici, nessun impatto offline/UI)
- `server/routes/modules/other.ts`
  - `/api/pin/validate`: reselezione schema‑agnostica su `public.utenti` usando solo `pin`.
    - 200 `{ success:true, ok:true, user_key:"<pin>", pin:"<pin>" }`
    - 404 `{ success:false, code:"NOT_FOUND" }` quando nessuna riga
    - 500 `{ success:false, code:"QUERY_ERROR", message }` solo su errori reali
    - Log DEV compatti: `starting | table_check_error | ok | not_found | query_error`
  - `/api/storico`: confermato fallback robusto già implementato; nessuna variazione ulteriore.
- `client/src/services/timbrature.service.ts`
  - `timbra(pin, tipo)`: usa sempre `/api/pin/validate` solo in online per verificare esistenza PIN. Se 200 ok → prosegue; se 404 → ritorna esito "PIN non registrato"; offline → bypass validazione e enqueue invariato.

## Esempi richieste/risposte (DEV)
- PIN esistente:
```bash
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=11"
```
```json
{"success":true,"ok":true,"user_key":"11","pin":"11"}
```
- PIN non esistente:
```bash
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=999"
```
```json
{"success":false,"code":"NOT_FOUND"}
```
- Storico (range):
```bash
curl -i "http://127.0.0.1:10000/api/storico?pin=11&dal=2025-10-01&al=2025-10-31"
```
```json
{"success":true,"data":[{"pin":11,"giorno_logico":"2025-10-06","entrata":"10:02:00","uscita":null,"ore":0,"extra":0,"nome":"","cognome":"","ore_contrattuali":8}]}
```

## Diff file toccati (sintesi)
- `server/routes/modules/other.ts`:
  - Aggiunta/rafforzata rotta `/api/pin/validate` schema‑agnostica.
  - Migliorati log DEV e gestione errori 404/500.
  - Confermato fallback `/api/storico` (pairing + cutoff) senza ulteriori modifiche funzionali.
- `client/src/services/timbrature.service.ts`:
  - Validazione PIN tramite API, bypass in offline, nessun uso di `user_id`.

## Acceptance
- Client e server utilizzano lo stesso Supabase (prefissi coincidono nel report ENV).
- `/api/pin/validate` restituisce 200/404 corretti su PIN presente/assente.
- Tastierino: con PIN valido non appare più "PIN non registrato" in online; in offline il flusso resta in enqueue.
- `/api/storico` continua a rispondere 200 con dati/[]; nessun 500 quando manca la view.

## Note finali
- Nessuna dipendenza nuova. Nessuna migrazione/RLS modificata. Nessun cambiamento UI/UX o pipeline offline.
