# BadgeNode — CHANGELOG

Tutti i cambiamenti rilevanti al progetto sono documentati in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/lang/it/).

---

## [1.0.0] — 2025-11-01

### 🎉 Release Iniziale Production-Ready

**Stato:** Enterprise Stable

#### Added
- ✅ Sistema timbrature PWA con PIN (1-99)
- ✅ Giorno logico con cutoff 05:00 per turni notturni
- ✅ Multi-sessione: più entrate/uscite per giorno
- ✅ Offline-first: coda IndexedDB con sync automatica
- ✅ Admin dashboard: gestione utenti, storico, export CSV/PDF
- ✅ Archivio dipendenti: archiviazione con perdita PIN
- ✅ Ex-dipendenti: eliminazione definitiva e ripristino
- ✅ Supabase integration: PostgreSQL con RLS policies
- ✅ Health endpoints: `/api/health`, `/api/ready`, `/api/version`
- ✅ Backup automatico con rotazione 3 copie
- ✅ Pre-commit hooks: ESLint + TypeScript + Prettier
- ✅ File-length guard: ≤220 righe hard limit
- ✅ E2E tests: Playwright suite completa
- ✅ Documentazione enterprise: 12 guide DOCS + 4 report diagnosi

#### Technical
- React 18.3.1 + TypeScript 5.6.3 + Vite 5.4.20
- Express.js backend con middleware Vite dev
- TanStack Query + React Context per state management
- Radix UI + TailwindCSS + Lucide Icons
- Service Worker + PWA manifest
- IndexedDB con fallback in-memory
- Request ID tracking per audit

#### Quality
- ✅ TypeScript strict mode: 0 errori
- ✅ ESLint: 132 warning (non bloccanti)
- ✅ Zero vulnerabilità npm audit
- ✅ Bundle ottimizzato: max 920KB (lazy-loaded)
- ✅ API latency: <1ms (dev)
- ✅ TTFB: 1.6-5.3ms (dev Vite)

#### Documentation
- Report_Asset&CodeMap.md (383 linee)
- Report_Governance.md (376 linee)
- Report_Qualità&Stabilità.md (543 linee)
- Report_Performance&Sync.md (168 linee)
- Report_Docs&Operatività.md (scorecard 28/36)

---

## [0.9.0] — 2025-10-21

### 🚧 Internal Staging Build

#### Added
- Offline queue system con retry/backoff
- Admin section: archivio dipendenti
- Ex-dipendenti management
- Storico timbrature con filtri avanzati
- Export CSV/PDF con lazy-loading librerie
- PWA icons e manifest
- Health check runner automatico

#### Fixed
- Bootstrap offline: rimossi import circolari
- Validazione PIN: schema-agnostic per view mancanti
- Storico: fallback da view a tabella timbrature
- IndexedDB: fallback in-memory per private mode

#### Changed
- Migrazione da RPC a endpoint REST `/api/timbrature`
- Separazione Anon Key (client) vs Service Role (server)
- File-length policy: da 300 a 220 righe

---

## [0.8.0] — 2025-10-15

### 🔧 Feature Development

#### Added
- Sistema giorno logico con cutoff 05:00
- Multi-sessione timbrature
- Validazione business logic offline
- Device whitelist per offline queue
- Diagnostic badge UI (development)

#### Technical
- Implementazione `computeGiornoLogico.ts`
- Unit tests per logica giorno logico
- Feature flags: `VITE_FEATURE_OFFLINE_QUEUE`, `VITE_FEATURE_OFFLINE_BADGE`

---

## [0.7.0] — 2025-10-10

### 🎨 UI/UX Improvements

#### Added
- Home keypad: tastierino 3x4 accessibile
- Logo app customizzato
- Toaster notifications con ToastKit
- Modal conferma timbrature
- Skeleton loaders per async data

#### Changed
- Layout mobile-first responsive
- Palette colori enterprise (blue/gray)
- Icone Lucide React

---

## [0.6.0] — 2025-10-05

### 🗄️ Database & API

#### Added
- Supabase PostgreSQL setup
- RLS policies per sicurezza
- Migrazioni database
- API endpoints: `/api/utenti`, `/api/storico`, `/api/pin/validate`
- View `view_storico` con fallback

#### Security
- SERVICE_ROLE_KEY solo server-side
- ANON_KEY con RLS attive
- Request ID tracking
- Environment validation al boot

---

## [0.5.0] — 2025-09-28

### 🏗️ Project Setup

#### Added
- Monorepo structure: client/ + server/ + shared/
- Vite build configuration
- ESLint + Prettier + TypeScript strict
- Husky pre-commit hooks
- Scripts automazione: backup, diagnose, health-check

#### Technical
- Express.js server con Vite middleware
- Hot Module Replacement (HMR)
- Path aliases: `@/` e `@shared/`

---

## Roadmap

### [1.1.0] — Pianificato Q1 2026
- Logger strutturato (pino/winston)
- Riduzione `any` types (98 → <20)
- Cleanup unused vars
- Test E2E completi con Playwright
- Monitoring esterno (UptimeRobot)

### [1.2.0] — Pianificato Q2 2026
- Multi-tenant support
- Role-based access control (RBAC)
- Audit log completo
- Export Excel avanzato
- Dashboard analytics

---

## Convenzioni

### Versioning
- **MAJOR**: Breaking changes (API, schema DB, UX)
- **MINOR**: Nuove feature backward-compatible
- **PATCH**: Bug fix, performance, documentazione

### Commit Types
- `feat`: Nuova feature
- `fix`: Bug fix
- `docs`: Solo documentazione
- `refactor`: Refactoring senza cambio funzionalità
- `perf`: Performance improvement
- `test`: Aggiunta/modifica test
- `chore`: Manutenzione (deps, build, config)

---

**Maintainer:** BadgeNode Team  
**License:** MIT  
**Repository:** https://github.com/cameraconvista/badgenode
