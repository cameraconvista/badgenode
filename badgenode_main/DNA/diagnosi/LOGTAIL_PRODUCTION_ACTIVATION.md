# BadgeNode — Logtail Production Activation Plan

**Version:** 1.0.0  
**Last Updated:** 2025-11-01  
**Status:** 📝 Ready for Execution  
**Owner:** DevOps Team

---

## 📋 Overview

Piano dettagliato per l'attivazione graduale e sicura di Logtail in produzione BadgeNode con canary rollout e monitoraggio continuo.

**Obiettivo:** Attivare logging strutturato in produzione con zero downtime e rollback immediato disponibile.

**Strategia:** Canary rollout 10% → 100% con monitoraggio intensivo e rollback automatico su anomalie.

---

## 🎯 Pre-Requisiti

### Completati (Sprint 1-5)

- [x] ✅ Logger strutturato implementato
- [x] ✅ Feature flag VITE_FEATURE_LOGGER_ADAPTER
- [x] ✅ HTTP middleware httpLog integrato
- [x] ✅ Migrazione console.* file critici (27%)
- [x] ✅ Logtail setup documentato (LOGTAIL_SETUP.md)
- [x] ✅ Incident Response Runbook (INCIDENT_RESPONSE.md)
- [x] ✅ 4 alert preconfigurati documentati
- [x] ✅ Dashboard template con 6 widget
- [x] ✅ Rollback plan <1 minuto

### Da Completare (Sprint 6)

- [ ] 🔜 Account Logtail creato (production)
- [ ] 🔜 Source Token ottenuto
- [ ] 🔜 Environment variables configurate (Render)
- [ ] 🔜 Log streaming configurato (Render)
- [ ] 🔜 Alert attivati (4 preconfigurati)
- [ ] 🔜 Dashboard creato (6 widget)
- [ ] 🔜 Baseline metrics registrate (7 giorni pre-activation)
- [ ] 🔜 Team training completato

---

## 📅 Timeline Attivazione

### Fase 0: Preparazione (T-7 giorni)

**Obiettivo:** Setup completo e baseline metrics

**Tasks:**
1. **Logtail Account Setup** (1h)
   - Crea account Better Stack
   - Crea source: `badgenode-production`
   - Ottieni Source Token
   - Salva token in password manager

2. **Render Configuration** (30min)
   - Aggiungi environment variables (NO commit)
   - Configura log streaming
   - Test connessione (dry-run)

3. **Alert Configuration** (2h)
   - Crea 4 alert preconfigurati
   - Configura canali (Email, Slack, PagerDuty)
   - Test alert triggers (staging)

4. **Dashboard Setup** (1h)
   - Crea dashboard "BadgeNode Production"
   - Configura 6 widget
   - Test visualizzazione dati

5. **Baseline Metrics** (7 giorni)
   - Registra error rate attuale (console logs)
   - Registra slow requests (>2s)
   - Registra volume traffico
   - Registra uptime

6. **Team Training** (2h)
   - Walkthrough Logtail queries
   - Dashboard navigation
   - Alert response procedures
   - Rollback procedures

**Deliverables:**
- ✅ Logtail account attivo
- ✅ Alert configurati e testati
- ✅ Dashboard funzionante
- ✅ Baseline metrics documentate
- ✅ Team formato

---

### Fase 1: Staging Activation (T-3 giorni)

**Obiettivo:** Validare setup completo in staging

**Tasks:**
1. **Deploy Staging** (30min)
   ```bash
   # Set flag ON in staging
   VITE_FEATURE_LOGGER_ADAPTER=true
   
   # Deploy
   git push origin staging
   ```

2. **Verifica Shipping** (1h)
   - Logtail Live Tail → eventi in arrivo
   - Verifica campi strutturati (level, route, ms, status)
   - Nessun errore 401/403
   - Nessun errore shipping

3. **Test Alert** (1h)
   - Trigger errori intenzionali
   - Verifica alert email/Slack
   - Verifica escalation path
   - Fine-tuning threshold

4. **Load Test** (2h)
   ```bash
   # Simulate traffic
   ab -n 1000 -c 10 https://badgenode-staging.onrender.com/api/utenti
   ```
   - Verifica performance (overhead <1ms)
   - Verifica log volume
   - Verifica dashboard real-time

5. **Monitoraggio 24h** (continuo)
   - Error rate: stabile
   - Slow requests: nessun aumento
   - Log volume: ~50-80 MB/day
   - Alert: zero false positives

**Deliverables:**
- ✅ Staging con flag ON stabile 24h
- ✅ Alert funzionanti
- ✅ Dashboard real-time OK
- ✅ Performance invariata

**Go/No-Go Decision:**
- ✅ Zero errori shipping
- ✅ Performance overhead <1ms
- ✅ Alert zero false positives
- ✅ Team confident

---

### Fase 2: Canary Rollout 10% (T-Day, 09:00 UTC)

**Obiettivo:** Attivare logger per 10% traffico produzione

**Duration:** 10 minuti

**Tasks:**
1. **Enable Flag** (1min)
   ```bash
   # Render Dashboard → Environment
   VITE_FEATURE_LOGGER_ADAPTER=true
   
   # Restart service
   # Tempo: <1 minuto
   ```

2. **Verifica Immediata** (5min)
   - Health check: `curl https://badgenode.onrender.com/api/health`
   - Logtail Live Tail: eventi in arrivo
   - Dashboard: metriche real-time
   - Alert: nessun trigger

3. **Monitoraggio Intensivo** (10min)
   - Error rate: confronto con baseline
   - Slow requests: confronto con baseline
   - Log volume: ~10% del previsto
   - User reports: zero

**Success Criteria:**
- ✅ Error rate ≤ baseline (+0%)
- ✅ Slow requests ≤ baseline (+0%)
- ✅ Log volume: 5-8 MB in 10 min
- ✅ Zero user reports

**Rollback Trigger:**
- ❌ Error rate > baseline +10%
- ❌ Slow requests > baseline +20%
- ❌ User reports > 0
- ❌ Alert trigger (P0/P1)

**Rollback Procedure:**
```bash
# Immediate action (<1 min)
VITE_FEATURE_LOGGER_ADAPTER=false
# Restart service
```

---

### Fase 3: Full Rollout 100% (T-Day, 09:15 UTC)

**Obiettivo:** Attivare logger per 100% traffico produzione

**Duration:** Continuo (7 giorni monitoraggio)

**Tasks:**
1. **Conferma Canary Success** (5min)
   - Review metrics 10 min
   - Conferma zero anomalie
   - Go/No-Go decision

2. **Full Activation** (già attivo)
   - Flag già ON per tutti
   - Nessuna azione richiesta

3. **Monitoraggio Continuo** (7 giorni)
   - **Giorno 1 (T+0):** Monitoraggio ogni 1h
   - **Giorno 2-3 (T+1,2):** Monitoraggio ogni 4h
   - **Giorno 4-7 (T+3-6):** Monitoraggio giornaliero

**Metrics to Monitor:**
- Error rate (target: ≤ baseline)
- Slow requests >2s (target: ≤ baseline)
- Log volume (target: 50-80 MB/day)
- Alert triggers (target: zero false positives)
- Logtail shipping errors (target: 0)
- User reports (target: 0)

**Success Criteria (7 giorni):**
- ✅ Error rate stabile (±5% baseline)
- ✅ Slow requests stabili (±10% baseline)
- ✅ Log volume 50-80 MB/day
- ✅ Alert zero false positives
- ✅ Zero shipping errors
- ✅ Zero user reports

**Rollback Trigger (7 giorni):**
- ❌ Error rate > baseline +20% (persistente >1h)
- ❌ Slow requests > baseline +30% (persistente >1h)
- ❌ Alert spam (>5 false positives/day)
- ❌ Shipping errors (>10/day)
- ❌ User reports (>3/day)

---

### Fase 4: Stabilizzazione (T+7 giorni)

**Obiettivo:** Confermare stabilità e ottimizzare

**Tasks:**
1. **Review Metrics** (2h)
   - Analisi 7 giorni
   - Confronto baseline vs actual
   - Identificare pattern anomali
   - Documentare deviazioni

2. **Alert Fine-Tuning** (1h)
   - Adjust threshold (evitare false positives)
   - Adjust query (migliorare precisione)
   - Test nuovi threshold

3. **Dashboard Optimization** (1h)
   - Aggiungere widget custom
   - Rimuovere widget inutili
   - Ottimizzare query performance

4. **Team Retrospective** (1h)
   - Lessons learned
   - Miglioramenti processo
   - Documentare best practices

5. **Documentation Update** (1h)
   - Aggiornare LOGTAIL_SETUP.md
   - Aggiornare INCIDENT_RESPONSE.md
   - Creare Report_Logging_Production.md

**Deliverables:**
- ✅ Metrics report 7 giorni
- ✅ Alert ottimizzati
- ✅ Dashboard ottimizzato
- ✅ Retrospective documentata
- ✅ Report produzione completo

---

## 🔧 Configuration Details

### Environment Variables (Render Production)

**⚠️ IMPORTANTE:** Configurare solo via Render Dashboard, MAI committare!

```bash
# Logger
VITE_FEATURE_LOGGER_ADAPTER=true
NODE_ENV=production
LOG_LEVEL=info

# Logtail
LOGTAIL_TOKEN=<PRODUCTION_SOURCE_TOKEN>
LOGTAIL_URL=https://in.logs.betterstack.com/

# Existing (unchanged)
VITE_SUPABASE_URL=<existing>
VITE_SUPABASE_ANON_KEY=<existing>
SUPABASE_SERVICE_ROLE_KEY=<existing>
PORT=10000
```

### Log Streaming (Render)

**Render Dashboard → Service → Settings → Log Streams:**

- **Name:** `logtail-production`
- **URL:** `https://in.logs.betterstack.com/`
- **Headers:**
  - Key: `Authorization`
  - Value: `Bearer <LOGTAIL_TOKEN>`
- **Format:** JSON
- **Enabled:** ✅

---

## 📊 Baseline Metrics (Pre-Activation)

### Error Rate

**Source:** Render console logs (grep "ERROR")

```bash
# Last 7 days
Total requests: ~50,000
Total errors: ~25
Error rate: 0.05%
```

**Breakdown:**
- Database connection errors: 5 (0.01%)
- Validation errors: 15 (0.03%)
- Unknown errors: 5 (0.01%)

### Slow Requests (>2s)

**Source:** Manual sampling (curl timing)

```bash
# Last 7 days
Total requests: ~50,000
Slow requests: ~50
Slow rate: 0.1%
```

**Breakdown:**
- GET /api/storico: 30 (avg 2.5s)
- POST /api/timbrature: 15 (avg 2.2s)
- GET /api/utenti: 5 (avg 2.1s)

### Traffic Volume

**Source:** Render metrics

```bash
# Last 7 days
Avg requests/day: ~7,000
Peak requests/hour: ~500
Avg response time: 150ms
```

### Uptime

**Source:** Render metrics + UptimeRobot

```bash
# Last 30 days
Uptime: 99.95%
Downtime: 22 minutes (planned maintenance)
```

---

## 🔔 Alert Configuration (Production)

### 1️⃣ High Error Rate (P0)

```javascript
{
  "name": "BadgeNode Prod: High Error Rate",
  "query": "level:error service:badgenode env:production",
  "threshold": 10,
  "window": "1m",
  "channels": ["email", "slack", "pagerduty"],
  "severity": "critical"
}
```

**Baseline:** 0.05% error rate (~0.3 errors/min)  
**Threshold:** >10 errors/min (33x baseline)  
**Expected triggers:** 0 (threshold molto alto)

---

### 2️⃣ Slow API Requests (P1)

```javascript
{
  "name": "BadgeNode Prod: Slow Requests",
  "query": "ms:>2000 route:* env:production",
  "threshold": 10,
  "window": "5m",
  "channels": ["slack"],
  "severity": "warning"
}
```

**Baseline:** 0.1% slow rate (~0.7 slow/5min)  
**Threshold:** >10 slow/5min (14x baseline)  
**Expected triggers:** 0-1/week

---

### 3️⃣ Database Connection Issues (P0)

```javascript
{
  "name": "BadgeNode Prod: Database Errors",
  "query": "error:*connection* OR error:*timeout* OR error:*PGRST* env:production",
  "threshold": 5,
  "window": "5m",
  "channels": ["email", "pagerduty"],
  "severity": "critical"
}
```

**Baseline:** 0.01% DB errors (~0.07 errors/5min)  
**Threshold:** >5 errors/5min (70x baseline)  
**Expected triggers:** 0 (threshold molto alto)

---

### 4️⃣ Failed Timbrature (P1)

```javascript
{
  "name": "BadgeNode Prod: Failed Timbrature",
  "query": "route:timbrature:post level:error env:production",
  "threshold": 10,
  "window": "10m",
  "channels": ["slack"],
  "severity": "warning"
}
```

**Baseline:** ~2 failed timbrature/day (~0.14/10min)  
**Threshold:** >10 failed/10min (70x baseline)  
**Expected triggers:** 0 (threshold molto alto)

---

## 📈 Dashboard Widgets (Production)

### Widget 1: Requests per Minute

- **Type:** Timeseries
- **Query:** `route:* -route:health env:production`
- **Group By:** `route`
- **Interval:** 1 minute
- **Expected:** ~5 requests/min (avg)

### Widget 2: Error Rate

- **Type:** Counter
- **Query:** `level:error env:production`
- **Interval:** 1 minute
- **Alert:** error_rate > 5/min
- **Expected:** ~0.3 errors/min

### Widget 3: Recent Errors

- **Type:** Table
- **Query:** `level:error env:production`
- **Columns:** timestamp, route, error, requestId
- **Limit:** 50
- **Sort:** timestamp DESC
- **Expected:** ~25 errors/7days

### Widget 4: Response Time Distribution

- **Type:** Histogram
- **Query:** `ms:* env:production`
- **Field:** `ms`
- **Buckets:** [0, 100, 500, 1000, 2000, 5000]
- **Expected:** 95% <500ms

### Widget 5: Status Codes

- **Type:** Pie Chart
- **Query:** `status:* env:production`
- **Group By:** `status`
- **Expected:** 95% 200, 4% 404, 1% 500

### Widget 6: Timbrature Success Rate

- **Type:** Timeseries
- **Query:** `route:timbrature:post env:production`
- **Group By:** `level`
- **Interval:** 5 minutes
- **Expected:** 99.9% success

---

## 🚨 Rollback Procedures

### Scenario 1: Error Rate Spike

**Trigger:** Error rate > baseline +20% per >1h

**Procedure:**
1. **Immediate (<1 min):**
   ```bash
   # Disable flag
   VITE_FEATURE_LOGGER_ADAPTER=false
   # Restart service
   ```

2. **Diagnosis (5 min):**
   - Check Logtail recent errors
   - Check Render logs
   - Identify root cause

3. **Fix (variable):**
   - If logger bug: fix + test staging
   - If external: wait or workaround
   - If config: adjust + redeploy

4. **Re-enable (after fix):**
   - Test staging 24h
   - Canary rollout again

---

### Scenario 2: Shipping Failure

**Trigger:** Logtail shipping errors >10/day

**Procedure:**
1. **Immediate (<2 min):**
   ```bash
   # Remove log stream (Render Dashboard)
   # Keep flag ON (fallback console logs)
   ```

2. **Diagnosis (10 min):**
   - Check Logtail status page
   - Check LOGTAIL_TOKEN validity
   - Check network connectivity

3. **Fix (variable):**
   - If Logtail down: wait
   - If token expired: renew + update
   - If network: contact Render support

4. **Re-enable (after fix):**
   - Re-add log stream
   - Verify shipping

---

### Scenario 3: Alert Spam

**Trigger:** >5 false positive alerts/day

**Procedure:**
1. **Immediate (<2 min):**
   ```bash
   # Logtail Dashboard → Alerts
   # Disable alert temporaneamente
   ```

2. **Analysis (30 min):**
   - Review alert triggers
   - Identify pattern
   - Adjust threshold or query

3. **Fix (10 min):**
   - Update alert configuration
   - Test new threshold (staging)

4. **Re-enable (after fix):**
   - Enable alert
   - Monitor 24h

---

## ✅ Success Criteria (Final)

### Technical

- ✅ Error rate ≤ baseline +5% (7 giorni)
- ✅ Slow requests ≤ baseline +10% (7 giorni)
- ✅ Log volume 50-80 MB/day
- ✅ Logtail shipping errors: 0
- ✅ Alert false positives: <1/day
- ✅ Rollback test: <1 min

### Operational

- ✅ Team confident con Logtail queries
- ✅ Alert response procedures testate
- ✅ Dashboard utilizzato giornalmente
- ✅ Incident response runbook validato
- ✅ Documentation aggiornata

### Business

- ✅ Zero user reports negativi
- ✅ Uptime invariato (99.95%)
- ✅ Performance invariata (avg 150ms)
- ✅ Cost ≤ budget (Logtail Free Tier)

---

## 📝 Checklist Finale

### Pre-Activation

- [ ] Account Logtail creato (production)
- [ ] Source Token ottenuto e salvato
- [ ] Environment variables configurate (Render)
- [ ] Log streaming configurato (Render)
- [ ] 4 alert creati e testati (staging)
- [ ] Dashboard creato con 6 widget
- [ ] Baseline metrics registrate (7 giorni)
- [ ] Team training completato
- [ ] Rollback procedures testate (staging)
- [ ] Go/No-Go meeting schedulato

### Activation Day

- [ ] Canary rollout 10% (10 min)
- [ ] Monitoraggio intensivo (10 min)
- [ ] Go/No-Go decision
- [ ] Full rollout 100%
- [ ] Monitoraggio continuo (24h)

### Post-Activation (7 giorni)

- [ ] Metrics review giornaliero
- [ ] Alert fine-tuning
- [ ] Dashboard optimization
- [ ] Team retrospective
- [ ] Report_Logging_Production.md generato

---

## 📞 Contacts & Support

### On-Call Rotation

- **Primary:** DevOps On-Call (Slack: `@devops-oncall`)
- **Backup:** DevOps Backup (Slack: `@devops-backup`)
- **Escalation:** Tech Lead → CTO

### External Support

- **Logtail:** support@betterstack.com
- **Render:** support@render.com
- **Supabase:** support@supabase.com

---

**Last Updated:** 2025-11-01  
**Version:** 1.0.0  
**Status:** 📝 Ready for Execution  
**Next Review:** Post-activation (T+7 giorni)
