# BadgeNode - TODO Minimali (Step 1 → Step 2)

**Data:** 2025-10-21T01:13:00+02:00  
**Scope:** Azioni suggerite per step successivi (NON da eseguire ora)

---

## 🔥 P0 - Priorità Critica (Blockers)

### GOVERNANCE-001: File Length Violations
**Problema:** 4 file superano il limite di 220 righe (governance hard limit)
- server/routes/timbrature.ts: 668 righe → Target: ≤220 righe
- server/routes.ts: 516 righe → Target: ≤220 righe  

**Azione:** Refactoring modulare senza alterare logica business
**Impatto:** Blocca pre-commit hook se STRICT_220=true

### SECURITY-001: Vulnerabilità xlsx (HIGH)
**Problema:** Libreria xlsx con Prototype Pollution + ReDoS
**Azione:** Sostituire con alternativa sicura (es. exceljs)
**Impatto:** Rischio sicurezza in produzione

---

## ⚠️ P1 - Priorità Alta (Performance/Quality)

### BUNDLE-001: Chunk Size Optimization  
**Problema:** 2 chunk >500kB impattano performance
- index-Bm3uKsqK.js: 552.67 kB
- jspdf.es.min-XH4K-Q9f.js: 413.66 kB

**Azione:** Implementare code-splitting dinamico
**Beneficio:** Miglior First Contentful Paint

### LINT-001: TypeScript Any Types
**Problema:** 23 occorrenze di 'any' type compromettono type safety
**Azione:** Tipizzazione esplicita con interfacce dedicate
**Beneficio:** Migliore DX e runtime safety

---

**Nota:** Questo documento è solo pianificazione. Nessuna azione da eseguire in Step 1.

**Generato:** 2025-10-21T01:13:00+02:00
