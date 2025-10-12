# 🚨 REPORT PROBLEMA TIMBRATURE - BadgeNode

**Data**: 2025-10-12  
**Versione**: Analisi completa  
**Gravità**: CRITICA - Sistema non funzionante

---

## 📋 SINTESI DEL PROBLEMA

### **Problema Principale**

L'applicazione BadgeNode presenta **DUE PROBLEMI CRITICI**:

1. **❌ VALIDAZIONE PIN ASSENTE**: Qualsiasi PIN viene accettato, anche se non esiste nella tabella `utenti`
2. **❌ TIMBRATURE NON REGISTRATE**: I record non vengono salvati correttamente in Supabase

### **Evidenze dai Log**

Dall'immagine fornita si osservano errori ripetuti:

- `timbrature-sync-Ds4J4x-R.js:1` - Errori nel sistema di sincronizzazione
- Timbrature per PIN inesistenti (es. PIN 1, 5, 9) che dovrebbero essere rifiutate
- Solo PIN 01 dovrebbe essere valido secondo la configurazione

---

## 🔍 ANALISI TECNICA DETTAGLIATA

### **1. FLUSSO TIMBRATURE ATTUALE**

```typescript
// client/src/pages/Home.tsx (righe 65-91, 93-119)
const handleEntrata = async () => {
  // ❌ PROBLEMA: Nessuna validazione PIN prima dell'invio
  const pinNumber = Number(pin);
  const id = await TimbratureService.timbra(pinNumber, 'entrata');
};
```

**PROBLEMA**: Il codice non verifica se il PIN esiste nella tabella `utenti` prima di tentare la timbratura.

### **2. SISTEMA DI SINCRONIZZAZIONE**

```typescript
// client/src/services/timbrature-insert.adapter.ts (righe 92-106)
const { data, error } = await supabase.from('timbrature').insert([
  {
    pin: ev.pin, // ❌ PIN non validato
    tipo: ev.tipo,
    // ... altri campi
  },
]);
```

**PROBLEMA**: L'adapter inserisce direttamente nella tabella `timbrature` senza usare la RPC `insert_timbro_v2` che contiene la validazione PIN.

### **3. VALIDAZIONE PIN MANCANTE**

La RPC `insert_timbro_v2` contiene la validazione corretta:

```sql
-- supabase/migrations/20251009T2300__create_insert_timbro_v2.sql (righe 52-56)
if not exists (select 1 from public.utenti where utenti.pin = p_pin) then
  raise exception 'PIN % inesistente', p_pin
  using errcode = 'P0002';
end if;
```

**PROBLEMA**: Questa validazione non viene mai eseguita perché il codice client bypassa la RPC.

---

## 🎯 CAUSE ROOT DEL PROBLEMA

### **Causa 1: Architettura Inconsistente**

- **RPC disponibile**: `insert_timbro_v2` con validazione completa
- **Codice client**: Usa INSERT diretto sulla tabella, bypassando la RPC
- **Risultato**: Validazioni business logic ignorate

### **Causa 2: Sistema Offline-First Mal Implementato**

```typescript
// client/src/services/timbrature-insert.adapter.ts
// Il sistema tenta di essere "offline-first" ma:
// 1. Non valida i dati localmente
// 2. Non usa le RPC server-side
// 3. Inserisce dati non validati
```

### **Causa 3: Mancanza di Validazione Client-Side**

```typescript
// client/src/pages/Home.tsx
// Nessun controllo se PIN esiste prima dell'invio:
const pinNumber = Number(pin); // ❌ Converte qualsiasi stringa
await TimbratureService.timbra(pinNumber, 'entrata'); // ❌ Invia senza validare
```

---

## 🔧 SOLUZIONI PROPOSTE

### **SOLUZIONE 1: Fix Immediato (Raccomandato)**

**A. Sostituire INSERT diretto con RPC call**

```typescript
// Modificare: client/src/services/timbrature-insert.adapter.ts (riga 93-106)
// PRIMA (ERRATO):
const { data, error } = await supabase
  .from('timbrature')
  .insert([{ pin: ev.pin, tipo: ev.tipo, ... }])

// DOPO (CORRETTO):
const { data, error } = await supabase
  .rpc('insert_timbro_v2', {
    p_pin: ev.pin,
    p_tipo: ev.tipo
  })
```

**B. Aggiungere validazione client-side**

```typescript
// Aggiungere in: client/src/pages/Home.tsx (prima della riga 76)
// Validazione PIN esistente
const { data: utente } = await supabase.from('utenti').select('pin').eq('pin', pinNumber).single();

if (!utente) {
  setFeedback({ type: 'error', message: 'PIN non valido' });
  return;
}
```

### **SOLUZIONE 2: Refactoring Completo (Opzionale)**

**A. Creare servizio validazione PIN**

```typescript
// Nuovo file: client/src/services/utenti-validation.service.ts
export class UtentiValidationService {
  static async validatePIN(pin: number): Promise<boolean> {
    const { data } = await supabase.from('utenti').select('pin').eq('pin', pin).single();
    return !!data;
  }
}
```

**B. Integrare validazione nel flusso**

```typescript
// Modificare: client/src/pages/Home.tsx
const handleEntrata = async () => {
  const pinNumber = Number(pin);

  // Validazione PIN
  const isValid = await UtentiValidationService.validatePIN(pinNumber);
  if (!isValid) {
    setFeedback({ type: 'error', message: 'PIN non registrato' });
    return;
  }

  // Procedi con timbratura...
};
```

---

## 🚨 PROBLEMI SUPABASE IDENTIFICATI

### **1. Row Level Security (RLS)**

```json
// Test permissions: /api/utenti/test-permissions
{
  "permissions": {
    "read": true,
    "delete": false, // ❌ RLS blocca DELETE
    "deleteError": "permission denied for table utenti"
  }
}
```

**PROBLEMA**: RLS configurato correttamente per sicurezza, ma potrebbe bloccare operazioni legittime.

### **2. Configurazione Environment**

```typescript
// server/routes.ts - Configurazione OK
{
  "hasUrl": true,
  "hasAnon": true,
  "hasServiceRole": true  // ✅ Tutte le chiavi presenti
}
```

**STATUS**: Configurazione Supabase corretta.

---

## 📊 IMPATTO DEL PROBLEMA

### **Sicurezza**

- **CRITICO**: Chiunque può timbrare con qualsiasi PIN
- **CRITICO**: Dati non validati inseriti nel database
- **MEDIO**: Possibile spam di record non validi

### **Funzionalità**

- **CRITICO**: Sistema timbrature completamente non funzionante
- **ALTO**: Report storico contiene dati non validi
- **MEDIO**: Esperienza utente compromessa

### **Integrità Dati**

- **CRITICO**: Database contiene record con PIN inesistenti
- **ALTO**: Calcoli ore/extra basati su dati non validi
- **MEDIO**: Necessaria pulizia dati esistenti

---

## 🎯 PIANO DI RISOLUZIONE

### **FASE 1: Fix Critico (1-2 ore)**

1. **Sostituire INSERT diretto con RPC** in `timbrature-insert.adapter.ts`
2. **Aggiungere validazione PIN** in `Home.tsx`
3. **Testare con PIN valido/non valido**

### **FASE 2: Pulizia Dati (30 min)**

1. **Identificare record con PIN inesistenti**:
   ```sql
   SELECT * FROM timbrature t
   WHERE NOT EXISTS (
     SELECT 1 FROM utenti u WHERE u.pin = t.pin
   );
   ```
2. **Eliminare o correggere** record non validi

### **FASE 3: Test Completo (1 ora)**

1. **Test PIN valido**: Deve registrare timbratura
2. **Test PIN non valido**: Deve mostrare errore
3. **Test alternanza**: Entrata → Uscita → Entrata
4. **Test offline**: Coda e sync quando torna online

---

## 🔍 FILE DA MODIFICARE

### **Priorità ALTA (Fix Immediato)**

1. `client/src/services/timbrature-insert.adapter.ts` - Riga 93-106
2. `client/src/pages/Home.tsx` - Righe 65-91, 93-119

### **Priorità MEDIA (Miglioramenti)**

3. `client/src/services/timbrature.service.ts` - Aggiungere validazione
4. `client/src/components/home/PinDisplay.tsx` - Feedback visivo

### **Priorità BASSA (Refactoring)**

5. Nuovo file: `client/src/services/utenti-validation.service.ts`
6. `client/src/hooks/useTimbrature.ts` - Hook centralizzato

---

## 📝 CODICE ESATTO DA MODIFICARE

### **1. Fix Critico - timbrature-insert.adapter.ts**

```typescript
// SOSTITUIRE righe 93-106:
// DA:
const { data, error } = await supabase
  .from('timbrature')
  .insert([
    {
      pin: ev.pin,
      tipo: ev.tipo,
      created_at: ev.created_at,
      client_event_id: ev.client_event_id,
      data_locale: dataLocale,
      ora_locale: oraLocale,
      giorno_logico: giornoLogico,
      ts_order: ev.created_at,
    },
  ])
  .select()
  .single();

// A:
const { data, error } = await supabase.rpc('insert_timbro_v2', {
  p_pin: ev.pin,
  p_tipo: ev.tipo,
});
```

### **2. Fix Validazione - Home.tsx**

```typescript
// AGGIUNGERE dopo riga 74:
// Validazione PIN esistente
const { data: utente } = await supabase.from('utenti').select('pin').eq('pin', pinNumber).single();

if (!utente) {
  setFeedback({ type: 'error', message: 'PIN non registrato nel sistema' });
  setLoading(false);
  setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
  return;
}
```

---

## ✅ VERIFICA POST-FIX

### **Test Case 1: PIN Valido (01)**

- **Input**: PIN 01 + Entrata
- **Aspettato**: Timbratura registrata, messaggio successo
- **Verifica**: Record in tabella `timbrature`

### **Test Case 2: PIN Non Valido (99)**

- **Input**: PIN 99 + Entrata
- **Aspettato**: Errore "PIN non registrato", nessun record
- **Verifica**: Nessun nuovo record in `timbrature`

### **Test Case 3: Alternanza**

- **Input**: PIN 01 + Entrata, poi PIN 01 + Uscita
- **Aspettato**: Entrambe registrate correttamente
- **Verifica**: Due record con alternanza corretta

---

## 🏁 CONCLUSIONI

Il problema è **CRITICO** ma **FACILMENTE RISOLVIBILE** con le modifiche proposte. La causa principale è l'uso di INSERT diretto invece della RPC `insert_timbro_v2` che contiene tutta la logica di validazione.

**Tempo stimato per fix completo**: 2-3 ore  
**Impatto post-fix**: Sistema completamente funzionante e sicuro

**AZIONE IMMEDIATA RICHIESTA**: Implementare il Fix Critico nelle prossime ore per ripristinare la funzionalità del sistema.
