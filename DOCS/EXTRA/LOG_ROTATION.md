# BadgeNode — Log Rotation Policy

**Versione:** 1.0.0  
**Ultima Revisione:** 2025-11-01

---

## 📋 Overview

Questo documento definisce la policy di gestione, rotazione e retention dei log per BadgeNode in tutti gli ambienti (development, staging, production).

**Obiettivo:** Mantenere log strutturati, accessibili e gestibili senza impattare performance o storage.

---

## 🎯 Log Strategy

### Log Levels

| Level | Uso | Ambiente | Esempio |
|-------|-----|----------|---------|
| `error` | Errori critici, eccezioni | Tutti | Database connection failed |
| `warn` | Warning, deprecation | Tutti | API deprecated, slow query |
| `info` | Eventi importanti | Prod, Staging | User login, deploy completed |
| `http` | Request/response | Dev, Staging | GET /api/health 200 in 5ms |
| `debug` | Debug dettagliato | Dev only | Variable state, function calls |

### Current State (v1.0.0)

**Implementazione Attuale:**
- ✅ Console logging (stdout/stderr)
- ✅ Request logging middleware (Express)
- ✅ Request ID tracking (`x-request-id`)
- ⚠️ Nessun logger strutturato (pianificato Sprint 2)
- ⚠️ Nessuna rotazione automatica

**Formato Log:**
```
[TIMESTAMP] [LEVEL] [CONTEXT] Message
[2025-11-01T15:30:00.123Z] [INFO] [server] 🚀 Server running on port 10000
[2025-11-01T15:30:05.456Z] [HTTP] [api] GET /api/health 200 in 5ms
[2025-11-01T15:30:10.789Z] [ERROR] [db] Connection timeout after 30s
```

---

## 🔄 Rotation Policy

### Development (localhost)

**Storage:** Console output (no file)

**Rotation:** N/A (logs non persistiti)

**Retention:** Session-based (persi al restart)

**Configuration:**
```bash
NODE_ENV=development
DEBUG_ENABLED=1  # Verbose logging
```

**Best Practices:**
- ✅ Console logging OK per debug
- ✅ Request logging attivo
- ⚠️ Non committare log files

---

### Staging (Render)

**Storage:** Render Log Streaming

**Rotation:** Automatica (Render managed)

**Retention:** 7 giorni (Render free tier) o 30 giorni (paid)

**Configuration:**
```bash
NODE_ENV=staging
DEBUG_ENABLED=0  # Solo info/warn/error
LOG_LEVEL=info
```

**Access:**
```bash
# Via Render Dashboard
https://dashboard.render.com/ → Service → Logs

# Via Render CLI (se installato)
render logs --service badgenode --tail 100
```

**Best Practices:**
- ✅ Log streaming real-time
- ✅ Filtri per level/keyword
- ⚠️ Download log per analisi offline

---

### Production (Render)

**Storage:** Render Log Streaming + External Aggregator (futuro)

**Rotation:** Automatica (Render managed)

**Retention:** 
- Render: 7 giorni (free) o 30 giorni (paid)
- External: 90 giorni (pianificato)

**Configuration:**
```bash
NODE_ENV=production
DEBUG_ENABLED=0  # Mai debug in prod
LOG_LEVEL=info
REQUEST_LOGGING=false  # Disabilitare se troppo verbose
```

**Access:**
- Render Dashboard (real-time)
- External aggregator (search/analytics)

**Best Practices:**
- ✅ Solo log essenziali (info/warn/error)
- ✅ Structured logging (JSON format)
- ❌ Mai loggare secrets/PII
- ✅ Correlation ID per request tracking

---

## 📦 Storage Limits

### File Size Limits (futuro)

**Quando implementato logger strutturato:**

| Ambiente | Max File Size | Max Files | Total Storage |
|----------|---------------|-----------|---------------|
| Development | 10 MB | 3 | 30 MB |
| Staging | 50 MB | 7 | 350 MB |
| Production | 100 MB | 30 | 3 GB |

**Rotation Trigger:**
- Size-based: File raggiunge max size
- Time-based: Daily rotation (00:00 UTC)

**Naming Convention:**
```
logs/
├── app.log              # Current log
├── app.log.1            # Yesterday
├── app.log.2            # 2 days ago
├── app.log.3.gz         # 3 days ago (compressed)
└── error.log            # Errors only
```

---

## 🔧 Implementation (Sprint 2)

### Logger Strutturato (Pianificato)

**Library:** `pino` (high-performance) o `winston` (feature-rich)

**Esempio Configurazione (pino):**
```typescript
// server/lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'password', 'token', 'secret'],
    remove: true,
  },
});

export default logger;
```

**Usage:**
```typescript
import logger from '@/lib/logger';

// Info
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Error
logger.error({ err, requestId }, 'Database connection failed');

// HTTP (con middleware)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.http({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: Date.now() - start,
      requestId: req.context?.requestId,
    });
  });
  next();
});
```

### Rotation Setup (futuro)

**Option 1: pino-roll (file rotation)**
```bash
npm install pino-roll
```

```typescript
import pinoRoll from 'pino-roll';

const logger = pino(pinoRoll({
  file: 'logs/app.log',
  size: '50m',  // 50 MB
  frequency: 'daily',
  mkdir: true,
}));
```

**Option 2: logrotate (system-level)**
```bash
# /etc/logrotate.d/badgenode
/var/log/badgenode/*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  create 0640 node node
  sharedscripts
  postrotate
    systemctl reload badgenode
  endscript
}
```

---

## 🚫 What NOT to Log

### Secrets & Credentials

❌ **Mai loggare:**
- Password, PIN, token
- API keys (SUPABASE_SERVICE_ROLE_KEY, etc.)
- Session cookies
- Authorization headers
- Environment variables con secrets

**Esempio BAD:**
```typescript
// ❌ BAD
console.log('Supabase key:', process.env.SUPABASE_SERVICE_ROLE_KEY);
logger.info({ password: req.body.password }, 'User login');
```

**Esempio GOOD:**
```typescript
// ✅ GOOD
logger.info({ userId: req.body.userId }, 'User login attempt');
logger.debug({ headers: sanitizeHeaders(req.headers) }, 'Request received');
```

### Personal Identifiable Information (PII)

❌ **Evitare:**
- Nome/cognome completo
- Email, telefono
- Indirizzo IP (se non necessario)
- Location GPS

**Esempio:**
```typescript
// ✅ GOOD: Log solo ID anonimo
logger.info({ pin: '42', action: 'timbratura' }, 'Timbratura created');

// ❌ BAD: Log dati personali
logger.info({ name: 'Mario Rossi', email: 'mario@example.com' }, 'User created');
```

### Large Payloads

❌ **Evitare:**
- Request/response body completi (se >1KB)
- Stack trace completi (solo summary)
- Array con >100 elementi

**Esempio:**
```typescript
// ✅ GOOD: Log solo metadata
logger.http({ 
  method: 'POST', 
  url: '/api/timbrature', 
  bodySize: req.body.length 
});

// ❌ BAD: Log payload completo
logger.http({ body: req.body });
```

---

## 📊 Log Analysis

### Search & Filter (Render)

**Dashboard Render:**
- Filter by level: `level:error`
- Filter by keyword: `database`
- Filter by time: Last 1h, 24h, 7d
- Export: Download as .txt

### Common Queries

**Errori 5xx:**
```
level:error status:5
```

**Slow Requests (>1s):**
```
duration:>1000
```

**Specific User:**
```
userId:123
```

**Request ID Tracking:**
```
requestId:abc123
```

### External Aggregator (futuro)

**Opzioni:**
- **Logtail** (Render integration)
- **Papertrail** (Heroku-style)
- **Datadog** (enterprise)
- **ELK Stack** (self-hosted)

**Features:**
- Full-text search
- Aggregazioni e analytics
- Alert su pattern
- Dashboard custom
- Retention 90+ giorni

---

## 🔔 Log-Based Alerts (futuro)

### Alert Rules

**Critical Errors:**
```
Trigger: level:error count:>10 in 5min
Action: Email + Slack
```

**Database Timeouts:**
```
Trigger: "connection timeout" count:>5 in 10min
Action: Email + PagerDuty
```

**High Latency:**
```
Trigger: duration:>2000 count:>50 in 5min
Action: Slack warning
```

**Unusual Activity:**
```
Trigger: failed_login count:>20 in 1min
Action: Security alert
```

---

## 🛡️ Security & Compliance

### Log Access Control

**Chi può accedere:**
- ✅ DevOps team (full access)
- ✅ Backend developers (read-only)
- ⚠️ Frontend developers (no production logs)
- ❌ External contractors (no access)

**Render Permissions:**
- Owner: Full access
- Admin: Read logs, no delete
- Developer: No log access

### Audit Trail

**Log dei log:**
- Chi ha acceduto ai log
- Quando
- Quali query eseguite
- Export effettuati

**Retention:** 1 anno (compliance)

### GDPR Compliance

**Right to Deletion:**
- Se utente richiede cancellazione dati
- Purge log contenenti userId
- Retention max 90 giorni

**Data Minimization:**
- Log solo dati necessari
- Anonimizzare quando possibile
- Redact PII automaticamente

---

## 📝 Maintenance Tasks

### Daily

- [ ] Check error rate (dashboard Render)
- [ ] Verify log streaming attivo
- [ ] No alert critici

### Weekly

- [ ] Review error patterns
- [ ] Check storage usage
- [ ] Verify rotation funzionante (quando implementato)

### Monthly

- [ ] Analyze performance trends
- [ ] Review log retention policy
- [ ] Update alert rules se necessario
- [ ] Audit log access

### Quarterly

- [ ] Review logger configuration
- [ ] Update dependencies (pino, winston)
- [ ] Security audit log handling
- [ ] Compliance review

---

## 🚀 Migration Plan (Sprint 2)

### Phase 1: Logger Strutturato

**Tasks:**
1. Install `pino` o `winston`
2. Create `server/lib/logger.ts`
3. Replace `console.*` con `logger.*`
4. Add request ID middleware
5. Configure log levels per environment
6. Test in development

**Effort:** 2-3 giorni

### Phase 2: File Rotation (opzionale)

**Tasks:**
1. Install `pino-roll` o setup `logrotate`
2. Configure rotation policy
3. Create `logs/` directory
4. Add to `.gitignore`
5. Test rotation trigger
6. Document in README

**Effort:** 1 giorno

### Phase 3: External Aggregator (futuro)

**Tasks:**
1. Evaluate providers (Logtail, Papertrail, Datadog)
2. Setup account + integration
3. Configure shipping (Render → Aggregator)
4. Create dashboards
5. Setup alerts
6. Train team

**Effort:** 1 settimana

---

## 📚 Resources

### Documentation

- **pino**: https://getpino.io/
- **winston**: https://github.com/winstonjs/winston
- **Render Logs**: https://render.com/docs/logs
- **Logtail**: https://logtail.com/

### Tools

- **npm run diagnose**: Include log analysis
- **Render Dashboard**: Real-time log streaming
- **curl**: Test log output manualmente

### Related Docs

- **ALERT_UPTIME.md**: Monitoring e alert
- **POST_DEPLOY_CHECKLIST.md**: Verifica log post-deploy
- **SECURITY.md**: Security logging best practices

---

## 🎉 v1.1.0 — Implementazione Logger Strutturato (Sprint 2)

**Data:** 2025-11-01  
**Status:** ✅ Implementato

### Modifiche

**File Creati:**
- `server/lib/logger.ts` — Logger adapter con fallback console
- `server/config/featureFlags.ts` — Feature flag VITE_FEATURE_LOGGER_ADAPTER

**File Modificati:**
- `server/start.ts` — Integrazione logger con feature flag (4 punti)

### Feature Flag

```bash
# Default: false (comportamento originale console.*)
VITE_FEATURE_LOGGER_ADAPTER=false

# Abilita logger strutturato
VITE_FEATURE_LOGGER_ADAPTER=true
```

### Logger Adapter

**Caratteristiche:**
- ✅ Zero dipendenze esterne (pino opzionale)
- ✅ Fallback console.* se pino non disponibile
- ✅ Structured logging con context
- ✅ Log levels: info, warn, error, debug, http
- ✅ Timestamp ISO 8601
- ✅ Service tag: 'badgenode'

**Usage:**
```typescript
import { logger } from './lib/logger';

// Simple logging
logger.info('Server started');

// Structured logging
logger.info('User login', { userId: '123', ip: req.ip });

// Error logging
logger.error('Database error', { error: err.message });
```

### Rotazione (Pianificato)

**Quando pino installato:**
- Log directory: `./logs/`
- Rotazione: Giornaliera (00:00 UTC)
- Retention: 7 giorni
- Max file size: 50 MB
- Compressione: gzip per file >3 giorni

**Installazione pino (opzionale):**
```bash
npm install pino pino-pretty
```

### Impatto

- ✅ Zero breaking changes
- ✅ Feature flag default OFF
- ✅ Compatibilità 100% con console.*
- ✅ Pronto per monitoring esterno (Logtail, Papertrail)

---

## 🚀 v1.2.0 — External Log Aggregator (Stub Documentation)

**Data:** 2025-11-01  
**Status:** 📝 Documentato (non implementato)

### Overview

Questa sezione documenta l'integrazione futura con aggregatori di log esterni per BadgeNode in produzione.

**Obiettivo:** Centralizzare, analizzare e monitorare i log in tempo reale senza impattare le performance dell'applicazione.

---

### Opzioni Aggregatori

#### 1️⃣ Logtail (Raccomandato)

**Vantaggi:**
- ✅ Integrazione nativa Render
- ✅ Setup 5 minuti
- ✅ Free tier: 1GB/mese
- ✅ Real-time streaming
- ✅ Dashboard SQL-like queries

**Setup (Futuro):**
```bash
# 1. Crea account Logtail
https://logtail.com/

# 2. Ottieni Source Token
# Dashboard → Sources → Create Source → Render

# 3. Configura Render
# Dashboard Render → Service → Logging → Add Logtail
# Paste Source Token

# 4. Verifica streaming
# Logtail Dashboard → Live Tail
```

**Query Examples:**
```sql
-- Errori ultimi 24h
SELECT * FROM logs 
WHERE level = 'error' 
AND timestamp > NOW() - INTERVAL '24 hours'

-- Slow requests (>1s)
SELECT * FROM logs 
WHERE ms > 1000 
ORDER BY ms DESC 
LIMIT 100

-- Error rate per ora
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as errors
FROM logs 
WHERE level = 'error'
GROUP BY hour
ORDER BY hour DESC
```

---

#### 2️⃣ Papertrail

**Vantaggi:**
- ✅ Semplice setup
- ✅ Free tier: 50MB/mese, 7 giorni retention
- ✅ Syslog-compatible
- ✅ Alert via email/Slack

**Setup (Futuro):**
```bash
# 1. Crea account Papertrail
https://papertrailapp.com/

# 2. Ottieni destination (host:port)
# Dashboard → Settings → Log Destinations

# 3. Configura Render
# render.yaml:
services:
  - type: web
    name: badgenode
    env: node
    logStreams:
      - name: papertrail
        url: syslog+tls://logs.papertrailapp.com:12345
```

---

#### 3️⃣ Datadog (Enterprise)

**Vantaggi:**
- ✅ APM completo
- ✅ Metrics + Logs + Traces
- ✅ Dashboard avanzate
- ⚠️ Costo elevato ($15/host/mese)

**Setup (Futuro):**
```bash
# 1. Installa Datadog Agent
npm install dd-trace

# 2. Configura tracer
// server/lib/datadog.ts
import tracer from 'dd-trace';
tracer.init({
  service: 'badgenode',
  env: process.env.NODE_ENV,
  logInjection: true,
});

# 3. Environment variables
DD_API_KEY=<api_key>
DD_SITE=datadoghq.eu
DD_SERVICE=badgenode
DD_ENV=production
```

---

### Shipping Configuration

**Quando logger strutturato attivo (FEATURE_LOGGER_ADAPTER=true):**

#### Option A: Render Native Streaming

```yaml
# render.yaml
services:
  - type: web
    name: badgenode
    logStreams:
      - name: logtail
        url: https://in.logtail.com/<source_token>
```

#### Option B: Pino Transport

```typescript
// server/lib/logger.ts (futuro)
import pino from 'pino';

const transport = process.env.NODE_ENV === 'production'
  ? {
      target: 'pino-logtail',
      options: {
        sourceToken: process.env.LOGTAIL_SOURCE_TOKEN,
      },
    }
  : {
      target: 'pino-pretty',
      options: { colorize: true },
    };

export const logger = pino({ level: 'info' }, transport);
```

---

### Alert Configuration (Stub)

**Logtail Alerts:**

```javascript
// Alert: Error Rate > 10/min
{
  "name": "High Error Rate",
  "query": "level:error",
  "threshold": 10,
  "window": "1m",
  "channels": ["email", "slack"]
}

// Alert: Slow Requests > 2s
{
  "name": "Slow API Requests",
  "query": "ms:>2000",
  "threshold": 5,
  "window": "5m",
  "channels": ["slack"]
}

// Alert: Database Errors
{
  "name": "Database Connection Issues",
  "query": "error:*connection* OR error:*timeout*",
  "threshold": 3,
  "window": "5m",
  "channels": ["email", "pagerduty"]
}
```

---

### Dashboard Templates (Stub)

**Logtail Dashboard:**

```json
{
  "name": "BadgeNode Production",
  "widgets": [
    {
      "type": "timeseries",
      "title": "Requests per Minute",
      "query": "route:*",
      "groupBy": "route"
    },
    {
      "type": "table",
      "title": "Top Errors",
      "query": "level:error",
      "columns": ["timestamp", "route", "error", "requestId"],
      "limit": 50
    },
    {
      "type": "pie",
      "title": "Status Codes",
      "query": "status:*",
      "groupBy": "status"
    }
  ]
}
```

---

### Cost Estimation

| Provider | Free Tier | Paid (Small) | Paid (Medium) |
|----------|-----------|--------------|---------------|
| **Logtail** | 1GB/mese | $10/mese (5GB) | $50/mese (50GB) |
| **Papertrail** | 50MB/mese | $7/mese (1GB) | $25/mese (10GB) |
| **Datadog** | Trial 14d | $15/host/mese | $31/host/mese |

**Stima BadgeNode (produzione):**
- Log volume: ~500MB/mese (low traffic)
- Raccomandazione: **Logtail Free Tier** (1GB sufficiente)

---

### Migration Checklist (Futuro Sprint 4+)

- [ ] Scegliere aggregatore (Logtail raccomandato)
- [ ] Creare account e source token
- [ ] Configurare Render log streaming
- [ ] Testare shipping in staging
- [ ] Configurare alert (error rate, slow requests)
- [ ] Creare dashboard produzione
- [ ] Documentare runbook incident response
- [ ] Training team su query e dashboard

---

## 🎯 v1.3.0 — External Log Aggregator (Production Setup)

**Data:** 2025-11-01  
**Status:** ✅ Implementato (stub configuration)

### Overview

Configurazione finale per integrazione con aggregatore di log esterno in produzione. BadgeNode è ora pronto per shipping log a Logtail (Better Stack) o alternative.

---

### Provider: Logtail (Better Stack) — Raccomandato

**Caratteristiche:**
- ✅ Free tier: 100 MB/day (sufficiente per BadgeNode)
- ✅ Retention: 7 giorni (free), 30 giorni (paid)
- ✅ Real-time streaming
- ✅ SQL-like queries
- ✅ Alert preconfigurati
- ✅ Dashboard customizzabili

**Setup Produzione:**

#### 1️⃣ Environment Variables

```bash
# .env.production (Render)
VITE_FEATURE_LOGGER_ADAPTER=true
LOG_LEVEL=info
LOGTAIL_TOKEN=<YOUR_SOURCE_TOKEN>
NODE_ENV=production
```

#### 2️⃣ Logtail Integration (Stub)

**Opzione A: Render Native Streaming (Raccomandato)**

```yaml
# render.yaml
services:
  - type: web
    name: badgenode
    env: node
    logStreams:
      - name: logtail
        url: https://in.logs.betterstack.com/
        headers:
          Authorization: Bearer <LOGTAIL_TOKEN>
```

**Opzione B: Pino Transport (Futuro)**

```typescript
// server/lib/logger.ts (quando pino installato)
import pino from 'pino';

const transport = process.env.NODE_ENV === 'production' && process.env.LOGTAIL_TOKEN
  ? {
      target: 'pino-logtail',
      options: {
        sourceToken: process.env.LOGTAIL_TOKEN,
      },
    }
  : process.env.NODE_ENV === 'production'
  ? undefined // JSON to stdout
  : {
      target: 'pino-pretty',
      options: { colorize: true },
    };

export const logger = pino({ level: process.env.LOG_LEVEL || 'info' }, transport);
```

---

### Alert Configuration (Production)

**Logtail Alerts (Preconfigurati):**

#### 1️⃣ High Error Rate

```javascript
{
  "name": "BadgeNode: High Error Rate",
  "query": "level:error service:badgenode",
  "threshold": 10,
  "window": "1m",
  "channels": ["email", "slack"],
  "severity": "critical"
}
```

**Trigger:** >10 errori in 1 minuto  
**Action:** Email + Slack notification  
**Escalation:** PagerDuty dopo 5 minuti

#### 2️⃣ Slow API Requests

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
**Action:** Slack warning  
**Escalation:** Nessuna (solo monitoring)

#### 3️⃣ Database Connection Issues

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
**Action:** Email + PagerDuty  
**Escalation:** Immediata (on-call)

#### 4️⃣ Failed Timbrature

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
**Action:** Slack notification  
**Escalation:** Email dopo 30 minuti

---

### Dashboard Configuration (Production)

**Logtail Dashboard: BadgeNode Production**

```json
{
  "name": "BadgeNode Production",
  "refresh": "30s",
  "widgets": [
    {
      "type": "timeseries",
      "title": "Requests per Minute",
      "query": "route:* -route:health",
      "groupBy": "route",
      "interval": "1m"
    },
    {
      "type": "counter",
      "title": "Error Rate",
      "query": "level:error",
      "interval": "1m",
      "alert": "error_rate > 5"
    },
    {
      "type": "table",
      "title": "Recent Errors",
      "query": "level:error",
      "columns": ["timestamp", "route", "error", "requestId"],
      "limit": 50,
      "sort": "timestamp:desc"
    },
    {
      "type": "histogram",
      "title": "Response Time Distribution",
      "query": "ms:*",
      "field": "ms",
      "buckets": [0, 100, 500, 1000, 2000, 5000]
    },
    {
      "type": "pie",
      "title": "Status Codes",
      "query": "status:*",
      "groupBy": "status"
    },
    {
      "type": "timeseries",
      "title": "Timbrature Success Rate",
      "query": "route:timbrature:post",
      "groupBy": "level",
      "interval": "5m"
    }
  ]
}
```

---

### Log Rotation (Production)

**Quando pino installato + pino-roll:**

```typescript
// server/lib/logger.ts (futuro)
import pinoRoll from 'pino-roll';

const logger = pino(pinoRoll({
  file: 'logs/badgenode.log',
  size: '50m',  // 50 MB per file
  frequency: 'daily',  // Rotazione giornaliera
  mkdir: true,
  extension: '.log',
}));
```

**Configurazione:**
- **Directory:** `./logs/`
- **Max file size:** 50 MB
- **Rotazione:** Giornaliera (00:00 UTC)
- **Retention:** 7 giorni
- **Compressione:** gzip per file >3 giorni
- **Naming:** `badgenode.log`, `badgenode.log.1`, `badgenode.log.2.gz`

**Cleanup automatico:**
```bash
# Cron job (opzionale)
0 2 * * * find /app/logs -name "*.log.*.gz" -mtime +7 -delete
```

---

### Query Examples (Logtail)

**Errori ultimi 24h:**
```sql
SELECT * FROM logs 
WHERE level = 'error' 
  AND service = 'badgenode'
  AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
```

**Slow requests (>1s):**
```sql
SELECT route, AVG(ms) as avg_ms, COUNT(*) as count
FROM logs 
WHERE ms > 1000 
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY route
ORDER BY avg_ms DESC
```

**Error rate per ora:**
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

**Top errori per route:**
```sql
SELECT route, error, COUNT(*) as count
FROM logs 
WHERE level = 'error'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY route, error
ORDER BY count DESC
LIMIT 10
```

---

### Cost Estimation (Updated)

| Provider | Free Tier | Paid (Small) | Paid (Medium) | BadgeNode Fit |
|----------|-----------|--------------|---------------|---------------|
| **Logtail** | 100MB/day | $10/mese (1GB/day) | $50/mese (10GB/day) | ✅ Free Tier |
| **Papertrail** | 50MB/mese | $7/mese (1GB/mese) | $25/mese (10GB/mese) | ⚠️ Limite basso |
| **Datadog** | Trial 14d | $15/host/mese | $31/host/mese | ❌ Troppo costoso |

**Stima BadgeNode (produzione):**
- **Log volume:** ~50-80 MB/day (low-medium traffic)
- **Retention:** 7 giorni (free tier)
- **Alert:** 4 preconfigurati (inclusi)
- **Dashboard:** 1 custom (incluso)
- **Raccomandazione:** **Logtail Free Tier** (100MB/day sufficiente)

---

### Migration Checklist (Production)

- [x] ✅ Logger strutturato implementato (Sprint 2)
- [x] ✅ Feature flag VITE_FEATURE_LOGGER_ADAPTER (Sprint 2)
- [x] ✅ HTTP middleware httpLog (Sprint 3)
- [x] ✅ Migrazione console.* → log.* (Sprint 3-4, 28 migrati)
- [x] ✅ LOG_ROTATION.md documentato (Sprint 2-4)
- [ ] 🔜 Creare account Logtail
- [ ] 🔜 Ottenere Source Token
- [ ] 🔜 Configurare Render log streaming
- [ ] 🔜 Testare shipping in staging
- [ ] 🔜 Configurare 4 alert preconfigurati
- [ ] 🔜 Creare dashboard produzione
- [ ] 🔜 Documentare runbook incident response
- [ ] 🔜 Training team su query e dashboard

---

### Security & Compliance

**Log Data Protection:**
- ✅ Nessun PII loggato (solo PIN anonimo, no nome/cognome)
- ✅ Nessun token/password nei log (masked)
- ✅ Request ID per tracking anonimo
- ✅ HTTPS per shipping log (Logtail)
- ✅ Retention 7 giorni (GDPR compliant)

**Access Control:**
- ✅ Logtail: Team-based access
- ✅ Read-only per developers
- ✅ Admin-only per alert config
- ✅ Audit trail accessi log

---

**Last Updated:** 2025-11-01  
**Version:** 1.3.0  
**Next Review:** Sprint 5 (Logtail Production Activation)
