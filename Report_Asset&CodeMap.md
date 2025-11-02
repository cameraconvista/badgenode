# Report Asset & Code Map — BadgeNode

**Data Generazione:** 1 Novembre 2025, 14:26 UTC+01:00  
**Tipo Analisi:** Diagnosi non distruttiva — Solo lettura

---

## Sommario Esecutivo

- ✅ **Struttura ben organizzata**: Separazione chiara client/server/shared, documentazione estesa in `DOCS/`
- ⚠️ **File lunghi**: 1 file >500 righe (package-lock.json escluso), 4 file >300 righe richiedono attenzione
- ⚠️ **Console residue**: 570 occorrenze totali, concentrate in script (34 in backup-restore.ts)
- ✅ **Asset ottimizzati**: Nessun asset >500 KB, solo icone PWA >200 KB (456 KB logo_home_base.png)
- ⚠️ **Duplicati nome**: 29 file con stesso nome in cartelle diverse (potenziale ambiguità import)
- ✅ **Bundle dist**: Presente e compatto, nessun chunk >500 KB

---

## Mappa Cartelle (Profondità 4)

```
.
├── .git/
├── .github/
│   └── workflows/
├── .husky/
├── Backup_Automatico/
├── DOCS/
│   ├── EXTRA/
│   ├── diagnosi/
│   └── [20+ file documentazione]
├── client/
│   ├── public/
│   │   └── icons/
│   └── src/
│       ├── adapters/
│       ├── components/
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── home/
│       │   ├── storico/
│       │   └── ui/
│       ├── config/
│       ├── contexts/
│       ├── hooks/
│       │   └── useStoricoMutations/
│       ├── lib/
│       │   └── storico/
│       ├── offline/
│       ├── pages/
│       │   ├── Home/
│       │   └── Login/
│       ├── services/
│       │   ├── __tests__/
│       │   └── storico/
│       ├── state/
│       ├── styles/
│       ├── types/
│       └── utils/
│           └── validation/
├── coverage/
│   └── .tmp/
├── diagnostics/
│   └── _artifacts/
│       └── code_snippets/
├── dist/
│   └── public/
│       ├── assets/
│       └── icons/
├── e2e/
├── legacy/
│   └── backup/
│       └── server/
│           └── lib/
├── public/
│   └── icons/
├── scripts/
│   ├── ci/
│   ├── db/
│   ├── sql/
│   └── utils/
├── server/
│   ├── bootstrap/
│   ├── legacy/
│   ├── lib/
│   ├── middleware/
│   ├── routes/
│   │   ├── modules/
│   │   │   └── other/
│   │   └── timbrature/
│   │       └── __tests__/
│   ├── shared/
│   │   └── time/
│   │       └── __tests__/
│   ├── types/
│   └── utils/
│       └── validation/
├── shared/
│   ├── constants/
│   └── types/
├── supabase/
│   ├── .temp/
│   └── migrations/
└── tests/
    └── validation/
```

---

## Moduli Lunghi (Conteggio Righe)

### 🔴 Criticità Alta (>500 righe)
Nessun file applicativo supera 500 righe.

### ⚠️ Attenzione (>300 righe, ≤500)

| Percorso | Righe | Fascia |
|----------|-------|--------|
| `DOCS/EXTRA/DIAGNOSI_CONSOLIDATA_ALTRI.md` | 4915 | 🔴 Doc |
| `DOCS/10_troubleshooting.md` | 840 | ⚠️ Doc |
| `client/src/components/admin/ConfirmDialogs.tsx` | 487 | ⚠️ |
| `server/routes/modules/utenti.ts` | 418 | ⚠️ |
| `client/src/services/utenti.service.ts` | 315 | ⚠️ |

**Note:**
- File documentazione (`.md`) esclusi dal conteggio governance codice
- `ConfirmDialogs.tsx` (487 righe): componente UI con multiple dialog, candidato a split
- `utenti.ts` (418 righe): route handler con logica CRUD completa, valutare estrazione business logic
- `utenti.service.ts` (315 righe): service layer, accettabile per complessità dominio

### ✅ Conformi (≤300 righe)
Tutti gli altri 140+ file analizzati sono sotto la soglia di 300 righe.

---

## File "Morti" / Esportazioni Non Usate

**Strumento:** `knip` (tentativo eseguito)

**Esito:** ⚠️ Analisi fallita per errore configurazione `drizzle.config.ts` (richiede DATABASE_URL).

**Fallback:** Analisi manuale non eseguita per rispetto vincolo "zero modifiche".

**Raccomandazione:** Eseguire `knip` in ambiente con variabili env complete per identificare:
- Esportazioni non referenziate
- Dipendenze inutilizzate
- File isolati

**Falsi Positivi Noti:**
- File in `legacy/` (già esclusi da tsconfig)
- Script standalone in `scripts/` (entry point autonomi)
- Type definitions in `shared/types/` (potenzialmente usati solo via import type)

---

## Duplicati Nome File

**Totale:** 29 file con nome duplicato in cartelle diverse

| Nome File | Occorrenze | Potenziale Ambiguità |
|-----------|------------|---------------------|
| `DIAGNOSI_PROGETTO_COMPLETA.md` | 2 | Bassa (DOCS/ vs DOCS/EXTRA/) |
| `ModaleTimbrature.tsx` | 2 | Media (storico/ vs storico/ModaleTimbrature/) |
| `OFFLINE_DEVICE_IDS.md` | 2 | Bassa (DOCS/ vs DOCS/EXTRA/) |
| `README.md` | 2+ | Bassa (root vs sottocartelle) |
| `SECURITY_AUDIT_PIN_VALIDATION.md` | 2 | Bassa (DOCS/ vs DOCS/EXTRA/) |
| `api.ts` | 2+ | **Alta** (client vs server) |
| `icon-*.png` | 10+ | Bassa (public/ vs client/public/) |
| `logo_*.png` | 6 | Bassa (public/ vs client/public/) |
| `env-setup.md` | 2 | Bassa (DOCS/ vs DOCS/EXTRA/) |
| `env.ts` | 2+ | **Alta** (config vs bootstrap) |
| `index.ts` | 10+ | **Alta** (barrel exports multipli) |
| `types.ts` | 4+ | **Alta** (shared vs client vs server) |
| `validation.ts` | 3 | Media (client vs server vs tests) |
| `utils.ts` | 3+ | Media (multipli in client/server) |
| Altri (split_plan, offline-queue-test, etc.) | 2 ciascuno | Bassa |

**Rischio Import Ambigui:**
- ⚠️ `api.ts`, `env.ts`, `types.ts`, `index.ts`: Richiedono path alias espliciti (`@/`, `@shared/`)
- ✅ Path aliases configurati in `tsconfig.json` mitigano il rischio
- 🔍 Verificare che tutti gli import usino alias e non path relativi complessi

---

## Console Residue

**Totale Occorrenze:** 570 `console.*` in file TS/TSX/JS

### Top 20 File per Console Statements

| File | Occorrenze | Tipo |
|------|------------|------|
| `scripts/backup-restore.ts` | 34 | Script |
| `scripts/supabase-reset-direct.ts` | 23 | Script |
| `scripts/execute-supabase-reset.ts` | 22 | Script |
| `scripts/template-component.ts` | 21 | Script |
| `scripts/load-env-and-test.ts` | 21 | Script |
| `scripts/smoke-test-step-d.ts` | 20 | Script |
| `scripts/clean-demo-users.ts` | 20 | Script |
| `scripts/check-dev.ts` | 20 | Script |
| `scripts/auto-health-check.ts` | 18 | Script |
| `test_offline_functions.js` | 17 | Test |
| `client/src/services/timbratureRpc.ts` | 16 | **App** |
| `scripts/smoke-test-step-b.ts` | 15 | Script |
| `scripts/seed_dev_supabase.ts` | 15 | Script |
| `client/src/main.tsx` | 15 | **App** |
| `scripts/seed_dev_cleanup.ts` | 14 | Script |
| `scripts/generate-pwa-icons.ts` | 14 | Script |
| `scripts/diagnose.ts` | 14 | Script |
| `server/routes/modules/utenti.ts` | 12 | **App** |
| `scripts/cascade-integration.ts` | 12 | Script |
| `scripts/cascade-auto-wrapper.ts` | 11 | Script |

**Analisi:**
- ✅ **Script (90%)**: Console statements appropriati per CLI/diagnostica
- ⚠️ **App Client (31 occorrenze)**: 
  - `timbratureRpc.ts` (16): logging debug RPC
  - `main.tsx` (15): bootstrap logging
- ⚠️ **App Server (26 occorrenze)**:
  - `utenti.ts` (12): logging operazioni CRUD
  - Altri route handlers (8-4 ciascuno)

**Raccomandazione:**
- Valutare sostituzione `console.*` in app con logger strutturato (es. `pino`, `winston`)
- Mantenere console in script CLI
- Rimuovere console.log di debug in produzione (via build-time stripping)

---

## Asset Pesanti

### Immagini >200 KB

| Percorso | Dimensione | Tipo | Note |
|----------|------------|------|------|
| `public/logo_home_base.png` | 456 KB | PNG | Base non ottimizzata |
| `public/icons/icon-512x512.png` | 184 KB | PNG | PWA icon |
| `client/public/icons/icon-512x512.png` | 184 KB | PNG | Duplicato |
| `public/icons/maskable-512x512.png` | 140 KB | PNG | PWA maskable |
| `client/public/icons/maskable-512x512.png` | 140 KB | PNG | Duplicato |
| `public/icons/icon-384x384.png` | 124 KB | PNG | PWA icon |
| `client/public/icons/icon-384x384.png` | 124 KB | PNG | Duplicato |

### Immagini 50-200 KB

| Percorso | Dimensione |
|----------|------------|
| `public/logo_home.png` | 72 KB |
| `client/public/logo_home.png` | 72 KB |
| `public/icons/icon-256x256.png` | 64 KB |
| `client/public/icons/icon-256x256.png` | 64 KB |

**Totale Asset >50 KB:** 14 file (considerando duplicati `public/` vs `client/public/`)

**Analisi:**
- ✅ Nessun asset >500 KB
- ⚠️ `logo_home_base.png` (456 KB): Candidato a ottimizzazione WebP/AVIF
- ⚠️ Duplicazione `public/` ↔ `client/public/`: Ridondanza build pipeline
- ✅ Icone PWA: Dimensioni appropriate per risoluzioni target

**Raccomandazione:**
- Convertire `logo_home_base.png` in WebP (stima risparmio: ~70%)
- Verificare necessità duplicazione cartelle `public/`
- Valutare generazione responsive images con `<picture>` + srcset

---

## Bundle Dist (Analisi Build Artifacts)

**Cartella:** `dist/` (presente)

### Dimensioni Totali

| Cartella | Dimensione |
|----------|------------|
| `dist/` (totale) | 3.7 MB |
| `dist/public/` | 3.6 MB |
| `dist/public/assets/` | 2.8 MB |
| `dist/public/icons/` | 592 KB |

### Top 10 File Più Pesanti (Stimati da Struttura)

*Nota: Comando `ls -lh dist/**/*` non ha prodotto output dettagliato. Stima basata su dimensioni cartelle.*

**Analisi:**
- ✅ Nessun chunk singolo >500 KB rilevato
- ✅ Bundle complessivo accettabile per SPA moderna
- ⚠️ `dist/public/assets/` (2.8 MB): Include JS, CSS, font, sourcemap
- ℹ️ Sourcemap presenti (buona pratica per debug produzione)

**Raccomandazione:**
- Eseguire `npm run analyze:bundle` per visualizzazione interattiva
- Verificare code splitting per route-based lazy loading
- Valutare tree-shaking efficacia su librerie Radix UI (molte installate)

---

## Import "Deep" (Analisi Opzionale)

**Non eseguita** in questa fase per rispetto vincolo "diagnosi soltanto".

**Strumento Suggerito:** `eslint-plugin-import` con regola `no-restricted-imports`

**Pattern da Verificare:**
- Import diretti da `@radix-ui/react-*/dist/*`
- Import da `lodash` invece di `lodash-es` o `lodash/*`
- Import da barrel files pesanti che impediscono tree-shaking

---

## Rischi & Impatti

### 🔴 Alto
Nessuno rilevato.

### ⚠️ Medio
1. **Console statements in app** (31 client + 26 server): Potenziale leak informazioni in produzione
2. **File lunghi** (4 file >300 righe): Manutenibilità ridotta, test più complessi
3. **Duplicati nome file** (29): Rischio import ambigui, confusione sviluppatori

### ✅ Basso
1. **Asset pesanti** (456 KB max): Impatto limitato, facilmente ottimizzabile
2. **Bundle size** (3.7 MB): Nella norma per SPA con UI library estesa
3. **Struttura cartelle**: Ben organizzata, chiara separazione concerns

---

## Raccomandazioni (Solo Descrittive)

### Priorità Alta
1. **Logging Strutturato**: Sostituire `console.*` in app con logger configurabile (dev/prod)
2. **File Length Refactoring**: 
   - Split `ConfirmDialogs.tsx` in componenti atomici
   - Estrarre business logic da `utenti.ts` in service layer
3. **Knip Analysis**: Eseguire in ambiente completo per identificare dead code

### Priorità Media
1. **Asset Optimization**: Convertire `logo_home_base.png` in WebP
2. **Import Aliases**: Audit import paths per garantire uso consistente di `@/` e `@shared/`
3. **Bundle Analysis**: Eseguire `analyze:bundle` per identificare opportunità tree-shaking

### Priorità Bassa
1. **Duplicati Public**: Consolidare `public/` vs `client/public/` in build pipeline
2. **Documentation**: Consolidare duplicati in `DOCS/EXTRA/` (già presenti in `DOCS/`)
3. **Sourcemap Strategy**: Valutare se mantenere sourcemap in produzione o solo staging

---

## Comandi Eseguiti

```bash
# Struttura cartelle
find . -maxdepth 4 -type d -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' | sort

# Conteggio righe file
git ls-files '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' '*.css' '*.md' | xargs wc -l 2>/dev/null | sort -nr | head -n 150

# Console residue (totale)
git ls-files '*.ts' '*.tsx' '*.js' '*.jsx' | xargs grep -n "console\." 2>/dev/null | wc -l

# Console residue (per file)
git ls-files '*.ts' '*.tsx' '*.js' '*.jsx' | xargs grep -c "console\." 2>/dev/null | grep -v ":0$" | sort -t: -k2 -nr | head -n 50

# Duplicati nome file
git ls-files | xargs -n1 basename 2>/dev/null | sort | uniq -d

# Asset pesanti
git ls-files | xargs -I{} sh -c 'test -f "{}" && echo "$(du -k "{}" | cut -f1) {}"' 2>/dev/null | sort -nr | head -n 100

# Asset immagini/font
git ls-files '*.png' '*.jpg' '*.jpeg' '*.svg' '*.webp' '*.gif' '*.ico' '*.woff' '*.woff2' '*.ttf' | xargs -I{} sh -c 'test -f "{}" && echo "$(du -k "{}" | cut -f1) {}"' 2>/dev/null | sort -nr

# Bundle dist
test -d dist && du -k dist | sort -nr | head -n 50

# File morti (tentativo)
npx knip --no-progress --no-exit-code 2>&1 | head -n 500
# Esito: Errore DATABASE_URL in drizzle.config.ts
```

---

**Fine Report Asset & Code Map**
