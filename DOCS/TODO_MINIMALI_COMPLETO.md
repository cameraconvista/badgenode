# BadgeNode - TODO Minimali Completo (Step 1 → Step 2)

**Data:** 2025-10-21T01:36:00+02:00  
**Scope:** Azioni prioritizzate per step successivi (NON da eseguire ora)  
**Baseline:** Analisi completa Step 1 completata

---

## 🔥 P0 - Priorità Critica (Blockers)

### GOVERNANCE-001: File Length Violations (CRITICAL)
**Problema:** 7 file superano governance limits, 2 critici
```
CRITICAL (>500 righe):
- server/routes/timbrature.ts: 668 righe → Target: ≤220 righe (3x over)
- server/routes.ts: 516 righe → Target: ≤220 righe (2.3x over)

MODERATE (220-300 righe):
- client/src/hooks/useStoricoMutations.ts: 280 righe
- scripts/utils/template-core.ts: 253 righe  
- client/src/components/storico/StoricoTable.tsx: 244 righe
- client/src/components/ui/carousel.tsx: 240 righe
- client/src/components/ui/menubar.tsx: 231 righe
```

**Azione:** Refactoring modulare mantenendo logica business intatta
- Split `server/routes/timbrature.ts` in 3-4 moduli tematici
- Split `server/routes.ts` in router modulari per endpoint
- Estrazione utilities comuni in helper dedicati

**Impatto:** Blocca pre-commit hook se STRICT_220=true  
**Tempo:** 4-6 ore  
**Priorità:** P0 (governance compliance)

### SECURITY-001: Vulnerabilità xlsx (HIGH)
**Problema:** Libreria xlsx@0.18.5 con Prototype Pollution + ReDoS
```
Vulnerabilità:
- GHSA-4r6h-8v6p-xvw6: Prototype Pollution
- GHSA-5pgg-2g8v-p4x9: Regular Expression DoS
Impact: Potenziale RCE in funzioni export Excel
Fix Available: Nessuno (libreria abbandonata)
```

**Azione:** Sostituzione con alternativa sicura
- Opzione 1: `exceljs@4.4.0` (più features, 2.1MB)
- Opzione 2: `sheetjs-style@0.15.8` (compatibile, 800KB)
- Opzione 3: `xlsx-populate@1.21.0` (leggero, 400KB)

**Impatto:** Rischio sicurezza in produzione  
**Tempo:** 2-3 ore  
**Priorità:** P0 (security critical)

### SECURITY-002: Vulnerabilità esbuild (MODERATE)
**Problema:** esbuild ≤0.24.2 con dev server exposure
```
Vulnerabilità: GHSA-67mh-4wv8-2f99
Impact: Request proxy in development
Affected: vite, drizzle-kit dependencies
```

**Azione:** Update forzato con breaking changes
```bash
npm audit fix --force
# Verificare compatibilità drizzle-kit post-update
```

**Impatto:** Potenziale esposizione dev environment  
**Tempo:** 1 ora  
**Priorità:** P0 (dev security)

---

## ⚠️ P1 - Priorità Alta (Performance/Quality)

### BUNDLE-001: Chunk Size Optimization  
**Problema:** 2 chunk >400kB impattano performance
```
Problematici:
- index-Bffo0z84.js: 445.64 kB (main bundle)
- jspdf.es.min-D0AhJqnD.js: 413.66 kB (PDF export)

Target: <300kB per chunk per optimal FCP
```

**Azione:** Code-splitting dinamico
```typescript
// Lazy loading PDF export
const PDFExport = lazy(() => import('./components/PDFExport'));

// Route-based splitting
const StoricoPage = lazy(() => import('./pages/Storico'));
```

**Beneficio:** -40% First Contentful Paint, migliore UX mobile  
**Tempo:** 3-4 ore  
**Priorità:** P1 (performance critical)

### LINT-001: TypeScript Any Types Cleanup
**Problema:** 23 occorrenze `any` compromettono type safety
```
Hotspots principali:
- server/routes/timbrature.ts: 6 any types
- client/src/lib/safeFetch.ts: 6 any types  
- server/lib/supabaseAdmin.ts: 4 any types
- client/src/hooks/useStoricoMutations.ts: 4 any types
```

**Azione:** Tipizzazione esplicita progressiva
```typescript
// Prima: any
function handleResponse(data: any): any

// Dopo: typed interfaces  
interface ApiResponse<T> { success: boolean; data: T; error?: string }
function handleResponse<T>(data: ApiResponse<T>): T
```

**Beneficio:** Migliore DX, catch errori compile-time, IntelliSense  
**Tempo:** 4-5 ore  
**Priorità:** P1 (code quality)

### DEPS-001: Major Dependencies Update Planning
**Problema:** Dipendenze major obsolete con security/performance benefits
```
MAJOR UPDATES (breaking):
- React 18.3.1 → 19.2.0: New concurrent features
- Express 4.21.2 → 5.1.0: Performance improvements  
- TailwindCSS 3.4.17 → 4.1.15: New utilities
- Vite 5.4.20 → 7.1.11: Faster builds

MINOR UPDATES (safe):
- @supabase/supabase-js: 2.74.0 → 2.76.0
- @tanstack/react-query: 5.60.5 → 5.90.5
```

**Azione:** Upgrade progressivo con testing
1. Minor updates batch (safe)
2. React 19 migration (test intensive)  
3. Express 5 migration (API compatibility)
4. Vite 7 + TailwindCSS 4 (build system)

**Beneficio:** Security patches, performance, new features  
**Tempo:** 8-12 ore (staged)  
**Priorità:** P1 (maintenance debt)

---

## 📊 P2 - Priorità Media (Maintenance)

### CLEAN-001: Unused Code Elimination
**Problema:** 8 variabili/import non utilizzati
```
Import morti identificati:
- ComputeGiornoLogicoParams (client/src/lib/time.ts)
- ComputeGiornoLogicoResult (client/src/lib/time.ts)
- createAdminProxy (server/lib/supabaseAdmin.ts)
- formatDataItaliana (useModaleTimbrature.ts)
- _error, _ variables (multiple files)
```

**Azione:** Cleanup automatico + linting rules
```bash
npx ts-prune # Trova export non usati
npx knip # Analisi dipendenze morte
```

**Beneficio:** Bundle size ridotto, codice più pulito  
**Tempo:** 2 ore  
**Priorità:** P2 (maintenance)

### ASSET-001: Asset Optimization & Audit
**Problema:** Possibili asset duplicati/orfani + dimensioni non ottimizzate
```
Sospetti duplicati:
- public/logo_home_base.png vs public/logo_home.png
- public/icons/icon-192.png vs public/icons/icon-192x192.png

Ottimizzazioni:
- PNG → WebP conversion (70% size reduction)
- Icon sprite generation
- Lazy loading images
```

**Azione:** Asset audit + optimization pipeline
```bash
# Trova asset non referenziati
npx unused-files src public

# Ottimizza immagini  
npx @squoosh/cli --webp public/**/*.png
```

**Beneficio:** -30% asset size, faster loading  
**Tempo:** 2-3 ore  
**Priorità:** P2 (performance minor)

### TEST-001: Test Coverage Implementation
**Problema:** Coverage non misurata, solo 1 test file
```
Attuale: client/src/services/__tests__/storico.service.test.ts
Target: >80% coverage su:
- API services (utenti, timbrature, storico)
- Business logic (giorno logico, validazioni)
- UI components critici (Home, Storico)
```

**Azione:** Test suite completa con Vitest
```typescript
// Setup coverage
npm install --save-dev @vitest/coverage-c8

// Test critici prioritari
- server/shared/time/computeGiornoLogico.test.ts
- client/src/services/timbrature.service.test.ts  
- client/src/hooks/useStoricoTimbrature.test.ts
```

**Beneficio:** Confidence deployment, regression prevention  
**Tempo:** 6-8 ore  
**Priorità:** P2 (quality assurance)

### DEPS-002: Minor Dependencies Batch Update
**Problema:** 40+ dipendenze con minor/patch updates disponibili
```
Safe updates (no breaking changes):
- @typescript-eslint/*: 8.46.0 → 8.46.2
- autoprefixer: 10.4.20 → 10.4.21
- drizzle-kit: 0.31.4 → 0.31.5
- lucide-react: 0.453.0 → 0.546.0
- react-hook-form: 7.55.0 → 7.65.0
```

**Azione:** Batch update automatico
```bash
npm update # Safe minor/patch updates
npm audit fix # Security patches
```

**Beneficio:** Bug fixes, security patches, performance  
**Tempo:** 1 ora  
**Priorità:** P2 (maintenance routine)

---

## 🔧 P3 - Priorità Bassa (Nice to Have)

### PERF-001: Bundle Analysis Automation
**Azione:** Integrazione bundle-analyzer in CI/CD pipeline
```yaml
# .github/workflows/bundle-analysis.yml
- name: Bundle Analysis
  run: npx vite-bundle-visualizer --template sunburst
```
**Beneficio:** Monitoring automatico dimensioni bundle  
**Tempo:** 1 ora

### DOC-001: API Documentation Generation  
**Azione:** OpenAPI/Swagger auto-generation
```typescript
// Swagger JSDoc annotations
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 */
```
**Beneficio:** Documentazione API sempre aggiornata  
**Tempo:** 3-4 ore

### MONITOR-001: Error Tracking & Analytics
**Azione:** Integrazione Sentry + performance monitoring
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```
**Beneficio:** Monitoring errori produzione, performance insights  
**Tempo:** 2-3 ore

### INFRA-001: PWA Enhancement
**Azione:** Offline capability + background sync
```typescript
// Service Worker enhancement
self.addEventListener('sync', (event) => {
  if (event.tag === 'timbrature-sync') {
    event.waitUntil(syncTimbrature());
  }
});
```
**Beneficio:** Funzionalità offline, migliore UX mobile  
**Tempo:** 4-5 ore

---

## 📋 Checklist Step 2 (Roadmap Suggerita)

### Pre-Requisiti
- [ ] Backup automatico completato ✅
- [ ] Branch `feature/step2-optimization` creato
- [ ] Test suite base funzionante
- [ ] Staging environment disponibile

### Fase 1: Security & Governance (P0) - 8 ore
- [ ] Fix vulnerabilità xlsx → exceljs migration
- [ ] Fix vulnerabilità esbuild → force update  
- [ ] Split server/routes/timbrature.ts (≤220 righe)
- [ ] Split server/routes.ts in moduli router

### Fase 2: Performance & Quality (P1) - 12 ore  
- [ ] Implementare code-splitting dinamico
- [ ] Eliminare TypeScript any types (23 → ≤5)
- [ ] Minor dependencies update batch
- [ ] Planning major updates (React 19, Express 5)

### Fase 3: Maintenance & Testing (P2) - 8 ore
- [ ] Cleanup unused imports/variables
- [ ] Asset optimization (WebP, sprites)
- [ ] Test coverage setup + critical tests
- [ ] Bundle analysis automation

### Validazione Finale
- [ ] Tutti i test passano ✅
- [ ] Build size non aumentato >5%
- [ ] Zero regressioni funzionali
- [ ] Governance compliance 100%
- [ ] Security vulnerabilità ≤2 LOW

---

## 🎯 Metriche Target Step 2

### Governance Compliance
```
File >220 righe: 0 (attuale: 7)
File >300 righe: 0 (attuale: 7)  
Lint warnings: ≤15 (attuale: 37)
TypeScript any: ≤5 (attuale: 23)
```

### Performance Targets
```
Main bundle: ≤300kB (attuale: 445kB)
Largest chunk: ≤350kB (attuale: 445kB)
First Contentful Paint: ≤1.5s
Bundle gzipped: ≤400kB total
```

### Security & Quality
```
High vulnerabilities: 0 (attuale: 1)
Moderate vulnerabilities: ≤2 (attuale: 5)
Test coverage: >60% (attuale: ~5%)
Unused imports: 0 (attuale: 8)
```

---

## 📝 Note Implementazione

### Vincoli Step 2
- ✅ **Zero modifiche** layout/UI esistente
- ✅ **Zero modifiche** logiche business (giorno logico, timbrature)
- ✅ **Zero modifiche** sincronizzazioni/RLS
- ✅ **Mantieni** compatibilità API esistente
- ✅ **Mantieni** funzionalità app invariate

### Approccio Raccomandato
1. **Incrementale:** Una categoria P0/P1/P2 alla volta
2. **Testabile:** Commit piccoli con test per ogni change
3. **Rollback-safe:** Branch feature con merge controllato
4. **Monitorato:** Metriche before/after per ogni ottimizzazione

### Success Criteria
- App funziona identicamente post-ottimizzazioni
- Performance migliorata measurabilmente  
- Governance compliance raggiunta
- Security vulnerabilità risolte
- Codebase più maintainable

---

**Nota:** Questo documento è pianificazione dettagliata. Nessuna azione da eseguire in Step 1.

**Generato:** 2025-10-21T01:36:00+02:00  
**Next Review:** Step 2 Implementation Planning  
**Baseline:** Diagnosi Step 1 completa
