# BadgeNode — Post-Deploy Checklist

**Versione:** 1.0.0  
**Ultima Revisione:** 2025-11-01

---

## 📋 Overview

Questa checklist deve essere eseguita **dopo ogni deploy** in staging o produzione per garantire che l'applicazione funzioni correttamente e che non ci siano regressioni.

**Tempo Stimato:** 10-15 minuti

---

## ✅ Pre-Deploy Verification

### Build & CI

- [ ] **CI/CD Pipeline**: Tutti i check passati
  ```bash
  npm run check:ci
  ```
  - TypeScript compilation: ✅ PASS
  - ESLint: ✅ PASS
  - Build production: ✅ SUCCESS
  - File length guard: ✅ PASS

- [ ] **Tests**: Tutti i test passati
  ```bash
  npm run test
  npm run e2e
  ```
  - Unit tests: ✅ PASS
  - E2E tests: ✅ PASS
  - Coverage: ≥80%

- [ ] **Security Audit**: Zero vulnerabilità critical/high
  ```bash
  npm audit --production
  ```

- [ ] **Environment Variables**: Tutte le variabili configurate
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PORT` (default: 10000)
  - `NODE_ENV=production`
  - Feature flags (se necessario)

- [ ] **Backup Snapshot**: Backup creato prima del deploy
  ```bash
  npm run esegui:backup
  ```
  - Timestamp: _______________
  - Location: `Backup_Automatico/`

- [ ] **Rollback Plan**: Piano di rollback pronto
  - Previous build ID: _______________
  - Rollback command: `git revert <commit>` o Render rollback

---

## 🚀 Deploy Execution

### Deployment Info

- **Deploy Date**: _______________
- **Deploy Time**: _______________
- **Build ID**: _______________
- **Commit SHA**: _______________
- **Deployer**: _______________
- **Environment**: [ ] Staging [ ] Production

### Deploy Method

- [ ] **Render Auto-Deploy**: Push to `main` branch
- [ ] **Manual Deploy**: Render dashboard → Manual Deploy
- [ ] **Rollback**: Revert to previous build

---

## 🔍 Post-Deploy Verification

### 1️⃣ Health Endpoints

**Verificare che tutti gli endpoint di health siano raggiungibili e rispondano correttamente.**

- [ ] **GET /api/health**
  ```bash
  curl -s https://badgenode.onrender.com/api/health | jq
  ```
  - Status: `200 OK`
  - Response:
    ```json
    {
      "ok": true,
      "status": "healthy",
      "service": "BadgeNode",
      "version": "1.0.0",
      "uptime": <number>,
      "timestamp": "<ISO8601>"
    }
    ```

- [ ] **GET /api/ready**
  ```bash
  curl -s https://badgenode.onrender.com/api/ready | jq
  ```
  - Status: `200 OK`
  - Response:
    ```json
    {
      "ok": true,
      "status": "ready"
    }
    ```

- [ ] **GET /api/version**
  ```bash
  curl -s https://badgenode.onrender.com/api/version | jq
  ```
  - Status: `200 OK`
  - Response:
    ```json
    {
      "version": "1.0.0",
      "build": "<build_id>",
      "commit": "<sha>"
    }
    ```

### 2️⃣ Smoke Tests

**Eseguire test funzionali critici per verificare che l'app funzioni end-to-end.**

#### Login & Home

- [ ] **Accesso Home Page**
  - URL: `https://badgenode.onrender.com/`
  - Status: `200 OK`
  - Keypad visibile
  - Logo caricato
  - Nessun errore console

#### Timbrature (PIN Test)

- [ ] **Inserimento PIN**
  - Inserire PIN valido (es. `1`)
  - Keypad risponde correttamente
  - Display mostra PIN

- [ ] **Timbratura ENTRATA**
  - Click su bottone "ENTRATA"
  - Toast success visibile
  - Nessun errore console
  - Verifica in DB (opzionale):
    ```sql
    SELECT * FROM timbrature 
    WHERE pin = '1' 
    ORDER BY created_at DESC 
    LIMIT 1;
    ```

- [ ] **Timbratura USCITA**
  - Click su bottone "USCITA"
  - Toast success visibile
  - Nessun errore console

#### Admin Section (se applicabile)

- [ ] **Login Admin**
  - Accesso con PIN admin
  - Dashboard caricata
  - Nessun errore console

- [ ] **Archivio Dipendenti**
  - Lista utenti caricata
  - Filtri funzionanti
  - Export CSV/PDF (opzionale)

- [ ] **Storico Timbrature**
  - Dati caricati correttamente
  - Filtri per data funzionanti
  - Paginazione OK

### 3️⃣ Supabase Integration

**Verificare che la connessione a Supabase sia attiva e funzionante.**

- [ ] **Database Connection**
  ```bash
  npm run smoke:runtime
  ```
  - Query utenti: ✅ SUCCESS
  - RPC test: ✅ SUCCESS
  - Nessun timeout

- [ ] **RLS Policies**
  - Client (ANON_KEY): Accesso limitato ✅
  - Server (SERVICE_ROLE): Accesso completo ✅
  - Nessun 401/403 anomalo

- [ ] **Storage (se usato)**
  - Upload file: ✅ SUCCESS
  - Download file: ✅ SUCCESS
  - Permissions OK

### 4️⃣ Offline Queue (se attivo)

**Verificare che il sistema offline funzioni correttamente.**

- [ ] **Feature Flag**
  - `VITE_FEATURE_OFFLINE_QUEUE=true`
  - `VITE_FEATURE_OFFLINE_BADGE=true` (dev only)

- [ ] **Device Whitelist**
  - Device ID configurati correttamente
  - Nessun `*` in produzione

- [ ] **IndexedDB**
  - Database `badgenode_offline` creato
  - Store `timbri_v1` presente
  - Fallback in-memory funzionante (private mode)

- [ ] **Sync Test** (opzionale)
  - Simulare offline
  - Creare timbratura
  - Tornare online
  - Verifica sync automatica

### 5️⃣ Performance

**Verificare che le performance siano accettabili.**

- [ ] **TTFB (Time To First Byte)**
  ```bash
  curl -o /dev/null -s -w "TTFB: %{time_starttransfer}s\n" https://badgenode.onrender.com/
  ```
  - Target: <500ms
  - Actual: _______________

- [ ] **Page Load Time**
  - Chrome DevTools → Network → DOMContentLoaded
  - Target: <2s
  - Actual: _______________

- [ ] **API Latency**
  ```bash
  curl -o /dev/null -s -w "Time: %{time_total}s\n" https://badgenode.onrender.com/api/health
  ```
  - Target: <200ms
  - Actual: _______________

- [ ] **Bundle Size**
  - Main bundle: <1MB
  - Lazy-loaded chunks: OK
  - No regression da build precedente

### 6️⃣ Logging & Monitoring

**Verificare che logging e monitoring siano attivi.**

- [ ] **Render Logs**
  - Logs streaming attivo
  - Nessun errore 5xx
  - Request logging OK (se attivo)

- [ ] **Error Tracking** (se configurato)
  - Sentry/LogRocket attivo
  - Test error capture

- [ ] **Uptime Monitoring**
  - UptimeRobot configurato (vedi `ALERT_UPTIME.md`)
  - Endpoint: `/api/health`
  - Frequenza: 5 minuti
  - Alert attivi

### 7️⃣ Security

**Verificare che le configurazioni di sicurezza siano corrette.**

- [ ] **HTTPS**
  - Certificato SSL valido
  - Nessun warning browser
  - HSTS header presente

- [ ] **Environment Variables**
  - `SERVICE_ROLE_KEY` mai esposta al client
  - Nessun secret in bundle JavaScript
  - Nessun secret in logs

- [ ] **CORS**
  - Configurazione corretta
  - Nessun errore CORS in console

- [ ] **Rate Limiting** (se configurato)
  - Render rate limiting attivo
  - Test con burst requests

---

## 🚨 Rollback Procedure

**Se uno dei check fallisce, eseguire rollback immediato.**

### Render Rollback

1. **Dashboard Render**: Vai su Deploys
2. **Seleziona build precedente**: Click su "Rollback to this deploy"
3. **Conferma rollback**
4. **Verifica health**: Ripeti check `/api/health`
5. **Notifica team**: Invia alert su Slack/Email

### Git Rollback

```bash
# 1. Identifica commit problematico
git log --oneline -10

# 2. Revert commit
git revert <commit_sha>

# 3. Push
git push origin main

# 4. Render auto-deploy
# (attendi completamento)

# 5. Verifica health
curl https://badgenode.onrender.com/api/health
```

---

## 📝 Post-Deploy Notes

### Issues Rilevati

- Issue #1: _______________
- Issue #2: _______________
- Issue #3: _______________

### Actions Taken

- Action #1: _______________
- Action #2: _______________
- Action #3: _______________

### Follow-Up Tasks

- [ ] Task #1: _______________
- [ ] Task #2: _______________
- [ ] Task #3: _______________

---

## ✅ Sign-Off

**Deploy Completato con Successo:**

- [ ] Tutti i check passati
- [ ] Nessun issue critico
- [ ] Monitoring attivo
- [ ] Team notificato

**Deployer Signature:**

- Nome: _______________
- Data: _______________
- Timestamp: _______________

---

**Next Deploy:** _______________

**Last Updated:** 2025-11-01  
**Version:** 1.0.0
