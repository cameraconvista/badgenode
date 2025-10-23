# REPORT STEP 6: RIPRISTINO EX-DIPENDENTE (NUOVO PIN) - BADGENODE

Data: 2025-10-23
Versione: Enterprise Stable v5.0
Stato: INTEGRATO (server, client, UI)

---

## 🧩 Obiettivo
Implementare l’azione Ripristina per riportare un ex-dipendente tra gli attivi assegnando un nuovo PIN, senza modifiche di layout/UX.

---

## 🩺 Diagnosi automatica preventiva
- **Azione/UI**: tabella `Ex-Dipendenti` in `client/src/components/admin/ExDipendentiTable.tsx`.
- **Modale riutilizzabile**: pattern e stile da `ArchiviaDialog` in `client/src/components/admin/ConfirmDialogs.tsx`.
- **Service client**: `client/src/services/utenti.service.ts` (con metodi `getExDipendenti()`, `archiveUtente()` già esistenti).
- **Endpoint server**: assente per ripristino. Creato `POST /api/utenti/:id/restore` in `server/routes/modules/other.ts`.
- **Dati necessari in riga**: `pin` e `archiviato_il` già presenti, `id` UI coincide con `pin` (Step 5). Nessuna SELECT aggiuntiva richiesta.

---

## 🔧 Implementazione (chirurgica)

### Server
- File: `server/routes/modules/other.ts`
- Endpoint nuovo: `POST /api/utenti/:id/restore`
- Validazioni:
  - **id**: PIN archiviato valido (1–99) ➜ `INVALID_PIN`
  - **newPin**: nuovo PIN valido (1–99) ➜ `INVALID_NEW_PIN`
  - Verifica che l’utente sia in `ex_dipendenti` ➜ `USER_NOT_ARCHIVED`
  - Verifica disponibilità `newPin` in `utenti` ➜ `PIN_IN_USE`
- Azione (transazionale a step):
  - Inserisce in `utenti` con `{ pin: newPin, nome, cognome, created_at }`
  - Elimina record originale da `ex_dipendenti`
- Risposte:
  - `200 { success: true }`
  - `409 { code: 'PIN_IN_USE' | 'USER_NOT_ARCHIVED' }`
  - `400 { code: 'INVALID_PIN' | 'INVALID_NEW_PIN' }`
  - `503 { code: 'SERVICE_UNAVAILABLE' }`
  - `500 { code: 'RESTORE_FAILED' | 'INTERNAL_ERROR' }`
- Note TypeScript: come da `DOCS/TS_TODO.md`, `.insert` tipizzato aggressivo in Supabase ➜ payload cast a `any[]` per evitare errori (nessun impatto runtime).

### Client service
- File: `client/src/services/utenti.service.ts`
- Metodo nuovo: `restoreUtente(userId: string, payload: { newPin: string })`
  - Chiama `POST /api/utenti/:id/restore`
  - Restituisce `{ success: true }` o `{ success: false, error: { code, message } }`

### UI
- File: `client/src/components/admin/ConfirmDialogs.tsx`
  - Componente nuovo: `RestoreDialog` (stile identico BadgeNode) con doppia conferma e input **Nuovo PIN** numerico (1–99).
- File: `client/src/components/admin/ExDipendentiTable.tsx`
  - Aggiunto prop opzionale `onRipristina(ex: ExDipendente)`.
  - Aggiunto pulsante **Ripristina** per riga (ghost, label verde). Nessun cambio layout.
- File: `client/src/pages/ExDipendenti.tsx`
  - Wiring `RestoreDialog` e stato locale.
  - Handler `handleOpenRestore()` e `handleConfirmRestore()` con chiamata `UtentiService.restoreUtente()`.
  - Invalidazioni cache: `['ex-dipendenti']` e `['utenti']` tramite `react-query`.

---

## ✅ Governance
- **Layout/Palette**: invariati. Solo nuovo bottone ghost “Ripristina” e modale coerente con stile esistente.
- **Nessuna migrazione DB**: uso tabelle esistenti (`ex_dipendenti`, `utenti`).
- **Zero refactor trasversali**: patch locali e atomiche.
- **TypeScript**: cast minimo per `.insert` (allineato a `TS_TODO.md`).

---

## 🧪 Test rapidi
1) **Happy path**
   - Dato ex-dipendente `PIN=11` e `newPin=12` libero → `POST /api/utenti/11/restore { newPin: '12' }` → `200 { success:true }`.
   - UI: elemento scompare da lista Ex-Dip; utente appare tra attivi.
2) **PIN_IN_USE**
   - `newPin` già presente in `utenti` → `409 { code:'PIN_IN_USE' }` mostrato come messaggio breve.
3) **USER_NOT_ARCHIVED**
   - `id` non presente in `ex_dipendenti` → `409 { code:'USER_NOT_ARCHIVED' }`.
4) **Network/URL**
   - `POST /api/utenti/<PIN>/restore` con payload `{ newPin }`.

---

## 📂 File toccati
- `server/routes/modules/other.ts` → aggiunto endpoint restore.
- `client/src/services/utenti.service.ts` → aggiunto `restoreUtente()`.
- `client/src/components/admin/ConfirmDialogs.tsx` → aggiunto `RestoreDialog`.
- `client/src/components/admin/ExDipendentiTable.tsx` → aggiunto `onRipristina` + pulsante.
- `client/src/pages/ExDipendenti.tsx` → wiring modale + invalidazioni.

---

## 🔐 Codici errore
- `INVALID_PIN`, `INVALID_NEW_PIN`, `PIN_IN_USE`, `USER_NOT_ARCHIVED`, `RESTORE_FAILED`, `SERVICE_UNAVAILABLE`, `INTERNAL_ERROR`.

---

## ⚠️ Rischi residui
- **Tipi Supabase**: cast `any[]` per `.insert` finché non vengono generati i tipi DB ufficiali (vedi `DOCS/TS_TODO.md`).
- **Dati opzionali**: campi extra (email, ore_contrattuali) non presenti nello schema reale → non ripristinati; mantenuto set minimo.

---

## 📌 Note operative
- App dev su `http://localhost:10000` (server già attivo).
- Accettazione: eseguire i 4 test rapidi sopra e validare aggiornamento liste.

---

**Autore**: BadgeNode / Cascade AI
Commit log suggerito: `feat: restore ex-dipendente with new PIN (Step 6)`
