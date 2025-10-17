# DOCS/ARCHIVIO_REPORTS — BadgeNode

Archivio sintetico dei principali report tecnici e documenti storici confluiti nei file canonici 00–08 e nel CHANGELOG.md.

---

## Timeline sintetica

### 2025-10-17 — Osservabilità minima + Read-Only Mode
- Origine: `CHANGELOG_STEP_D.md`
- Esito: request-id in header/payload, `/api/version`, `/api/ready`, guard `READ_ONLY_MODE`.
- Impatto: nessuna modifica a UX/logica. Migliorata diagnosi e sicurezza manutenzioni.
- Consolidato in: `CHANGELOG.md` e riferimenti in `04_config_sviluppo.md`.

### 2025-10-17 — Micro-hardening Admin PIN + meta PWA
- Origine: `CHANGELOG_STEP_C.md`
- Esito: input Admin migliorato (autocomplete/inputMode), meta PWA aggiornati.
- Impatto: zero cambi logica; UX mobile migliorata.
- Consolidato in: `CHANGELOG.md`, dettagli UI in `08_ui_home_keypad.md`.

### 2025-10-16 — Server-only data layer + bootstrap Supabase admin
- Origine: `CHANGELOG_STEP_B.md`
- Esito: servizi client migrati a `/api/*`; `/api/health` stabile; singleton `supabaseAdmin`; bootstrap env anticipato.
- Impatto: maggiore robustezza runtime, contratti uniformi.
- Consolidato in: `CHANGELOG.md`, dettagli struttura in `02_struttura_progetto.md` e `04_config_sviluppo.md`.

### 2025-10-16 — Giorno logico e Alternanza (A / A.1)
- Origine: `CHANGELOG_STEP_A.md`
- Esito: unificazione `computeGiornoLogico`; alternanza robusta; rimosso limite durata turno (A.1).
- Impatto: gestione notturni e ricostruzioni amministrative più solide.
- Consolidato in: `CHANGELOG.md`, regole operative in `07_logica_giorno_logico.md`.

### 2025-10-13 — Cleanup finale warning e gestione utenti
- Origine: `DOCS/DIAGNOSI_CLEANUP.md`, `DOCS/REPORT_GENERICI/REPORT_FIX_USER_MANAGEMENT_20251013.md`
- Esito: ESLint warnings ridotti a 8; gestione utenti funzionante; backup automatico attivo.
- Consolidato in: `05_setup_sviluppo.md` (workflow), `03_scripts_utilita.md` (diagnose/backup), `02_struttura_progetto.md` (policy).

### 2025-10-09 → 2025-10-12 — Consolidamento documentazione 00–08
- Origine: `DOCS/00_REPORT_CONSOLIDATO.txt` e serie 01→08
- Esito: struttura stabile per database/API, progetto, script, setup, icone, giorno logico, UI keypad.
- Consolidato in: file canonici `01_..` → `08_..` aggiornati.

---

## Report tecnici inclusi (estratto)

- `DOCS/REPORT_GENERICI/REPORT_DIAGNOSI_COMPLETA.md`
  - Outcome: mappa codebase, regole file length, azioni di refactor prioritarie.
  - Destinazione: `02_struttura_progetto.md`, `03_scripts_utilita.md`.

- `DOCS/REPORT_GENERICI/REPORT_REFACTOR_FINALE.md`
  - Outcome: splitting Home in moduli, limiti righe, miglioramento hot reload.
  - Destinazione: `02_struttura_progetto.md`, `08_ui_home_keypad.md`.

- `DOCS/REPORT_GENERICI/REPORT_FIX_GIORNO_LOGICO_STEP1.md`
  - Outcome: primi aggiustamenti pairing e finestra notturna.
  - Destinazione: `07_logica_giorno_logico.md`.

- `DOCS/REPORT_GENERICI/REPORT_FIX_TIMBRATURE_DEFINITIVO.md`
  - Outcome: validazioni entrata/uscita e messaggi d’errore.
  - Destinazione: `01_database_api.md`, `07_logica_giorno_logico.md`.

- `DOCS/DOC IMPORTANTI/BADGENODE_SQL_REFERENCE.md`
  - Outcome: note su schema e indici.
  - Destinazione: `01_database_api.md`.

- `DOCS/DOC IMPORTANTI/DOCUMENTAZIONE_LOGICA_GIORNO_LOGICO.md`
  - Outcome: definizioni di `giornologico` e esempi.
  - Destinazione: `07_logica_giorno_logico.md`.

---

## Decisioni di consolidamento

- **Rimozione duplicati**: contenuti ridondanti tra `DOC IMPORTANTI/` e `REPORT_GENERICI/` sono stati accorpati nei file canonici.
- **Fonte autorevole**: in caso di conflitto, prevale il documento più recente per data di modifica.
- **Placeholder segreti**: sostituite chiavi/URL con variabili `${VITE_SUPABASE_URL}` / `${VITE_SUPABASE_ANON_KEY}` dove pertinente.

---

## Come navigare la documentazione

- **Executive**: `DOCS/00_REPORT_CONSOLIDATO.txt`
- **Database & API**: `DOCS/01_database_api.md`
- **Struttura progetto**: `DOCS/02_struttura_progetto.md`
- **Scripts**: `DOCS/03_scripts_utilita.md`
- **Config sviluppo**: `DOCS/04_config_sviluppo.md`
- **Setup**: `DOCS/05_setup_sviluppo.md`
- **Icone**: `DOCS/06_icons_guide.md`
- **Giorno logico**: `DOCS/07_logica_giorno_logico.md`
- **UI Home Keypad**: `DOCS/08_ui_home_keypad.md`
- **Changelog**: `CHANGELOG.md`
