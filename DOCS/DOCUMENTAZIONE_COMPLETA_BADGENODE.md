# 📘 DOCUMENTAZIONE COMPLETA — **BadgeNode**
**Versione:** 1.0 • **Data:** 2025-10-07 22:33 • **Autore:** Project BADGENODE

---

## 🧭 Visione d’insieme
**BadgeNode** è una **PWA mobile‑first** per la gestione delle **timbrature** dei dipendenti tramite **PIN (1–99)**, con sezione **Admin** desktop‑first. Il progetto privilegia **stabilità**, **performance**, **UI standard**, e **governance** ferrea (backup, documentazione, qualità codice).

- **Device target**
  - **Utenti** (tastierino): **solo mobile** (smartphone/tablet), **portrait**.
  - **Admin** (Archivio/Storico/Ex‑Dipendenti): **desktop** (monitor/laptop).
- **Backend**: **Supabase** (PostgreSQL + Realtime, RLS opzionale).
- **Timezone**: Europe/Rome. **Evitare** conversioni UTC (`toISOString`) nelle logiche.

---

## 🎨 Brand, Palette, Temi e Asset
- **Palette base**: viola/bianco (riferimento: `#510357`, `#e774f0`, `#ffffff`).  
  **Stato**: verde (Entrata), rosso (Uscita), giallo (Extra).
- **Temi**: **dark** e **light** coerenti; contrasto almeno **AA**.
- **Asset**:
  - `logo_home.png` → **icona PWA** (installazione su smartphone/desktop).
  - `logo_app.png` → **logo interno app** (header/home).
- **Icone**: standardizzate (in seguito Iconify + Tabler/Lucide; vedi sezione *Pacchetto icone*).

---

## 🗺️ Pagine e Flussi principali

### 1) Home — Tastierino (Utenti, mobile‑first)
- **Campi/Pulsanti**: display **PIN**, tasti **0–9**, **C** (clear), **ingranaggio** (admin).
- **Admin code** (ingranaggio): **1909** (apre sezione Admin).
- **Data & ora correnti** sempre visibili **in basso**, aggiornamento live.
- **Feedback**:
  - **Verde**: **Entrata** registrata (con data/ora).
  - **Rosso**: **Uscita** registrata (con data/ora).
  - **Errore** (rosso): doppia Entrata senza Uscita o sequenza non valida.
- **Regola PIN**: `01` ≡ `1` (leading zero ignorato). PIN **unico**; se esistente, avviso.
- **Layout**: **identico ai mock** forniti, palette **viola/bianco** (no blu).

**Sequenza timbrature (per PIN)**  
1ª = Entrata → 2ª = Uscita → 3ª = Entrata → 4ª = Uscita → … (alternanza **obbligatoria**).

---

### 2) Admin — Archivio Dipendenti (desktop‑first)
- **Tabella**: colonne **Storico** (🕒), **PIN**, **Nome**, **Cognome**, **Azioni**.
- **Azioni**:
  - ✏️ **Modifica** dati anagrafici/contratto/PIN.
  - 📦 **Archivia** in **Ex‑Dipendenti** → **libera il PIN** (riutilizzabile).
  - ❌ **Elimina** definitiva con **doppia conferma**.
- **Footer**: **← Login Utenti**, **Aggiungi**, **Ex‑Dipendenti**.
- **UX**: larghezza **contenuta e leggibile** (no full‑width), dimensioni celle/testi/icon **standard**.

---

### 3) Modale — Aggiungi Nuovo Dipendente
- **Obbligatori**: **Nome**, **Cognome**, **PIN (1–99)**, **Ore max giornaliere da contratto** (decimale; **step 0.25**).
- **Opzionali**: Email, Telefono, **Descrizione contratto**.
- **Vincoli**: **PIN unico**; `01` ≡ `1`.
- **Uso “Ore max”**: base per calcolo **Ore Extra** nello storico (v. sotto).

---

### 4) Ex‑Dipendenti (desktop‑first)
- **Colonne**: **Nome**, **Cognome**, **Data archiviazione**, **Azioni**.
- **Azioni**: 📊 **XLS** timbrature fino all’archiviazione; ❌ **elimina** definitiva; *(futuro)* **Dettagli**.
- **Regola**: **archiviazione** → **PIN liberato**.

---

### 5) Storico Timbrature (desktop‑first, per utente)
- **Filtri**: **mese corrente** + **range da/a** personalizzato.
- **Export**: **PDF** e **XLS** (includono **Ore** e **Ore Extra**).
- **Tabella**: **Data (giorno logico)**, **Mese**, **Entrata**, **Uscita**, **Ore**, **Extra**, **Modifica (✏️)**.
- **Riga Totali**: **Ore totali** + **Extra totali** del periodo.
- **✏️ Modifica** → apre **Modale Modifica Timbrature** (vedi sotto).

---

### 6) Modale — Modifica Timbrature
- **Campi**: **Data Entrata**, **Ora Entrata**, **Data Uscita**, **Ora Uscita**.
- **Azioni**: **Salva**, **Elimina**, **Chiudi**.
- **Periodo**: modifiche su **qualsiasi** intervallo (mese corrente, precedente, **custom**).
- **UX**: interfaccia **desktop‑friendly**; su **iPad** mantenere picker con **scroll nativi** fluido/stabile.
- **Temi**: dark/light coerenti; palette **viola/bianco**.

---

## ⏱️ Logica “Giorno logico”, Ore lavorate e Ore Extra

### Giorno logico
- **Concetto**: il **giorno di riferimento** del turno (può differire dal calendario per i notturni).
- **Regole**:
  - **Entrate** tra **00:00–04:59** → associate al **giorno precedente**.
  - **Uscite** post‑mezzanotte (00:00–04:59) → appartengono al **turno del giorno prima** (stesso **giorno logico** dell’entrata).

### Calcolo **Ore lavorate** (regola aggiornata)
- Usa **prima Entrata** e **ultima Uscita** **dello stesso giorno logico**.
- Se l’**Uscita** è **dopo mezzanotte**, si **sommano normalmente** le ore oltre le 24.  
  **Esempio**: Entrata **17:00** (lun.) → Uscita **02:00** (mar.) = **9.00 h**.

> Limiti di validazione consigliati: turno **≤ 24h**; minimo **30 min**; Entrata non oltre Uscita nello **stesso** giorno logico.

### Calcolo **Ore Extra**
- Ogni dipendente ha `ore_contrattuali` (es. **8.00 h**).
- **Extra giorno** = **max(0, ore_lavorate − ore_contrattuali)**.  
- **Totale mensile Extra** = somma degli extra giornalieri nel periodo.

### Database (sintesi)
- **utenti**: `pin (PK)`, `nome`, `cognome`, `email?`, `telefono?`, `ore_contrattuali NUMERIC(4,2) DEFAULT 8.00`, `descrizione_contratto?`, `created_at`.
- **timbrature**: `id (PK)`, `tipo ('entrata'|'uscita')`, `pin (FK)`, `nome`, `cognome`, `data (DATE)`, `ore (TIME)`, `giornologico (DATE)`, `created_at`.
- **Indici**: `(pin, giornologico)`, `(pin, data)`, `created_at`.
- **Vista** (consigliata) `v_timbrature_utenti`: join `timbrature` + `utenti` con `ore_contrattuali`.
- **Timezone safety**: formattare date **locali** (no `.toISOString()`), evitare drift.

---

## 📦 Esportazioni
- **XLS/PDF** in Storico e in Ex‑Dipendenti (storico fino ad archiviazione).
- CSV includendo **Ore Extra**, totali e metadati dipendente.

---

## 🧰 Replit → Bozza iniziale (solo struttura)
Obiettivo: creare **cartella portabile** da importare in Windsurf, con pagine vuote e standard PWA.

**Stack suggerito**: React + TypeScript + Vite + Tailwind (o CSS Modules) + Supabase JS.

**Struttura minima**  
```
/public
  favicon.ico
  manifest.webmanifest  # include logo_home.png
  icons/                 # vari formati generati
/src
  /pages
    HomeTastierino.tsx
    AdminArchivio.tsx
    AdminExDipendenti.tsx
    AdminStoricoTimbrature.tsx
  /components
    Keypad.tsx
    FeedbackBanner.tsx
    DateTimeLive.tsx
    Table.tsx
    ModaleDipendente.tsx
    ModaleTimbrature.tsx
  /hooks
    useClock.ts
    usePinInput.ts
  /styles
    theme.css  # dark/light + palette viola/bianco
  /lib
    supabase.ts
  app.tsx
  main.tsx
/scripts
  (placeholder, vedi governance)
/DOCS
  (file informativi standard, vedi governance)
.env.example
```

**Router**: 4 route principali (Home, Archivio, Ex‑Dipendenti, Storico).  
**PWA**: manifest + service worker base (workbox o vite-plugin-pwa).  
**Placeholder**: componenti **vuoti**/mock senza logiche invasive.

---

## 🏛️ Governance & Qualità codice (⚠️ **limite 200 righe**)
> **Modifica richiesta**: la lunghezza massima dei file codice è **200 righe** (non 500).

**Regole**  
- **Blocco hard**: **>200 righe** → **commit rifiutato** (pre‑commit hook).  
- **Warning**: **>150 righe** → segnalazione automatica.  
- **ESLint + Prettier**: attivi; autofix dove possibile.  
- **Niente** cambi UX/layout/flow senza richiesta esplicita.  
- **Archivio**: ogni refactor salva originale in `/ARCHIVE/` con timestamp.

**Scripts utili (cartella `/scripts`)**  
- `file-size-check` → trova file **vicini/superiori** ai limiti.  
- `config-check` → verifica env/config mancanti.  
- `template-component` → genera moduli standard (per split sotto 200 righe).  
- `cleanup` → segnala obsoleti/duplicati.  
- `project-info` → panoramica progetto.

**Pre‑commit (Husky o simili)**  
- Lint + typecheck.  
- Blocca file **>200** righe; warning **>150**.  
- Blocca commit con errori ESLint non fixabili.

---

## 🔄 Backup automatico & Diagnosi

### Sistema di **Backup Automatico**
- Cartella: `/Backup_Automatico/`  
- Formato: `backup_ddMMyyyy_HHmm.tar.gz`  
- **Rotazione**: max **3** copie (elimina la più vecchia).  
- **Escludi sempre**: `node_modules`, `.git`, `dist`, `build`, `coverage`, cache/temp.  
- **Logging** con timestamp IT; ripristino **in 2 fasi**:
  - `backup:restore` (anteprima)
  - `restore-confirm <nome>` (conferma)
- **Comandi npm**: `esegui backup`, `backup:list`, `backup:restore`, `restore-confirm`.

### **Diagnosi iniziale progetto**
- Cerca **file pesanti**, **errori/log**, **obsoleti**, **duplicati**, **temporanei/sync**.  
- Output: `REPORT_DIAGNOSI_INIZIALE.txt` (append).  
- Sentinella `.diagnose_done` al primo avvio.  
- Comandi: `diagnose`, `diagnose:force`.

### **Consolidamento report**
- Unisci tutti i `.txt` in `/DOCS/REPORT_AUTH_REMOVAL_COMPLETE.txt` con **sommario** e **sezioni** ben marcate.  
- Dopo verifica, **rimuovi** gli altri `.txt` in `/DOCS/` e logga i nomi rimossi.

---

## 🧩 Pacchetto Icone (predisposizione, nessuna sostituzione)
- Installa: `unplugin-icons`, `@iconify-json/tabler`, `@iconify-json/lucide` (e `unplugin-vue-components` solo se stack Vue).  
- Integra plugin in **Vite**; aggiungi **typings** per import `~icons/*`.  
- **Stile globale**: 24×24, stroke 2, `linecap/linejoin: round`, colore via `currentColor`.  
- **DOCS/ICONS_GUIDE.md**: collezioni, import, standard visuale, come aggiungere nuove collezioni.  
- **Test**: `npm run dev` + `npm run build` → app **immutata**.  
- **Backup & Git**: branch `chore/setup-icons`; max 3 backup config; commit dedicato.

---

## 📱 Mobile Layout Standard (riutilizzabile)
- **Struttura**: `[HEADER fisso] [CONTENT scroll] [NAVBAR fissa]` (sibling).  
- **Chi scrolla**: **solo** `CONTENT`. Bloccare scroll su `html/body` e wrapper.  
- **Misure**: Header 44–56pt + `env(safe-area-inset-top)`; Navbar 56–64pt + `env(safe-area-inset-bottom)`; touch target ≥ **44×44pt**; spacing 16pt.  
- **Safe‑area**: padding dinamici in base alle altezze **runtime** di header/navbar.  
- **Layering**: Navbar (z:20) > Header (z:15) > Content (z:10); modali z:30+.  
- **Pitfall iOS**: niente `transform/filter/perspective/backdrop/overflow` sui **genitori** di header/navbar fixed.  
- **Accessibilità**: focus visibile, colori AA, evitare ellissi su pulsanti primari.  
- **Checklist**: avvio/mezzo/fine lista, menù/filtri, notch Android/iOS, rotazione (o blocco portrait).

---

## 🔐 Git Automations (trigger “esegui commit”)
- Setup off‑chat: `GIT_REMOTE_URL`, `GITHUB_TOKEN` (salvati in `.env`, ignorati).  
- Pipeline: `git init` → `git add -A` → commit `chore(auto-commit): save @ dd.MM.yyyy HH.mm` → `git push origin main` (+ rebase automatico in caso di divergenze).  
- Log: URL commit in console + `/DOCS/COMMIT_LOG.md`.  
- Errori: 401/403/404 gestiti; report conflitti `REPORT_COMMIT_CONFLICTS.txt`.

---

## 📂 Cartella /DOCS (set iniziale)
- `01_database_api.md` — schema tabelle/relazioni/endpoint, RLS, viste/functions/trigger, indici, change‑log, placeholders credenziali e sync‑status.
- `02_struttura_progetto.md` — mappa directory, responsabilità componenti, convenzioni naming.
- `03_scripts_utilita.md` — elenco e uso degli script CLI (backup, diagnosi, consolidate, template, ecc.).
- `04_config_sviluppo.md` — hot reload, logging, error reporting, env.
- `05_setup_sviluppo.md` — installazione, comandi, troubleshooting, workflow.

---

## ✅ Checklist Implementativa (riassunto operativo)
1) **Replit**: crea bozza con struttura minima (route, pagine vuote, manifest PWA, temi, supabase lib).  
2) **/DOCS**: aggiungi file informativi standard.  
3) **Scripts**: backup, diagnosi, consolidate, template‑component.  
4) **Governance**: ESLint/Prettier/Husky con **limite 200 righe** (block), warning a 150.  
5) **Icone**: predisposizione unplugin‑icons (nessuna sostituzione ora).  
6) **Storico**: implementa **giorno logico** + **ore/extra** come sopra; export XLS/PDF.  
7) **Modali**: ottimizza per desktop/iPad; mantieni dark/light coerenti.  
8) **Test**: sequenze timbrature, notturni (post‑mezzanotte = somma ore), PIN univoco/equivalenze, archiviazione che libera PIN, export.

---

## 📎 Note finali
- **Sicurezza**: mai esporre chiavi in repo; `.env` nel `.gitignore`.  
- **Performance**: derive con `useMemo`, handlers con `useCallback`, evitare ricalcoli nel JSX.  
- **Affidabilità**: evitare drift timezone; centralizzare funzioni di data/ora; validare turni > 24h e < 0.5h.
- **Retrocompatibilità**: nessun cambiamento a UX/flow senza richiesta; refactor sempre con backup in `/ARCHIVE/`.

---

*Questa documentazione è progettata per essere usata come riferimento unico in nuove chat e come base per i prompt operativi in Windsurf/Cascade.*
