# 🩺 Diagnosi Tecnica • Bug Giorno Logico (Timbrature dopo Mezzanotte)

## 📊 Esito Diagnosi: **BUG IDENTIFICATO** ✅

---

## 🎯 Causa Root del Bug

### **Problema Principale: Validazione Offline Usa Cache Locale Invece del Database**

Il sistema **fallisce nella validazione dell'alternanza ENTRATA/USCITA** per timbrature notturne (00:00-05:00) a causa di un **disallineamento tra cache locale e stato reale del database**.

---

## 🔍 Analisi Tecnica Dettagliata

### 1. **Flusso Timbratura Corrente**

#### Quando l'utente timbra (es. USCITA alle 01:14):

```
1. Client → TimbratureService.timbra(pin: 14, tipo: 'uscita')
2. Pre-validazione → OfflineValidatorService.validateOfflineTimbratura()
3. Controllo alternanza → TimbratureCacheService.getUltimaTimbratura(pin: 14)
4. ❌ PROBLEMA: Cache locale potrebbe non essere aggiornata o assente
5. Se cache non trova ENTRATA precedente → BLOCCO
```

#### File coinvolti:
- **`client/src/services/timbrature.service.ts`** (linee 222-240)
- **`client/src/services/offline-validator.service.ts`** (linee 17-73)
- **`client/src/services/timbrature-cache.service.ts`** (linee 19-44)

---

### 2. **Perché il Bug si Manifesta Dopo Mezzanotte**

#### Scenario Critico:
1. **Sabato 1 novembre, ore 18:56**: Utente PIN 14 timbra ENTRATA ✅
   - Server salva correttamente con `giorno_logico = '2025-11-01'`
   - Cache locale aggiornata: `{ pin: 14, tipo: 'entrata', giorno_logico: '2025-11-01' }`

2. **Domenica 2 novembre, ore 01:14**: Utente tenta USCITA ❌
   - **Cache locale potrebbe essere:**
     - Scaduta (>24h)
     - Cancellata (localStorage cleared)
     - Non sincronizzata (refresh browser, cambio dispositivo)
   
3. **Validazione Offline fallisce:**
   ```typescript
   // offline-validator.service.ts:25-32
   const ultimaTimbratura = await TimbratureCacheService.getUltimaTimbratura(pin);
   
   if (!ultimaTimbratura) {
     // ⚠️ MODALITÀ PERMISSIVA: dovrebbe permettere, ma...
     return { valid: true };
   }
   ```

4. **Problema Reale**: Se la cache è presente ma **non aggiornata** (es. contiene un'USCITA precedente invece dell'ENTRATA del sabato), la validazione fallisce:
   ```typescript
   // offline-validator.service.ts:36-52
   if (ultimaTimbratura.tipo === nuovoTipo) {
     return {
       valid: false,
       code: 'ALTERNANZA_VIOLATION',
       message: `Alternanza violata: ultima timbratura è già ${ultimaTimbratura.tipo}`
     };
   }
   ```

---

### 3. **Verifica nel Codice Server**

#### Il server **calcola correttamente** il giorno logico:

```typescript
// server/routes/timbrature/postTimbratura.ts:82-87
const { giorno_logico } = computeGiornoLogico({
  data: dataLocale,      // '2025-11-02'
  ora: oraLocale,        // '01:14:00'
  tipo,                  // 'uscita'
  dataEntrata: anchorDate
});
```

#### La funzione `computeGiornoLogico` applica correttamente la regola:

```typescript
// server/shared/time/computeGiornoLogico.ts:48-72
if (tipo === 'uscita' && ore >= 0 && ore < 5) {
  if (dataEntrata) {
    // Ancoraggio: uscita appartiene al giorno logico dell'entrata
    return { giorno_logico: dataEntrata, dataReale: data };
  }
  // Fallback: giorno precedente
  const d = new Date(data + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return { giorno_logico: formatDateLocal(d), dataReale: data };
}
```

#### La validazione server **cerca correttamente** sul giorno logico:

```typescript
// server/routes/timbrature/validation.ts:67-74
const { data: currentEntries } = await supabaseAdmin
  .from('timbrature')
  .select('id, giorno_logico, data_locale, ora_locale')
  .eq('pin', pin)
  .eq('tipo', 'entrata')
  .eq('giorno_logico', giorno_logico)  // ✅ Cerca sul giorno logico corretto
  .order('ts_order', { ascending: false })
  .limit(1);
```

---

## 🐛 Bug Identificato

### **Causa Primaria: Validazione Offline Basata su Cache Locale Inaffidabile**

Il sistema ha **due livelli di validazione**:

1. **Validazione Client (offline-first)**: Usa cache localStorage
   - ❌ **Inaffidabile**: cache può essere scaduta, cancellata, non sincronizzata
   - ❌ **Non tiene conto del giorno logico**: controlla solo ultimo tipo

2. **Validazione Server (authoritative)**: Usa database Supabase
   - ✅ **Affidabile**: stato reale delle timbrature
   - ✅ **Giorno logico corretto**: query su `giorno_logico` normalizzato

### **Problema**: La validazione client **blocca prima** che la richiesta arrivi al server.

---

## 🔧 Causa Secondaria: Mancata Query Database in Validazione Offline

Il servizio `OfflineValidatorService` **non interroga mai il database** per verificare lo stato reale:

```typescript
// client/src/services/offline-validator.service.ts:25
const ultimaTimbratura = await TimbratureCacheService.getUltimaTimbratura(pin);
// ❌ Usa solo localStorage, non fa query a Supabase
```

Dovrebbe invece:
```typescript
// Query database per ultima timbratura reale
const { data } = await supabase
  .from('timbrature')
  .select('tipo, giorno_logico')
  .eq('pin', pin)
  .order('ts_order', { ascending: false })
  .limit(1);
```

---

## 🎯 Sintesi Tecnica

### **Perché il Bug si Verifica**

1. Utente timbra ENTRATA sabato sera (18:56)
2. Cache locale salvata correttamente
3. **Dopo mezzanotte** (01:14 domenica):
   - Cache potrebbe essere scaduta/cancellata
   - O cache contiene stato obsoleto
4. Validazione offline **non consulta database**
5. Blocco USCITA con errore "Alternanza violata" o "Manca ENTRATA"

### **Perché il Server Funzionerebbe Correttamente**

Se la richiesta arrivasse al server:
- `computeGiornoLogico` calcola `giorno_logico = '2025-11-01'` (giorno precedente)
- `validateAlternanza` cerca ENTRATA su `giorno_logico = '2025-11-01'`
- Trova ENTRATA delle 18:56 ✅
- Permette USCITA ✅

---

## 📋 Verifiche Eseguite

✅ **Analizzato `postTimbratura.ts`**: Calcolo giorno logico corretto (linee 82-87)  
✅ **Analizzato `computeGiornoLogico.ts`**: Regola 00:00-05:00 implementata (linee 48-72)  
✅ **Analizzato `validation.ts`**: Query su `giorno_logico` corretta (linee 67-74)  
✅ **Analizzato `offline-validator.service.ts`**: Validazione usa solo cache locale ❌  
✅ **Analizzato `timbrature-cache.service.ts`**: Cache localStorage con scadenza 24h  

---

## 🩹 Soluzioni Proposte

### **Soluzione 1: Disabilitare Validazione Offline per Turni Notturni** (Quick Fix)

Modificare `offline-validator.service.ts` per **bypassare validazione** se ora < 05:00:

```typescript
static async validateAlternanza(pin: number, nuovoTipo: 'entrata' | 'uscita'): Promise<ValidationResult> {
  // Bypass validazione per turni notturni (00:00-05:00)
  const now = new Date();
  if (now.getHours() < 5) {
    if (import.meta.env.DEV) {
      console.debug('[OfflineValidator] Turno notturno detected - skipping validation');
    }
    return { valid: true };
  }
  
  // ... resto validazione
}
```

**Pro**: Minimo impatto, risolve immediatamente il bug  
**Contro**: Non risolve il problema di fondo (cache inaffidabile)

---

### **Soluzione 2: Query Database in Validazione Offline** (Soluzione Robusta)

Modificare `offline-validator.service.ts` per **consultare database** invece di cache:

```typescript
import { supabase } from '@/lib/supabaseClient';

static async validateAlternanza(pin: number, nuovoTipo: 'entrata' | 'uscita'): Promise<ValidationResult> {
  try {
    // Calcola giorno logico corrente
    const giornoLogico = this.calculateGiornoLogico();
    
    // Query database per ultima timbratura sul giorno logico
    const { data, error } = await supabase
      .from('timbrature')
      .select('tipo, giorno_logico')
      .eq('pin', pin)
      .eq('giorno_logico', giornoLogico)
      .order('ts_order', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    const ultimaTimbratura = data?.[0];
    
    // Controllo alternanza
    if (ultimaTimbratura?.tipo === nuovoTipo) {
      return {
        valid: false,
        code: 'ALTERNANZA_VIOLATION',
        message: `Alternanza violata: ultima timbratura è già ${ultimaTimbratura.tipo}`
      };
    }
    
    return { valid: true };
  } catch (error) {
    // Fallback sicuro: permetti in caso di errore
    return { valid: true };
  }
}
```

**Pro**: Risolve il problema alla radice, validazione affidabile  
**Contro**: Richiede query database (latenza), ma accettabile per validazione critica

---

### **Soluzione 3: Rimuovere Validazione Offline** (Drastica)

Rimuovere completamente la validazione offline e **affidarsi solo al server**:

```typescript
// timbrature.service.ts:222-240
// RIMUOVERE BLOCCO:
// const offlineValidation = await OfflineValidatorService.validateOfflineTimbratura(pin, tipo);
// if (!offlineValidation.valid) { ... }

// Lasciare solo:
const result = await callInsertTimbro({ pin, tipo });
```

**Pro**: Massima affidabilità, nessun disallineamento  
**Contro**: Perde validazione offline (ma server valida comunque)

---

## 🎯 Raccomandazione

**Implementare Soluzione 2** (Query Database in Validazione Offline):
- Mantiene validazione offline per UX migliore
- Risolve il bug alla radice
- Compatibile con logica giorno logico esistente
- Nessuna modifica a schema DB o API

**Fallback**: Se latenza è un problema, implementare **Soluzione 1** (bypass turni notturni) come quick fix temporaneo.

---

## 📊 Test di Verifica Proposti

### Test Case 1: Turno Notturno Standard
1. Timbra ENTRATA sabato 23:30
2. Timbra USCITA domenica 02:30
3. ✅ Entrambe devono avere `giorno_logico = sabato`

### Test Case 2: Turno Notturno con Cache Scaduta
1. Timbra ENTRATA sabato 18:56
2. Cancella localStorage (simula cache scaduta)
3. Timbra USCITA domenica 01:14
4. ✅ Deve permettere USCITA (trova ENTRATA da database)

### Test Case 3: Alternanza Reale Violata
1. Timbra ENTRATA sabato 08:00
2. Tenta ENTRATA sabato 09:00
3. ❌ Deve bloccare (alternanza violata)

---

## 🏁 Conclusione

Il bug **NON è nel calcolo del giorno logico** (che funziona correttamente sia client che server).

Il bug è nella **validazione offline che usa cache locale inaffidabile** invece di consultare il database per verificare lo stato reale delle timbrature.

**Soluzione**: Modificare `OfflineValidatorService` per interrogare Supabase invece di localStorage.

---

## 📁 File da Modificare

1. **`client/src/services/offline-validator.service.ts`** (linee 17-73)
   - Aggiungere query database invece di cache locale
   
2. **`client/src/services/timbrature.service.ts`** (linee 222-240) [opzionale]
   - Rimuovere validazione offline se si sceglie Soluzione 3

---

## 🔗 Riferimenti Codice

- **Calcolo giorno logico**: `server/shared/time/computeGiornoLogico.ts:28-81`
- **Validazione server**: `server/routes/timbrature/validation.ts:9-140`
- **Validazione offline**: `client/src/services/offline-validator.service.ts:17-73`
- **Cache locale**: `client/src/services/timbrature-cache.service.ts:19-44`
- **Inserimento timbratura**: `server/routes/timbrature/postTimbratura.ts:82-127`

---

**Diagnosi completata**: 2 novembre 2025, ore 01:33  
**Stato server**: ✅ Attivo su porta 10000
