# BadgeNode — Riallineamento Tooling Monitoraggio

Data: 2026-04-15

## Obiettivo

Rendere coerenti con l'operatività reale locale gli strumenti già presenti per test e monitoraggio, senza toccare logiche applicative, dati o flussi critici.

## Modifiche applicate

### Playwright

File:
- [playwright.config.ts](/Users/dero/Documents/badgenode/badgenode_main/playwright.config.ts)

Fix:
- base URL portata da `3001` a porta configurabile con default `5001`
- `webServer.command` aggiornato per avviare l'app con `PORT=5001`
- `webServer.url` riallineato a `http://localhost:5001`

Effetto:
- la suite E2E non è stata resa automaticamente affidabile sul piano funzionale
- ma la configurazione non punta più a una porta errata rispetto all'operatività corrente

### Auto health check locale

File:
- [scripts/auto-health-check.ts](/Users/dero/Documents/badgenode/badgenode_main/scripts/auto-health-check.ts)

Fix:
- porta target aggiornata da `3001` a valore configurabile con default `5001`
- root progetto ricavata da `process.cwd()` invece di un path hardcoded obsoleto
- verifica salute eseguita su `/api/health` invece che sulla root `/`
- pattern di kill aggiornato da `server/index.ts` a `server/start.ts`
- startup del processo figlio riallineato a `PORT=5001`
- conferma avvio aggiornata sul log reale `Server running on port 5001`

Effetto:
- `npm run health:check` ora è coerente con l'ambiente reale locale

## Verifiche eseguite

- `npm run lint` -> verde, `0 errori`, `106 warning`
- `npm run typecheck` -> verde
- `npm run health:check` -> verde
- `npm run check:ci` -> verde

## Limiti residui

- Non ho eseguito Playwright E2E live.
- Motivo:
  - la suite tocca aree sensibili come timbrature e storico
  - alcuni selector e assunzioni restano da validare contro il runtime reale
  - questo step era di riallineamento tooling, non di esecuzione aggressiva dei test end-to-end

## Conclusione

Il progetto ora ha due strumenti locali in meno disallineati rispetto all'ambiente reale:

- Playwright non punta più di default alla porta sbagliata
- l'health-check automatico è finalmente coerente con la root e la porta operative effettive

Questo migliora la readiness del progetto a un futuro step di consolidamento osservabilità, senza rischio per l'applicazione in uso.
