# Test Offline Queue — BadgeNode

**Guida per testare la funzionalità offline delle timbrature in ambiente locale**

---

## 🎯 Obiettivo

Verificare che le timbrature vengano memorizzate localmente quando il dispositivo è offline e sincronizzate automaticamente al ritorno della connessione Wi-Fi.

---

## ⚙️ Setup Test

### 1. Attivazione Environment Offline

```bash
# Copia il file di configurazione test
cp .env.offline-test.sample .env.local

# Personalizza le credenziali Supabase nel file .env.local
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. Avvio Dev Server

```bash
npm run dev
```

**Verifica**: App disponibile su http://localhost:3001

---

## 🧪 Procedura Test

### **Step 1: Verifica Diagnostica Offline**

Apri **DevTools Console** ed esegui:

```javascript
(() => {
  const d = window.__BADGENODE_DIAG__;
  return {
    hasDiag: !!d,
    enabled: d?.offline?.enabled ?? null,
    allowed: d?.offline?.allowed ?? null,
    deviceId: d?.offline?.deviceId ?? localStorage.getItem('BADGENODE_DEVICE_ID')
  };
})();
```

**Risultato Atteso**:
```javascript
{
  hasDiag: true,
  enabled: true,
  allowed: true,
  deviceId: "device-1730000000000-abc123def" // UUID generato
}
```

### **Step 2: Test Offline - Disconnessione Wi-Fi**

1. **Disconnetti il Wi-Fi** dal dispositivo
2. Nell'app BadgeNode, effettua **2-3 timbrature**:
   - Entrata (PIN valido, es. 01)
   - Uscita (stesso PIN)
   - Entrata (stesso PIN)

**Risultato Atteso**:
- ✅ Nessun errore "PIN non registrato"
- ✅ Feedback positivo "Entrata/Uscita registrata"
- ✅ Timbrature vanno in coda locale

### **Step 3: Verifica Coda Locale**

In **DevTools Console**, verifica la coda:

```javascript
// Controlla numero item in coda
window.__BADGENODE_DIAG__?.offline?.queueCount?.()

// Snapshot completo stato offline
window.__BADGENODE_DIAG__?.offline?.acceptance?.()
```

**Risultato Atteso**:
```javascript
// queueCount() dovrebbe restituire 3
3

// acceptance() dovrebbe mostrare:
{
  deviceId: "device-1730000000000-abc123def",
  allowed: true,
  queueCount: 3,
  lastSeq: 3,
  online: false,
  lastSyncAt: null,
  appVersion: "offline-test"
}
```

### **Step 4: Test Sincronizzazione - Riconnessione Wi-Fi**

1. **Riconnetti il Wi-Fi**
2. **Porta l'app in foreground** (se necessario)
3. Attendi **5-10 secondi** per la sincronizzazione automatica

**Risultato Atteso**:
- ✅ Coda locale svuotata automaticamente
- ✅ `queueCount()` ritorna 0
- ✅ `lastSyncAt` valorizzato con timestamp

### **Step 5: Verifica Database**

Controlla che le timbrature siano presenti nel database **senza duplicati**:

1. Vai alla pagina **Storico Timbrature** nell'app
2. Verifica che le 3 timbrature offline siano presenti
3. Controlla che non ci siano duplicati

---

## 🔍 Diagnostica Avanzata

### Badge Visivo (Opzionale)

Se abilitato (`VITE_FEATURE_OFFLINE_BADGE=true`), vedrai un piccolo badge in alto a destra che mostra:
- **offline**: Dispositivo offline
- **queued: N**: N timbrature in coda
- **syncing**: Sincronizzazione in corso
- **ok**: Tutto sincronizzato

### Comandi Console Utili

```javascript
// Stato completo diagnostica
window.__BADGENODE_DIAG__

// Solo diagnostica offline
window.__BADGENODE_DIAG__?.offline

// Device ID corrente
window.__BADGENODE_DIAG__?.offline?.getDeviceId?.()

// Sequenza client corrente
window.__BADGENODE_DIAG__?.offline?.peekClientSeq?.()
```

---

## ⚠️ Note Importanti

### **Solo Test Locale**

- ⚠️ **NON abilitare `VITE_OFFLINE_DEVICE_WHITELIST=*` in produzione**
- ⚠️ **NON committare file `.env.local`** (già in .gitignore)
- ⚠️ Per ambienti REMOTE usare whitelist specifica con device ID reali

### **Configurazione Produzione**

Per abilitare offline in produzione:

```bash
# Solo dispositivi specifici
VITE_FEATURE_OFFLINE_QUEUE=true
VITE_FEATURE_OFFLINE_BADGE=false  # No badge in produzione
VITE_OFFLINE_DEVICE_WHITELIST=tablet-001,tablet-002,tablet-003
```

### **Troubleshooting**

**Problema**: Diagnostica non disponibile
```javascript
// Verifica feature flags
console.log({
  queue: import.meta.env.VITE_FEATURE_OFFLINE_QUEUE,
  badge: import.meta.env.VITE_FEATURE_OFFLINE_BADGE,
  whitelist: import.meta.env.VITE_OFFLINE_DEVICE_WHITELIST
});
```

**Problema**: Sincronizzazione non automatica
```javascript
// Forza sincronizzazione manuale
window.__BADGENODE_DIAG__?.offline?.runSyncOnce?.()
```

**Problema**: Coda non si svuota
- Verifica connessione di rete
- Controlla credenziali Supabase in `.env.local`
- Verifica che RPC `insert_timbro_offline` sia disponibile

---

## ✅ Criteri Successo Test

- ✅ **Diagnostica attiva**: `enabled: true`, `allowed: true`
- ✅ **Offline funzionante**: Timbrature enqueued senza errori
- ✅ **Sincronizzazione automatica**: Coda svuotata al ritorno rete
- ✅ **Idempotenza**: Nessun duplicato in database
- ✅ **Zero regressioni**: App funziona normalmente online

---

**Documento creato**: 2025-10-27  
**Versione**: BadgeNode Enterprise v5.0  
**Ambiente**: Solo test locale
