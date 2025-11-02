# 10 🔧 TROUBLESHOOTING - BadgeNode

**Risoluzione problemi post-implementazione offline e diagnostica avanzata**  
**Versione**: 5.1 • **Data**: 2025-11-02 • **Stato**: Enterprise Stable

---

## 📋 Contenuti

1. [Fix Sprint 10 (Nov 2025)](#fix-sprint-10-nov-2025) ⭐ NUOVO
2. [Overview Problematiche](#overview-problematiche)
3. [Fix Bootstrap Offline](#fix-bootstrap-offline)
4. [Fix Validazione PIN](#fix-validazione-pin)
5. [Fix Storico Timbrature](#fix-storico-timbrature)
6. [Diagnostica Environment](#diagnostica-environment)
7. [Sincronizzazione e Validazione](#sincronizzazione-e-validazione)

---

## ⭐ Fix Sprint 10 (Nov 2025)

### **1. Export PDF/Excel - Rules of Hooks Violation**

**Problema**: Click su pulsanti "Esporta PDF" e "Esporta Excel" non eseguiva azione.

**Causa**: `useStoricoExport` era un React Hook chiamato dentro callback async, violando Rules of Hooks.

**Soluzione**:
- Convertito `useStoricoExport` da hook a modulo di funzioni normali
- `export async function exportPDF({...})` e `exportXLS({...})`
- Mantenuto lazy-loading di `jspdf` e `exceljs`

**File modificati**:
- `client/src/hooks/useStoricoExport.ts`
- `client/src/hooks/useStoricoTimbrature.ts`

**Commit**: `9193754` (2025-11-02)

---

### **2. Formato Export - Ordinamento e Date**

**Problema**: Export mostrava date 31→1 (decrescente) e colonna Mese vuota.

**Soluzione**:
- Ordinamento 1→31 con `.sort((a, b) => a.giorno.localeCompare(b.giorno))`
- Colonna Data: `formatDataConGiorno()` → "01 Lunedì"
- Colonna Mese: `formatMeseAnno()` → "Ottobre 2025"

**File modificati**:
- `client/src/hooks/useStoricoExport.ts`

**Commit**: `122f40d` (2025-11-02)

---

### **3. Ore Contrattuali Non Modificabili**

**Problema**: Modifica "Ore max giornaliere da contratto" non veniva salvata.

**Causa**: Campi `email`, `telefono`, `ore_contrattuali`, `note` non esistevano nella tabella database.

**Soluzione**:
- Creata migration SQL: `20251102_add_utenti_extra_fields.sql`
- Aggiornato server GET/PUT per includere nuovi campi
- Aggiornato client per inviare campi modificabili
- Form UI ora permette modifica

**File modificati**:
- `supabase/migrations/20251102_add_utenti_extra_fields.sql` (NUOVO)
- `server/routes/modules/utenti.ts`
- `client/src/services/utenti.service.ts`
- `client/src/components/admin/FormModificaDipendente.tsx`

**Commit**: `0d65e5a` (2025-11-02)

**⚠️ Azione Richiesta**: Applicare migration manualmente su Supabase Dashboard

---

### **4. Form Modali - TypeScript Errors**

**Problema**: Errori console "Cannot read properties of undefined (reading 'control')" all'apertura modali.

**Causa**: Pulsante `type="submit"` fuori dal `<form>`, React cercava form control inesistente.

**Soluzione**:
- Spostato `<form>` per includere body + footer
- Pulsanti ora dentro il form
- Rimosso `onClick` duplicato

**File modificati**:
- `client/src/components/admin/ModaleModificaDipendente.tsx`
- `client/src/components/admin/ModaleNuovoDipendente.tsx`

**Commit**: `c5bf326` (2025-11-02)

---

## 🎯 Overview Problematiche

### **Problemi Identificati Post-Offline**
Dopo l'implementazione del sistema offline, sono emersi diversi problemi che hanno richiesto fix specifici:

1. **Pagina bianca all'avvio** con flag offline attivi
2. **Errori 500 su `/api/pin/validate`** per schema inconsistenti
3. **Storico Timbrature vuoto** per mancanza view database
4. **Mismatch environment** tra client e server
5. **Import circolari** nei moduli offline
6. **IndexedDB non disponibile** in modalità private

### **Approccio Fix**
- **Chirurgici**: Modifiche minime senza impatto su UI/UX
- **Backward Compatible**: Nessuna regressione su funzionalità esistenti
- **Offline Safe**: Tutti i fix mantengono compatibilità con modalità offline
- **Schema Agnostic**: Soluzioni robuste per variazioni schema database

---

## 🚨 Fix Bootstrap Offline

### **Problema: Pagina Bianca all'Avvio**

#### **Sintomi Riprodotti**
- Pagina bianca all'avvio in DEV con flag offline attivi
- Console errors:
  - `Uncaught ReferenceError: window is not defined`
  - `TypeError: Cannot read properties of undefined (reading '__BADGENODE_DIAG__')`
  - `Circular dependency detected` tra `featureFlags` ↔ `offline/*`
  - `DOMException: IDB is not available` (Private mode)

#### **Cause Radice**
- Accessi a `window/localStorage/IDB` eseguiti a livello top-level
- Import circolare: `config/featureFlags.ts` ↔ `offline/gating.ts`
- Bootstrap non protetto senza try/catch
- Assenza fallback quando IndexedDB non disponibile

#### **Correzioni Applicate**

##### **1. Rimozione Import Circolare**
```typescript
// PRIMA - client/src/config/featureFlags.ts
import { isDeviceAllowed } from '@/offline/gating';
import { getDeviceId } from '@/lib/deviceId';
export function isOfflineEnabled(): boolean { ... }

// DOPO - client/src/config/featureFlags.ts
// Solo ENV: FEATURE_OFFLINE_QUEUE/FEATURE_OFFLINE_BADGE
export function isOfflineBadgeEnabled(): boolean { ... }
```

```typescript
// NUOVO - client/src/offline/gating.ts
import { isOfflineQueueEnabled } from '@/config/featureFlags';
export function isOfflineEnabled(deviceId?: string): boolean {
  if (!isOfflineQueueEnabled()) return false;
  return isDeviceAllowed(deviceId ?? '');
}
```

##### **2. Bootstrap Protetto**
```typescript
// client/src/main.tsx
if (import.meta.env.DEV) {
  (async () => {
    try {
      const [{ isOfflineEnabled }, { getDeviceId }] = await Promise.all([
        import('./offline/gating'),
        import('./lib/deviceId'),
      ]);
      const enabled = isOfflineEnabled(getDeviceId());
      if (enabled) {
        void import('./offline/diagnostic').then((m) => m.installOfflineDiagnostics());
        void import('./offline/syncRunner').then((m) => m.installSyncTriggers());
        const { isOfflineBadgeEnabled } = await import('./config/featureFlags');
        if (isOfflineBadgeEnabled()) setTimeout(() => {
          void import('./offline/OfflineBadge').then((m) => m.mountOfflineBadge());
        }, 0);
      }
    } catch (e) { 
      console.debug('[offline:bootstrap] skipped:', (e as Error)?.message); 
    }
  })();
}
```

##### **3. IndexedDB Fallback**
```typescript
// client/src/offline/idb.ts
function hasIDB(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

const memDB = { timbri_v1: [] };

// Fallback in-memory per add/put/getAll/count/delete quando IDB non disponibile
if (!hasIDB()) {
  // Implementazione fallback in-memory
}
```

#### **Verifiche Post-Fix**
- ✅ Dev server avvia senza pagina bianca
- ✅ Nessun accesso a `window`/`localStorage` top-level
- ✅ Nessun import circolare rilevato
- ✅ Offline bootstrap caricato solo in DEV e quando whitelisted
- ✅ Fallback in-memory funzionante in Private mode

---

## 🔑 Fix Validazione PIN

### **Problema: Schema-Agnostic PIN Validation**

#### **Root Cause**
- La rotta `/api/pin/validate` selezionava `utenti.id`, ma nel progetto corrente la colonna non esiste
- Errore: `column utenti.id does not exist` → 500 `QUERY_ERROR`

#### **Fix Implementato**

##### **Server - Schema-Agnostic Query**
```typescript
// server/routes/modules/other.ts
router.get('/api/pin/validate', async (req, res) => {
  const { pin } = req.query;
  
  try {
    // Lookup schema-agnostico selezionando solo 'pin'
    const { data, error } = await supabaseAdmin
      .from('utenti')
      .select('pin')
      .eq('pin', parseInt(pin as string))
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return res.status(404).json({ 
          success: false, 
          code: 'NOT_FOUND' 
        });
      }
      throw error;
    }

    return res.json({ 
      success: true, 
      ok: true, 
      user_key: pin, 
      pin: pin 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      code: 'QUERY_ERROR', 
      message: error.message 
    });
  }
});
```

##### **Client - Validazione Integrata**
```typescript
// client/src/services/timbrature.service.ts
export async function timbra(pin: string, tipo: 'entrata' | 'uscita'): Promise<TimbratureResult> {
  // Pre-validazione PIN solo in modalità online
  if (!isOfflineEnabled()) {
    try {
      const validateResponse = await fetch('/api/pin/validate?pin=' + pin);
      if (validateResponse.status === 404) {
        return { success: false, error: 'PIN non registrato' };
      }
    } catch (error) {
      // In caso di errore rete, prosegui con timbratura
    }
  }

  // Resto della logica timbratura...
}
```

#### **Esempi Risposta**

##### **200 OK - PIN Esistente**
```json
{
  "success": true,
  "ok": true,
  "user_key": "11",
  "pin": "11"
}
```

##### **404 Not Found - PIN Inesistente**
```json
{
  "success": false,
  "code": "NOT_FOUND"
}
```

##### **500 Query Error**
```json
{
  "success": false,
  "code": "QUERY_ERROR",
  "message": "Database error details"
}
```

#### **Test Validazione**
```bash
# PIN esistente
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=11"

# PIN inesistente  
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=999"
```

---

## 📊 Fix Storico Timbrature

### **Problema: Storico Vuoto e View Mancante**

#### **Sintomi**
- Pagina "Storico Timbrature" vuota
- API `/api/storico` risponde 500
- Log: `Could not find the table 'public.v_turni_giornalieri' in the schema cache`

#### **Root Cause**
- Query dipendeva dalla view `public.v_turni_giornalieri` non presente/migrata
- Assenza di fallback robusto in caso di errore view

#### **Fix Implementato**

##### **Fallback Robusto su Tabella Base**
```typescript
// server/routes/modules/other.ts
router.get('/api/storico', async (req, res) => {
  const requestId = generateRequestId();
  const { pin, dal, al } = req.query;

  // Validazione input
  if (!pin) {
    return res.status(400).json({
      success: false,
      error: 'Parametro PIN obbligatorio',
      code: 'MISSING_PARAMS',
      requestId
    });
  }

  try {
    // Tentativo con view ottimizzata
    const { data, error } = await supabaseAdmin
      .from('v_turni_giornalieri')
      .select('*')
      .eq('pin', parseInt(pin as string))
      .gte('giorno_logico', dal)
      .lte('giorno_logico', al)
      .order('giorno_logico', { ascending: false });

    if (!error) {
      return res.json({ success: true, data: data || [] });
    }

    // FALLBACK: Ricostruzione da tabella timbrature
    console.log(`[API][storico] View fallback for pin=${pin}, requestId=${requestId}`);
    
    const { data: timbrature } = await supabaseAdmin
      .from('timbrature')
      .select('pin, tipo, data, ore, giornologico, created_at')
      .eq('pin', parseInt(pin as string))
      .gte('giornologico', dal)
      .lte('giornologico', al)
      .order('giornologico', { ascending: false })
      .order('ore', { ascending: true });

    // Pairing Entrata/Uscita per giorno logico
    const grouped = groupByGiornoLogico(timbrature || []);
    const calculated = calculateOreExtra(grouped);

    return res.json({ success: true, data: calculated });

  } catch (error) {
    console.error(`[API][storico] Error: ${error.message}, requestId=${requestId}`);
    return res.status(500).json({
      success: false,
      error: 'Errore interno',
      code: 'INTERNAL_ERROR',
      requestId
    });
  }
});
```

##### **Algoritmo Pairing Entrata/Uscita**
```typescript
function groupByGiornoLogico(timbrature: any[]) {
  const groups = new Map();
  
  for (const t of timbrature) {
    const key = t.giornologico;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(t);
  }
  
  return Array.from(groups.entries()).map(([giorno, timbri]) => {
    // Ordina per ora locale
    timbri.sort((a, b) => a.ore.localeCompare(b.ore));
    
    let entrata = null;
    let uscita = null;
    let oreGiornaliere = 0;
    
    // Pairing sequenziale
    for (const timbro of timbri) {
      if (timbro.tipo === 'entrata' && !entrata) {
        entrata = timbro.ore;
      } else if (timbro.tipo === 'uscita' && entrata && !uscita) {
        uscita = timbro.ore;
        
        // Calcolo ore con gestione rollover notturno
        const minutiEntrata = timeToMinutes(entrata);
        let minutiUscita = timeToMinutes(uscita);
        
        if (minutiUscita < minutiEntrata) {
          minutiUscita += 24 * 60; // +24h per rollover
        }
        
        oreGiornaliere += (minutiUscita - minutiEntrata) / 60;
        entrata = null;
        uscita = null;
      }
    }
    
    return {
      pin: timbri[0].pin,
      giorno_logico: giorno,
      entrata: timbri.find(t => t.tipo === 'entrata')?.ore || null,
      uscita: timbri.filter(t => t.tipo === 'uscita').pop()?.ore || null,
      ore: Math.round(oreGiornaliere * 100) / 100,
      extra: Math.max(0, oreGiornaliere - 8), // Assumendo 8h contrattuali
      nome: '',
      cognome: '',
      ore_contrattuali: 8
    };
  });
}
```

#### **Validazione Input Rafforzata**
```typescript
// Validazione formato date
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (dal && !dateRegex.test(dal as string)) {
  return res.status(422).json({
    success: false,
    error: 'Formato data dal non valido (YYYY-MM-DD)',
    code: 'INVALID_DATE_FROM',
    requestId
  });
}
```

#### **Esempi Risposta Post-Fix**

##### **200 OK - Dati Presenti**
```json
{
  "success": true,
  "data": [
    {
      "pin": 11,
      "giorno_logico": "2025-10-06",
      "entrata": "10:02:00",
      "uscita": "18:30:00",
      "ore": 8.47,
      "extra": 0.47,
      "nome": "",
      "cognome": "",
      "ore_contrattuali": 8
    }
  ]
}
```

##### **200 OK - Nessun Dato**
```json
{
  "success": true,
  "data": []
}
```

##### **400 Bad Request**
```json
{
  "success": false,
  "error": "Parametro PIN obbligatorio",
  "code": "MISSING_PARAMS",
  "requestId": "abc123"
}
```

---

## 🔍 Diagnostica Environment

### **Problema: Mismatch Configurazione Supabase**

#### **Obiettivo**
Verificare che server e client puntino allo stesso progetto Supabase e diagnosticare errori di configurazione.

#### **Diagnostica Implementata**

##### **Server-Side Logging**
```typescript
// server/start.ts - Bootstrap logging
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log(`[ENV][server] prefix: ${supabaseUrl.slice(0, 20)} role: ${serviceKey ? 'service' : 'none'}`);
```

##### **Client-Side Diagnostica**
```typescript
// client/src/lib/supabaseClient.ts
if (import.meta.env.DEV) {
  const g = globalThis as any;
  g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
  g.__BADGENODE_DIAG__.supabase = {
    url: import.meta.env.VITE_SUPABASE_URL?.slice(0, 30) + '...',
    anonKeyPrefix: import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20) + '...'
  };
}
```

#### **Verifica Environment**

##### **DevTools Console**
```js
// Verifica configurazione client
window.__BADGENODE_DIAG__?.supabase
// → { url: "https://tutllgsjrbxkmrwseogz...", anonKeyPrefix: "eyJhbGciOiJIUzI1NiIs..." }

// Log prefix client
console.log('[ENV][client] prefix:', (import.meta.env.VITE_SUPABASE_URL||'').slice(0,20))
```

##### **Server Logs**
```
[ENV][server] prefix: https://tutllgsjrbxk role: service
```

#### **Interpretazione Diagnostica**

##### **ENV Mismatch**
- Prefissi server vs client differiscono
- **Soluzione**: Allineare `.env.local` per tutte le variabili
- **Azione**: Riavviare dev server

##### **Errore SQL**
- Prefissi uguali ma errori `table_check_error`/`query error`
- **Cause**: Schema non migrato, permessi, tabelle mancanti
- **Test**: `SELECT 1 FROM public.utenti LIMIT 1;` in Supabase SQL Editor

#### **Test Comandi**
```bash
# Validate PIN
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=11"

# Storico
curl -i "http://127.0.0.1:10000/api/storico?pin=11&dal=2025-10-01&al=2025-10-31"
```

---

## 🔄 Sincronizzazione e Validazione

### **Problema: Validazione PIN Inconsistente**

#### **Contesto**
- App stabile con offline Step 1-6 completati
- `/api/storico` risponde 200 con fallback robusto
- Tastierino mostrava "PIN non registrato" per PIN esistenti

#### **Diagnosi Completa**

##### **Environment Verification**
- ✅ ENV server: `[ENV][server] prefix: https://tutllgsjrbxk role: service`
- ✅ ENV client: Disponibile in `window.__BADGENODE_DIAG__.supabase`
- ✅ Prefissi coerenti → stesso progetto Supabase
- ❌ Schema: `public.utenti` privo di colonna `id`

#### **Fix Chirurgici Applicati**

##### **1. API PIN Validate Schema-Agnostic**
```typescript
// server/routes/modules/other.ts
router.get('/api/pin/validate', async (req, res) => {
  const { pin } = req.query;
  
  console.log(`[API][pin.validate] starting pin=${pin}`);
  
  try {
    // Selezione solo campo 'pin' (schema-agnostic)
    const { data, error } = await supabaseAdmin
      .from('utenti')
      .select('pin')
      .eq('pin', parseInt(pin as string))
      .single();

    if (error?.code === 'PGRST116') {
      console.log(`[API][pin.validate] not_found`);
      return res.status(404).json({ success: false, code: 'NOT_FOUND' });
    }
    
    if (error) {
      console.log(`[API][pin.validate] query_error:`, error.message);
      throw error;
    }

    console.log(`[API][pin.validate] ok`);
    return res.json({ 
      success: true, 
      ok: true, 
      user_key: pin, 
      pin: pin 
    });
  } catch (error) {
    console.log(`[API][pin.validate] query_error:`, error.message);
    return res.status(500).json({ 
      success: false, 
      code: 'QUERY_ERROR', 
      message: error.message 
    });
  }
});
```

##### **2. Client Integration con Offline Bypass**
```typescript
// client/src/services/timbrature.service.ts
export async function timbra(pin: string, tipo: 'entrata' | 'uscita'): Promise<TimbratureResult> {
  // Pre-validazione PIN solo in modalità online
  if (!isOfflineEnabled()) {
    try {
      const response = await fetch(`/api/pin/validate?pin=${pin}`);
      
      if (response.status === 404) {
        return { 
          success: false, 
          error: 'PIN non registrato' 
        };
      }
      
      if (!response.ok) {
        console.warn('[timbrature] PIN validation failed, proceeding anyway');
      }
    } catch (error) {
      console.debug('[timbrature] PIN validation error, proceeding offline');
    }
  }

  // Modalità offline: bypass validazione e procedi con enqueue
  if (isOfflineEnabled() && !navigator.onLine) {
    return await timbraOffline(pin, tipo);
  }

  // Timbratura online normale
  return await timbraOnline(pin, tipo);
}
```

#### **Esempi Request/Response**

##### **PIN Esistente**
```bash
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=11"
```
```json
{
  "success": true,
  "ok": true,
  "user_key": "11",
  "pin": "11"
}
```

##### **PIN Inesistente**
```bash
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=999"
```
```json
{
  "success": false,
  "code": "NOT_FOUND"
}
```

##### **Storico con Fallback**
```bash
curl -i "http://127.0.0.1:10000/api/storico?pin=11&dal=2025-10-01&al=2025-10-31"
```
```json
{
  "success": true,
  "data": [
    {
      "pin": 11,
      "giorno_logico": "2025-10-06",
      "entrata": "10:02:00",
      "uscita": null,
      "ore": 0,
      "extra": 0,
      "nome": "",
      "cognome": "",
      "ore_contrattuali": 8
    }
  ]
}
```

#### **Acceptance Finale**
- ✅ Client e server utilizzano stesso Supabase (prefissi coincidenti)
- ✅ `/api/pin/validate` restituisce 200/404 corretti
- ✅ Tastierino: PIN valido non mostra più "PIN non registrato" in online
- ✅ Offline: flusso enqueue invariato, bypass validazione
- ✅ `/api/storico` risponde sempre 200 con dati o array vuoto

---

## 🛠️ Utility e Helper

### **SafeFetch Enhancement**
```typescript
// client/src/lib/safeFetch.ts
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    // 4xx: Warning in DEV, return structured object
    if (response.status >= 400 && response.status < 500) {
      if (import.meta.env.DEV) {
        console.warn(`[safeFetch] ${response.status} ${response.statusText} for ${url}`);
      }
      
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        status: response.status,
        message: errorData.error || response.statusText,
        data: errorData
      };
    }
    
    // 5xx: Throw exception (blocking)
    if (response.status >= 500) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[safeFetch] Network error:', error);
    throw error;
  }
}
```

### **Request ID Generation**
```typescript
// server/utils/requestId.ts
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Usage in routes
const requestId = generateRequestId();
console.log(`[API][endpoint] Processing request ${requestId}`);
```

### **Time Utilities**
```typescript
// Conversion utilities per calcolo ore
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
}
```

---

## 📊 Checklist Validazione

### **Pre-Deploy Checklist**
- [ ] **Environment**: Prefissi server/client coincidenti
- [ ] **PIN Validation**: `/api/pin/validate` risponde 200/404 correttamente
- [ ] **Storico**: `/api/storico` fallback funzionante senza view
- [ ] **Offline Bootstrap**: Nessuna pagina bianca con flag attivi
- [ ] **IndexedDB Fallback**: Funzionamento in Private mode
- [ ] **Import Circolari**: Nessuna dipendenza circolare rilevata

### **Test Runtime**
```bash
# Health check
curl -i "http://127.0.0.1:10000/api/health"

# PIN validation
curl -i "http://127.0.0.1:10000/api/pin/validate?pin=11"

# Storico fallback
curl -i "http://127.0.0.1:10000/api/storico?pin=11&dal=2025-10-01&al=2025-10-31"
```

### **DevTools Verification**
```js
// Environment diagnostica
window.__BADGENODE_DIAG__

// Offline status
window.__BADGENODE_DIAG__.offline?.enabled

// Supabase config
window.__BADGENODE_DIAG__.supabase
```

---

## 🔍 Note Implementative

### **Principi Seguiti**
- **Zero Breaking Changes**: Nessuna regressione su funzionalità esistenti
- **Offline Compatible**: Tutti i fix mantengono compatibilità offline
- **Schema Agnostic**: Soluzioni robuste per variazioni schema
- **Graceful Degradation**: Fallback automatici per servizi non disponibili

### **File Modificati**
- `server/routes/modules/other.ts`: API endpoints e fallback
- `client/src/services/timbrature.service.ts`: Validazione PIN integrata
- `client/src/lib/safeFetch.ts`: Error handling migliorato
- `client/src/main.tsx`: Bootstrap offline protetto
- `client/src/config/featureFlags.ts`: Import circolari risolti
- `client/src/offline/gating.ts`: Logica gating centralizzata
- `client/src/offline/idb.ts`: Fallback IndexedDB

### **Nessun Impatto Su**
- ✅ UI/UX esistente
- ✅ Pipeline offline
- ✅ Schema database
- ✅ RLS policies
- ✅ Migrazioni esistenti

---

**Nota**: Tutti i fix sono stati implementati seguendo principi di robustezza e backward compatibility. Il sistema mantiene piena funzionalità sia in modalità online che offline, con graceful degradation per scenari edge case.

---

> **Documento consolidato dalla baseline Enterprise Stable (v1.0.0 — 2025-10-21)**  
> Autore: BadgeNode / Cascade AI

---

## ✅ Fix recenti (2025-10-25) — Stato Attuale

### 1) UI Glow e Sfondo Uniforme
- Rimosso bagliore viola su pagine Archivio Dipendenti e Storico Timbrature.
- Uniformato sfondo a gradiente `linear-gradient(135deg, #1a1a2e → #16213e → #0f3460)`.
- Header tabelle resi opachi (`bn-solid-surface`, `bn-sticky-head`).

File rilevanti:
- `client/src/pages/ArchivioDipendenti.tsx` (boxShadow: none; bg gradient)
- `client/src/pages/StoricoTimbrature.tsx` (boxShadow: none; rimozione shadow-2xl)
- `client/src/styles/badgenode.css` (header opachi)

### 2) Timbratura — Eliminazione "successi fantasma"
- La UI mostra successo solo se il server scrive veramente (presenza `data.id`).
- Enforced POST sempre per Entrata/Uscita; niente ottimismo.
- Errori surfacizzati con `code` (es. `ALTERNANZA_INVALIDA`).

File rilevanti:
- `client/src/services/timbratureRpc.ts` (success solo con id; propagazione code)
- `client/src/services/timbrature.service.ts` (`timbra` ritorna `{ ok, code, message, id }`; validatePinApi no-store + fallback)
- `client/src/pages/Home/components/TimbratureActions.tsx` (await esito; toast verde solo su `ok===true`)

### 3) Validazione PIN — Cache e Formato Risposta
- `validatePinApi` ora usa `cache: 'no-store'` per evitare 304/risposte cached.
- Supporto a risposte sia wrappate (`data.ok`) sia flat (`ok`).
- In caso di errore rete → non blocca (lasciare la timbratura gestire fallback/offline).

Endpoint server:
- `GET /api/pin/validate` schema-agnostico (`select('pin')` su `public.utenti`).

### 4) Storico — Fallback Robusto
- `GET /api/storico` tenta view `v_turni_giornalieri` e fallback su tabella `timbrature` con pairing sequenziale.

### 5) Dev Server e Proxy
- Dev server Express in esecuzione su porta 10000 (proxy per preview IDE).
- Se il proxy non carica: verificare che il server sia attivo e rilanciare `npm run dev`.

---

## 🔁 Checklist Rapida Post-Fix
- [x] POST `/api/timbrature` parte su Entrata/Uscita (Network → 200 o 4xx con code).
- [x] Nessun toast verde se `ok!==true`.
- [x] PIN valido non mostra più "PIN non registrato" salvo 404 reali.
- [x] Glow cornici rimosso; header opachi; sfondi uniformi.
- [x] Dev server stabile su `:10000`.
