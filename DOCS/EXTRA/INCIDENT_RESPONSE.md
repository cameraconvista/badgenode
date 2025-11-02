# BadgeNode — Incident Response Runbook

**Version:** 1.0.0  
**Last Updated:** 2025-11-01  
**Owner:** DevOps Team  
**Status:** ✅ Active

---

## 📋 Obiettivo

Gestire alert e incidenti in produzione BadgeNode con Logtail (Better Stack) + Render, garantendo tempi di risposta rapidi e comunicazione efficace.

---

## 👥 Ruoli & Responsabilità

### On-Call Rotation

| Ruolo | Responsabilità | Contatto |
|-------|----------------|----------|
| **DevOps On-Call** | Primo responder, diagnosi e mitigazione | Slack: `@devops-oncall` |
| **Backup On-Call** | Supporto al primo responder | Slack: `@devops-backup` |
| **Tech Lead** | Escalation per decisioni tecniche | Email: tech-lead@company.com |
| **CTO** | Escalation per incidenti critici | Phone: +39 XXX XXX XXXX |

### Escalation Path

```
Alert → DevOps On-Call (0-5 min)
  ↓ (se non risolto in 15 min)
Backup On-Call (5-20 min)
  ↓ (se non risolto in 30 min)
Tech Lead (20-45 min)
  ↓ (se impatto critico)
CTO (45+ min)
```

---

## 🚨 Fasi Incident Management

### 1️⃣ Rilevamento (Detection)

**Trigger:**
- Alert Logtail via email/Slack/PagerDuty
- Monitoring esterno (UptimeRobot, Pingdom)
- Report utente via Slack `#support`

**Azioni:**
1. Confermare ricezione alert su Slack `#incident`
2. Creare thread dedicato con formato:
   ```
   🚨 INCIDENT: [Titolo breve]
   Severity: [P0/P1/P2/P3]
   Started: [HH:MM UTC]
   On-Call: [@username]
   ```
3. Aprire Logtail dashboard: https://betterstack.com/logs/

**Tempo SLA:** <1 minuto

---

### 2️⃣ Diagnosi (Diagnosis)

**Query Logtail (Quick Checks):**

#### Errori recenti (ultimi 10 minuti)
```sql
SELECT * FROM logs 
WHERE level = 'error' 
  AND service = 'badgenode'
  AND timestamp > NOW() - INTERVAL '10 minutes'
ORDER BY timestamp DESC
LIMIT 50
```

#### Error rate spike
```sql
SELECT 
  DATE_TRUNC('minute', timestamp) as minute,
  COUNT(*) as errors
FROM logs 
WHERE level = 'error'
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY minute
ORDER BY minute DESC
```

#### Slow requests (>2s)
```sql
SELECT route, AVG(ms) as avg_ms, COUNT(*) as count
FROM logs 
WHERE ms > 2000 
  AND timestamp > NOW() - INTERVAL '10 minutes'
GROUP BY route
ORDER BY avg_ms DESC
```

#### Database errors
```sql
SELECT * FROM logs 
WHERE (error LIKE '%connection%' OR error LIKE '%timeout%' OR error LIKE '%PGRST%')
  AND timestamp > NOW() - INTERVAL '10 minutes'
ORDER BY timestamp DESC
```

**Render Logs:**
```bash
# Via Render Dashboard
https://dashboard.render.com/web/[SERVICE_ID]/logs

# Via CLI (se configurato)
render logs -s badgenode --tail 100
```

**Health Check:**
```bash
curl https://badgenode.onrender.com/api/health
# Expected: 200 OK
```

**Tempo SLA:** <5 minuti

---

### 3️⃣ Mitigazione (Mitigation)

**Opzioni (in ordine di priorità):**

#### A) Disattivare Feature Flag (se logger causa problemi)
```bash
# Render Dashboard → Environment → Edit
VITE_FEATURE_LOGGER_ADAPTER=false

# Restart service
# Tempo: <1 minuto
```

#### B) Rollback Deploy (se bug recente)
```bash
# Render Dashboard → Deploys → Rollback to previous
# Tempo: <3 minuti
```

#### C) Scale Up (se performance issue)
```bash
# Render Dashboard → Settings → Instance Type
# Upgrade temporaneo a tier superiore
# Tempo: <2 minuti
```

#### D) Restart Service (se memory leak)
```bash
# Render Dashboard → Manual Deploy → Clear build cache + Deploy
# Tempo: <5 minuti
```

#### E) Maintenance Mode (se problema critico)
```bash
# Creare file static/maintenance.html
# Redirect temporaneo via Render
# Tempo: <10 minuti
```

**Comunicazione:**
```
📢 UPDATE: [Azione intrapresa]
Status: Mitigating
ETA: [Stima risoluzione]
Impact: [Descrizione impatto utenti]
```

**Tempo SLA:** <5 minuti (azione), <10 minuti (comunicazione)

---

### 4️⃣ Comunicazione (Communication)

**Canali:**

#### Interno (Team)
- **Slack `#incident`**: Aggiornamenti real-time
- **Slack `#engineering`**: Notifica generale
- **Email**: Solo per escalation

#### Esterno (Utenti)
- **Status Page** (se disponibile): https://status.badgenode.com
- **Email**: Solo per P0/P1 con impatto >30 min
- **In-app banner**: Per maintenance programmata

**Template Comunicazione:**

```markdown
🚨 INCIDENT UPDATE

**Status:** [Investigating / Mitigating / Resolved]
**Severity:** [P0/P1/P2/P3]
**Impact:** [Descrizione impatto]
**Started:** [HH:MM UTC]
**ETA:** [Stima risoluzione o "Unknown"]

**Actions Taken:**
- [Azione 1]
- [Azione 2]

**Next Steps:**
- [Step 1]
- [Step 2]

**On-Call:** [@username]
```

**Tempo SLA:** <10 minuti (primo update), ogni 15 min (update successivi)

---

### 5️⃣ Risoluzione (Resolution)

**Workflow:**

1. **Fix in staging:**
   ```bash
   # Branch dedicato
   git checkout -b hotfix/incident-YYYY-MM-DD
   
   # Fix + test
   npm run check && npm run lint && npm run build
   npm run test
   
   # Deploy staging
   git push origin hotfix/incident-YYYY-MM-DD
   ```

2. **Verifica staging:**
   ```bash
   # Health check
   curl https://badgenode-staging.onrender.com/api/health
   
   # Smoke tests
   npm run smoke:runtime
   ```

3. **Deploy produzione:**
   ```bash
   # Merge to main
   git checkout main
   git merge hotfix/incident-YYYY-MM-DD
   git push origin main
   
   # Render auto-deploy
   # Monitorare Logtail per conferma
   ```

4. **Verifica produzione:**
   ```bash
   # Health check
   curl https://badgenode.onrender.com/api/health
   
   # Monitorare Logtail 10 min
   # Confermare error rate normale
   ```

**Comunicazione Risoluzione:**
```
✅ RESOLVED: [Titolo incident]

**Duration:** [HH:MM]
**Root Cause:** [Breve descrizione]
**Fix:** [Azione risolutiva]
**Prevention:** [Azioni preventive future]

Post-mortem: DOCS/INCIDENTS/YYYY-MM-DD.md
```

**Tempo SLA:** <30 minuti (P0/P1), <2 ore (P2), <1 giorno (P3)

---

### 6️⃣ Post-Mortem

**Template:** `DOCS/INCIDENTS/YYYY-MM-DD-[title].md`

```markdown
# Incident Post-Mortem: [Titolo]

**Date:** YYYY-MM-DD  
**Duration:** [HH:MM]  
**Severity:** [P0/P1/P2/P3]  
**On-Call:** [@username]

## Timeline

| Time (UTC) | Event |
|------------|-------|
| HH:MM | Alert triggered |
| HH:MM | Investigation started |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Incident resolved |

## Root Cause

[Descrizione dettagliata causa]

## Impact

- **Users affected:** [Numero/percentuale]
- **Duration:** [HH:MM]
- **Services impacted:** [Lista servizi]
- **Data loss:** [Yes/No + dettagli]

## Resolution

[Descrizione fix applicato]

## Prevention

**Short-term:**
- [ ] [Azione 1]
- [ ] [Azione 2]

**Long-term:**
- [ ] [Azione 1]
- [ ] [Azione 2]

## Lessons Learned

**What went well:**
- [Punto 1]
- [Punto 2]

**What could be improved:**
- [Punto 1]
- [Punto 2]

## Action Items

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Azione 1] | [@username] | YYYY-MM-DD | [ ] |
| [Azione 2] | [@username] | YYYY-MM-DD | [ ] |
```

**Deadline:** <48 ore dalla risoluzione

---

## 📊 Severity Levels

| Level | Descrizione | Esempio | SLA Response | SLA Resolution |
|-------|-------------|---------|--------------|----------------|
| **P0** | Sistema completamente down | API 500 su tutte le route | <1 min | <30 min |
| **P1** | Funzionalità critica down | Timbrature non salvano | <5 min | <2 ore |
| **P2** | Funzionalità secondaria degraded | Storico lento (>5s) | <15 min | <1 giorno |
| **P3** | Issue minore, no impatto utenti | Warning ESLint in build | <1 ora | <1 settimana |

---

## 🔔 Alert Configuration (Logtail)

### 1️⃣ High Error Rate (P0)

```javascript
{
  "name": "BadgeNode: High Error Rate",
  "query": "level:error service:badgenode",
  "threshold": 10,
  "window": "1m",
  "channels": ["email", "slack", "pagerduty"],
  "severity": "critical"
}
```

**Trigger:** >10 errori in 1 minuto  
**Action:** PagerDuty + Email + Slack `#incident`  
**Escalation:** Immediata

---

### 2️⃣ Slow API Requests (P1)

```javascript
{
  "name": "BadgeNode: Slow Requests",
  "query": "ms:>2000 route:*",
  "threshold": 5,
  "window": "5m",
  "channels": ["slack"],
  "severity": "warning"
}
```

**Trigger:** >5 request >2s in 5 minuti  
**Action:** Slack `#monitoring`  
**Escalation:** Se persiste >15 min → P1

---

### 3️⃣ Database Connection Issues (P0)

```javascript
{
  "name": "BadgeNode: Database Errors",
  "query": "error:*connection* OR error:*timeout* OR error:*PGRST*",
  "threshold": 3,
  "window": "5m",
  "channels": ["email", "pagerduty"],
  "severity": "critical"
}
```

**Trigger:** >3 errori DB in 5 minuti  
**Action:** PagerDuty + Email  
**Escalation:** Immediata

---

### 4️⃣ Failed Timbrature (P1)

```javascript
{
  "name": "BadgeNode: Failed Timbrature",
  "query": "route:timbrature:post level:error",
  "threshold": 5,
  "window": "10m",
  "channels": ["slack"],
  "severity": "warning"
}
```

**Trigger:** >5 timbrature fallite in 10 minuti  
**Action:** Slack `#monitoring`  
**Escalation:** Se persiste >30 min → P1

---

## 🛠️ Troubleshooting Playbooks

### Playbook 1: API 500 Errors

**Symptoms:**
- Logtail: `level:error` spike
- Health check: 500 Internal Server Error
- Users: "Errore interno del server"

**Diagnosis:**
```bash
# Check recent errors
curl https://api.logtail.com/query -H "Authorization: Bearer <TOKEN>" \
  -d '{"query": "level:error service:badgenode", "limit": 10}'

# Check Render logs
render logs -s badgenode --tail 50 | grep ERROR

# Check Supabase status
curl https://status.supabase.com/api/v2/status.json
```

**Common Causes:**
1. **Supabase down/timeout** → Check Supabase status page
2. **Environment variable missing** → Check Render env vars
3. **Memory leak** → Check Render metrics, restart service
4. **Bad deploy** → Rollback to previous deploy

**Resolution:**
```bash
# If Supabase issue: wait or switch to fallback
# If env var issue: add missing var + restart
# If memory leak: restart service
# If bad deploy: rollback
```

---

### Playbook 2: Slow Response Times

**Symptoms:**
- Logtail: `ms:>2000` spike
- Users: "App lenta"
- Render metrics: High CPU/memory

**Diagnosis:**
```sql
-- Logtail: Slow routes
SELECT route, AVG(ms) as avg_ms, COUNT(*) as count
FROM logs 
WHERE ms > 1000 
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY route
ORDER BY avg_ms DESC
```

**Common Causes:**
1. **Database slow query** → Check Supabase query performance
2. **High traffic** → Scale up Render instance
3. **Memory leak** → Restart service
4. **External API timeout** → Check external dependencies

**Resolution:**
```bash
# If DB slow: optimize query or add index
# If high traffic: scale up temporarily
# If memory leak: restart + investigate
# If external timeout: add circuit breaker
```

---

### Playbook 3: Database Connection Errors

**Symptoms:**
- Logtail: `error:*connection*` or `error:*PGRST*`
- Users: "Errore di connessione"
- API: 503 Service Unavailable

**Diagnosis:**
```bash
# Check Supabase status
curl https://status.supabase.com/api/v2/status.json

# Check connection pool
# Render logs: "connection pool exhausted"

# Check env vars
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

**Common Causes:**
1. **Supabase down** → Check status page
2. **Invalid credentials** → Check env vars
3. **Connection pool exhausted** → Restart service
4. **Network issue** → Check Render network status

**Resolution:**
```bash
# If Supabase down: wait or maintenance mode
# If invalid creds: update env vars + restart
# If pool exhausted: restart service
# If network issue: contact Render support
```

---

## 📞 Contact Information

### Internal

| Service | Contact | URL |
|---------|---------|-----|
| **Slack** | `#incident`, `#engineering` | https://workspace.slack.com |
| **Email** | devops@company.com | - |
| **PagerDuty** | BadgeNode On-Call | https://company.pagerduty.com |

### External

| Service | Support | URL |
|---------|---------|-----|
| **Render** | support@render.com | https://render.com/support |
| **Supabase** | support@supabase.com | https://supabase.com/support |
| **Logtail** | support@betterstack.com | https://betterstack.com/support |

---

## 📚 Resources

- **Logtail Dashboard:** https://betterstack.com/logs/
- **Render Dashboard:** https://dashboard.render.com/
- **Supabase Dashboard:** https://app.supabase.com/
- **Status Pages:**
  - Render: https://status.render.com/
  - Supabase: https://status.supabase.com/
  - Logtail: https://status.betterstack.com/

---

## 🔄 Runbook Maintenance

**Review Frequency:** Quarterly (ogni 3 mesi)  
**Next Review:** 2025-02-01  
**Owner:** DevOps Team

**Changelog:**
- 2025-11-01: v1.0.0 - Initial version (Sprint 5)

---

**Last Updated:** 2025-11-01  
**Version:** 1.0.0  
**Status:** ✅ Active
