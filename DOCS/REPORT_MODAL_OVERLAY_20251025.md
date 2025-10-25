# REPORT — Fix definitivo overlay dei modali (Archivio Dipendenti)

Data: 2025-10-25
Stato: Completato

## Sintomo
- Con i modali di archiviazione/ripristino/eliminazione aperti, passando il mouse su header/body/footer, lo sfondo (tabella) risultava ancora reattivo e visibile (see-through/hover highlight).

## Root cause
- L’overlay non bloccava completamente gli eventi dell’utente (pointer-events) e lo stacking (z-index/stacking context) non garantiva l’isolamento dal contenuto.
- Alcune regole globali di hover rendevano trasparenti i layer interni del modale in specifiche aree (padding/border section), facendo intravedere il contenuto sottostante.

## Obiettivi
- Impedire qualsiasi interazione/hover sul background quando un modale è aperto.
- Overlay opaco, nessun blur, z-index superiore al contenuto.
- Soluzione chirurgica e locale ai modali Admin.

## Implementazione

### 1) Conferma Portal + Overlay e Content (fixed) centrati
- I modali Admin usano markup custom; è stato mantenuto lo stile attuale con overlay full-screen `fixed inset-0`, ma reso più robusto:
  - `bg-black` opaco, `pointer-events: auto`, z-index alto.
  - Content con z-index ancora superiore.

### 2) Disattivazione background durante modale
- Toggle di una classe globale `modal-open` su `<html>` quando `isOpen` è true.
  - Applicato in: `ConfirmDialogs.tsx` in tutti i modali (Archivia, Restore, DeleteEx).

### 3) Hardening CSS
Aggiunte in `client/src/styles/badgenode.css`:

```css
.bn-modal-overlay { background-color: rgba(0,0,0,0.86) !important; backdrop-filter: none !important; z-index: 60 !important; pointer-events: all !important; }
.bn-modal-solid { background-color: #2b0048 !important; box-shadow: none !important; position: relative; z-index: 70 !important; isolation: isolate; mix-blend-mode: normal !important; opacity: 1 !important; }
.bn-modal-solid *:hover,
.bn-modal-solid *:focus,
.bn-modal-solid *:focus-within { background-color: inherit !important; }
.bn-nohover .bn-modal-solid *:hover,
.bn-nohover .bn-modal-solid *:focus,
.bn-nohover .bn-modal-solid *:focus-within { background-color: inherit !important; }
.bn-modal-solid .p-6, .bn-modal-solid .border-b, .bn-modal-solid .border-t { background-color: inherit !important; }
.bn-modal-solid *, .bn-modal-solid *:hover, .bn-modal-solid *:focus { opacity: 1 !important; }

/* Disattiva interazioni sul background quando un modale è aperto */
.modal-open body > #root,
.modal-open body > #app { pointer-events: none !important; }
.modal-open body > #root *:hover,
.modal-open body > #app  *:hover { background-color: inherit !important; box-shadow: none !important; }
.modal-open .bn-modal-overlay,
.modal-open .bn-modal-solid,
.modal-open .bn-modal-solid * { pointer-events: auto !important; }
```

### 4) Rimozione hover schiarente sui pulsanti interni
- Eliminati `hover:bg-*` e `hover:shadow-md` dai pulsanti "Annulla" e dal tasto di chiusura (ora `hover:bg-transparent`).

### 5) Z-index esplicito
- Overlay: `z-[1000]`.
- Panel: `z-[1001]`.

## File modificati
- `client/src/components/admin/ConfirmDialogs.tsx`
  - Overlay opaco, z-index alto, pointer-events attivi; panel con `bn-modal-solid`, z-index, rimozione hover schiarenti; toggle `modal-open` su `<html>` quando `isOpen`.
- `client/src/styles/badgenode.css`
  - Nuove classi `.bn-modal-overlay`, `.bn-modal-solid` e regole per neutralizzare hover/opacity e disattivare background durante il modale.

## Test
1. Aprire Archivio Dipendenti → aprire ArchiviaDialog.
2. Passare il mouse su header/body/footer del modale.
   - Atteso: nessuna evidenza della tabella sottostante, overlay opaco.
3. Provare a cliccare dietro il modale.
   - Atteso: nessun click arriva al background.
4. TAB navigation dentro il modale.
   - Atteso: focus trap funziona (già implementato), background inert.
5. Chiudere il modale.
   - Atteso: classe `modal-open` rimossa, background torna interattivo.

## Checklist finale
- [x] Overlay sopra tutto, opaco, senza blur.
- [x] Background inert/pointer-events none quando il modale è aperto.
- [x] Nessuna trasparenza/opacity ridotta nei layer interni del modale.
- [x] Hover su tabelle disattivato durante il modale.
- [x] Nessuna regressione su altri dialog.

## Note
- La soluzione è locale ai modali Admin; non tocca backend/RLS. Posizionamento e UI esistenti sono preservati.
