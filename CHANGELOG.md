# CHANGELOG — BadgeNode

Sintesi consolidata degli step A→D e dei micro-aggiornamenti recenti. Per i dettagli completi, vedere i file storici in backup o il nuovo `DOCS/ARCHIVIO_REPORTS.md`.

---

## 2025-10-17 — STEP D: Osservabilità minima + Read-Only Mode
- **Request ID** su tutte le risposte (`x-request-id`) e nei payload errore.
- **Endpoint osservabilità**: `/api/version`, `/api/ready`, `/api/health` (+ `/api/health/admin`).
- **Read-Only Mode**: blocco scritture se `READ_ONLY_MODE=1` con `503 { code: 'READ_ONLY_MODE_ACTIVE' }`.
- **Error handler uniforme**: `INTERNAL_ERROR` + `requestId` sempre incluso.
- Nessun impatto su logica business/UI.

Rif: `CHANGELOG_STEP_D.md`.

---

## 2025-10-17 — STEP C: Micro-hardening Admin PIN + meta PWA
- Input Admin PIN: `inputMode="numeric"`, `autoComplete="one-time-code"`, `name="one-time-code"`, `type="password"`, attributi anti-warning.
- Meta PWA: aggiunto `mobile-web-app-capable` e mantenuto tag Apple.
- Zero modifiche a logica/contratti.

Rif: `CHANGELOG_STEP_C.md`.

---

## 2025-10-16 — STEP B: Consolidamento Server-Only
- Tutte le chiamate Supabase spostate lato server con endpoint Express uniformi.
- Servizi client aggiornati a usare solo API `/api/*`.
- Feature flag: `VITE_API_SERVER_ONLY=1`.
- Bootstrap env centralizzato e singleton `supabaseAdmin` (B.2).
- `/api/health` stabile; storicizzazione diagnosi admin.

Rif: `CHANGELOG_STEP_B.md`.

---

## 2025-10-16 — STEP A / A.1: Giorno logico e Alternanza
- Unificazione `computeGiornoLogico` (00:00–04:59 → giorno precedente; notturni ancorati).
- Alternanza robusta Entrata/USCITA con ancoraggio.
- A.1: rimosso limite durata turno (nessun cap ore); codici errore aggiornati.

Rif: `CHANGELOG_STEP_A.md`.

---

## 2025-10-20 — ENTERPRISE HARDENING: Repository Cleanup & Governance

### 🎯 Obiettivo Raggiunto
Portato BadgeNode a standard enterprise-ready con governance rigorosa, zero breaking changes, architettura validata.

### ✅ Modifiche Implementate

#### Repository Cleanup
- **Rimossi file temporanei** (7 files): `fix-definitivo-timbrature.js`, `fix-modale-timbrature-completato.js`, `test-immediato-schema.js`, `test-patch-rest-diretta.js`, `debug-schema-timbrature.js`, `client/src/App-simple.tsx`, `client/test-simple.html`
- **Fix TypeScript**: Corretto import path per `computeGiornoLogico` shared module
- **Linting**: Risolto errore `prefer-const` in smoke test

#### Governance & Documentation
- **`GOVERNANCE.md`**: Standards code quality, file length limits (≤500 righe hard, ≤300 consigliato)
- **`QA_CHECKLIST.md`**: Strategia testing completa (unit, integration, E2E)
- **`DIAGNOSI.md`**: Audit completo repository con priorità interventi
- **`.env.example`**: Documentazione completa variabili ambiente + security checklist

#### Architecture Validation
- **Supabase Centralized**: Confermato pattern server-only (Step B)
- **Time Logic Unified**: Validato shared module `computeGiornoLogico`
- **API Consistency**: Verificati endpoint uniformi `/api/*`
- **Bundle Analysis**: 1.7MB total, performance targets rispettati

### 📊 Quality Gates
- ✅ **TypeScript**: 0 errori compilation
- ✅ **Build**: Successo in 4.68s
- ✅ **Health Checks**: `/api/ready` e `/api/health` OK
- ⚠️ **ESLint**: 37 warnings (accettabili, mostly adapter `any` types)

### 🔒 Security Validation
- ✅ **SERVICE_ROLE_KEY**: Solo server-side
- ✅ **RLS Policies**: Attive e verificate
- ✅ **Environment**: Validazione completa, no secrets in code
- ✅ **Request IDs**: Tracking completo per audit

### 📈 Next Steps Identified
1. **File Refactoring**: Split `server/routes.ts` (458 righe) in moduli
2. **Bundle Optimization**: Lazy load PDF export (414KB)
3. **Unit Testing**: Coverage target 80% business logic

**Branch**: `hardening/badgenode-enterprise`  
**Backup Tag**: `pre-hardening-20251020-2331`  
**Status**: ✅ ENTERPRISE-READY

---

## Stato corrente
- App: 🟢 `http://localhost:3001` (dev + prod build)
- Osservabilità: `/api/ready`, `/api/version`, `/api/health` attivi
- Sicurezza: Read-Only Mode disponibile via env
- Governance: Standards enterprise attivi
- Documentation: Suite completa (1,200+ righe)

---

## Note
- **Enterprise Hardening Report**: Vedere `HARDENING_REPORT.md` per dettagli completi
- **Governance**: Regole attive in `GOVERNANCE.md`, enforcement via pre-commit hooks
- **Quality Assurance**: Checklist completa in `QA_CHECKLIST.md`
- I file `CHANGELOG_STEP_A..D.md` restano nel backup per riferimento storico
