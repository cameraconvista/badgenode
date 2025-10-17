# CHANGELOG STEP D — Osservabilità minima + Paracadute "Read-Only Mode"

**Data**: 2025-10-17 (pomeriggio)  
**Commit**: `chore(server): add request-id, readiness & version endpoints, and Read-Only mode guard; preserve business logic`

## 🎯 Obiettivo

Aggiungere **monitoraggio essenziale** e **flag di sicurezza** per manutenzioni senza impatto su logica business:
- ✅ **Request tracking**: Request ID su tutte le risposte
- ✅ **Osservabilità**: Endpoint version e readiness
- ✅ **Paracadute**: Read-Only Mode per manutenzioni sicure
- ✅ **Logging uniforme**: Request ID per diagnosi veloci
- ✅ **Zero impatto**: Nessuna modifica a computeGiornoLogico/UX

## ✅ Implementazioni

### 1. Request ID Middleware
**File**: `server/middleware/requestId.ts`

**Funzionalità**:
```typescript
// Genera request ID univoco per ogni richiesta
function generateRequestId(): string {
  return randomBytes(8).toString('hex');
}

// Aggiunge ID a response headers e req.context
app.use(requestIdMiddleware);
```

**Benefici**:
- ✅ **Tracking**: ID univoco per ogni richiesta
- ✅ **Headers**: `x-request-id` in tutte le risposte
- ✅ **Context**: Disponibile in `req.context.requestId`
- ✅ **Logging**: Correlazione errori e richieste

### 2. Read-Only Mode Guard
**File**: `server/middleware/readOnlyGuard.ts`

**Configurazione**:
```bash
# Modalità normale (default)
READ_ONLY_MODE=0

# Modalità manutenzione
READ_ONLY_MODE=1
```

**Comportamento**:
- ✅ **GET/HEAD/OPTIONS**: Sempre permessi
- ✅ **POST/PATCH/PUT/DELETE**: Bloccati se `READ_ONLY_MODE=1`
- ✅ **Risposta**: `503 { code: 'READ_ONLY_MODE_ACTIVE' }`
- ✅ **Logging**: `[Read-Only] Blocked POST /api/... [requestId]`

### 3. Endpoint Osservabilità

#### `/api/version`
**File**: `server/routes/version.ts`
```json
{
  "version": "dev",
  "buildTime": "2025-10-17T11:53:24.664Z",
  "commit": "manual",
  "timestamp": "2025-10-17T11:53:24.665Z",
  "requestId": "a70681df00dbc9c2"
}
```

#### `/api/ready`
**File**: `server/routes/health.ts`
```json
{
  "ok": true,
  "timestamp": "2025-10-17T11:53:29.866Z",
  "requestId": "3d3c33f31a2d1b28"
}
```

**Readiness Check**:
- ✅ **Query veloce**: `SELECT pin FROM utenti LIMIT 1`
- ✅ **Verifica DB**: Connessione Supabase Admin
- ✅ **503 se fail**: Database non raggiungibile

### 4. Error Handler Migliorato
**File**: `server/index.ts`

**Formato standardizzato**:
```json
{
  "success": false,
  "code": "INTERNAL_ERROR",
  "error": "Internal Server Error",
  "requestId": "abc123def456"
}
```

**Miglioramenti**:
- ✅ **Request ID**: Sempre incluso negli errori
- ✅ **Code standardizzato**: `INTERNAL_ERROR` se mancante
- ✅ **Formato uniforme**: Stesso schema di tutte le API

## 🧪 Test Risultati

### Smoke Test: **5/5 Endpoint OK** 🎉
```bash
✅ Health Check: OK
   📋 Request ID: test-1760702015013
✅ Version Info: OK
   📋 Request ID: test-1760702015016
✅ Readiness Check: OK
   📋 Request ID: test-1760702015018
✅ Health Admin: OK
   📋 Request ID: test-1760702015395
✅ Utenti API: OK
   📋 Request ID: test-1760702015397
```

### Read-Only Mode: **FUNZIONANTE** ✅
```bash
# Server con READ_ONLY_MODE=1
POST /api/timbrature/manual → 503 {
  "success": false,
  "code": "READ_ONLY_MODE_ACTIVE",
  "error": "Sistema in manutenzione (solo lettura)",
  "requestId": "59c395f83d30d381"
}

# Server normale READ_ONLY_MODE=0
POST /api/timbrature/manual → 200 (funziona normalmente)
```

### Request ID Tracking
- ✅ **Generazione**: Crypto random 16 caratteri hex
- ✅ **Headers**: `x-request-id` in tutte le risposte
- ✅ **Errori**: Request ID incluso per debugging
- ✅ **Logging**: Correlazione richieste/errori

## 📋 File Modificati

### Nuovi File
- ✅ `server/middleware/requestId.ts` (Request tracking)
- ✅ `server/middleware/readOnlyGuard.ts` (Paracadute manutenzione)
- ✅ `server/routes/health.ts` (Health & readiness)
- ✅ `server/routes/version.ts` (Version info)
- ✅ `scripts/smoke-test-step-d.ts` (Test osservabilità)
- ✅ `CHANGELOG_STEP_D.md` (Documentazione)

### File Modificati
- ✅ `server/index.ts` (Wire middleware e routes)

## 🏗️ Architettura

**Middleware Stack**:
```
1. requestIdMiddleware    ← Genera/estrae request ID
2. readOnlyGuard         ← Blocca scritture se manutenzione
3. express.json()        ← Parsing body
4. logging middleware    ← Log richieste
5. routes                ← Business logic
6. error handler         ← Gestione errori con request ID
```

**Nessun impatto su**:
- ❌ `computeGiornoLogico` (invariato)
- ❌ Logica alternanza (invariata)
- ❌ Validazioni PIN (invariate)
- ❌ Layout UI (invariato)
- ❌ Contratti API esistenti (invariati)

**Solo aggiunte**:
- ✅ Request ID tracking
- ✅ Endpoint osservabilità
- ✅ Paracadute manutenzione
- ✅ Logging migliorato

## 🎯 Benefici

### Osservabilità
- ✅ **Monitoring**: `/api/ready` per health check
- ✅ **Versioning**: `/api/version` per deploy tracking
- ✅ **Debugging**: Request ID per correlazione errori
- ✅ **Logging**: Tracciabilità completa richieste

### Manutenzione Sicura
- ✅ **Read-Only Mode**: Blocca scritture senza downtime
- ✅ **Graduali**: Solo operazioni mutanti bloccate
- ✅ **Reversibile**: `READ_ONLY_MODE=0` ripristina tutto
- ✅ **Monitoraggio**: Log di richieste bloccate

### Produzione Ready
- ✅ **Error handling**: Formato uniforme con request ID
- ✅ **Diagnostica**: Endpoint ready per load balancer
- ✅ **Versioning**: Deploy tracking e rollback info
- ✅ **Zero downtime**: Manutenzioni senza interruzioni

---

**Stato**: ✅ COMPLETATO  
**Impatto**: 🟢 ADDITIVO (solo nuove funzionalità)  
**Regressioni**: 🚫 NESSUNA  
**Osservabilità**: 🟢 COMPLETA (request-id, version, ready)  
**Manutenzione**: 🟢 SICURA (read-only mode)
