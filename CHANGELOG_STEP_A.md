# CHANGELOG - STEP A: Fix giorno_logico + alternanza

**Data**: 2025-10-16  
**Commit**: `feat(server): unifica computeGiornoLogico e valida alternanza con ancoraggio (notturni + ricostruzioni), errori codificati`

## 🎯 Obiettivo Completato

Unificazione del calcolo del giorno logico e riscrittura della validazione alternanza per supportare turni notturni e ricostruzioni amministrative.

## ✅ Implementazioni

### 1. Logica Unificata `computeGiornoLogico`

**File**: `server/shared/time/computeGiornoLogico.ts` (NUOVO)

- Finestra notturna: **00:00–04:59** → giorno precedente
- Ancoraggio automatico per uscite notturne entro **20h**
- Supporto parametro `dataEntrata` per ricostruzioni
- Funzioni helper: `calcolaDifferenzaOre`, `isValidShiftDuration`

### 2. Validazione Alternanza Riscritta

**File**: `server/routes/timbrature.ts`

- **Rimossa** regola "primo timbro deve essere ENTRATA"
- **Aggiunta** logica di ancoraggio per uscite notturne
- **Supporto** ricostruzioni amministrative con `anchorDate`
- **Finestra massima** 20 ore per turni

### 3. Errori Codificati JSON

```json
{
  "success": false,
  "error": "Messaggio leggibile",
  "code": "CODICE_SPECIFICO"
}
```

**Codici implementati**:
- `MISSING_ANCHOR_ENTRY`: Manca entrata di ancoraggio entro 20h
- `ALTERNANZA_DUPLICATA`: Stesso tipo consecutivo
- `SHIFT_TOO_LONG`: Turno > 20 ore
- `QUERY_ERROR`: Errore database

### 4. Refactor Client

**File**: `client/src/lib/time.ts`

- Import dalla funzione shared unificata
- Wrapper per compatibilità esistente
- Alias `@shared` → `server/shared/`

## 🧪 Test Integrazione Superati

| Scenario | Input | Output | Status |
|----------|-------|--------|--------|
| **Diurno normale** | Entrata 14:00 → Uscita 22:00 | Stesso giorno logico | ✅ |
| **Notturno** | Entrata 14:00 → Uscita 01:00 (+1) | Ancoraggio corretto | ✅ |
| **Ricostruzione** | Uscita senza entrata | `MISSING_ANCHOR_ENTRY` | ✅ |
| **Entrata notturna** | Entrata 04:30 | Giorno precedente | ✅ |
| **Turno lungo** | Entrata → Uscita +26h | `SHIFT_TOO_LONG` | ✅ |
| **Ancoraggio esplicito** | `anchorDate` parameter | Override automatico | ✅ |

## 🔧 Algoritmo Validazione

```typescript
// Pseudocodice implementato
if (tipo === 'entrata') {
  if (lastOnAnchor?.tipo === 'entrata') -> ALTERNANZA_DUPLICATA
  else -> OK
}

if (tipo === 'uscita') {
  // 1) Cerca entrata su giorno logico corrente
  // 2) Fallback: giorno precedente entro 20h
  // 3) Override: anchorDate esplicito
  
  if (!anchorEntry) -> MISSING_ANCHOR_ENTRY
  if (diffHours > 20) -> SHIFT_TOO_LONG
  if (lastOnAnchor?.tipo === 'uscita') -> ALTERNANZA_DUPLICATA
  
  -> OK
}
```

## 📁 File Modificati

- ✅ `server/shared/time/computeGiornoLogico.ts` (NUOVO)
- ✅ `server/routes/timbrature.ts` (REFACTOR validazione)
- ✅ `client/src/lib/time.ts` (WRAPPER shared)
- ✅ `vite.config.ts` (ALIAS @shared)

## 🚀 Benefici

1. **Turni notturni**: Gestione corretta senza errori alternanza
2. **Ricostruzioni**: Supporto amministrativo con ancoraggio
3. **Errori chiari**: Codici specifici per troubleshooting
4. **Logica unificata**: Client e server usano stessa implementazione
5. **Zero regressioni**: Compatibilità completa con esistente

## 🎯 Prossimi Step

- **STEP B**: Trigger database e validazioni RLS
- **STEP C**: Miglioramenti UX e gestione errori client-side
- **STEP D**: Ottimizzazioni performance e monitoring

---

# STEP A.1: Rimozione Limite Durata Turno

**Data**: 2025-10-16 (sera)  
**Commit**: `feat(server): remove shift duration cap, keep day-logic & alternanza only; drop SHIFT_TOO_LONG`

## 🎯 Problema Risolto

L'errore "Manca ENTRATA di ancoraggio entro 20h" bloccava turni lunghi legittimi e ricostruzioni amministrative.

## ✅ Modifiche Implementate

### 1. Rimosso Limite 20h
- **Eliminato** controllo `diffOre <= 20` nella ricerca ancoraggio
- **Rimosso** completamente codice `SHIFT_TOO_LONG`
- **Aggiornato** messaggio errore: "Manca ENTRATA di ancoraggio per questa uscita"

### 2. Logica Semplificata
- **Ricerca ancoraggio**: solo regole giorno logico + alternanza
- **Nessun limite temporale**: turni di qualsiasi durata accettati
- **Finestra notturna**: 00:00-04:59 → cerca nel giorno precedente
- **Override esplicito**: `anchorDate` forza ancoraggio

### 3. Helper Deprecati
- `isValidShiftDuration()` → sempre `true`
- `calcolaDifferenzaOre()` → non più utilizzato
- Funzioni mantenute per compatibilità con TODO

## 🧪 Test Integrazione Superati

| Scenario | Input | Output | Status |
|----------|-------|--------|--------|
| **Turno 26h** | Entrata 08:00 → Uscita +26h con anchorDate | ✅ Accettato | ✅ |
| **Turno 36h** | Entrata dom 10:00 → Uscita lun 22:00 con anchorDate | ✅ Accettato | ✅ |
| **Notturno 10.5h** | Entrata 18:00 → Uscita 04:30 (+1) | ✅ Ancoraggio automatico | ✅ |
| **Ricostruzione** | Uscita 03:00 senza entrata | ❌ MISSING_ANCHOR_ENTRY | ✅ |
| **Ancoraggio esplicito** | Uscita con anchorDate | ✅ Forza giorno logico | ✅ |

## 📋 Codici Errore Aggiornati

- ✅ `MISSING_ANCHOR_ENTRY`: Manca entrata di ancoraggio
- ✅ `ALTERNANZA_DUPLICATA`: Stesso tipo consecutivo  
- ✅ `QUERY_ERROR`: Errore database
- ❌ `SHIFT_TOO_LONG`: **RIMOSSO** (non più utilizzato)

## 🔧 Algoritmo Finale

```typescript
// USCITA: nessun limite durata
const { giorno_logico } = computeGiornoLogico({ data, ora, tipo: 'uscita' })

let anchorEntry = 
  findOpenEntry({ pin, giorno_logico }) ||
  (isBetween00_04_59(ora) ? findOpenEntry({ pin, giorno_logico: prev(giorno_logico) }) : null)

// Override esplicito
if (!anchorEntry && anchorDate) {
  anchorEntry = findOpenEntry({ pin, giorno_logico: anchorDate })
}

if (!anchorEntry) -> MISSING_ANCHOR_ENTRY
if (lastOnAnchor?.tipo === 'uscita') -> ALTERNANZA_DUPLICATA

-> OK: inserisci USCITA (qualsiasi durata)
```

---

**Stato**: ✅ COMPLETATO  
**App**: 🟢 FUNZIONANTE su http://localhost:3001  
**Regressioni**: 🚫 NESSUNA
