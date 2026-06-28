# Operations

## Ambiente

Caricamento env server:
- import iniziale in `server/bootstrap/env.ts`
- lettura esplicita di `.env.local`
- fallback a `.env`

Variabili oggi rilevanti:
- `PORT`
- `NODE_ENV`
- `LOG_LEVEL`
- `DEBUG_ENABLED`
- `READ_ONLY_MODE`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- feature flags client offline/auth
- `VITE_FEATURE_LOGGER_ADAPTER`
- `VITE_FEATURE_MONITORING`
- `SENTRY_DSN`

File env operativi:
- `.env.local`: segreti locali reali, non committare
- `.env.example`: placeholders canonici per bootstrap ambiente

## Avvio

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run check`
- `npm run lint`
- `npm run test`
- `npm run e2e`

Nota: il server dev reale e` `server/start.ts`, non `server/index.ts` come riportato in parte della documentazione storica.
Nota E2E: Playwright usa `playwright.config.ts`, lancia `npm run dev` su `PLAYWRIGHT_PORT || PORT || 5001` e il repository contiene suite attive in `e2e/`.

## Verifiche rapide

- health: `curl http://127.0.0.1:<PORT>/api/health`
- version: `curl http://127.0.0.1:<PORT>/api/version`
- home: `curl -I http://127.0.0.1:<PORT>/`

## Backup

Directory backup attiva:
- `Backup_Automatico/`

Script disponibile:
- `npm run esegui:backup`
- `npm run backup:list`
- `npm run backup:restore`

Convenzione nome file:
- `Backup_DD Mese_HH.MM.tar.gz`

Esclusioni operative del backup:
- `node_modules`
- `.git`
- `dist`
- `build`
- `coverage`
- `.cache`
- `Backup_Automatico`

Nota:
- il backup locale e` un archivio di progetto, non un sostituto di backup DB o Supabase
- non sovrascrivere backup esistenti

## Script da trattare con cautela

Leggere il codice prima di eseguire:
- `scripts/seed_dev_supabase.ts`
- `scripts/seed_dev_cleanup.ts`
- `scripts/seed-auth.mjs`
- `scripts/backup-restore.ts`
- SQL in `scripts/sql/`

Questi possono toccare dati, auth o stato operativo.

## CI e workflow

Workflow presente:
- `.github/workflows/ci.yml`

Copre:
- lint
- test
- build
- e2e
- audit/security non bloccante

In CI E2E viene creato un `.env.local` temporaneo con valori fittizi. Non usare quella configurazione come riferimento per l'ambiente reale.

## Git / GitHub

Repository remoto operativo:
- remote GitHub: `origin`
- branch operativo richiesto per rilascio manuale: `main`

Regole operative:
- verificare sempre `git status`, branch corrente e remote prima di commit o push
- eseguire almeno `check`, `lint`, `test` e `build` prima di push manuali quando il contesto lo consente
- non committare `.env`, segreti, backup o artefatti generati
- non usare `push --force`
- se il push fallisce, fermarsi e verificare causa e stato locale/remoto prima di nuovi tentativi

## Deploy

Hosting: Render, servizio `badgenode` (`srv-d3r9miali9vc73cv7qag`), deploy unico frontend+backend, region Frankfurt, plan starter.
- URL pubblico: `https://badgenode.onrender.com` · Admin: `/archivio-dipendenti`
- Build: `npm install; npm run build` · Start: `npm run start` · `NODE_ENV=production`, `PORT=10000`, `healthCheckPath=/api/health`
- **`NPM_CONFIG_PRODUCTION=false`** è obbligatorio: vite/esbuild/typescript sono devDependencies e servono in build.
- autoDeploy è impostato su `main`, ma **manca il webhook GitHub→Render**: finché non si ricollega il repo dal dashboard, ogni push richiede un deploy manuale (Render dashboard → Manual Deploy, o API).

## Post-deploy (verifica rapida)

1. `npm run check:ci` + `npm run test` verdi prima del push.
2. Backup pre-deploy: `npm run esegui:backup`.
3. Dopo il deploy, verifica endpoint prod:
   - `curl -s https://badgenode.onrender.com/api/health` → 200
   - `curl -s https://badgenode.onrender.com/api/ready` → 200
   - `curl -s https://badgenode.onrender.com/api/version`
4. Smoke Supabase: `npm run smoke:runtime`.
5. Rollback: Render dashboard → Deploys → "Rollback to this deploy", oppure `git revert <sha>` + nuovo deploy.

## Monitoraggio / alert

- Endpoint da monitorare: `/api/health` e `/api/ready` (intervallo 5 min, 2 fallimenti consecutivi = down), home `/` (10 min).
- Target: uptime >99.5%, response <500ms.
- Strumento previsto (non ancora attivo): UptimeRobot su `https://badgenode.onrender.com/api/health`. Stato: DA ATTIVARE.
- Keepalive Supabase Free: workflow `.github/workflows/supabase-keepalive.yml` (ping read-only ogni 2 giorni).

Storico versioni: `CHANGELOG.md` (root).

## Regola documentale

Se cambia davvero:
- un entrypoint
- una variabile env necessaria
- una route o un flusso critico
- un workflow CI/CD

allora aggiornare i file canonici in `DNA/`.
