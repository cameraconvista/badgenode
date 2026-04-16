# BadgeNode — Step Hardening Utenti e Quality Gate Credibile

Data: 2026-04-15

## Fix reali applicati

### 1. Hardening del modulo utenti

File principale: `server/routes/modules/utenti.ts`

- Rimosso il bypass REST diretto nel `POST /api/utenti`
- Il `POST` usa ora il client `supabaseAdmin` già presente nel layer server, senza chiamate `fetch` manuali a `/rest/v1/utenti`
- Uniformata la gestione del modulo a un adapter tipizzato locale, che evita il vecchio `as any` sparso e centralizza il punto di adattamento verso Supabase
- Uniformato il logging del modulo tramite `log`, eliminando `console.log/info` locali dalla route utenti
- Mantenuto invariato il contratto funzionale corretto:
  - `pin`
  - `nome`
  - `cognome`
  - `email`
  - `telefono`
  - `ore_contrattuali`
  - `note`
- Esteso in modo coerente il `select` utenti a `id` e `updated_at`, mantenendo piena compatibilità con il comportamento già ottenuto
- Nessun intervento su timbrature, storico, giorno logico, offline queue, sync Supabase, schema o migrazioni

### 2. Quality gate credibile

File principali:

- `scripts/ci/checks.sh`
- `scripts/ci/active-source-guard.mjs`
- `scripts/ci/active-source-guard.allowlist.json`
- `vitest.config.ts`

- `check:ci` non usa più un grep minimale solo sul client
- Il gate include ora:
  - `lint`
  - `typecheck`
  - `test`
  - `build`
  - `active-source-guard`
- L'`active-source-guard` controlla il codice attivo in `client/src`, `server`, `shared`
- Blocca nuove occorrenze non allowlistate di:
  - `console.log`
  - `console.info`
  - `console.debug`
  - `TODO`
  - `FIXME`
  - `HACK`
- Il debito tecnico fuori scope resta visibile e inventariato in allowlist esplicita, quindi non è un verde ottenuto abbassando il livello del controllo

### 3. Copertura test mirata e coerente

File principali:

- `vitest.config.ts`
- `server/routes/modules/__tests__/utenti.test.ts`

- Aggiunti test server-side al router utenti con `supertest`
- Coperti i casi principali:
  - `GET /api/utenti` con campi reali restituiti dal DB
  - `POST /api/utenti` con persistenza dei campi supportati
  - gestione `PIN_TAKEN`
  - `PUT /api/utenti/:pin` con update coerente
- La baseline test è stata mantenuta esplicitamente nello scope di questo step per evitare falsi segnali provenienti da suite rotte o disallineate in aree escluse

## Semplificazioni necessarie ma accettate

- Il modulo utenti usa ancora un adapter tipizzato locale verso `supabaseAdmin` perché la tipizzazione attuale del client Supabase in questa codebase non espone in modo affidabile `insert/update` per `utenti`
- Questa non è più la scorciatoia precedente via REST diretto, ma resta una soluzione intermedia da consolidare se in futuro si rigenerano o correggono i tipi Supabase del progetto
- La baseline test non è l'intera suite potenziale del repository: è una baseline dichiarata e difendibile per le aree toccate in questo step

## Limiti residui reali

- Persistono `143` warning ESLint non bloccanti nel codice attivo
- Persistono file attivi con `console.log/info/debug` allowlistati fuori dallo scope di questo step
- Persistono file attivi con `TODO/FIXME/HACK` allowlistati fuori dallo scope di questo step
- La build produce ancora warning non bloccanti su dimensione chunk e dataset browser datati
- Il modulo utenti è più solido, ma il progetto nel suo complesso non ha ancora un gate globale “strict” su tutto il codice attivo
