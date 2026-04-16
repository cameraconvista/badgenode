# BadgeNode — Step Riduzione Debito Quality Gate D

Data: 2026-04-15

## Obiettivo dello step

- Eseguire prima un nuovo backup locale
- Ridurre ancora il debito residuo del quality gate con soli fix meccanici e a rischio operativo nullo
- Restare fuori da timbrature, storico, giorno logico, offline, sync, Supabase, schema DB, migrazioni, Render e UX

## Backup eseguito

- Comando: `npm run esegui:backup`
- Archivio creato: `Backup_15 Aprile_16.15.tar.gz`
- Posizione: `Backup_Automatico/`
- Esito: successo
- Nessun backup esistente sovrascritto

## Fix reali applicati

### Pagina admin ex-dipendenti

File:
- [client/src/pages/ExDipendenti.tsx](/Users/dero/Documents/badgenode/badgenode_main/client/src/pages/ExDipendenti.tsx)

Fix:
- rimosso import inutilizzato `useAuth`
- rimossa variabile inutilizzata `isAdmin`
- rimosso cast `as any` non necessario su `setSelectedEx`
- rimossa funzione morta `handleEsporta`
- rimossi con essa un `console.log`, un marker `TODO(BUSINESS)` e un `any` banale
- tipizzato `storicoRaw` da `any[]` a `unknown[]`

Nota:
- non è stata modificata alcuna logica di caricamento, archiviazione, ripristino o storico

### Route admin ex-dipendenti delete

File:
- [server/routes/modules/other/internal/userManagement/exDipendentiDeleteRoutes.ts](/Users/dero/Documents/badgenode/badgenode_main/server/routes/modules/other/internal/userManagement/exDipendentiDeleteRoutes.ts)

Fix:
- rimosso import inutilizzato `sendError`
- sostituito un cast `any` banale su `delErr.code` con narrowing minimale e sicuro
- rimosso parametro `error` inutilizzato nel `catch`

Nota:
- nessun cambio comportamento nella route

### Active source guard

File:
- [scripts/ci/active-source-guard.allowlist.json](/Users/dero/Documents/badgenode/badgenode_main/scripts/ci/active-source-guard.allowlist.json)

Fix:
- rimossa la voce `client/src/pages/ExDipendenti.tsx` dalla allowlist `console.log/info/debug`
- rimozione giustificata da fix reale: il file non contiene più `console.log/info/debug`

## Delta misurato

- warning ESLint: `106 -> 98`
- allowlist `console.log/info/debug`: `27 -> 26`
- allowlist `TODO/FIXME/HACK`: `4 -> 4`

## Verifiche eseguite

- `npm run lint` -> verde, `0 errori`, `98 warning`
- `npm run typecheck` -> verde
- `npm run test` -> verde, `37/37`
- `npm run build` -> verde
- `npm run check:ci` -> verde
- `node scripts/ci/active-source-guard.mjs` -> verde

## Limiti residui

- Non sono stati toccati warning o marker in aree escluse:
  - timbrature
  - storico
  - giorno logico
  - offline
  - sync

- I `TODO/FIXME/HACK` allowlistati residui sono ancora confinati ad aree sensibili e restano fuori scope per questo step.
