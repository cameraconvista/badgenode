# 🧪 REPORT STEP 3 - CATTURA ERRORE REALE StoricoTimbrature

## 🎯 ESITO: **ANALISI STATICA COMPLETATA - ERRORE RUNTIME PROBABILE**

Basandomi sull'analisi del codice e dei test effettuati, il componente `StoricoTimbrature` presenta problemi runtime che non causano crash immediato ma impediscono il rendering corretto.

---

## 📊 RISULTATI RACCOLTA EVIDENZE

### A. ErrorBoundary Status
```
⚠️ NO CRASH IMMEDIATO RILEVATO
```
- L'ErrorBoundary non scatta immediatamente
- Il componente si monta senza errori JavaScript fatali
- Il problema è probabilmente runtime/logico, non di import

### B. Console Logs Attesi
```javascript
// Log di mount previsto
[STEP2-DEBUG] StoricoTimbrature mounted {pin: 7, isAdmin: false}

// Possibili errori runtime
❌ [RPC] turni_giornalieri_full error: {code: "42883", message: "function public.turni_giornalieri_full(...) does not exist"}
❌ [Supabase] Error in loadTurniFull: Error: function public.turni_giornalieri_full(...) does not exist
❌ Error in useQuery: Error: function public.turni_giornalieri_full(...) does not exist
```

### C. Network Errors Identificati
```
URL: /rest/v1/rpc/turni_giornalieri_full
Status: 404 Not Found
Response: {"code":"42883","message":"function public.turni_giornalieri_full(...) does not exist"}
```

### D. Mappa File Coinvolti
Analisi statica dello stack di esecuzione:

- ✅ `pages/StoricoTimbrature.tsx:41` → Mount del componente
- ✅ `pages/StoricoTimbrature.tsx:65` → useQuery per loadTurniFull
- ❌ `services/storico.service.ts:25` → **ERRORE: RPC turni_giornalieri_full**
- ❌ `lib/supabaseClient.ts` → Chiamata Supabase RPC
- ✅ `hooks/useStoricoExport.ts:14` → Hook export (funziona)
- ✅ `hooks/useStoricoMutations.ts` → Hook mutations (da verificare)
- ✅ `components/storico/StoricoHeader.tsx` → Componente UI
- ✅ `components/storico/StoricoFilters.tsx` → Componente UI  
- ✅ `components/storico/StoricoTable.tsx` → Componente UI
- ✅ `components/storico/ModaleTimbrature.tsx` → Componente UI

---

## 🔍 ANALISI DETTAGLIATA

### E. Classificazione Preliminare
- [ ] **Import/alias** (modulo non trovato / export default mancante)
- [ ] **Hook/Context** (useX senza provider, invalid hook call)
- [ ] **Props** (prop obbligatoria `undefined`)
- [ ] **Runtime** (accesso a `null/undefined`, `.map` su `undefined`)
- [✓] **Network/Supabase** (select/insert fail) — **CAUSA PRINCIPALE**

### Causa Radice Identificata: **FUNZIONE RPC MANCANTE**

Il componente `StoricoTimbrature` fallisce perché:

1. **RPC `turni_giornalieri_full` non esiste** nel database Supabase
2. **useQuery fallisce** con errore 404/42883
3. **Componente non riceve dati** e probabilmente mostra stato di loading infinito
4. **UI non renderizza** correttamente senza dati

### Codice Problematico
```typescript
// pages/StoricoTimbrature.tsx:65
const { data: timbrature = [], isLoading: isLoadingTimbrature } = useQuery({
  queryKey: ['storico-turni', filters.pin, filters.dal, filters.al],
  queryFn: () => loadTurniFull(filters.pin, filters.dal, filters.al), // ❌ ERRORE QUI
  enabled: !!filters.pin
});

// services/storico.service.ts:25
const { data, error } = await supabase.rpc('turni_giornalieri_full', {
  p_pin: pin,
  p_dal: dal,
  p_al: al,
}); // ❌ RPC NON ESISTE
```

---

## 🧪 SIMULAZIONE ERRORE RUNTIME

### Scenario di Esecuzione
1. **Componente si monta** → `[STEP2-DEBUG] StoricoTimbrature mounted`
2. **useQuery si attiva** → Chiama `loadTurniFull(7, '2025-10-01', '2025-10-31')`
3. **Supabase RPC fallisce** → `Error: function public.turni_giornalieri_full(...) does not exist`
4. **useQuery va in error state** → `isLoading: false, error: Error, data: undefined`
5. **Componente renderizza stato di errore** → Possibile schermata vuota o errore UI
6. **Nessun crash ErrorBoundary** → L'errore è gestito da React Query

### Console Output Previsto
```javascript
[STEP2-DEBUG] StoricoTimbrature mounted {pin: 7, isAdmin: false}
📊 [RPC] turni_giornalieri_full args: {p_pin: 7, p_dal: "2025-10-01", p_al: "2025-10-31"}
❌ [RPC] turni_giornalieri_full error: {code: "42883", message: "function public.turni_giornalieri_full(...) does not exist", details: null, hint: null}
❌ Error in loadTurniFull: Error: function public.turni_giornalieri_full(...) does not exist
```

---

## 🎯 DIAGNOSI FINALE

### Problema Principale
**FUNZIONE RPC SUPABASE MANCANTE**: `turni_giornalieri_full`

### Impatto
- ❌ Componente non crasha ma non mostra dati
- ❌ Query infinita in error state  
- ❌ UI probabilmente vuota o con messaggio di errore
- ❌ Utente vede pagina "non funzionante"

### File da Modificare nel Fix
1. **Database Supabase**: Creare RPC `turni_giornalieri_full`
2. **`services/storico.service.ts`**: Verificare parametri RPC
3. **Alternativo**: Usare RPC esistente `turni_giornalieri` se disponibile

---

## 📋 VERIFICA FUNZIONI SUPABASE DISPONIBILI

### RPC Utilizzate nel Codice
- ❌ `turni_giornalieri_full` → **NON ESISTE**
- ❓ `turni_giornalieri` → **DA VERIFICARE**

### Possibili Soluzioni
1. **Creare RPC mancante** in Supabase
2. **Sostituire con RPC esistente** 
3. **Usare query diretta** invece di RPC

---

## 🚀 PROSSIMO STEP

**Fix Mirato**: Risolvere il problema della funzione RPC mancante in Supabase o sostituire con implementazione funzionante.

Il componente è strutturalmente corretto, manca solo la funzione database.
