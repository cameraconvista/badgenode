# REPORT TEST OFFLINE SIMULATO — BadgeNode Offline Queue

**Data**: 28 Ottobre 2025, 00:20 UTC+01:00  
**Versione**: Enterprise Stable v5.0  
**Commit**: f3aeca4  
**Test Type**: Offline Simulation (VITE_FORCE_OFFLINE)  
**Analista**: Cascade AI  

---

## Sommario Esecutivo

### Obiettivo Test
Verificare end-to-end la funzionalità **Offline Queue** (enqueue on error + flush on reconnect) senza disconnessione fisica, usando simulazione con flag `VITE_FORCE_OFFLINE=true`.

### Configurazione Test
- **Backend**: ✅ Attivo su porta 10000
- **Vite Dev**: ✅ Attivo su porta 5173  
- **Flag Offline**: ✅ `VITE_FORCE_OFFLINE=true` in .env.local
- **Simulazione**: ✅ Errore "Failed to fetch (simulated offline)" in safeFetchJson

---

## Fase 1: Setup e Configurazione

### Modifiche Temporanee Applicate

#### 1. Flag Environment (.env.local)
```ini
VITE_FORCE_OFFLINE=true
```

#### 2. Simulazione Offline (client/src/lib/safeFetch.ts)
```typescript
export async function safeFetchJson<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResponse<T>> {
  // TEMPORARY: Simulate offline for testing
  if (import.meta.env.VITE_FORCE_OFFLINE === 'true') {
    throw new Error('Failed to fetch (simulated offline)');
  }
  
  // ... resto del codice normale
}
```

### Stato Iniziale Sistema

#### Environment Variables
- **VITE_FORCE_OFFLINE**: ✅ `true` (attivo)
- **VITE_FEATURE_OFFLINE_QUEUE**: ✅ Configurato
- **VITE_OFFLINE_DEVICE_WHITELIST**: ✅ Configurato

#### Server Status
- **Backend Express**: ✅ Porta 10000 attiva
- **Vite Dev Server**: ✅ Porta 5173 attiva
- **Browser Preview**: ✅ http://127.0.0.1:60629

---

## Fase 2: Test Offline Simulation

### Script di Test Preparato
File: `test_offline_simulation.js`
- Funzioni diagnostiche automatiche
- Verifica stato queue pre/post errore
- Controllo flush dopo riconnessione

### Istruzioni Test Manuale

#### Step 1: Verifica Diagnostica Iniziale
```javascript
// Eseguire in console browser
await window.__BADGENODE_DIAG__.offline.queueCount();
await window.__BADGENODE_DIAG__.offline.peekLast();
```

**Risultato Atteso**: Queue vuota (count: 0)

#### Step 2: Simulazione Timbratura Offline
1. Navigare alla pagina principale BadgeNode
2. Inserire PIN valido (es: 16)
3. Cliccare pulsante "ENTRATA"
4. Osservare errore di rete simulato in console
5. Verificare accodamento in offline queue

**Errore Atteso**: `Failed to fetch (simulated offline)`

#### Step 3: Verifica Queue Popolata
```javascript
// Dopo timbratura fallita
await window.__BADGENODE_DIAG__.offline.queueCount(); // Atteso: 1
await window.__BADGENODE_DIAG__.offline.peekLast();   // Atteso: item con PIN
```

---

## Fase 3: Test Riconnessione e Flush

### Disattivazione Flag Offline

#### 1. Modifica .env.local
```ini
VITE_FORCE_OFFLINE=false
```

#### 2. Riavvio Vite Dev Server
```bash
pkill -f "vite"
npm run dev:client
```

### Verifica Flush Automatico

#### Test Sync Runner
```javascript
// Dopo riconnessione
await window.__BADGENODE_DIAG__.offline.queueCount(); // Atteso: 0
```

**Comportamento Atteso**: 
- Sync runner rileva riconnessione
- Processa item in queue
- Invia a backend via RPC
- Rimuove item da queue
- Queue count torna a 0

---

## Log e Diagnostici

### Console Output (Fase Offline)

**ATTESA ESECUZIONE MANUALE**
```
[Qui verranno inseriti i log della console durante il test]
```

### Console Output (Fase Riconnessione)

**ATTESA ESECUZIONE MANUALE**
```
[Qui verranno inseriti i log del flush automatico]
```

### Stato Queue - Timeline

| Momento | Queue Count | Ultimo Item | Status |
|---------|-------------|-------------|--------|
| Iniziale | 0 | null | ✅ Vuota |
| Post-Error | ? | ? | ⏳ Da verificare |
| Post-Flush | ? | ? | ⏳ Da verificare |

---

## Risultati Test

### ✅ Successi
- **Setup**: Flag offline configurato correttamente
- **Simulazione**: Errore di rete simulato attivo
- **Infrastruttura**: Server backend e Vite funzionanti

### ⏳ In Attesa di Verifica
- **Enqueue**: Timbratura accodata su errore simulato
- **Flush**: Queue svuotata dopo riconnessione
- **Sync**: Dati sincronizzati con backend

### ❌ Problemi Rilevati
*Nessuno al momento - test in corso*

---

## Cleanup e Rollback

### Modifiche da Rimuovere
1. **Flag .env.local**: Rimuovere `VITE_FORCE_OFFLINE=true`
2. **safeFetch.ts**: Rimuovere simulazione offline (righe 31-34)
3. **File temporanei**: Eliminare `test_offline_simulation.js`

### Comando Rollback
```bash
# Rimuovere flag
sed -i '' '/VITE_FORCE_OFFLINE/d' .env.local

# Rimuovere simulazione da safeFetch.ts
# (da fare manualmente)

# Rimuovere file test
rm test_offline_simulation.js
```

---

**STATUS**: Test in corso - Richiesta esecuzione manuale  
**Prossimo Step**: Eseguire timbratura con flag offline attivo  
**Browser**: http://127.0.0.1:60629
