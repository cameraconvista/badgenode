# REPORT STEP 7: ELIMINAZIONE DEFINITIVA EX-DIPENDENTE - BADGENODE

Data: 2025-10-23
Versione: Enterprise Stable v5.0
Stato: Implementato (server, client, UI)

---

## 🧩 Obiettivo
Abilitare l’azione "Elimina definitivamente" su Ex‑Dipendenti, con doppia conferma in stile BadgeNode, senza toccare le timbrature esistenti.

---

## 🩺 Diagnosi automatica preventiva
- **Pulsante/azione**: tabella `Ex-Dipendenti` in `client/src/components/admin/ExDipendentiTable.tsx`.
- **Modale riutilizzabile**: pattern double-confirm già presente (Archivia/Restore). Aggiunta modale dedicata `DeleteExDialog` in `client/src/components/admin/ConfirmDialogs.tsx`.
- **Service client**: aggiunto metodo minimo `deleteExDipendente(pin)` in `client/src/services/utenti.service.ts`.
- **Endpoint server**: aggiunto `DELETE /api/ex-dipendenti/:pin` in `server/routes/modules/other.ts`. Non modifica tabelle timbrature.

---

## 🔧 Implementazione (chirurgica)

### Server
- File: `server/routes/modules/other.ts`
- Endpoint: `DELETE /api/ex-dipendenti/:pin`
- Validazioni:
  - `pin` numerico 1–99 → `INVALID_PIN` (400)
  - Utente deve esistere in `ex_dipendenti` → `USER_NOT_ARCHIVED` (409)
- Azione: hard delete su `ex_dipendenti` (nessun tocco alle timbrature)
- Errori:
  - `FK_CONSTRAINT` (409) se presenti vincoli bloccanti
  - `DELETE_FAILED` (500) per altri errori

### Client service
- File: `client/src/services/utenti.service.ts`
- Metodo nuovo: `deleteExDipendente(pin: number)` → `DELETE /api/ex-dipendenti/:pin`
- Mappa codici: `USER_NOT_ARCHIVED`, `FK_CONSTRAINT`, `DELETE_FAILED`

### UI
- File: `client/src/components/admin/ConfirmDialogs.tsx`
  - Componente nuovo: `DeleteExDialog` (rosso, doppia conferma)
- File: `client/src/components/admin/ExDipendentiTable.tsx`
  - Nuovi props: `onElimina(ex)` e bottone ghost "Elimina" per riga
- File: `client/src/pages/ExDipendenti.tsx`
  - Wiring: stato modale, handler `handleOpenDelete()`, `handleConfirmDelete()`
  - Invalidazione cache: `['ex-dipendenti']` dopo delete

---

## 🧪 Test rapidi
1) **Happy path**
```bash
curl -i -X DELETE http://localhost:10000/api/ex-dipendenti/11
# → 200 {"success": true}
```
2) **USER_NOT_ARCHIVED**
```bash
curl -i -X DELETE http://localhost:10000/api/ex-dipendenti/999
# → 409 {"code": "USER_NOT_ARCHIVED"}
```
3) **FK_CONSTRAINT**
- Simulare vincolo per blocco: atteso `409 { code: 'FK_CONSTRAINT' }` e nessuna rimozione.

---

## ⚠️ Governance
- Niente modifiche a timbrature.
- Nessuna migrazione DB.
- UI/Palette invariati, solo contenuti della modale e nuovi bottoni ghost.

---

## 📂 File toccati
- `server/routes/modules/other.ts` → endpoint `DELETE /api/ex-dipendenti/:pin`
- `client/src/services/utenti.service.ts` → `deleteExDipendente(pin)`
- `client/src/components/admin/ConfirmDialogs.tsx` → `DeleteExDialog`
- `client/src/components/admin/ExDipendentiTable.tsx` → pulsante Elimina + props
- `client/src/pages/ExDipendenti.tsx` → wiring modale e invalidazioni

---

## 🔐 Codici errore
- `INVALID_PIN`, `USER_NOT_ARCHIVED`, `FK_CONSTRAINT`, `DELETE_FAILED`, `SERVICE_UNAVAILABLE`, `INTERNAL_ERROR`

---

## Rischi residui
- Possibili differenze di schema tra ambienti → gestite con messaggi chiari.
- Nessun impatto su storico timbrature per requisito.

---

**Autore**: BadgeNode / Cascade AI
Commit suggerito: `feat: hard delete ex-dipendente with double confirm (Step 7)`
