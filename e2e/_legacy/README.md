# e2e legacy — NON in esecuzione

Questi spec (`login`, `storico`, `timbrature`) sono stati scritti su una UI che non
corrisponde al codice reale: cercano ~108 `data-testid` di cui nella UI ne esistono
solo pochi. Tutti i loro test fallivano. Alcuni cliccavano "entrata" senza intercettare
la rete, con rischio di scrittura reale sul DB.

Sono **esclusi dal run** via `testIgnore: '_legacy/**'` in `playwright.config.ts`.
Restano qui come riferimento storico dei flussi che si volevano coprire.

La suite attiva è in `e2e/`:
- `visual-nav.spec.ts` — navigazione pagine + regressione visiva, multi-viewport, read-only
- `smoke-isolated.spec.ts` — flusso timbratura con rete mockata, nessuna scrittura reale

Per riusare un flusso legacy: riscrivere i selettori su quelli reali della UI e
intercettare le chiamate `/api/**` prima di portarlo fuori da questa cartella.
