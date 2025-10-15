# REPORT DIAGNOSI: STORICO NON REFRESH DOPO UPDATE

**Data**: 2025-10-16  
**Obiettivo**: Identificare perché refetch non aggiorna la tabella immediatamente

## 🔍 PROBLEMA IDENTIFICATO

**Sintomo**: Dopo PATCH `/api/timbrature/:id` (200 OK) e `refetchAll()`, la UI non si aggiorna senza refresh manuale.

## 🛠️ STRUMENTAZIONE IMPLEMENTATA

### **1. Debug Query Keys**
**File**: `client/src/lib/debugQuery.ts`
- `logStoricoQueries()`: Log di tutte le query storico con dati
- `logActiveQueries()`: Log delle query attive con stato

### **2. Logging Hook Principale**
**File**: `client/src/hooks/useStoricoTimbrature.ts`
- Log queryKey effettiva: `['storico-dataset-v5', filters]`
- Log parametri: `{ pin, dal, to }`
- Log data changes con timestamp

### **3. Logging Tabella**
**File**: `client/src/components/storico/StoricoTable.tsx`
- Log quando props `storicoDatasetV5` cambiano
- Verifica: nessun state locale, usa direttamente props

### **4. Refetch Migliorato**
**File**: `client/src/hooks/useStoricoMutations.ts`
- Log BEFORE/AFTER refetch con stato completo
- Refetch con predicate per query con filtri
- Refetch specifici per PIN

### **5. Test Structural Sharing**
**File**: `client/src/services/storico/v5.ts`
- Clonazione profonda con `JSON.parse(JSON.stringify())`
- Log timestamp per ogni build dataset

## 📊 QUERY KEYS IDENTIFICATE

### **Query Principale (Tabella)**
```typescript
queryKey: ['storico-dataset-v5', { pin: 1, dal: '2025-10-01', al: '2025-10-31' }]
```

### **Query Legacy (Compatibilità)**
```typescript
queryKey: ['turni-completi-legacy', { pin: 1, dal: '2025-10-01', al: '2025-10-31' }]
```

## 🎯 IPOTESI TESTATE

### **A) QueryKey Mismatch** ❓
- **Test**: Log queryKey effettiva vs invalidazioni
- **Risultato**: Da verificare nei log browser

### **B) State Locale** ✅ ESCLUSO
- **Verifica**: StoricoTable usa direttamente `storicoDatasetV5` props
- **Risultato**: Nessun useState locale che blocca aggiornamenti

### **C) Structural Sharing** 🧪 IN TEST
- **Test**: Clonazione profonda in `buildStoricoDataset`
- **Risultato**: Se UI si aggiorna → problema confermato

### **D) Deps Memoizzazione** ✅ VERIFICATO
- **Verifica**: useEffect con deps corrette `[storicoDatasetV5, filters]`
- **Risultato**: Deps corrette, dovrebbe triggerare

### **E) Filtri/Ordinamento** ❓
- **Test**: Log sample data per verificare contenuto
- **Risultato**: Da verificare se record modificato è visibile

## 🔧 MODIFICHE APPLICATE

### **Refetch Strategia**
```typescript
// PRIMA: Refetch generico
qc.refetchQueries({ queryKey: ['storico'], type: 'active' })

// DOPO: Refetch specifico + predicate
qc.refetchQueries({ queryKey: ['storico-dataset-v5'], type: 'active' })
qc.refetchQueries({ 
  predicate: (query) => query.queryKey[0] === 'storico-dataset-v5' && 
                       typeof query.queryKey[1] === 'object'
})
```

### **Structural Sharing Test**
```typescript
// PRIMA: Return diretto
return allDays.map(day => ({ ... }))

// DOPO: Clone profondo
return JSON.parse(JSON.stringify(result))
```

## 📋 LOG ATTESI NEL BROWSER

### **1. Query Initialization**
```
[STORICO][QUERY] dataset-v5 key= ['storico-dataset-v5', {pin: 1, dal: '...', al: '...'}]
[STORICO][DATA] dataset-v5 updated: { length: 31, filters: {...}, timestamp: '...' }
```

### **2. Mutation Flow**
```
[HOOK] refetchAll started → { pin: 1 }
[RQ-DEBUG] BEFORE refetch storico queries: [...]
[RQ-DEBUG] AFTER refetch storico queries: [...]
[HOOK] refetchAll completed
```

### **3. Data Updates**
```
[SERVICE] buildStoricoDataset result: { length: 31, timestamp: '...' }
[STORICO][DATA] dataset-v5 updated: { length: 31, ... }
[TABLE] storicoDatasetV5 props changed: { length: 31, ... }
```

## 🎯 DIAGNOSI ATTESA

### **Scenario A: QueryKey Mismatch**
- Log mostra refetch su chiavi diverse da quelle in uso
- **Fix**: Allineare esattamente le chiavi

### **Scenario B: Structural Sharing**
- UI si aggiorna con clone profondo
- **Fix**: Implementare clonazione selettiva

### **Scenario C: Timing Issue**
- Refetch completa ma props non cambiano
- **Fix**: Forzare re-render con key dinamica

### **Scenario D: Cache Stale**
- Query non si considera "stale" nonostante refetch
- **Fix**: Ridurre staleTime o forzare invalidation

## 🚀 PROSSIMI STEP

### **Test Browser**
1. Apri DevTools → Console
2. Modifica timbratura (es. 19:00 → 20:00)
3. Osserva sequenza log completa
4. Identifica dove si interrompe il flusso

### **Analisi Log**
- Verifica queryKey match tra refetch e query
- Controlla se `[TABLE] props changed` appare
- Verifica timestamp per timing issues

### **Fix Mirato**
Basato sui risultati, applicare fix specifico:
- QueryKey alignment
- Structural sharing fix  
- Force re-render
- Cache invalidation

---

## 📝 CONCLUSIONI PRELIMINARI

**Strumentazione completa implementata** per identificare il punto esatto dove il flusso si interrompe.

**Ipotesi più probabile**: QueryKey mismatch tra refetch generico e query con filtri specifici.

**Test decisivo**: Log browser durante modifica timbratura rivelerà la causa root.

---
**Status**: 🔍 DIAGNOSI PRONTA  
**Prossimo**: Test browser con log completi
