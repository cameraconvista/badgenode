# BadgeNode — Audit Tecnico

Data audit: 2026-04-15

## 1. Verifiche eseguite

### Ambiente locale

- `node -v`: `v22.20.0`
- `npm -v`: `10.9.3`
- `.env.local`: presente ma non ispezionato per evitare esposizione segreti

### Comandi eseguiti

- `npm ci --ignore-scripts --dry-run`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check:ci`
- `node scripts/file-length-guard.cjs`
- `npm run depcheck`
- `npm run tsprune`

## 2. Risultati qualità

### Install / lockfile

- `npm ci --ignore-scripts --dry-run`: eseguibile, ma segnala `EBADENGINE`
- Motivo: `package.json` richiede `node: 22.12.x`, ambiente locale `22.20.0`
- Il lockfile è utilizzabile, ma il vincolo engine è troppo stretto rispetto all'uso reale

### Lint

- Stato: `FAIL`
- Errori bloccanti rilevati:
  - `client/src/pages/Home/index.tsx`: `prefer-const`
  - `scripts/_archive/2025-11-02_cleanup/test-client-giorno-logico.ts`: `prefer-const`
- Warning diffusi: `no-explicit-any`, import/variabili inutilizzate
- Nota importante: il secondo errore è in `scripts/_archive`, quindi il lint oggi blocca anche materiale archiviato
- ESLint segnala anche la presenza di `.eslintignore` legacy non più supportato da ESLint 9

### Typecheck

- Stato: `PASS`

### Test unit/integration

- Stato: `FAIL` prima dell'esecuzione effettiva
- Errore: dipendenza mancante `@vitest/coverage-v8`
- Conseguenza:
  - nessuna coverage affidabile prodotta in questo audit
  - la cartella `coverage/` contiene solo `coverage/.tmp/coverage-0.json`
  - manca `coverage/coverage-summary.json`

### Build

- Stato: `PASS`
- Warning reali:
  - dataset Browserslist obsoleto
  - warning PWA su pattern glob non allineato
  - chunk JS troppo grandi
- Evidenza bundle:
  - `exceljs.min` circa `939.78 kB`
  - `jspdf.es.min` circa `387.78 kB`
  - chunk `react` circa `314.44 kB`

### Script CI locale

- `npm run check:ci`: `FAIL`
- Motivo reale: grep guard trova molti `console.log` residui in `client/src/`
- Quindi il quality gate attuale non è verde neppure localmente

### Husky

- `.husky/pre-commit` esegue:
  - `npm run lint`
  - `npm run check`
  - `npm run check:ci`
  - `node scripts/file-length-guard.cjs`
- Con lo stato attuale, un commit locale può essere bloccato da controlli non verdi

## 3. Architettura e boundary

## Client

- Router Wouter in `client/src/App.tsx`
- Bootstrap complesso in `client/src/main.tsx`
- Servizi principali:
  - `timbrature.service.ts`
  - `timbratureRpc.ts`
  - `utenti.service.ts`
  - `storico.service.ts`

## Server

- Bootstrap in `server/start.ts`
- App factory in `server/createApp.ts`
- Route aggregation in `server/routes.ts`
- Route principali:
  - `server/routes/timbrature/*`
  - `server/routes/modules/utenti.ts`
  - `server/routes/modules/other/internal/*`

## Boundary client-server

- Boundary non completamente consolidato:
  - scritture timbrature lato server
  - letture Home direttamente da Supabase lato client
  - realtime lato client direttamente via Supabase
  - storico tramite API server
- Questo aumenta il rischio di divergenze tra autorizzazione, validazione e stato UI

## 4. Supabase e persistenza

### Scritture

- Le scritture timbrature usano `supabaseAdmin` e non toccano direttamente dati remoti in questo audit
- `POST /api/timbrature` valida alternanza e poi inserisce in tabella `timbrature`

### Rischi osservati

- Nessuna transazione tra validazione alternanza e insert
- Nessuna idempotenza evidente server-side per `client_event_id` nel codice Node attuale
- L'offline queue invia `client_event_id`, ma `postTimbratura.ts` non lo usa
- Possibile rischio di doppia persistenza se il retry offline viene rieseguito e il DB non protegge davvero a livello schema

### Admin / utenti

- `GET /api/utenti` ha un bug certo nel ramo production: legge campi estesi dal DB ma risponde con valori default/null
- `POST /api/utenti` ignora campi estesi e usa REST diretto Supabase invece del client singleton
- `PUT /api/utenti/:pin` usa `supabaseAdmin` e aggiorna campi estesi
- `DELETE /api/utenti/:pin` elimina direttamente da `utenti`
- `POST /api/utenti/:id/archive` e `POST /api/utenti/:id/restore` operano su due tabelle senza transazione

## 5. Offline

### Stato reale

- Queue locale presente
- Flush presente
- Gating per-device presente
- Validazione offline presente
- Diagnostica globale `window.__BADGENODE_DIAG__` presente

### Gap reali

- La documentazione parla di `insert_timbro_offline` e `syncRunner`, ma il codice runtime attuale usa flush diretto a `/api/timbrature`
- `main.tsx` contiene bootstrap offline molto esteso e centralizza più responsabilità
- `gating.ts` richiede exact match della whitelist, mentre `offline/index.ts` applica anche logica per prefisso: le due logiche non sono equivalenti

## 6. Logging e osservabilità

- Logger adapter presente ma dipendenze opzionali come `pino` non risultano installate
- `server/lib/monitoring.ts` è uno stub, non un monitoring operativo
- Persistono molti `console.log` nel client attivo
- Esistono endpoint health/version duplicati

## 7. Dipendenze

### Stato reale

- Stack principale coerente con React/Vite/Express/Supabase
- `depcheck` segnala pacchetti non usati, ma il risultato è solo indicativo
- `depcheck` produce falsi positivi almeno su dipendenze lette da config/tooling, ad esempio `autoprefixer` e `postcss`

### Elementi certi

- `@vitest/coverage-v8` manca rispetto allo script `npm run test`
- CI GitHub usa Node 18, non coerente con engine dichiarato

### Elementi da verificare in step successivo

- insieme Radix parzialmente non usato
- eventuali dipendenze export pesanti non necessarie in eager chunks

## 8. E2E

- Suite non eseguita per sicurezza
- Motivi:
  - `.env.local` presente, quindi il runtime locale potrebbe parlare con backend reale
  - i test Playwright includono azioni di timbratura e quindi potenziali scritture
  - i selector `data-testid` nella suite non corrispondono al naming attuale del codice (`key-1` atteso vs `button-key-1` reale, `pin-display` atteso vs `display-pin` reale)
- Conclusione: la suite e2e attuale non è una baseline affidabile né sicura

## 9. Problemi certi

- Ramo production `/api/utenti` non restituisce i campi reali letti dal DB
- Creazione utente incompleta rispetto a UI/documentazione
- Archivio/restore utenti non atomici
- Coverage non eseguibile
- Quality gate locale rosso
- Governance file size applicata in modo parziale
- Endpoint di sistema duplicati

## 10. Debito tecnico strutturale

- Residui template in `shared/schema.ts` e `server/storage.ts`
- codice legacy/backup ancora dentro il perimetro di alcuni controlli
- bootstrap client `main.tsx` troppo carico
- documentazione non pienamente sincronizzata con il codice
