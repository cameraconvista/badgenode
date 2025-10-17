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

## Stato corrente
- App: 🟢 `http://localhost:3001` (dev)
- Osservabilità: `/api/ready`, `/api/version`, `/api/health` attivi.
- Sicurezza: Read-Only Mode disponibile via env.

---

## Note
- I file `CHANGELOG_STEP_A..D.md` restano nel backup `Backup_Automatico/pre_cleanup_docs_*.zip` e verranno rimossi dal repo nella fase di pulizia finale.
