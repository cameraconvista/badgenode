# BadgeNode — Report Stato Attuale

Data audit: 2026-04-15

## Obiettivo dello step

Questo step ha prodotto una baseline tecnica affidabile dello stato reale del repository senza modificare logiche core, dati Supabase, schema database o configurazioni Render.

## Stato generale

- Repository applicativo reale: `badgenode_main/`
- Worktree locale: pulita prima e dopo l'audit
- Stack reale: React + Vite + TypeScript lato client, Express + TypeScript lato server, Supabase come backend dati, Playwright/Vitest/ESLint/Husky già presenti
- Stato generale: progetto funzionante e deployabile, ma con quality gate non ancora coerente con gli obiettivi enterprise

## Mappa repository

### Codice attivo

- `client/`: frontend applicativo
- `server/`: API Express e integrazione server-side con Supabase
- `shared/`: tipi condivisi e schema residuo template
- `supabase/`: migrazioni SQL
- `scripts/`: tooling operativo, diagnostico e manutenzione
- `tests/`: unit test mirati
- `e2e/`: suite Playwright

### Legacy o archivio tecnico

- `legacy/`
- `server/legacy/`
- `scripts/_archive/`
- file `*.backup`

### Output generati

- `dist/`
- `coverage/`
- `node_modules/`

### Documentazione

- `DNA/`

## Architettura reale osservata

- Il client usa sia API server (`/api/*`) sia letture dirette Supabase dal browser.
- Le scritture di timbratura passano da endpoint server (`POST /api/timbrature`, `POST /api/timbrature/manual`, `PATCH /api/timbrature/:id`, `DELETE /api/timbrature/day`) con `SUPABASE_SERVICE_ROLE_KEY`.
- Le letture storico e parte delle letture anagrafiche passano da API server.
- La Home interroga direttamente la tabella `timbrature` dal client per determinare l'azione consentita.
- L'offline queue usa IndexedDB sul client e flush verso `POST /api/timbrature`.
- Lato server è presente un doppio layer di endpoint di sistema: `server/routes/health.ts` e `server/routes/version.ts`, ma anche `server/routes/modules/system.ts` espone endpoint duplicati.

## Timbrature e persistenza

- La logica centrale di timbratura è attiva in `server/routes/timbrature/postTimbratura.ts`.
- Il giorno logico è calcolato server-side con `server/shared/time/computeGiornoLogico.ts`.
- Esiste auto-recovery server-side per uscite notturne senza `anchorDate`.
- Esiste una validazione alternanza server-side, ma non è transazionale rispetto all'insert.
- La Home applica una pre-validazione client-side leggendo direttamente Supabase, con fallback permissivo in caso di errore.

## Stato admin

- Gestione utenti attivi presente via `/api/utenti`.
- Archivio/ex-dipendenti presente ma con implementazione non completamente allineata ai documenti.
- Archiviazione e restore non sono transazionali.

## Stato offline

- Sistema offline presente e integrato.
- Queue locale: `client/src/offline/queue.ts`
- Bootstrap offline: `client/src/main.tsx` + `client/src/offline/index.ts`
- Gating per-device presente.
- Persistenza offline reale: IndexedDB con fallback soft.
- La documentazione offline descrive un flusso più strutturato di quello effettivamente in uso oggi.

## Tooling e qualità

- `typecheck`: passa
- `build`: passa
- `lint`: fallisce
- `test`: fallisce prima dell'esecuzione per dipendenza coverage mancante
- `check:ci`: fallisce
- `file-length-guard`: attivo solo sui file staged sotto `client/src/`
- CI GitHub Actions esiste ma usa Node 18, non coerente con `package.json`

## Punti forti

- Struttura client/server abbastanza leggibile
- Modulo timbrature separato dal resto
- Presenza di read-only guard
- Presenza di test unitari mirati sulla logica giorno logico e timbrature
- Migrazioni Supabase tracciate
- Documentazione ampia, anche se non interamente allineata

## Problemi certi ad alta rilevanza

- `server/routes/modules/utenti.ts` in produzione scarta campi reali (`email`, `telefono`, `ore_contrattuali`, `note`) e restituisce default/null invece del dato letto dal DB.
- `POST /api/utenti` inserisce solo `pin`, `nome`, `cognome`, ignorando campi che la UI e la documentazione dichiarano supportati.
- Suite `vitest` non produce coverage perché manca `@vitest/coverage-v8`.
- `lint` e `check:ci` non sono verdi.
- La suite e2e non è affidabile come baseline: usa selector `data-testid` che non corrispondono al markup attuale e contiene test che possono generare scritture reali.
- Duplicazione endpoint di sistema tra `server/routes/modules/system.ts` e `server/routes/health.ts` / `server/routes/version.ts`.

## Rischi principali

- Incoerenza tra UI, cache locale, letture Supabase client-side e scritture server-side
- Archiviazione/restore utenti non atomici
- Documentazione più ottimistica del codice reale
- Governance file size applicata solo a una porzione del codice

## Esito dello step

- Nessuna modifica al comportamento applicativo
- Nessun accesso distruttivo a Supabase
- Nessuna migrazione eseguita
- Baseline enterprise iniziale prodotta in `REPORT/`
