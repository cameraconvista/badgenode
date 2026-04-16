# BadgeNode — Monitoraggio Enterprise Integrabile

Data: 2026-04-15

## Obiettivo

Mappare gli strumenti già presenti o integrabili nel progetto per aumentare monitoraggio, testing e controllo enterprise senza toccare logiche operative critiche dell'applicazione.

## 1. Già pronto e sfruttabile subito

### Quality gate e controlli locali/CI

- `ESLint` attivo
- `TypeScript` typecheck attivo
- `Vitest` con coverage attiva
- `Husky` pre-commit attivo
- `GitHub Actions CI` attiva
- `active-source-guard` attivo
- `file-length-guard` attivo, ma limitato a `client/src`

File chiave:
- [eslint.config.js](/Users/dero/Documents/badgenode/badgenode_main/eslint.config.js)
- [vitest.config.ts](/Users/dero/Documents/badgenode/badgenode_main/vitest.config.ts)
- [.husky/pre-commit](/Users/dero/Documents/badgenode/badgenode_main/.husky/pre-commit)
- [scripts/ci/checks.sh](/Users/dero/Documents/badgenode/badgenode_main/scripts/ci/checks.sh)
- [scripts/ci/active-source-guard.mjs](/Users/dero/Documents/badgenode/badgenode_main/scripts/ci/active-source-guard.mjs)
- [.github/workflows/ci.yml](/Users/dero/Documents/badgenode/badgenode_main/.github/workflows/ci.yml)

Valore reale:
- baseline professionale già funzionante per lint, typecheck, unit test, build e guard sui marker tecnici
- non richiede nuove dipendenze per essere usata

Limite reale:
- la coverage Vitest è oggi una baseline mirata, non copertura enterprise estesa dell'intera codebase

### Analisi statica e dependency audit già disponibili

Script già presenti:
- `depcheck`
- `ts-prune`
- `knip`
- `vite-bundle-visualizer`
- `source-map-explorer`
- `npm audit`
- `npm outdated`

Valore reale:
- utili per capire debito, dipendenze inutilizzate, bundle growth e rischio di regressione tecnica

Limite reale:
- sono audit diagnostici, non enforcement automatico della qualità di produzione

### Health, diagnostica e operatività

Già presenti:
- endpoint `/api/health`
- endpoint `/api/ready`
- endpoint `/api/version`
- endpoint `/api/health/admin`
- script di diagnosi codebase
- script health-check locale
- sistema backup/restore

File chiave:
- [server/routes/modules/system.ts](/Users/dero/Documents/badgenode/badgenode_main/server/routes/modules/system.ts)
- [server/routes/health.ts](/Users/dero/Documents/badgenode/badgenode_main/server/routes/health.ts)
- [server/routes/version.ts](/Users/dero/Documents/badgenode/badgenode_main/server/routes/version.ts)
- [scripts/diagnose.ts](/Users/dero/Documents/badgenode/badgenode_main/scripts/diagnose.ts)
- [scripts/health-check-runner.ts](/Users/dero/Documents/badgenode/badgenode_main/scripts/health-check-runner.ts)
- [scripts/backup.ts](/Users/dero/Documents/badgenode/badgenode_main/scripts/backup.ts)
- [scripts/backup-restore.ts](/Users/dero/Documents/badgenode/badgenode_main/scripts/backup-restore.ts)

Valore reale:
- c'è già una base concreta per osservabilità operativa e runbook

Limite reale:
- gli endpoint di sistema sono duplicati tra router diversi
- `health/deep` è ancora uno stub e non fa una vera probe DB

## 2. Presente ma da attivare o riallineare

### Playwright E2E

Presenza reale:
- `@playwright/test` installato
- suite in `e2e/`
- config presente

File chiave:
- [playwright.config.ts](/Users/dero/Documents/badgenode/badgenode_main/playwright.config.ts)
- [e2e/login.spec.ts](/Users/dero/Documents/badgenode/badgenode_main/e2e/login.spec.ts)
- [e2e/timbrature.spec.ts](/Users/dero/Documents/badgenode/badgenode_main/e2e/timbrature.spec.ts)
- [e2e/storico.spec.ts](/Users/dero/Documents/badgenode/badgenode_main/e2e/storico.spec.ts)

Stato reale:
- predisposto ma non affidabile come gate enterprise oggi

Motivi:
- punta a `localhost:3001`, mentre il flusso operativo locale è ora `5001`
- assume `data-testid` e stati UI che non sono garantiti come allineati al runtime reale
- contiene test su aree sensibili fuori scope come timbrature e storico
- in CI crea `.env.local` fittizio, ma non c'è evidenza che la suite sia stabile e fedele

### Monitoring applicativo server

Presenza reale:
- modulo monitoring già scritto

File chiave:
- [server/lib/monitoring.ts](/Users/dero/Documents/badgenode/badgenode_main/server/lib/monitoring.ts)

Stato reale:
- stub pronto a essere attivato, non monitoring operativo oggi

Motivi:
- il codice Sentry è commentato
- non risultano installati SDK come `@sentry/node`
- il provider dichiarato è ancora `sentry-stub`

### Logger strutturato

Presenza reale:
- adapter logger con supporto a `pino` opzionale

File chiave:
- [server/lib/logger.ts](/Users/dero/Documents/badgenode/badgenode_main/server/lib/logger.ts)

Stato reale:
- fallback console attivo, structured logging non realmente attivato

Motivi:
- `pino` e `pino-pretty` non risultano presenti in `package.json`
- il modulo è utile come punto di aggancio, ma oggi non dà vantaggi enterprise completi

### Auto health check locale

File chiave:
- [scripts/auto-health-check.ts](/Users/dero/Documents/badgenode/badgenode_main/scripts/auto-health-check.ts)

Stato reale:
- presente ma da riallineare prima di poter essere considerato affidabile

Motivi:
- usa porta `3001`
- usa un `cwd` hardcoded non coerente con la root reale attuale

### Smoke runtime

File chiave:
- [scripts/ci/smoke-runtime.ts](/Users/dero/Documents/badgenode/badgenode_main/scripts/ci/smoke-runtime.ts)

Stato reale:
- utile ma delicato

Motivi:
- esegue accesso Supabase reale
- invoca anche una RPC di timbratura
- non va promosso a controllo standard senza isolamento ambiente o sandbox dedicata

## 3. Non presente davvero ma utile da aggiungere

Le integrazioni sotto non risultano oggi installate come strumenti reali del progetto.

### Error tracking e APM

Utili:
- `@sentry/node`
- `@sentry/react`

Perché utili:
- tracciamento errori server/client
- release tracking
- breadcrumb e tracing basilare

Precondizione:
- attivazione graduale e solo dietro feature flag già prevista nel modulo monitoring

### Structured logging vero

Utili:
- `pino`
- `pino-pretty`

Perché utili:
- log strutturati, filtrabili e più adatti a produzione
- attivabili con minimo impatto dato che il logger adapter esiste già

### Accessibility e UI smoke non invasivi

Utili:
- `@axe-core/playwright` oppure `axe-core`

Perché utili:
- controlli automatici accessibilità su pagine admin e login
- monitoraggio qualità UI senza toccare logiche business

### Mocking affidabile per test client

Utile:
- `msw`

Nota:
- compare solo come dipendenza transitiva nel lockfile, non come strumento integrato del progetto

Perché utile:
- rendere più affidabili test client e integration senza chiamare backend o Supabase reali

### Coverage e test dashboard evoluta

Utili:
- `@vitest/ui`
- eventuale estensione progressiva di coverage thresholds

Nota:
- compaiono nel lockfile come riferimenti transitive/opzionali, ma non come integrazione configurata

Perché utile:
- migliorare la leggibilità dello stato test senza toccare produzione

## 4. Cose documentate ma non realmente integrate

Documentazione presente:
- [ALERT_UPTIME.md](/Users/dero/Documents/badgenode/badgenode_main/ALERT_UPTIME.md)
- [DNA/diagnosi/LOGTAIL_PRODUCTION_ACTIVATION.md](/Users/dero/Documents/badgenode/badgenode_main/DNA/diagnosi/LOGTAIL_PRODUCTION_ACTIVATION.md)

Stato reale:
- piani o runbook, non integrazioni operative già attive nel codice o nelle dipendenze

## 5. Raccomandazione conservativa

Ordine più sicuro per aumentare monitoraggio enterprise senza rischio sulle logiche in uso:

1. Riallineare e consolidare gli strumenti già presenti:
   - Playwright
   - auto-health-check
   - health endpoints duplicati
   - coverage estesa ma solo su moduli non delicati

2. Attivare structured logging vero sul logger già esistente:
   - `pino`
   - `pino-pretty`

3. Attivare error tracking solo dopo:
   - `@sentry/node`
   - eventualmente `@sentry/react`

4. Aggiungere test non invasivi:
   - `msw` per integration test client
   - `axe` per accessibilità

## 6. Conclusione

Il progetto non è privo di tooling enterprise: la base c'è già. Il punto non è aggiungere "qualunque plugin", ma attivare in modo controllato ciò che è già predisposto e aggiungere solo integrazioni con ROI chiaro e basso rischio operativo.

Le opportunità migliori e più sicure sono:
- consolidamento Playwright
- structured logging reale
- error tracking graduale
- mocking testabile senza backend reale

Le aree da evitare come primo intervento restano:
- smoke test che scrivono su Supabase reale
- E2E che toccano timbrature live
- cambi alle logiche core per “fare entrare” nuovi strumenti
