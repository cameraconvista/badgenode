# 🔍 DIAGNOSI SCRIPTS - BadgeNode

**Data**: 2025-11-02T03:15:00+01:00  
**Scope**: Identificare script eliminabili senza rischi

---

## 📊 Categorizzazione Script

### ✅ CRITICI (NON ELIMINARE)

**Script Runtime/Build**:
- `server/start.ts` - Entry point server (usato da `npm run dev`)
- `backup.ts` - Sistema backup automatico (usato da `npm run esegui:backup`)
- `backup-restore.ts` - Ripristino backup
- `diagnose.ts` - Diagnostica codebase (usato da `npm run diagnose`)

**Utility Core** (`scripts/utils/`):
- `diagnose-core.ts` - Funzioni diagnosi (importato da `diagnose.ts`)
- `diagnose-report.ts` - Report diagnosi (importato da `diagnose.ts`)
- `docs-core.ts` - Gestione documentazione
- `report-manager.ts` - Manager report
- `template-core.ts` - Template generator

**CI/CD**:
- `scripts/ci/` - Script per CI/CD pipeline
- `file-length-guard.cjs` - Guard lunghezza file (220 righe)

---

### ⚠️ MANTENERE (Utility Sviluppo)

**Development Tools**:
- `auto-health-check.ts` - Health check automatico
- `auto-start-dev.ts` - Auto-start dev server
- `check-dev.ts` - Verifica ambiente dev
- `dev-guardian.ts` - Guardian dev server
- `health-check-runner.ts` - Runner health check

**Database Tools**:
- `scripts/db/` - Utility database
- `scripts/sql/` - Query SQL utility
- `seed_dev_supabase.ts` - Seed dati dev
- `seed_dev_cleanup.ts` - Cleanup seed

**Testing**:
- `smoke-test-step-b.ts` - Smoke test
- `smoke-test-step-d.ts` - Smoke test
- `load-env-and-test.ts` - Test environment

**Build/Deploy**:
- `generate-pwa-icons.ts` - Genera icone PWA
- `consolidate-docs.ts` - Consolida documentazione
- `template-component.ts` - Template componenti

---

### 🗑️ ELIMINABILI (Dati Storici/One-Time)

**Batch Insert Storici** (19 file):
```
✅ ELIMINABILI - Usati solo per import iniziale dati
```

- `batch-insert-novembre.ts`
- `batch-insert-pin1-ottobre.ts`
- `batch-insert-pin2-ottobre.ts`
- `batch-insert-pin5-novembre.ts`
- `batch-insert-pin7-novembre.ts`
- `batch-insert-veronica.ts`
- `correct-pin04-ottobre.ts`
- `correct-pin05-ottobre.ts`
- `correct-pin07-ottobre.ts`
- `fix-pin1-ottobre.ts`
- `fix-pin2-final.ts`
- `fix-pin2-ottobre.ts`
- `insert-direct-pin2.ts`
- `delete-wrong-november.ts`

**Verify Scripts** (7 file):
```
✅ ELIMINABILI - Usati solo per verifica post-import
```

- `verify-all-corrections.ts`
- `verify-insert.ts`
- `verify-novembre.ts`
- `verify-pin1-ottobre.ts`
- `verify-pin2-ottobre.ts`
- `verify-pin5-novembre.ts`
- `verify-pin7-novembre.ts`

**Test/Debug One-Time**:
```
✅ ELIMINABILI - Script di test/debug una tantum
```

- `analyze-wrong-dates.ts`
- `test-client-giorno-logico.ts`
- `test-fix-giorno-logico.ts`
- `clean-demo-users.ts`

**Supabase Reset** (⚠️ PERICOLOSI):
```
⚠️ ELIMINABILI - Ma mantenere per emergenze
```

- `execute-supabase-reset.ts`
- `supabase-reset-direct.ts`

**Seed/Auth Legacy**:
```
✅ ELIMINABILI - Se non usati in produzione
```

- `seed-auth.mjs`
- `seed-demo.ts`
- `write-env.mjs`

**Cascade Integration** (⚠️ VERIFICARE):
```
⚠️ VERIFICARE - Se Cascade AI non è più usato
```

- `cascade-auto-wrapper.ts`
- `cascade-integration.ts`

**Git Utility**:
```
✅ ELIMINABILE - Se non usato in workflow
```

- `git-commit.mjs`

---

## 📋 Riepilogo Eliminabili

### Totale File Analizzati: ~55

**Eliminabili con Sicurezza**: ~30 file (55%)

### Categorie Eliminabili:

1. **Batch Insert/Correct** (14 file)
2. **Verify Scripts** (7 file)
3. **Test One-Time** (4 file)
4. **Seed/Demo Legacy** (3 file)
5. **Git/Cascade Utility** (2 file)

**Spazio Recuperabile**: ~150 KB

---

## ✅ Azione Consigliata

### Opzione 1: Archiviazione (CONSIGLIATO)

```bash
mkdir -p scripts/_archive/2025-11-02_cleanup
mv scripts/batch-insert*.ts scripts/_archive/2025-11-02_cleanup/
mv scripts/correct-*.ts scripts/_archive/2025-11-02_cleanup/
mv scripts/fix-*.ts scripts/_archive/2025-11-02_cleanup/
mv scripts/verify-*.ts scripts/_archive/2025-11-02_cleanup/
mv scripts/analyze-wrong-dates.ts scripts/_archive/2025-11-02_cleanup/
mv scripts/test-*.ts scripts/_archive/2025-11-02_cleanup/
mv scripts/clean-demo-users.ts scripts/_archive/2025-11-02_cleanup/
mv scripts/delete-wrong-november.ts scripts/_archive/2025-11-02_cleanup/
```

### Opzione 2: Eliminazione Diretta

```bash
# ATTENZIONE: Azione irreversibile!
rm scripts/batch-insert*.ts
rm scripts/correct-*.ts
rm scripts/fix-*.ts
rm scripts/verify-*.ts
rm scripts/analyze-wrong-dates.ts
rm scripts/test-*.ts
rm scripts/clean-demo-users.ts
rm scripts/delete-wrong-november.ts
```

---

## 🔒 File da NON Toccare

- `scripts/utils/*` - Tutti i file (usati da diagnose.ts)
- `scripts/ci/*` - CI/CD pipeline
- `scripts/db/*` - Database utility
- `scripts/sql/*` - SQL utility
- `backup.ts`, `backup-restore.ts` - Sistema backup
- `diagnose.ts` - Diagnostica
- `file-length-guard.cjs` - Guard lunghezza
- Development tools (auto-*, check-*, dev-*)

---

## 📝 Note

1. **scripts/utils/** - Nessun import trovato da app runtime, ma usati da `diagnose.ts`
2. **Batch insert** - Dati già in DB, script non più necessari
3. **Verify scripts** - Verifiche già eseguite, non più necessari
4. **Test scripts** - Debug completati, non più necessari

---

**Raccomandazione**: Archiviare invece di eliminare per sicurezza
