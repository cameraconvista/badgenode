# BadgeNode — Step Riduzione Debito Quality Gate E

Data: 2026-04-15

## Obiettivo dello step

- Eseguire un nuovo backup locale
- Ridurre ancora il debito residuo del quality gate con soli fix meccanici e a rischio operativo nullo
- Restare esclusivamente su codice non delicato

## Backup eseguito

- Comando: `npm run esegui:backup`
- Archivio creato: `Backup_15 Aprile_16.19.tar.gz`
- Posizione: `Backup_Automatico/`
- Esito: successo
- Nessuna sovrascrittura dei backup esistenti

## Fix reali applicati

### Route admin archiviazione utenti

File:
- [server/routes/modules/other/internal/userManagement/archiveRoutes.ts](/Users/dero/Documents/badgenode/badgenode_main/server/routes/modules/other/internal/userManagement/archiveRoutes.ts)

Fix:
- rimosso parametro inutilizzato `reason`
- sostituiti `console.log/error/warn` con `log.info/error/warn` già esistente
- introdotto un adapter locale minimale per `ex_dipendenti`, sul modello già usato in altre route server
- rimossi cast `any` meccanici su `utente` e sulla `insert` verso `ex_dipendenti`

Nota:
- nessun cambio al flusso funzionale di archiviazione
- nessuna modifica a timbrature, sessioni, Supabase schema o business rules

### Active source guard

File:
- [scripts/ci/active-source-guard.allowlist.json](/Users/dero/Documents/badgenode/badgenode_main/scripts/ci/active-source-guard.allowlist.json)

Fix:
- rimossa la voce `server/routes/modules/other/internal/userManagement/archiveRoutes.ts` dalla allowlist `console.log/info/debug`
- rimozione giustificata da fix reale: il file non contiene più `console.log/info/debug`

## Delta misurato

- warning ESLint: `98 -> 90`
- allowlist `console.log/info/debug`: `26 -> 25`
- allowlist `TODO/FIXME/HACK`: `4 -> 4`

## Verifiche eseguite

- `npm run esegui:backup` -> verde
- `npm run lint` -> verde, `0 errori`, `90 warning`
- `npm run typecheck` -> verde
- `npm run test` -> verde, `37/37`
- `npm run build` -> verde
- `npm run check:ci` -> verde
- `node scripts/ci/active-source-guard.mjs` -> verde

## Limiti residui

- I `TODO/FIXME/HACK` allowlistati residui restano confinati ad aree sensibili e non sono stati toccati.
- I warning residui sono ancora concentrati soprattutto in:
  - `storico`
  - `timbrature`
  - `offline`
  - alcune route admin interne con typing più debole
