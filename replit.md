# BadgeNode — Sistema Timbrature Ristorante

## Panoramica

**BadgeNode** è un sistema enterprise di timbratura dipendenti (entrata/uscita) basato su PIN, progettato per l'uso su tablet o kiosk. Attualmente in uso attivo nel ristorante del proprietario.

## Tema Visivo (Aggiornato Aprile 2026)

Palette light professionale: **sfondo crema caldo** (`#F8F3EE`) + **bordeaux scuro elegante** (`#7A1228`) come colore dominante. File CSS principali:
- `client/src/index.css` — CSS variables (`:root`)
- `client/src/styles/badgenode.css` — classi utili BN + overrides
- `client/src/styles/bn-table.css` — stile tabelle storico/archivio

## Stack Tecnologico

| Layer | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Radix UI (solo 8 componenti utilizzati) |
| Routing | Wouter |
| State | TanStack Query v5 |
| Backend | Express + TypeScript (tsx) |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Offline | Service Worker (vite-plugin-pwa) + IndexedDB |
| Test | Vitest + Playwright |

## Comandi

```bash
cd badgenode_main
npm run dev        # Avvia il server di sviluppo (porta 5000 su Replit)
npm run build      # Build produzione
npm run test       # Esegui test (37 test)
npm run typecheck  # Controllo TypeScript
npm run lint       # ESLint
```

## Workflow Replit

Il workflow "Start application" esegue:
```
cd badgenode_main && PORT=5000 npm run dev
```

## Architettura

### Client (`client/src/`)
- **`pages/Home/`** — Tastierino PIN + azioni timbratura
- **`pages/StoricoTimbrature.tsx`** — Storico e report dipendenti
- **`pages/ArchivioDipendenti.tsx`** — Gestione utenti admin
- **`offline/`** — Sistema offline: IndexedDB + queue + sync runner
- **`services/`** — Servizi API (timbrature, utenti, storico)
- **`contexts/AuthContext.tsx`** — Auth (mock, da integrare con Supabase Auth)

### Server (`server/`)
- **`routes/timbrature/`** — POST/PATCH/DELETE timbrature
- **`routes/modules/utenti.ts`** — CRUD dipendenti
- **`routes/modules/system.ts`** — Health admin, debug env, deep health
- **`routes/health.ts`** — `/api/health`, `/api/ready`
- **`routes/version.ts`** — `/api/version`
- **`shared/time/computeGiornoLogico.ts`** — Logica giorno logico (CORE — NON TOCCARE)

### Logiche critiche da preservare
- **Giorno Logico**: turni notturni che finiscono dopo mezzanotte ma prima delle 05:00 appartengono al giorno precedente
- **Offline Queue**: timbrature salvate in IndexedDB quando offline, sincronizzate al ripristino della connessione
- **Alternanza**: validazione che entrata/uscita si alternino correttamente
- **Auto-recovery**: uscite notturne (00:00-05:00) senza anchorDate recuperano automaticamente l'ultima entrata

## Database Supabase

Tabelle principali:
- `timbrature` — Record timbrature (pin, tipo, ts_order, giorno_logico, data_locale, ora_locale)
- `utenti` — Dipendenti (pin, nome, cognome, email, telefono, ore_contrattuali, note)
- `ex_dipendenti` — Archivio dipendenti non più attivi

Migrations in `supabase/migrations/`.

## Documentazione

- `DNA/` — Documentazione tecnica completa del progetto
- `DNA/07_logica_giorno_logico.md` — Logica giorno logico
- `DNA/09_offline.md` — Sistema offline
- `REPORT/` — Audit tecnici e step di quality gate
- `CHANGELOG.md` — Storico modifiche

## Variabili d'Ambiente

Richieste in `.env.local`:
- `VITE_SUPABASE_URL` — URL progetto Supabase
- `VITE_SUPABASE_ANON_KEY` — Chiave pubblica Supabase
- `SUPABASE_URL` — URL server-side
- `SUPABASE_SERVICE_ROLE_KEY` — Chiave service role (bypassa RLS)

## Note di Manutenzione

- Il vincolo engine node è `>=22.12` (senza limite superiore)
- I Radix UI components installati nel package.json sono più del necessario (tree-shaking li esclude dal bundle)
- `caniuse-lite` aggiornato ad aprile 2026
- 0 errori ESLint, ~82 warning (tutti non bloccanti)
- 37/37 test passano
