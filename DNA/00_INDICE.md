# DNA — Indice di ingresso

`DNA/` è il contesto operativo canonico di BadgeNode: leggero da caricare, completo nel panorama. Il **codice reale resta la fonte di verità**: se diverge dalla doc, vale il codice e il DNA va riallineato.

## Cosa leggere e quando

Leggere in ordine di numero. I primi file sono indispensabili prima di operare; gli ultimi sono consultazione occasionale.

| # | File | Quando serve |
|---|------|--------------|
| 00 | questo indice | ingresso |
| 01 | [01_GUARDRAIL.md](01_GUARDRAIL.md) | **sempre, prima di agire** — vincoli non negoziabili e cose da non rompere |
| 02 | [02_ARCHITETTURA_REALE.md](02_ARCHITETTURA_REALE.md) | struttura reale, entrypoint, runtime, routing, moduli chiave |
| 03 | [03_LOGICHE_CRITICHE.md](03_LOGICHE_CRITICHE.md) | giorno logico, alternanza, idempotenza, storico, offline, PIN |
| 04 | [04_SUPABASE_DATABASE.md](04_SUPABASE_DATABASE.md) | schema reale verificato, RLS, RPC, trigger, punti accesso DB |
| 05 | [05_OPERATIONS.md](05_OPERATIONS.md) | avvio, build, test, script, backup, CI, deploy, Git |
| 06 | [06_DECISION_LOG.md](06_DECISION_LOG.md) | decisioni tecniche rilevanti già prese |
| 07 | [07_INTEGRAZIONI_DATI.md](07_INTEGRAZIONI_DATI.md) | env e ruoli, storage locale, GitHub, integrazioni esterne |

## Risposte rapide

- **Repo corretto:** GitHub `cameraconvista/badgenode` (remote `origin`); branch rilascio `main`.
- **Deploy:** Render, servizio `badgenode`, deploy unico frontend+backend. Pubblico: `https://badgenode.onrender.com`. Admin reale: `https://badgenode.onrender.com/archivio-dipendenti`. Autodeploy su push a `main` = deploy in produzione.
- **DB collegato:** Supabase, progetto `tutllgsjrbxkmrwseogz`. Tabelle reali: `utenti`, `timbrature`, `ex_dipendenti`. Chiave logica di dominio = `pin`.
- **Avvio locale:** `npm run dev` (Express + Vite middleware), porta richiesta `5001`. Entry server `server/start.ts`.
- **Workflow attivi:** CI `.github/workflows/ci.yml` (lint, test, build, e2e, audit non bloccante); pre-commit Husky + lint-staged.
- **Backup:** `npm run esegui:backup` → `Backup_Automatico/` (archivio progetto, non sostituto del backup DB).
- **Segreti:** in `.env.local` (gitignored). Mai stampare token/chiavi.

## Materiale fuori da `DNA/`

- File root operativi: `README_OPERATIVO.md`, `CHANGELOG.md`, `POST_DEPLOY_CHECKLIST.md`, `ALERT_UPTIME.md`.
- Archivio storico non canonico: `DOCS_STORICO/` (validare sempre contro il codice).
- README accoppiati ad archivi: `scripts/_archive/.../README.md`, `server/legacy/README.md`.
- `.local/`: tooling locale dell'ambiente agente, non documentazione di progetto.

## Manutenzione

Tenere qui solo ciò che riduce errori, regressioni o perdita di contesto e che un agent NON ricava rapidamente dal codice. Se elimini o accorpi un file, **rinumera senza buchi**. Aggiornare il DNA nello stesso intervento in cui cambia un flusso, un vincolo o un workflow reale.
