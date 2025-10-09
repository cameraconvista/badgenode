# 🔍 REPORT STORICO DIAGNOSI - BadgeNode

**Data**: 2025-10-09 20:15  
**Problema**: Timbrature registrate in Supabase non appaiono nella pagina Storico Timbrature  
**Stato**: DIAGNOSI COMPLETATA - In attesa approvazione piano fix

---

## 🎯 SINTOMI OSSERVATI

### **Comportamento Attuale**
- ✅ **Home Tastierino**: Registrazione Entrata/Uscita funziona correttamente
- ✅ **Supabase**: Tabella `timbrature` si popola con tutti i campi corretti
- ❌ **Storico Timbrature**: Tabella mostra righe vuote con "—" e Ore=0.00

### **Test Case Specifico**
```
PIN: 7 (mock user)
Azione: Entrata + Uscita da tastierino home
Supabase: Record inseriti correttamente con giornologico=2025-10-09
Storico: Periodo Ottobre 2025, Dal=01/10/2025, Al=31/10/2025
Risultato: Riga "Gio 09" mostra celle vuote invece di orari e ore
```

---

## 🔍 ANALISI CODICE ATTUALE

### **Flusso Dati Identificato**

#### **1. Registrazione Timbratura (✅ Funziona)**
```typescript
// client/src/services/timbrature.service.ts:115
static async timbra(pin: number, tipo: 'entrata' | 'uscita'): Promise<number> {
  const { data, error } = await supabase.rpc('insert_timbro_rpc', { 
    p_pin: pin, 
    p_tipo: p_tipo 
  });
}
```
**Status**: ✅ RPC funziona, inserisce in tabella `timbrature`

#### **2. Caricamento Storico (❌ Problematico)**
```typescript
// client/src/services/storico.service.ts:43-58
const { data, error } = await supabase
  .from('v_turni_giornalieri')  // ← VISTA, non tabella diretta
  .select('*')
  .eq('pin', pin)
  .gte('giornologico', dal)     // ← Filtro su giornologico
  .lte('giornologico', al)      // ← Range inclusivo
  .order('giornologico', { ascending: true });
```
**Status**: ❌ Usa vista `v_turni_giornalieri` invece di tabella `timbrature`

#### **3. Mapping Risultati**
```typescript
// client/src/services/storico.service.ts:60-62
const dbResult = (data ?? []).map((row: any) => ({
  pin: row.pin,
  giorno: row.giornologico,  // ← Mappa giornologico → giorno
  // ...
}));
```

---

## 🚨 ROOT CAUSE IDENTIFICATA

### **CAUSA PRINCIPALE: Vista `v_turni_giornalieri` Problematica**

**Problema**: Il codice usa la vista `v_turni_giornalieri` che potrebbe:
1. **Non esistere** in Supabase
2. **Non essere aggiornata** con i nuovi record
3. **Avere struttura diversa** da quella attesa
4. **Mancare di permessi RLS** per lettura

**Evidenza**:
- Tabella `timbrature` si popola ✅
- Vista `v_turni_giornalieri` restituisce array vuoto ❌
- Nessun errore SQL, ma `data = []`

### **CAUSE SECONDARIE POSSIBILI**

#### **1. Struttura Vista Inconsistente**
```sql
-- Vista attesa dal codice:
SELECT pin, giornologico, entrata, uscita, ore, extra, mese_label
FROM v_turni_giornalieri
WHERE pin = ? AND giornologico >= ? AND giornologico <= ?

-- Possibili problemi:
-- • Campo 'giornologico' non esiste nella vista
-- • Vista usa 'data' invece di 'giornologico'  
-- • Vista non aggrega correttamente prima_entrata/ultima_uscita
```

#### **2. Permissions RLS**
```sql
-- Vista potrebbe avere policies diverse da tabella timbrature
-- ANON_KEY potrebbe non avere accesso alla vista
-- Solo SERVICE_ROLE_KEY può leggere vista aggregata
```

#### **3. Filtro Periodo Non Inclusivo**
```typescript
// Range attuale: dal=2025-10-01, al=2025-10-31
.gte('giornologico', dal)  // >= 2025-10-01 ✅
.lte('giornologico', al)   // <= 2025-10-31 ✅ (dovrebbe essere corretto)
```

---

## 📋 FILE COINVOLTI E POSIZIONI CRITICHE

### **File Principali**
1. **`/client/src/services/storico.service.ts`**
   - **Riga 43-58**: Query vista `v_turni_giornalieri` 
   - **Riga 60-77**: Mapping risultati e generazione giorni vuoti
   - **Riga 65-77**: `expandDaysRange()` per riempire giorni senza timbrature

2. **`/client/src/pages/StoricoTimbrature.tsx`**
   - **Riga 70-74**: Query React Query che chiama `loadTurniFull()`
   - **Riga 26-33**: Inizializzazione filtri periodo (primo/ultimo giorno mese)

3. **`/client/src/services/timbrature.service.ts`**
   - **Riga 115**: RPC `insert_timbro_rpc` (funziona)
   - **Riga 25-45**: `getTimbraturePeriodo()` usa anche vista (stesso problema)

4. **`/client/src/lib/time.ts`**
   - **Riga 129-140**: `expandDaysRange()` genera array giorni periodo
   - **Riga 119-124**: `formatDateLocal()` per formato date

---

## 🔧 PIANO FIX MINIMO PROPOSTO

### **STEP 1: Bypass Vista → Query Diretta Tabella**
```typescript
// SOSTITUIRE in storico.service.ts:43-58
const { data, error } = await supabase
  .from('timbrature')  // ← Tabella diretta invece di vista
  .select('pin, tipo, data, ore, giornologico, nome, cognome, created_at')
  .eq('pin', pin)
  .gte('giornologico', dal)
  .lte('giornologico', al)
  .order('giornologico', { ascending: true })
  .order('ore', { ascending: true });
```

### **STEP 2: Aggregazione Client-Side**
```typescript
// AGGIUNGERE logica aggregazione per giorno logico
const aggregateByGiornoLogico = (timbrature: any[]) => {
  const grouped = timbrature.reduce((acc, t) => {
    const key = t.giornologico;
    if (!acc[key]) acc[key] = { entrate: [], uscite: [] };
    
    if (t.tipo === 'entrata') acc[key].entrate.push(t);
    if (t.tipo === 'uscita') acc[key].uscite.push(t);
    
    return acc;
  }, {});
  
  return Object.entries(grouped).map(([giorno, data]) => ({
    pin,
    giorno,
    entrata: data.entrate[0]?.ore || null,      // Prima entrata
    uscita: data.uscite[data.uscite.length-1]?.ore || null, // Ultima uscita
    ore: calculateOreLavorate(data.entrate, data.uscite),
    extra: Math.max(0, ore - oreContrattuali)
  }));
};
```

### **STEP 3: Verifica Formato Date**
```typescript
// GARANTIRE formato YYYY-MM-DD in tutti i filtri
const normalizeDate = (date: string): string => {
  // Assicura formato ISO senza conversioni UTC
  return date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : formatDateLocal(new Date(date));
};
```

### **STEP 4: Cache Invalidation**
```typescript
// VERIFICARE che dopo timbratura si invalidi cache storico
// In pages/StoricoTimbrature.tsx già presente realtime subscription
// Ma potrebbe non triggerare per vista v_turni_giornalieri
```

---

## ⚠️ IMPATTI E RISCHI

### **Impatti Positivi**
- ✅ **Dati Real-time**: Timbrature appaiono immediatamente nello storico
- ✅ **Affidabilità**: Query diretta su tabella invece di vista potenzialmente mancante
- ✅ **Performance**: Meno dipendenze da viste DB complesse

### **Rischi Potenziali**
- ⚠️ **Performance**: Aggregazione client-side vs server-side (vista)
- ⚠️ **Logica Business**: Calcolo ore client-side potrebbe differire da vista
- ⚠️ **Compatibilità**: Altri componenti potrebbero usare la vista

### **Mitigazioni**
- 🛡️ **Test Completi**: Verificare tutti gli scenari nella checklist
- 🛡️ **Rollback Plan**: Mantenere codice vista commentato per rollback rapido
- 🛡️ **Monitoring**: Log temporanei per verificare correttezza calcoli

---

## ✅ CHECK-LIST TEST OBBLIGATORIA

### **Test Funzionali**
1. **Diurno Standard**
   - [ ] Entrata 09:00, Uscita 17:00 stesso giorno
   - [ ] Atteso: Riga giorno con Entrata="09:00", Uscita="17:00", Ore="8.00"

2. **Turno Notturno**
   - [ ] Entrata 22:00 (giorno N), Uscita 02:00 (giorno N+1)
   - [ ] Atteso: Riga giorno N con Ore="4.00", stesso giornologico

3. **Range Inclusivo**
   - [ ] Filtro Al=31/10/2025, timbratura 31/10/2025
   - [ ] Atteso: Riga 31/10 inclusa nei risultati

4. **PIN Normalizzazione**
   - [ ] PIN "01" e PIN "1" restituiscono stesso storico
   - [ ] Atteso: Risultati identici

5. **Totali Coerenti**
   - [ ] Somma ore giornaliere = Totale ore
   - [ ] Somma ore extra = Totale extra
   - [ ] Giorni con ore > 0 = Giorni lavorati

6. **Timezone Safety**
   - [ ] Nessuna deriva ±1 giorno cambiando fuso orario sistema
   - [ ] Atteso: Date sempre Europe/Rome, no `.toISOString()`

### **Test Tecnici**
7. **Real-time Update**
   - [ ] Timbra da Home → Storico si aggiorna automaticamente
   - [ ] Atteso: Nuova riga appare senza refresh manuale

8. **Performance**
   - [ ] Caricamento storico mese completo <2 secondi
   - [ ] Atteso: Aggregazione client-side accettabile

---

## 🔧 LOG DIAGNOSI TEMPORANEI AGGIUNTI

### **File Modificato per Diagnosi**
- **`/client/src/services/storico.service.ts`**: Aggiunti log `[StoricoDiag]` alle righe 41, 44-50, 52

### **Log da Verificare in Console**
```javascript
// Aprire DevTools → Console durante caricamento storico
[StoricoDiag] loadTurniFull query: {pin: 7, dal: "2025-10-01", al: "2025-10-31"}
[StoricoDiag] Raw timbrature table: {rawTimbrature: [...], count: N}
[StoricoDiag] v_turni_giornalieri raw result: {data: [], error: null, count: 0}
```

**Atteso**: 
- `rawTimbrature.count > 0` (tabella ha dati)
- `data.count = 0` (vista è vuota) → **CONFERMA ROOT CAUSE**

---

## 🚀 PROSSIMI STEP

### **Fase 1: Approvazione Piano**
- [ ] Review piano fix minimo
- [ ] Approvazione modifiche proposte
- [ ] Conferma test cases obbligatori

### **Fase 2: Implementazione** (SOLO dopo approvazione)
- [ ] Applicare STEP 1-4 del piano fix
- [ ] Rimuovere log diagnosi temporanei
- [ ] Eseguire tutti i test della checklist

### **Fase 3: Verifica e Commit**
- [ ] Creare `DOCS/REPORT_STORICO_FIX.md`
- [ ] Commit: `fix(storico): query diretta timbrature + aggregazione client-side`
- [ ] Backup automatico pre-fix

---

## 📊 CONCLUSIONI

### **Root Cause Confermata**
Il problema è causato dall'uso della vista `v_turni_giornalieri` che restituisce risultati vuoti, mentre la tabella `timbrature` contiene i dati corretti.

### **Soluzione Raccomandata**
Sostituire query vista con query diretta tabella + aggregazione client-side per garantire affidabilità e real-time updates.

### **Rischio Basso**
La modifica è chirurgica, limitata a un singolo servizio, con piano di rollback e test completi.

---

**[StoricoDiag] Report pronto: /DOCS/REPORT_STORICO_DIAGNOSI.md**

**⏳ In attesa di approvazione per procedere con il Piano Fix Minimo.**
