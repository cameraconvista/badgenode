# BadgeNode — Documentazione Master Index

**Versione:** 1.0.0  
**Ultima Revisione:** 2025-11-01

---

## 📚 Benvenuto

Questo è l'indice completo della documentazione BadgeNode. Tutti i documenti sono organizzati per categoria e livello di dettaglio.

**Quick Links:**
- [Setup Rapido](#-setup-rapido)
- [Guide Tecniche](#-guide-tecniche-core)
- [Operatività](#-operativit-deployment)
- [Report Diagnosi](#-report-diagnosi)
- [Governance](#-governance-policy)

---

## 🚀 Setup Rapido

### Onboarding Sviluppatori

| Documento | Descrizione | Tempo Lettura |
|-----------|-------------|---------------|
| [README.md](../README.md) | Overview progetto, Quick Start 5 minuti | 10 min |
| [05_setup_sviluppo.md](05_setup_sviluppo.md) | Setup completo ambiente development | 20 min |
| [04_config_sviluppo.md](04_config_sviluppo.md) | Configurazione tools (ESLint, TypeScript, Vite) | 15 min |

**Checklist Onboarding:**
1. ✅ Leggi README.md
2. ✅ Setup environment (05_setup_sviluppo.md)
3. ✅ Configura editor (04_config_sviluppo.md)
4. ✅ Esegui `npm run check:ci`
5. ✅ Avvia `npm run dev`
6. ✅ Esplora DOCS/ per approfondimenti

---

## 📖 Guide Tecniche (Core)

### Architettura & Database

| Documento | Descrizione | Livello |
|-----------|-------------|---------|
| [01_database_api.md](01_database_api.md) | Schema DB, API endpoints, RLS policies | ⭐⭐⭐ Essenziale |
| [02_struttura_progetto.md](02_struttura_progetto.md) | Struttura cartelle, moduli, convenzioni | ⭐⭐⭐ Essenziale |

**Contenuti:**
- Schema tabelle PostgreSQL (utenti, timbrature, ex_dipendenti)
- API REST endpoints (`/api/health`, `/api/timbrature`, `/api/storico`)
- Row Level Security (RLS) policies Supabase
- Relazioni e indici database
- Architettura monorepo (client/ + server/ + shared/)

---

### Logica Business

| Documento | Descrizione | Livello |
|-----------|-------------|---------|
| [07_logica_giorno_logico.md](07_logica_giorno_logico.md) | Cutoff 05:00, multi-sessione, edge cases | ⭐⭐⭐ Essenziale |
| [09_offline.md](09_offline.md) | Offline-first, IndexedDB, sync, retry | ⭐⭐ Importante |

**Contenuti:**
- Giorno logico con cutoff 05:00 per turni notturni
- Multi-sessione: più entrate/uscite per giorno
- Pairing automatico entrate/uscite
- Coda offline IndexedDB con fallback in-memory
- Sync automatica con backoff exponential
- Device whitelist e feature flags

---

### UI/UX & Design

| Documento | Descrizione | Livello |
|-----------|-------------|---------|
| [08_ui_home_keypad.md](08_ui_home_keypad.md) | Home keypad, accessibilità, layout | ⭐⭐ Importante |
| [06_icons_guide.md](06_icons_guide.md) | Sistema icone, PWA manifest | ⭐ Opzionale |

**Contenuti:**
- Tastierino 3x4 accessibile (WCAG)
- Layout mobile-first responsive
- Palette colori enterprise (blue/gray)
- Logo app customizzato
- PWA icons e manifest
- Lucide React icons

---

### Performance & Optimization

| Documento | Descrizione | Livello |
|-----------|-------------|---------|
| [11_asset_optimization.md](11_asset_optimization.md) | Bundle size, lazy-loading, PWA | ⭐⭐ Importante |
| [12_dependency_management.md](12_dependency_management.md) | Audit deps, outdated, security | ⭐⭐ Importante |

**Contenuti:**
- Bundle analysis (max 920KB lazy-loaded)
- Code splitting route-based
- Lazy-loading export libraries (exceljs, jspdf)
- PWA caching strategies
- Dependency audit e update policy
- Security vulnerabilities check

---

## 🔧 Operatività & Deployment

### Script & Automazione

| Documento | Descrizione | Livello |
|-----------|-------------|---------|
| [03_scripts_utilita.md](03_scripts_utilita.md) | Backup, diagnosi, health check, CI/CD | ⭐⭐⭐ Essenziale |
| [10_troubleshooting.md](10_troubleshooting.md) | Risoluzione problemi comuni | ⭐⭐⭐ Essenziale |

**Contenuti:**
- Script backup automatico con rotazione
- Health check runner
- Diagnosi completa progetto
- CI/CD checks (TypeScript + ESLint + build)
- Smoke test runtime Supabase
- Fix comuni (bootstrap offline, PIN validation, storico)

---

### Deployment & Monitoring

| Documento | Descrizione | Livello |
|-----------|-------------|---------|
| [POST_DEPLOY_CHECKLIST.md](../POST_DEPLOY_CHECKLIST.md) | Checklist post-deploy completa | ⭐⭐⭐ Essenziale |
| [ALERT_UPTIME.md](../ALERT_UPTIME.md) | Monitoring UptimeRobot, alert policy | ⭐⭐ Importante |
| [LOG_ROTATION.md](../LOG_ROTATION.md) | Policy log, rotation, retention | ⭐⭐ Importante |

**Contenuti:**
- Verifica health endpoints post-deploy
- Smoke test login e timbrature
- UptimeRobot configuration
- Alert channels (Email, Slack, Telegram)
- Incident response escalation
- Log rotation policy (pianificato Sprint 2)

---

## 📊 Report Diagnosi

### Report Completi (STEP 1-4)

| Report | Descrizione | Data | Linee |
|--------|-------------|------|-------|
| [Report_Asset&CodeMap.md](../Report_Asset&CodeMap.md) | Mappa codice, asset, bundle analysis | 2025-11-01 | 383 |
| [Report_Governance.md](../Report_Governance.md) | Governance, pre-commit, ESLint, deps | 2025-11-01 | 376 |
| [Report_Qualità&Stabilità.md](../Report_Qualità&Stabilità.md) | TypeScript, ESLint, security, testing | 2025-11-01 | 543 |
| [Report_Performance&Sync.md](../Report_Performance&Sync.md) | TTFB, API latency, offline, bundle | 2025-11-01 | 168 |
| [Report_Docs&Operatività.md](../Report_Docs&Operatività.md) | Scorecard docs 28/36, prontezza ops | 2025-11-01 | ~600 |

**Highlights:**
- ✅ **0 errori TypeScript** (strict mode)
- ✅ **0 vulnerabilità npm** (production)
- ✅ **API <1ms** latency (dev)
- ✅ **Bundle ottimizzato** (max 920KB lazy)
- ✅ **Documentazione 78%** completa

---

### Report Storici (EXTRA/)

| Report | Descrizione | Categoria |
|--------|-------------|-----------|
| [DIAGNOSI_PROGETTO_COMPLETA.md](DIAGNOSI_PROGETTO_COMPLETA.md) | Diagnosi completa pre-STEP 1-4 | Storico |
| [SECURITY_AUDIT_PIN_VALIDATION.md](SECURITY_AUDIT_PIN_VALIDATION.md) | Audit sicurezza validazione PIN | Security |
| [REPORT_CONSOLIDATO_STORICO.md](EXTRA/REPORT_CONSOLIDATO_STORICO.md) | Report consolidato feature storiche | Storico |
| [REPORT_STEP3-8_*.md](EXTRA/) | Report sviluppo feature (archiviazione, export, etc.) | Storico |

---

## 📜 Governance & Policy

### Documenti Formali

| Documento | Descrizione | Livello |
|-----------|-------------|---------|
| [CHANGELOG.md](../CHANGELOG.md) | Cronologia versioni e rilasci (semver) | ⭐⭐⭐ Essenziale |
| [SECURITY.md](../SECURITY.md) | Disclosure policy, RLS, incident response | ⭐⭐⭐ Essenziale |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Linee guida contributi, coding standards | ⭐⭐⭐ Essenziale |
| [LICENSE](../LICENSE) | MIT License | ⭐⭐ Importante |

**Contenuti:**
- Versioning semver (MAJOR.MINOR.PATCH)
- Commit convention (type(scope): message)
- Responsible disclosure policy
- RLS policies e key management
- Branch naming, PR process
- File-length policy (≤220 righe)

---

### Configurazione & Tools

| File | Descrizione | Tipo |
|------|-------------|------|
| [.editorconfig](../.editorconfig) | Configurazione editor cross-IDE | Config |
| [.env.example](../.env.example) | Template environment variables | Config |
| [eslint.config.js](../eslint.config.js) | ESLint flat config | Config |
| [tsconfig.json](../tsconfig.json) | TypeScript strict configuration | Config |
| [vite.config.ts](../vite.config.ts) | Vite build + dev server | Config |

---

## 🗂️ Struttura Completa DOCS/

```
DOCS/
├── README.md                          # ← Questo file (indice master)
│
├── 01_database_api.md                 # Schema DB, API, RLS
├── 02_struttura_progetto.md           # Architettura, cartelle
├── 03_scripts_utilita.md              # Backup, diagnosi, CI/CD
├── 04_config_sviluppo.md              # ESLint, TypeScript, Vite
├── 05_setup_sviluppo.md               # Onboarding completo
├── 06_icons_guide.md                  # PWA icons, manifest
├── 07_logica_giorno_logico.md         # Cutoff 05:00, multi-sessione
├── 08_ui_home_keypad.md               # UI keypad, accessibilità
├── 09_offline.md                      # Offline-first, IndexedDB
├── 10_troubleshooting.md              # Fix comuni, diagnostica
├── 11_asset_optimization.md           # Bundle, lazy-loading
├── 12_dependency_management.md        # Audit deps, security
│
├── DIAGNOSI_PROGETTO_COMPLETA.md      # Diagnosi pre-STEP 1-4
├── SECURITY_AUDIT_PIN_VALIDATION.md   # Audit security PIN
├── OFFLINE_DEVICE_IDS.md              # Device whitelist guide
├── env-setup.md                       # Environment setup dettagliato
├── offline-queue-test.md              # Test offline queue
├── split_plan.md                      # Piano split feature
│
├── diagnosi/                          # Report diagnosi tecnici
│   ├── bundle-analysis.md
│   ├── circular-deps.md
│   ├── eslint-analysis.md
│   └── legacy-files.md
│
└── EXTRA/                             # Report storici feature
    ├── DIAGNOSI_CONSOLIDATA_ALTRI.md
    ├── REPORT_CONSOLIDATO_STORICO.md
    ├── REPORT_STEP3_EX_DIP_ARCHIVIAZIONE.md
    ├── REPORT_STEP4_RIMOZIONE_ESPORTA_TUTTI.md
    ├── REPORT_STEP5_FIX_E2E_E_ID_ARCHIVIAZIONE.md
    ├── REPORT_STEP6_RIPRISTINO.md
    ├── REPORT_STEP7_ELIMINAZIONE_DEFINITIVA.md
    ├── REPORT_STEP8_STORICO_EXPORT_CSV.md
    └── ... (altri report storici)
```

---

## 🎯 Percorsi di Lettura Consigliati

### Per Nuovi Sviluppatori

1. **Giorno 1**: README.md + 05_setup_sviluppo.md
2. **Giorno 2**: 02_struttura_progetto.md + 01_database_api.md
3. **Giorno 3**: 07_logica_giorno_logico.md + 08_ui_home_keypad.md
4. **Giorno 4**: 09_offline.md + 10_troubleshooting.md
5. **Giorno 5**: CONTRIBUTING.md + 03_scripts_utilita.md

### Per DevOps

1. **Setup**: 05_setup_sviluppo.md + 04_config_sviluppo.md
2. **Deploy**: POST_DEPLOY_CHECKLIST.md + ALERT_UPTIME.md
3. **Monitoring**: LOG_ROTATION.md + 03_scripts_utilita.md
4. **Security**: SECURITY.md + 01_database_api.md (RLS)
5. **Troubleshooting**: 10_troubleshooting.md

### Per Product Owner

1. **Overview**: README.md + Report_Docs&Operatività.md
2. **Features**: 07_logica_giorno_logico.md + 09_offline.md
3. **Quality**: Report_Qualità&Stabilità.md + Report_Performance&Sync.md
4. **Governance**: CHANGELOG.md + Report_Governance.md
5. **Security**: SECURITY.md

---

## 🔍 Ricerca Rapida

### Per Argomento

**Setup & Configuration:**
- Environment: 05_setup_sviluppo.md, .env.example
- Editor: 04_config_sviluppo.md, .editorconfig
- Build: vite.config.ts, tsconfig.json

**Database & API:**
- Schema: 01_database_api.md
- Endpoints: 01_database_api.md
- RLS: 01_database_api.md, SECURITY.md

**Business Logic:**
- Giorno logico: 07_logica_giorno_logico.md
- Timbrature: 01_database_api.md, 07_logica_giorno_logico.md
- Offline: 09_offline.md

**UI/UX:**
- Keypad: 08_ui_home_keypad.md
- Icons: 06_icons_guide.md
- Styling: 08_ui_home_keypad.md

**Operations:**
- Deploy: POST_DEPLOY_CHECKLIST.md
- Monitoring: ALERT_UPTIME.md
- Logs: LOG_ROTATION.md
- Backup: 03_scripts_utilita.md

**Quality & Performance:**
- TypeScript: Report_Qualità&Stabilità.md
- ESLint: Report_Qualità&Stabilità.md
- Bundle: 11_asset_optimization.md, Report_Performance&Sync.md
- Testing: CONTRIBUTING.md, Report_Qualità&Stabilità.md

**Security:**
- Disclosure: SECURITY.md
- RLS: 01_database_api.md, SECURITY.md
- Keys: SECURITY.md, .env.example

---

## 📝 Contribuire alla Documentazione

### Aggiungere Nuovi Documenti

1. **Crea file** in `DOCS/` con naming convention:
   - Guide tecniche: `NN_nome_guida.md` (numerato)
   - Report: `REPORT_Nome_Report.md`
   - Policy: `NOME_POLICY.md` (radice)

2. **Formato standard**:
   ```markdown
   # BadgeNode — Titolo Documento
   
   **Versione:** X.Y.Z
   **Ultima Revisione:** YYYY-MM-DD
   
   ---
   
   ## 📋 Contenuti
   ...
   ```

3. **Aggiorna questo indice** (DOCS/README.md)

4. **Commit**:
   ```bash
   git add DOCS/
   git commit -m "docs: add new guide for XYZ"
   ```

### Aggiornare Documenti Esistenti

1. **Modifica file**
2. **Aggiorna "Ultima Revisione"**
3. **Aggiorna CHANGELOG.md** se breaking change
4. **Commit**:
   ```bash
   git commit -m "docs(guide): update XYZ section"
   ```

---

## 🆘 Supporto

### Documentazione Non Trovata?

- **GitHub Issues**: Apri issue con tag `documentation`
- **GitHub Discussions**: Chiedi nella sezione Q&A
- **Email**: docs@badgenode.example.com

### Segnala Errori

- **Typo/errori**: Apri PR con fix
- **Contenuto obsoleto**: Apri issue
- **Link rotti**: Apri issue con tag `broken-link`

---

## 📈 Statistiche Documentazione

**Totale Documenti:** 45+  
**Guide Core:** 12  
**Report Diagnosi:** 5  
**Policy Formali:** 6  
**Linee Totali:** ~15,000+  
**Ultima Revisione Completa:** 2025-11-01

**Scorecard Qualità:** 28/36 (78%) — 🟢 Buono

---

**Maintainer:** BadgeNode Team  
**Last Updated:** 2025-11-01  
**Version:** 1.0.0
