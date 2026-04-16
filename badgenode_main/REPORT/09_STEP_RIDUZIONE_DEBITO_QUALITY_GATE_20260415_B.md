# BadgeNode — Step Riduzione Debito Quality Gate B

Data: 2026-04-15

## Obiettivo

Ridurre ancora il debito attivo residuo su codice non delicato, senza toccare timbrature, storico, giorno logico, offline, sync, schema DB, migrazioni o Render.

## Pulizia reale eseguita

### Infrastruttura server

File coinvolti:

- `server/createApp.ts`
- `server/start.ts`

- Sostituiti log infrastrutturali `console.log` con `log.http` e `log.info`
- Rimosso un `any` banale da `setupStaticFiles`, sostituendolo con `http.Server`
- Aggiunto guard esplicito sul server HTTP richiesto in development

### Utility e warning banali

File coinvolti:

- `client/src/lib/safeFetch.ts`
- `client/src/lib/dateFmt.ts`
- `client/src/pages/Home/index.tsx`
- `client/src/pages/Home/components/HomeContainer.tsx`

- Rimossa interfaccia `SuccessResponse` inutilizzata
- Rimossa funzione `fromInputDate` inutilizzata
- Rimossi due `catch (error)` con parametro non usato, convertiti a `catch {}` senza cambiare comportamento

### Allowlist aggiornata

File coinvolto:

- `scripts/ci/active-source-guard.allowlist.json`

- Rimossi dalla allowlist `console.log/info/debug`:
  - `server/createApp.ts`
  - `server/start.ts`

## Debito residuo: delta reale

- Allowlist `console.log/info/debug`: da `30` file a `28`
- Allowlist `TODO/FIXME/HACK`: invariata a `4`
- Warning ESLint attivi: da `140` a `135`

## Limiti residui reali

- Restano `28` file allowlistati per logging tecnico fuori scope
- Restano `4` file allowlistati per marker tecnici fuori scope
- Restano `135` warning ESLint non bloccanti, concentrati soprattutto in aree escluse o più sensibili
- Restano warning di build non bloccanti su chunk size e dataset browser datati
