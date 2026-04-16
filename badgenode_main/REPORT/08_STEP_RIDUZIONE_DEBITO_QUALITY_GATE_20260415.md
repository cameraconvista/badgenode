# BadgeNode — Step Riduzione Debito Quality Gate

Data: 2026-04-15

## Obiettivo

Ridurre il debito attivo residuo del quality gate senza toccare timbrature, storico, giorno logico, offline, sync, schema DB, migrazioni, Render o UX.

## Pulizia reale eseguita

### Logging e marker

File coinvolti:

- `server/bootstrap/env.ts`
- `server/lib/supabaseAdmin.ts`
- `server/routes/modules/system.ts`
- `shared/types/timbrature.ts`

- Sostituiti i `console.log` del bootstrap env con `log.info`
- Sostituito il `console.log` di inizializzazione Supabase Admin con `log.info`
- Rimossa la funzione morta `createAdminProxy` da `server/lib/supabaseAdmin.ts`
- Rimosso un marker `TODO` non necessario da `server/routes/modules/system.ts`
- Rimosso un marker `TODO` non necessario da `shared/types/timbrature.ts`

### Warning ESLint semplici e sicuri

File coinvolti:

- `client/src/components/admin/ExDipendentiTable.tsx`
- `client/src/components/admin/ModaleNuovoDipendente.tsx`

- Rimosso import inutilizzato `EmptyState`
- Rimossa interfaccia `ApiError` inutilizzata

## Debito residuo: delta reale

- Allowlist `console.log/info/debug`: da `32` file a `30`
- Allowlist `TODO/FIXME/HACK`: da `6` file a `4`
- Warning ESLint attivi: da `143` a `140`

## Cosa non è stato toccato volutamente

- File collegati a timbrature
- File collegati a storico
- File collegati a giorno logico
- File collegati a offline queue o sync
- Warning e log in aree delicate o in file con rischio di side effect non giustificato in questo step

## Limiti residui reali

- Restano `30` file allowlistati per logging tecnico fuori scope
- Restano `4` file allowlistati per marker tecnici fuori scope
- Restano `140` warning ESLint non bloccanti
- Restano warning di build non bloccanti su chunk size e dataset browser datati
