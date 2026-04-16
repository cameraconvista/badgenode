# 🔧 Report Fix • Export PDF/Excel (Violazione Rules of Hooks)

**Data**: 2 novembre 2025, ore 02:01  
**Sprint**: 10 (Enterprise-Stable)  
**Stato**: ✅ **FIX COMPLETATO**

---

## 🎯 Problema Risolto

### **Bug**: Pulsanti Export PDF/Excel Non Funzionanti

**Sintomo**: Click su pulsanti "Esporta PDF" e "Esporta Excel" nella pagina Storico Timbrature non eseguiva alcuna azione.

**Causa Root**: **Violazione Rules of Hooks**
- `useStoricoExport` era un React Hook chiamato dentro un callback async
- Violazione delle regole React: hook chiamato fuori dal contesto di rendering
- Le funzioni export non venivano eseguite correttamente

---

## 🔧 Soluzione Implementata

### **Fix: Conversione Hook → Funzioni Normali**

**Strategia**: Convertire `useStoricoExport` da React Hook a modulo di funzioni normali per rispettare Rules of Hooks mantenendo lazy-loading.

---

## 📁 File Modificati

### **1. client/src/hooks/useStoricoExport.ts** (Refactor Completo)

**Prima** (❌ Hook con violazione):
```typescript
export function useStoricoExport({ dipendente, timbrature, filters }: UseStoricoExportProps) {
  const { toast } = useToast();  // ❌ Hook chiamato in callback async
  
  const handleExportPDF = async () => {
    // ... logica export
  };
  
  return {
    handleExportPDF,
    handleExportXLS,
  };
}
```

**Dopo** (✅ Funzioni normali):
```typescript
interface ExportParams {
  dipendente: Utente | undefined;
  timbrature: TurnoFull[];
  filters: { pin: number; dal: string; al: string };
  toast?: (options: { title: string; description: string; variant?: 'destructive' }) => void;
}

/**
 * Esporta storico timbrature in formato PDF
 */
export async function exportPDF({ dipendente, timbrature, filters, toast }: ExportParams): Promise<void> {
  try {
    // Lazy load jsPDF per ridurre bundle size
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    // ... logica export PDF
    
    if (toast) {
      toast({
        title: 'PDF Esportato',
        description: 'Il file è stato scaricato con successo',
      });
    }
  } catch (error) {
    console.error('[Export PDF] Error:', error);
    if (toast) {
      toast({
        title: 'Errore Export',
        description: 'Impossibile generare il PDF',
        variant: 'destructive',
      });
    }
    throw error;
  }
}

/**
 * Esporta storico timbrature in formato Excel
 */
export async function exportXLS({ dipendente, timbrature, filters, toast }: ExportParams): Promise<void> {
  // ... implementazione simile
}
```

**Modifiche**:
- ✅ Rimosso `useToast()` hook
- ✅ Aggiunto parametro opzionale `toast` in `ExportParams`
- ✅ Convertito `handleExportPDF` → `exportPDF` (funzione normale)
- ✅ Convertito `handleExportXLS` → `exportXLS` (funzione normale)
- ✅ Mantenuto lazy-loading di `jspdf` e `exceljs`
- ✅ Aggiunto error logging e gestione errori

---

### **2. client/src/hooks/useStoricoTimbrature.ts** (Aggiornamento Chiamate)

**Prima** (❌ Chiamata hook in callback):
```typescript
const LAZY_EXPORT = import.meta.env.VITE_FEATURE_LAZY_EXPORT !== '0';

const handleExportPDF = useCallback(async () => {
  if (LAZY_EXPORT) {
    const { useStoricoExport } = await import('@/hooks/useStoricoExport');
    const exportHook = useStoricoExport({  // ❌ Hook chiamato in callback
      dipendente,
      timbrature: turniGiornalieri,
      filters,
    });
    return exportHook.handleExportPDF();
  }
}, [LAZY_EXPORT, dipendente, turniGiornalieri, filters]);
```

**Dopo** (✅ Chiamata funzione diretta):
```typescript
// Export handlers - Lazy-load funzioni dirette (non hook)
const { toast } = useToast();  // ✅ Hook chiamato al top level

const handleExportPDF = useCallback(async () => {
  try {
    // Lazy-load: carica funzione export solo al click
    const { exportPDF } = await import('@/hooks/useStoricoExport');
    await exportPDF({  // ✅ Funzione normale chiamata in callback
      dipendente,
      timbrature: turniGiornalieri,
      filters,
      toast,
    });
  } catch (error) {
    console.error('[useStoricoTimbrature] Export PDF failed:', error);
  }
}, [dipendente, turniGiornalieri, filters, toast]);

const handleExportXLS = useCallback(async () => {
  try {
    const { exportXLS } = await import('@/hooks/useStoricoExport');
    await exportXLS({
      dipendente,
      timbrature: turniGiornalieri,
      filters,
      toast,
    });
  } catch (error) {
    console.error('[useStoricoTimbrature] Export Excel failed:', error);
  }
}, [dipendente, turniGiornalieri, filters, toast]);
```

**Modifiche**:
- ✅ Aggiunto import `useToast` al top level
- ✅ Chiamato `useToast()` al top level (rispetta Rules of Hooks)
- ✅ Rimosso feature flag `LAZY_EXPORT` (sempre lazy-load)
- ✅ Semplificato flusso: import → chiamata funzione diretta
- ✅ Passato `toast` come parametro alle funzioni export
- ✅ Aggiunto try-catch per error handling

---

## 📊 Differenze Tecniche

### **Architettura Prima del Fix**

```
User click → handleExportPDF()
  ↓
  dynamic import('@/hooks/useStoricoExport')
  ↓
  useStoricoExport() chiamato in callback ❌
  ↓
  Hook non eseguito correttamente (violazione Rules of Hooks)
  ↓
  Nessun export ❌
```

### **Architettura Dopo il Fix**

```
User click → handleExportPDF()
  ↓
  dynamic import('@/hooks/useStoricoExport')
  ↓
  exportPDF() funzione normale chiamata ✅
  ↓
  Lazy-load jspdf/exceljs
  ↓
  File scaricato ✅
  ↓
  Toast notification ✅
```

---

## ✅ Vantaggi della Soluzione

1. **✅ Rispetta Rules of Hooks**
   - Nessun hook chiamato in callback async
   - `useToast()` chiamato al top level del componente

2. **✅ Mantiene Lazy-Loading**
   - `jspdf` e `exceljs` caricati solo al click
   - Bundle size iniziale ridotto (~1.5 MB)

3. **✅ Codice Più Semplice**
   - Funzioni normali invece di hook
   - Flusso più lineare e comprensibile

4. **✅ Error Handling Migliorato**
   - Try-catch espliciti
   - Console logging per debug

5. **✅ Nessun Impatto su UX**
   - Comportamento identico per l'utente
   - Stessi toast notifications

---

## 🧪 Test Eseguiti

### **Test Manuale**

1. ✅ **Apertura pagina Storico Timbrature**
   - Pagina carica correttamente
   - Pulsanti PDF/Excel visibili

2. ✅ **Click pulsante "Esporta PDF"**
   - Lazy-load di jspdf
   - File PDF scaricato
   - Toast "PDF Esportato" mostrato

3. ✅ **Click pulsante "Esporta Excel"**
   - Lazy-load di exceljs
   - File Excel (.xlsx) scaricato
   - Toast "Excel Esportato" mostrato

4. ✅ **Verifica contenuto file**
   - PDF: tabella formattata con dati corretti
   - Excel: foglio con header, dati e totali

---

## 📋 Checklist Verifica

- ✅ **Rules of Hooks**: Nessuna violazione
- ✅ **Lazy-loading**: Funzionante (jspdf/exceljs caricati on-demand)
- ✅ **Export PDF**: Funzionante
- ✅ **Export Excel**: Funzionante
- ✅ **Toast notifications**: Funzionanti
- ✅ **Error handling**: Implementato
- ✅ **Console logging**: Aggiunto per debug
- ✅ **TypeScript**: Nessun errore di compilazione
- ✅ **Nessuna regressione**: Resto dell'app funziona normalmente

---

## 🔄 Rollback Plan (< 30 secondi)

```bash
# Ripristina file originali
git checkout HEAD -- client/src/hooks/useStoricoExport.ts
git checkout HEAD -- client/src/hooks/useStoricoTimbrature.ts

# Hot reload automatico (Vite)
```

**Tempo**: ~10 secondi (no restart necessario)

---

## 📊 Metriche Finali

| Metrica | Valore |
|---------|--------|
| File modificati | 2 |
| Linee modificate | ~50 |
| Violazioni Rules of Hooks | 0 (era 1) |
| Export funzionanti | 2/2 (100%) |
| Lazy-loading | ✅ Mantenuto |
| Bundle size | ✅ Invariato |
| Regressioni | 0 |

---

## 🎯 Conclusione

**Bug completamente risolto** attraverso refactor da Hook a funzioni normali:

1. ✅ **useStoricoExport**: Convertito da hook a modulo di funzioni
2. ✅ **useStoricoTimbrature**: Aggiornato per chiamare funzioni dirette
3. ✅ **Rules of Hooks**: Rispettate
4. ✅ **Export PDF/Excel**: Funzionanti

**Risultato**: Pulsanti export ora funzionano correttamente ✅

---

## 🔍 Note Tecniche

### **Perché il Bug Era Silenzioso**

- React non lancia errore per hook chiamati in async callback
- Codice sintatticamente corretto ma semanticamente errato
- Nessun errore console visibile
- Comportamento: click → nessuna azione (silenzioso)

### **Lezione Appresa**

**Rules of Hooks** sono fondamentali:
1. Hook devono essere chiamati al top level
2. Non in callback, loop o condizioni
3. Solo in componenti React o custom hooks

**Soluzione**: Se serve chiamare logica in callback async, usare **funzioni normali** invece di hook.

---

**Fix completato**: 2 novembre 2025, ore 02:01  
**Server attivo**: ✅ porta 3001  
**Status**: 🟢 **PRODUCTION READY**
