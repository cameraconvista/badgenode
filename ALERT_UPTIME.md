# BadgeNode — Alert & Uptime Monitoring

**Versione:** 1.0.0  
**Ultima Revisione:** 2025-11-01

---

## 📋 Overview

Questo documento descrive la configurazione del monitoraggio uptime e degli alert per BadgeNode in produzione.

**Obiettivo:** Rilevare downtime e problemi di performance in tempo reale, con notifiche automatiche al team.

---

## 🎯 Monitoring Strategy

### Endpoints Monitorati

| Endpoint | Tipo | Frequenza | Timeout | Alert Threshold |
|----------|------|-----------|---------|-----------------|
| `/api/health` | HTTP GET | 5 min | 30s | 2 fallimenti consecutivi |
| `/api/ready` | HTTP GET | 5 min | 10s | 2 fallimenti consecutivi |
| `/` (Home) | HTTP GET | 10 min | 30s | 3 fallimenti consecutivi |

### Metriche Monitorate

- **Uptime**: Percentuale disponibilità (target: >99.5%)
- **Response Time**: Latenza endpoint (target: <500ms)
- **Status Code**: HTTP status (target: 200 OK)
- **SSL Certificate**: Validità certificato (alert 7 giorni prima scadenza)

---

## 🔧 UptimeRobot Configuration

### Setup Account

1. **Registrazione**: https://uptimerobot.com/
2. **Piano**: Free (50 monitors, 5 min interval) o Pro (1 min interval)
3. **Dashboard**: https://dashboard.uptimerobot.com/

### Monitor #1: Health Endpoint

**Configurazione:**
```
Name: BadgeNode - Health Check
Type: HTTP(s)
URL: https://badgenode.onrender.com/api/health
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
HTTP Method: GET
Expected Status Code: 200
Keyword Check: "healthy" (opzionale)
Alert Contacts: Email, Slack, Telegram
```

**Alert Rules:**
- **Down**: 2 fallimenti consecutivi (10 minuti)
- **Up**: 1 successo dopo down
- **Slow Response**: >2000ms (warning)

### Monitor #2: Ready Endpoint

**Configurazione:**
```
Name: BadgeNode - Ready Check
Type: HTTP(s)
URL: https://badgenode.onrender.com/api/ready
Monitoring Interval: 5 minutes
Monitor Timeout: 10 seconds
HTTP Method: GET
Expected Status Code: 200
Keyword Check: "ready"
Alert Contacts: Email, Slack, Telegram
```

**Alert Rules:**
- **Down**: 2 fallimenti consecutivi (10 minuti)
- **Up**: 1 successo dopo down

### Monitor #3: Home Page

**Configurazione:**
```
Name: BadgeNode - Home Page
Type: HTTP(s)
URL: https://badgenode.onrender.com/
Monitoring Interval: 10 minutes
Monitor Timeout: 30 seconds
HTTP Method: GET
Expected Status Code: 200
Keyword Check: "BadgeNode" (opzionale)
Alert Contacts: Email
```

**Alert Rules:**
- **Down**: 3 fallimenti consecutivi (30 minuti)
- **Up**: 1 successo dopo down

### SSL Certificate Monitor

**Configurazione:**
```
Name: BadgeNode - SSL Certificate
Type: Port
URL: badgenode.onrender.com
Port: 443
Monitoring Interval: 1 day
Alert: 7 giorni prima scadenza
Alert Contacts: Email, Slack
```

---

## 🔔 Alert Channels

### Email Notifications

**Configurazione:**
```
Primary: ops@badgenode.example.com
Secondary: dev@badgenode.example.com
Format: Plain text o HTML
Include: Status, Response Time, Error Message
```

**Email Template:**
```
Subject: [BadgeNode] Monitor DOWN: {monitor_name}

Monitor: {monitor_name}
URL: {monitor_url}
Status: DOWN
Response Time: {response_time}ms
Error: {error_message}
Timestamp: {timestamp}

Dashboard: https://dashboard.uptimerobot.com/
```

### Slack Integration

**Setup:**
1. Crea Slack Incoming Webhook: https://api.slack.com/messaging/webhooks
2. Aggiungi webhook URL in UptimeRobot → Alert Contacts → Slack
3. Seleziona canale: `#badgenode-alerts`

**Slack Message Format:**
```
🔴 BadgeNode Monitor DOWN
Monitor: Health Check
URL: https://badgenode.onrender.com/api/health
Status: 503 Service Unavailable
Response Time: Timeout (30s)
Timestamp: 2025-11-01 15:30:00 UTC

Dashboard: https://dashboard.uptimerobot.com/
```

### Telegram Bot (opzionale)

**Setup:**
1. Crea bot Telegram: https://t.me/BotFather
2. Ottieni Bot Token
3. Aggiungi bot al gruppo `BadgeNode Ops`
4. Configura in UptimeRobot → Alert Contacts → Telegram

**Telegram Message:**
```
🔴 BadgeNode DOWN

Monitor: Health Check
Status: 503
Time: 15:30 UTC

https://dashboard.uptimerobot.com/
```

---

## 🚨 Incident Response

### Alert Severity

| Severity | Condition | Response Time | Action |
|----------|-----------|---------------|--------|
| 🔴 **Critical** | `/api/health` DOWN >10min | 15 min | Immediate investigation |
| 🟠 **High** | `/api/ready` DOWN >10min | 30 min | Check logs, restart if needed |
| 🟡 **Medium** | Home page DOWN >30min | 1 hour | Verify CDN, check build |
| 🟢 **Low** | Slow response >2s | 4 hours | Performance analysis |

### Escalation Path

**Level 1: On-Call Engineer** (0-15 min)
- Riceve alert via Email/Slack/Telegram
- Verifica dashboard UptimeRobot
- Check Render logs: https://dashboard.render.com/
- Verifica `/api/health` manualmente

**Level 2: DevOps Lead** (15-30 min)
- Se Level 1 non risponde o non risolve
- Accesso completo Render + Supabase
- Decisione rollback o hotfix

**Level 3: CTO** (30+ min)
- Se downtime >30 minuti
- Decisione comunicazione clienti
- Post-mortem planning

### Response Actions

#### 1. Verify Incident

```bash
# Check health endpoint
curl -i https://badgenode.onrender.com/api/health

# Check Render status
# Dashboard: https://dashboard.render.com/

# Check Supabase status
# Dashboard: https://app.supabase.com/
```

#### 2. Diagnose Issue

**Common Causes:**
- ❌ Render service sleeping (free tier)
- ❌ Supabase connection timeout
- ❌ Build failure
- ❌ Environment variables missing
- ❌ Database migration failed
- ❌ Memory/CPU limit exceeded

**Diagnostic Commands:**
```bash
# Render logs
# Dashboard → Logs → Last 100 lines

# Check recent deploys
# Dashboard → Deploys → Recent

# Check environment variables
# Dashboard → Environment → Variables
```

#### 3. Resolve Issue

**Quick Fixes:**
```bash
# Restart service (Render)
# Dashboard → Manual Deploy → Restart

# Rollback deploy
# Dashboard → Deploys → Rollback to previous

# Clear cache
# Dashboard → Settings → Clear Build Cache
```

#### 4. Verify Resolution

```bash
# Check health again
curl https://badgenode.onrender.com/api/health

# Run smoke tests
npm run smoke:runtime

# Check UptimeRobot dashboard
# Verify monitor is UP
```

#### 5. Post-Incident

- [ ] Document incident in `DOCS/incidents/YYYY-MM-DD-incident.md`
- [ ] Update runbook if new issue discovered
- [ ] Schedule post-mortem meeting (if >30min downtime)
- [ ] Notify stakeholders of resolution

---

## 📊 Render Health Checks

### Native Render Monitoring

**Configurazione (render.yaml):**
```yaml
services:
  - type: web
    name: badgenode
    env: node
    buildCommand: npm run build
    startCommand: npm run start
    healthCheckPath: /api/health
    autoDeploy: true
```

**Health Check Settings:**
- **Path**: `/api/health`
- **Interval**: 30 secondi
- **Timeout**: 10 secondi
- **Unhealthy Threshold**: 3 fallimenti consecutivi
- **Action**: Restart service automaticamente

### Render Notifications

**Setup:**
1. Dashboard Render → Settings → Notifications
2. Aggiungi email: `ops@badgenode.example.com`
3. Eventi:
   - [ ] Deploy started
   - [ ] Deploy succeeded
   - [x] Deploy failed
   - [x] Service unhealthy
   - [x] Service restarted

---

## 📈 Performance Monitoring

### Response Time Tracking

**UptimeRobot:**
- Grafici response time ultimi 7/30/90 giorni
- Alert se avg response time >2s per 1 ora
- Export dati CSV per analisi

**Target SLA:**
- **Uptime**: >99.5% (max 3.6 ore downtime/mese)
- **Response Time**: <500ms (p95)
- **Error Rate**: <0.1%

### Custom Metrics (futuro)

**Pianificato Sprint 2+:**
- Application Performance Monitoring (APM)
- Real User Monitoring (RUM)
- Error tracking (Sentry)
- Log aggregation (Logtail, Papertrail)

---

## 🔧 Maintenance Windows

### Scheduled Maintenance

**Notifica:**
- Comunicare 48 ore prima
- Email a tutti gli utenti
- Banner in app (se possibile)

**Timing:**
- Preferibile: Domenica 02:00-04:00 UTC
- Evitare: Lunedì-Venerdì 08:00-18:00 UTC

**Durante Manutenzione:**
- Disabilitare alert UptimeRobot temporaneamente
- Mettere app in read-only mode (`READ_ONLY_MODE=1`)
- Monitorare manualmente

---

## 📝 Reporting

### Weekly Report

**Generato automaticamente da UptimeRobot:**
- Uptime percentage
- Average response time
- Downtime incidents
- Alert count

**Invio:**
- Email: `ops@badgenode.example.com`
- Frequenza: Ogni lunedì 09:00 UTC

### Monthly Report

**Contenuti:**
- SLA compliance (target: >99.5%)
- Performance trends
- Incident summary
- Action items

**Review:**
- Meeting mensile team ops
- Identificare pattern
- Pianificare miglioramenti

---

## 🆘 Emergency Contacts

### On-Call Rotation

| Week | Primary | Secondary |
|------|---------|-----------|
| 1-7 Nov | Engineer A | Engineer B |
| 8-14 Nov | Engineer B | Engineer C |
| 15-21 Nov | Engineer C | Engineer A |

### Contact Info

**Primary:**
- Email: oncall@badgenode.example.com
- Phone: +39 XXX XXX XXXX
- Slack: @oncall

**Secondary:**
- Email: ops@badgenode.example.com
- Phone: +39 YYY YYY YYYY
- Slack: @ops-team

**Escalation:**
- DevOps Lead: devops@badgenode.example.com
- CTO: cto@badgenode.example.com

---

## 📚 Resources

### Dashboards

- **UptimeRobot**: https://dashboard.uptimerobot.com/
- **Render**: https://dashboard.render.com/
- **Supabase**: https://app.supabase.com/

### Documentation

- **POST_DEPLOY_CHECKLIST.md**: Verifica post-deploy
- **DOCS/10_troubleshooting.md**: Risoluzione problemi comuni
- **SECURITY.md**: Incident response security

### Tools

- **curl**: Test endpoint manuali
- **npm run smoke:runtime**: Smoke test Supabase
- **npm run health:check**: Health check locale

---

**Last Updated:** 2025-11-01  
**Version:** 1.0.0  
**Maintainer:** BadgeNode Ops Team
