# BadgeNode — Governance Check

Data audit: 2026-04-15

## Scope verificato

- File attivi sotto `client/src`, `server`, `shared`
- Esclusi test, backup `*.backup`, legacy esplicito

## File oltre la soglia enterprise futura `>350`

- `487` righe: `client/src/components/admin/ConfirmDialogs.tsx`
- `465` righe: `server/routes/modules/utenti.ts`

## File oltre la soglia attuale documentata `>220`

- `487` righe: `client/src/components/admin/ConfirmDialogs.tsx`
- `465` righe: `server/routes/modules/utenti.ts`
- `317` righe: `client/src/services/utenti.service.ts`
- `279` righe: `client/src/services/timbrature.service.ts`
- `259` righe: `client/src/services/timbratureRpc.ts`
- `244` righe: `client/src/components/storico/StoricoTable.tsx`
- `241` righe: `client/src/pages/ArchivioDipendenti.tsx`
- `236` righe: `client/src/hooks/useStoricoTimbrature.ts`

## Osservazioni

- Il repository reale viola già la governance documentata da tempo.
- Il guard automatico attuale intercetta solo parte del perimetro e non impedisce la crescita di `server/` e `shared/`.
- In questo step non è stato eseguito alcuno splitting automatico, come richiesto.

## Raccomandazione

- Nel prossimo step, intervenire prima sui file che combinano più responsabilità e hanno impatto diretto sulla correttezza dati:
  - `server/routes/modules/utenti.ts`
  - `client/src/services/utenti.service.ts`
  - `client/src/services/timbrature.service.ts`
  - `client/src/services/timbratureRpc.ts`
- Trattare `ConfirmDialogs.tsx` e `StoricoTable.tsx` come refactor secondario, non come urgenza di integrità dati.
