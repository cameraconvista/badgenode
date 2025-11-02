# BadgeNode — Logtail Setup Guide

**Version:** 1.0.0  
**Last Updated:** 2025-11-01  
**Status:** 📝 Ready for Activation

---

## 📋 Overview

Questa guida documenta il setup completo di Logtail (Better Stack) per BadgeNode in ambiente staging e produzione.

**Provider:** Logtail (Better Stack)  
**Plan:** Free Tier (100 MB/day)  
**Retention:** 7 giorni  
**Cost:** $0/mese

---

## 🚀 Step 1: Creazione Account

### 1️⃣ Sign Up

1. Vai su https://logtail.com
2. Click **"Sign Up with Better Stack"**
3. Compila form:
   - Email: `devops@company.com`
   - Password: (usa password manager)
   - Company: `BadgeNode`
4. Conferma email

### 2️⃣ Crea Source

1. Dashboard → **Sources** → **Create Source**
2. Seleziona tipo: **Render Service**
3. Nome: `badgenode-production`
4. Click **Create**
5. **Copia Source Token** (formato: `logtail_XXXXXXXXXXXXXXXXXXXXXXXX`)

**⚠️ IMPORTANTE:** Salva il token in password manager, non committare in Git!

---

## 🔧 Step 2: Configurazione Environment Variables

### Staging

**Render Dashboard → badgenode-staging → Environment:**

```bash
VITE_FEATURE_LOGGER_ADAPTER=true
NODE_ENV=staging
LOG_LEVEL=debug
LOGTAIL_TOKEN=<STAGING_SOURCE_TOKEN>
```

### Production

**Render Dashboard → badgenode-production → Environment:**

```bash
VITE_FEATURE_LOGGER_ADAPTER=true
NODE_ENV=production
LOG_LEVEL=info
LOGTAIL_TOKEN=<PRODUCTION_SOURCE_TOKEN>
```

**⚠️ NOTA:** Non aggiungere `LOGTAIL_TOKEN` in `.env.example` o `.env.local`!

---

## 📡 Step 3: Configurazione Log Streaming (Render)

### Opzione A: Render Native Streaming (Raccomandato)

**File:** `render.yaml` (già presente, solo documentazione)

```yaml
services:
  - type: web
    name: badgenode
    env: node
    envVars:
      - key: VITE_FEATURE_LOGGER_ADAPTER
        value: true
      - key: LOG_LEVEL
        value: info
      - key: LOGTAIL_TOKEN
        sync: false  # Secret, non in Git
    logStreams:
      - name: logtail
        url: https://in.logs.betterstack.com/
        headers:
          Authorization: Bearer ${LOGTAIL_TOKEN}
```

**Attivazione:**
1. Render Dashboard → Service → Settings → Log Streams
2. Click **Add Log Stream**
3. Name: `logtail`
4. URL: `https://in.logs.betterstack.com/`
5. Headers:
   - Key: `Authorization`
   - Value: `Bearer <LOGTAIL_TOKEN>`
6. Click **Save**

### Opzione B: Pino Transport (Futuro)

**Richiede installazione pino:**

```bash
npm install pino pino-logtail
```

**File:** `server/lib/logger.ts` (modifica futura)

```typescript
import pino from 'pino';

const transport = process.env.NODE_ENV === 'production' && process.env.LOGTAIL_TOKEN
  ? {
      target: 'pino-logtail',
      options: {
        sourceToken: process.env.LOGTAIL_TOKEN,
      },
    }
  : process.env.NODE_ENV === 'production'
  ? undefined // JSON to stdout (Render streaming)
  : {
      target: 'pino-pretty',
      options: { colorize: true },
    };

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    service: 'badgenode',
  },
  transport
);
```

**⚠️ NOTA:** Opzione A (Render Native) è più semplice e non richiede dipendenze.

---

## ✅ Step 4: Verifica Shipping

### Test Locale (Flag ON)

```bash
# Terminal 1: Start server con flag
VITE_FEATURE_LOGGER_ADAPTER=true npm run dev

# Terminal 2: Test requests
curl http://localhost:10000/api/health
curl http://localhost:10000/api/utenti
curl -X POST http://localhost:10000/api/timbrature \
  -H "Content-Type: application/json" \
  -d '{"pin": 1, "tipo": "entrata"}'
```

**Expected Output (Terminal 1):**
```
[INFO] 🚀 Server running { port: 10000 }
[INFO] { method: 'GET', url: '/api/health', status: 200, ms: 3 } http
[INFO] { method: 'GET', url: '/api/utenti', status: 200, ms: 45 } http
[INFO] { pin: 1, tipo: 'entrata', route: 'timbrature:post' } INSERT timbratura
```

### Test Staging

```bash
# Deploy to staging
git push origin staging

# Wait for deploy (2-3 min)

# Test
curl https://badgenode-staging.onrender.com/api/health
```

**Logtail Dashboard:**
1. Vai su https://betterstack.com/logs/
2. Seleziona source: `badgenode-staging`
3. Click **Live Tail**
4. Verifica log in arrivo real-time

**Expected Log Entry:**
```json
{
  "level": "info",
  "timestamp": "2025-11-01T16:30:00.123Z",
  "service": "badgenode",
  "method": "GET",
  "url": "/api/health",
  "status": 200,
  "ms": 3,
  "msg": "http"
}
```

### Test Production

```bash
# Deploy to production
git push origin main

# Wait for deploy (2-3 min)

# Test
curl https://badgenode.onrender.com/api/health
```

**Logtail Dashboard:**
1. Seleziona source: `badgenode-production`
2. Click **Live Tail**
3. Verifica log in arrivo

**⚠️ IMPORTANTE:** Monitorare per almeno 10 minuti dopo deploy!

---

## 🔔 Step 5: Configurazione Alert

### 1️⃣ High Error Rate (P0)

**Logtail Dashboard → Alerts → Create Alert:**

- **Name:** `BadgeNode: High Error Rate`
- **Query:** `level:error service:badgenode`
- **Condition:** Count > 10
- **Window:** 1 minute
- **Channels:** Email + Slack + PagerDuty
- **Severity:** Critical

**Test Alert:**
```bash
# Trigger errori intenzionali (staging)
for i in {1..15}; do
  curl https://badgenode-staging.onrender.com/api/pin/validate?pin=invalid
done
```

---

### 2️⃣ Slow API Requests (P1)

**Logtail Dashboard → Alerts → Create Alert:**

- **Name:** `BadgeNode: Slow Requests`
- **Query:** `ms:>2000 route:*`
- **Condition:** Count > 5
- **Window:** 5 minutes
- **Channels:** Slack
- **Severity:** Warning

---

### 3️⃣ Database Connection Issues (P0)

**Logtail Dashboard → Alerts → Create Alert:**

- **Name:** `BadgeNode: Database Errors`
- **Query:** `error:*connection* OR error:*timeout* OR error:*PGRST*`
- **Condition:** Count > 3
- **Window:** 5 minutes
- **Channels:** Email + PagerDuty
- **Severity:** Critical

---

### 4️⃣ Failed Timbrature (P1)

**Logtail Dashboard → Alerts → Create Alert:**

- **Name:** `BadgeNode: Failed Timbrature`
- **Query:** `route:timbrature:post level:error`
- **Condition:** Count > 5
- **Window:** 10 minutes
- **Channels:** Slack
- **Severity:** Warning

---

## 📊 Step 6: Configurazione Dashboard

### Dashboard: BadgeNode Production

**Logtail Dashboard → Dashboards → Create Dashboard:**

**Name:** `BadgeNode Production`  
**Refresh:** 30 seconds

#### Widget 1: Requests per Minute

- **Type:** Timeseries
- **Query:** `route:* -route:health`
- **Group By:** `route`
- **Interval:** 1 minute

#### Widget 2: Error Rate

- **Type:** Counter
- **Query:** `level:error`
- **Interval:** 1 minute
- **Alert:** error_rate > 5

#### Widget 3: Recent Errors

- **Type:** Table
- **Query:** `level:error`
- **Columns:** timestamp, route, error, requestId
- **Limit:** 50
- **Sort:** timestamp DESC

#### Widget 4: Response Time Distribution

- **Type:** Histogram
- **Query:** `ms:*`
- **Field:** `ms`
- **Buckets:** [0, 100, 500, 1000, 2000, 5000]

#### Widget 5: Status Codes

- **Type:** Pie Chart
- **Query:** `status:*`
- **Group By:** `status`

#### Widget 6: Timbrature Success Rate

- **Type:** Timeseries
- **Query:** `route:timbrature:post`
- **Group By:** `level`
- **Interval:** 5 minutes

---

## 🔍 Step 7: Query Examples

### Errori ultimi 24h

```sql
SELECT * FROM logs 
WHERE level = 'error' 
  AND service = 'badgenode'
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
```

### Slow requests (>1s)

```sql
SELECT route, AVG(ms) as avg_ms, COUNT(*) as count
FROM logs 
WHERE ms > 1000 
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY route
ORDER BY avg_ms DESC
```

### Error rate per ora

```sql
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as errors,
  COUNT(DISTINCT requestId) as unique_requests
FROM logs 
WHERE level = 'error'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC
```

### Top errori per route

```sql
SELECT route, error, COUNT(*) as count
FROM logs 
WHERE level = 'error'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY route, error
ORDER BY count DESC
LIMIT 10
```

### Timbrature fallite oggi

```sql
SELECT * FROM logs 
WHERE route = 'timbrature:post' 
  AND level = 'error'
  AND timestamp > DATE_TRUNC('day', NOW())
ORDER BY timestamp DESC
```

---

## 🔐 Security & Compliance

### Data Protection

- ✅ **No PII:** Solo PIN anonimo, no nome/cognome
- ✅ **No secrets:** Token/password masked automaticamente
- ✅ **HTTPS:** Shipping log via HTTPS
- ✅ **Retention:** 7 giorni (GDPR compliant)
- ✅ **Access control:** Team-based access Logtail

### Access Management

**Logtail Dashboard → Team → Members:**

| Role | Permissions | Users |
|------|-------------|-------|
| **Admin** | Full access, alert config | DevOps Lead |
| **Developer** | Read-only, query | Dev Team |
| **Viewer** | Dashboard only | Stakeholders |

---

## 🔄 Rollback Plan

### Scenario: Logtail causa problemi

**Azione Immediata (<1 minuto):**

```bash
# Render Dashboard → Environment
VITE_FEATURE_LOGGER_ADAPTER=false

# Restart service
# Comportamento: fallback console.* nativo
```

### Scenario: Log shipping fallisce

**Diagnosi:**
```bash
# Check Render logs
render logs -s badgenode --tail 50 | grep "logtail"

# Check Logtail status
curl https://status.betterstack.com/api/v2/status.json
```

**Azione:**
1. Verificare `LOGTAIL_TOKEN` corretto
2. Verificare Logtail status page
3. Rimuovere log stream temporaneamente
4. Contattare Logtail support

---

## 📝 Checklist Attivazione

### Pre-Activation

- [ ] Account Logtail creato
- [ ] Source token ottenuto e salvato in password manager
- [ ] Environment variables configurate (staging + production)
- [ ] Log streaming configurato su Render
- [ ] Alert preconfigurati creati (4)
- [ ] Dashboard creato con 6 widget
- [ ] Team access configurato
- [ ] Incident Response Runbook letto

### Activation (Staging)

- [ ] Deploy staging con flag ON
- [ ] Verifica log shipping (Live Tail)
- [ ] Test alert (trigger intenzionale)
- [ ] Monitorare 24h
- [ ] Conferma zero errori shipping

### Activation (Production)

- [ ] Deploy production con flag ON
- [ ] Verifica log shipping (Live Tail)
- [ ] Monitorare 1h intensivo
- [ ] Conferma alert funzionanti
- [ ] Comunicare team attivazione

### Post-Activation

- [ ] Monitorare 7 giorni
- [ ] Review alert triggers (false positives?)
- [ ] Ottimizzare query dashboard
- [ ] Training team su query Logtail
- [ ] Documentare lessons learned

---

## 📞 Support

### Logtail Support

- **Email:** support@betterstack.com
- **Docs:** https://betterstack.com/docs/logs/
- **Status:** https://status.betterstack.com/
- **Community:** https://community.betterstack.com/

### Internal

- **Slack:** `#devops`, `#engineering`
- **Email:** devops@company.com
- **On-Call:** PagerDuty rotation

---

## 🔄 Maintenance

**Review Frequency:** Monthly  
**Next Review:** 2025-12-01  
**Owner:** DevOps Team

**Changelog:**
- 2025-11-01: v1.0.0 - Initial setup guide (Sprint 5)

---

**Last Updated:** 2025-11-01  
**Version:** 1.0.0  
**Status:** 📝 Ready for Activation
