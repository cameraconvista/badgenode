# BadgeNode — Step Riduzione Debito Quality Gate C

Data: 2026-04-15

## Obiettivo dello step

- Ridurre altro debito attivo residuo sul codice non delicato
- Applicare solo micro-fix meccanici e a rischio operativo nullo
- Mantenere verde l'intera pipeline minima: `lint`, `typecheck`, `test`, `build`, `check:ci`

## Fix reali applicati

### Utility e typing client

- [client/src/types/api.ts](/Users/dero/Documents/badgenode/badgenode_main/client/src/types/api.ts)
  - sostituito `ApiResponse<any>` con `ApiResponse<unknown>`

- [client/src/config/featureFlags.ts](/Users/dero/Documents/badgenode/badgenode_main/client/src/config/featureFlags.ts)
  - introdotto helper tipizzato per leggere `import.meta.env`
  - rimossi `any` usati solo per accesso all'env runtime

- [client/src/services/utenti.service.ts](/Users/dero/Documents/badgenode/badgenode_main/client/src/services/utenti.service.ts)
  - rimossi `catch` con parametro inutilizzato in casi non comportamentali
  - nessuna modifica al contratto funzionale utenti in questo step

### Infrastruttura server

- [server/lib/logger.ts](/Users/dero/Documents/badgenode/badgenode_main/server/lib/logger.ts)
  - sostituiti `any` con alias tipizzati `unknown[]`
  - separato typing minimo per uso contestuale del logger
  - comportamento invariato: pino opzionale con fallback console

- [server/routes/modules/other/internal/helpers.ts](/Users/dero/Documents/badgenode/badgenode_main/server/routes/modules/other/internal/helpers.ts)
  - tipizzato `Response` Express
  - sostituiti `any` con `unknown` e `Record<string, unknown>`
  - comportamento invariato sui payload di risposta

- [server/lib/monitoring.ts](/Users/dero/Documents/badgenode/badgenode_main/server/lib/monitoring.ts)
  - sostituiti `console.info/error/debug` con `log.info/error/debug`
  - rimosso un file dalla allowlist `console.log/info/debug`
  - nessun cambio logico al modulo di monitoring stub

## Delta misurato

- warning ESLint: `135 -> 106`
- allowlist `console.log/info/debug`: `28 -> 27`
- allowlist `TODO/FIXME/HACK`: `4 -> 4`

## Limiti residui

- Restano warning concentrati soprattutto in aree escluse o più sensibili:
  - `storico`
  - `timbrature`
  - `offline`
  - route admin interne con typing ancora debole

- Non è stato corretto alcun marker `TODO/FIXME/HACK` perché quelli residui sono in aree fuori scope o non abbastanza sicure per questo step.

## Verifica finale

- `npm run lint` -> verde, `0 errori`, `106 warning`
- `npm run typecheck` -> verde
- `npm run test` -> verde, `37/37`
- `npm run build` -> verde
- `npm run check:ci` -> verde
- `node scripts/ci/active-source-guard.mjs` -> verde
