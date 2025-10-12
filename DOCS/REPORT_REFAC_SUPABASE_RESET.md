# 🔧 REPORT REFACTOR SUPABASE RESET - BadgeNode

**Data**: 2025-10-12  
**Branch**: `refactor/supabase-reset`  
**Obiettivo**: Pulizia chirurgica codice sincronizzazione Supabase (client)

---

## 📋 SCANSIONE PATTERN LEGACY (COMPLETATA)

### ✅ PATTERN NON TROVATI (POSITIVO)
- ❌ Nessun `fetch('/rest/v1/timbrature')` diretto
- ❌ Nessun `.from('timbrature').insert()` diretto
- ❌ Nessuna RPC legacy (solo `insert_timbro_v2` presente)

### 🚨 PATTERN LEGACY IDENTIFICATI

#### **1. Campi Obsoleti `giornologico` (senza underscore) - 12 FILE**
```
src/services/timbrature.service.ts (4 occorrenze)
src/services/timbrature-stats.service.ts (1 occorrenza)
src/services/storico/v5.ts (3 occorrenze)
src/services/storico/legacy.ts (8 occorrenze)
src/services/storico/fallback.ts (4 occorrenze)
src/lib/validation.ts (1 occorrenza)
src/lib/export.ts (1 occorrenza)
src/lib/time.ts (multiple occorrenze)
src/components/storico/ModaleTimbrature/useModaleTimbrature.ts (2 occorrenze)
src/components/storico/StoricoTable.tsx (1 occorrenza)
src/components/storico/ModaleTimbratureForm.tsx (2 occorrenze)
src/hooks/useStoricoMutations.ts (2 occorrenze)
```

#### **2. Campi Obsoleti `data`, `ore` (senza underscore) - 8 FILE**
```
src/services/storico/legacy.ts (2 occorrenze .order('ore'))
src/services/timbrature-stats.service.ts (4 occorrenze)
src/services/storico/fallback.ts (5 occorrenze)
src/lib/time.ts (6 occorrenze)
src/components/storico/ModaleTimbrature/useModaleTimbrature.ts (4 occorrenze)
src/components/storico/StoricoTable.tsx (4 occorrenze)
src/components/storico/ModaleTimbratureForm.tsx (2 occorrenze)
src/hooks/useStoricoMutations.ts (4 occorrenze)
```

#### **3. Sistema Queue Legacy `insertNowOrEnqueue` - 4 FILE**
```
src/services/timbrature-sync.ts (1 occorrenza)
src/services/timbrature.service.ts (1 occorrenza)
src/services/timbrature-insert.adapter.ts (1 occorrenza principale)
src/utils/test-offline-sync.ts (2 occorrenze test)
```

---

## 🎯 PIANO REFACTOR

### **STEP 3: Centralizzazione Client Supabase**
- [ ] Verificare/creare `src/lib/supabase.ts` con client unificato
- [ ] Export unico `export const supabase = ...`

### **STEP 4: Nuovo Service RPC Unico**
- [ ] Creare `src/services/timbratureRpc.ts`
- [ ] Funzione `callInsertTimbro({ pin, tipo, client_event_id? })`
- [ ] TODO comment per gestione offline queue

### **STEP 5: Rimozione/Refactor Chiamate Legacy**
- [ ] Sostituire tutti `insertNowOrEnqueue` con `callInsertTimbro`
- [ ] Rimuovere campi obsoleti `giornologico`, `data`, `ore`
- [ ] Mantenere solo SELECT con colonne valide

### **STEP 6-9: Pulizia, Verifiche, Deliverable**
- [ ] Pulizia tipi obsoleti
- [ ] Verifiche build/typecheck
- [ ] Commit finale
- [ ] Report aggiornato

---

## 📊 STATO ATTUALE
- ✅ Branch `refactor/supabase-reset` creato
- ✅ Scansione pattern legacy completata
- ⏳ Prossimo: Centralizzazione client Supabase

---

## 🔍 COMANDI GREP PRIMA/DOPO

### PRIMA (Pattern da eliminare):
```bash
# Campi obsoleti
grep -r "giornologico[^_]" client/src --include="*.ts" --include="*.tsx"
grep -r "\.data[^_]" client/src --include="*.ts" --include="*.tsx"
grep -r "\.ore[^_]" client/src --include="*.ts" --include="*.tsx"

# Sistema queue legacy
grep -r "insertNowOrEnqueue" client/src --include="*.ts" --include="*.tsx"
```

### DOPO (Deve essere vuoto):
```bash
# Stessi comandi - devono restituire 0 risultati
```

---

**Status**: 🟡 IN PROGRESS - Step 2/9 completato
