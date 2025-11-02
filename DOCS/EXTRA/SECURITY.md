# BadgeNode — Security Policy

## 🔒 Responsible Disclosure

BadgeNode prende seriamente la sicurezza. Se scopri una vulnerabilità, ti preghiamo di seguire questa procedura:

### Reporting Process

1. **Non aprire issue pubbliche** per vulnerabilità di sicurezza
2. **Invia una email** a: `security@badgenode.example.com` (sostituire con contatto reale)
3. **Includi**:
   - Descrizione dettagliata della vulnerabilità
   - Steps per riprodurre il problema
   - Impatto potenziale (CVSS score se disponibile)
   - Proof of concept (se applicabile)
   - Tua informazione di contatto

### Response Timeline

- **Acknowledgment**: Entro 72 ore dalla segnalazione
- **Initial Assessment**: Entro 7 giorni
- **Fix Development**: Entro 30 giorni (dipende da severità)
- **Public Disclosure**: Dopo fix deployment, coordinato con reporter

### Severity Levels

| Livello | Descrizione | Response Time |
|---------|-------------|---------------|
| 🔴 **Critical** | RCE, SQL Injection, Auth bypass | 24-48h |
| 🟠 **High** | XSS, CSRF, Data leak | 7 giorni |
| 🟡 **Medium** | Information disclosure, DoS | 14 giorni |
| 🟢 **Low** | Minor issues, best practices | 30 giorni |

---

## 🛡️ Security Architecture

### Authentication & Authorization

#### Supabase Row Level Security (RLS)

**Client-Side (ANON_KEY):**
- ✅ RLS policies attive su tutte le tabelle
- ✅ Accesso limitato a dati utente autenticato
- ✅ Nessun accesso diretto a tabelle sensibili
- ✅ Query filtrate automaticamente da Supabase

**Server-Side (SERVICE_ROLE_KEY):**
- ✅ Bypass RLS solo per operazioni admin
- ✅ Chiave mai esposta al client
- ✅ Validazione business logic lato server
- ✅ Audit log per operazioni privilegiate

#### Key Management

```
VITE_SUPABASE_ANON_KEY    → Client-side (pubblico, RLS attivo)
SUPABASE_SERVICE_ROLE_KEY → Server-only (privato, bypass RLS)
```

**Principi:**
- ❌ SERVICE_ROLE_KEY mai in bundle client
- ❌ SERVICE_ROLE_KEY mai in git/logs
- ✅ Rotazione chiavi ogni 90 giorni (raccomandato)
- ✅ Environment variables solo in `.env.local` (non commit)

---

### Data Protection

#### Personal Identifiable Information (PII)

**Dati Raccolti:**
- PIN dipendente (1-99, non PII)
- Timestamp timbrature (UTC)
- Device ID (hash anonimo per offline queue)

**Dati NON Raccolti:**
- Nome/cognome dipendente (gestito esternamente)
- Email, telefono, indirizzo
- Dati biometrici
- Location GPS

**Storage:**
- ✅ Database Supabase (PostgreSQL, timezone Europe/Rome)
- ✅ IndexedDB locale (solo coda offline, sync e purge)
- ❌ Nessun dato sensibile in localStorage/sessionStorage
- ❌ Nessun cookie di tracking

#### Encryption

- ✅ HTTPS/TLS 1.3 per tutte le comunicazioni
- ✅ Database encryption at rest (Supabase managed)
- ✅ Secrets gestiti via environment variables
- ✅ No hardcoded credentials in codebase

---

### Offline Queue Security

#### Device Whitelist

**Feature Flag:** `VITE_OFFLINE_DEVICE_WHITELIST`

```bash
# Development
VITE_OFFLINE_DEVICE_WHITELIST=BN_DEV_localhost_demo

# Production (esempio)
VITE_OFFLINE_DEVICE_WHITELIST=BN_TABLET_01,BN_TABLET_02,BN_TABLET_03
```

**Principi:**
- ✅ Device ID generato da `window.navigator` + hash
- ✅ Whitelist verificata prima di enqueue
- ❌ Mai usare `*` in produzione (bypass whitelist)
- ✅ Device ID visibile in `window.__BADGENODE_DIAG__.offline.deviceId`

#### Queue Validation

- ✅ Business logic validation offline (alternanza ENTRATA/USCITA)
- ✅ Retry con backoff exponential (max 3 tentativi)
- ✅ Timestamp client + server per audit
- ✅ UUID deduplication (`client_event_id`)

---

### API Security

#### Endpoints Protection

| Endpoint | Auth | RLS | Rate Limit |
|----------|------|-----|------------|
| `/api/health` | ❌ Public | N/A | 60/min |
| `/api/ready` | ❌ Public | N/A | 60/min |
| `/api/version` | ❌ Public | N/A | 60/min |
| `/api/pin/validate` | ✅ PIN | ✅ RLS | 10/min |
| `/api/timbrature` | ✅ Server-only | ❌ Bypass | 30/min |
| `/api/utenti` | ✅ Admin | ✅ RLS | 30/min |
| `/api/storico` | ✅ Auth | ✅ RLS | 30/min |

**Note:**
- Rate limiting gestito da Render (produzione)
- Development: nessun rate limit

#### Request Tracking

- ✅ `x-request-id` header univoco per ogni richiesta
- ✅ Logging strutturato (pianificato Sprint 2)
- ✅ Audit trail per operazioni admin
- ✅ Error tracking senza leak di secrets

---

### Dependency Security

#### Audit Process

```bash
# Check vulnerabilità production
npm audit --production

# Check vulnerabilità dev
npm audit

# Fix automatico (non breaking)
npm audit fix

# Security report
npm run security:audit
```

**Policy:**
- ✅ Audit mensile dipendenze
- ✅ Zero vulnerabilità critical/high in produzione
- ✅ Update dipendenze ogni trimestre
- ✅ Lockfile (`package-lock.json`) sempre committato

#### Known Dependencies

**Critical:**
- `@supabase/supabase-js` — Database client
- `express` — Backend server
- `react` — Frontend framework

**Security-Sensitive:**
- `dompurify` — XSS sanitization
- `zod` — Input validation
- `nanoid` — ID generation

---

### Deployment Security

#### Environment Separation

| Ambiente | URL | Secrets |
|----------|-----|---------|
| Development | localhost:10000 | `.env.local` (non commit) |
| Staging | staging.badgenode.example.com | Render env vars |
| Production | badgenode.example.com | Render env vars |

**Principi:**
- ✅ Secrets mai in git
- ✅ `.env.local` in `.gitignore`
- ✅ Environment validation al boot
- ✅ Render env vars encrypted at rest

#### Build Security

- ✅ TypeScript strict mode (zero `any` tollerati)
- ✅ ESLint security rules attive
- ✅ Pre-commit hooks (Husky)
- ✅ CI/CD checks: `npm run check:ci`
- ✅ No console.log in produzione (guard grep)

---

### Incident Response

#### Escalation Path

1. **Detection**: Monitoring, logs, user report
2. **Assessment**: Severity classification (Critical/High/Medium/Low)
3. **Containment**: Disable feature flag, rollback deploy
4. **Remediation**: Fix development, test, deploy
5. **Post-Mortem**: Root cause analysis, preventive measures

#### Emergency Contacts

- **Security Lead**: security@badgenode.example.com
- **DevOps On-Call**: ops@badgenode.example.com
- **Supabase Support**: support@supabase.com

#### Kill-Switch

**Feature Flags:**
```bash
# Disable offline queue (emergency)
VITE_FEATURE_OFFLINE_QUEUE=false

# Enable read-only mode (maintenance)
READ_ONLY_MODE=1
```

---

### Compliance

#### GDPR Considerations

- ✅ Minimal data collection (PIN + timestamp)
- ✅ No PII stored without consent
- ✅ Data retention: 90 giorni (configurabile)
- ✅ Right to deletion: admin panel
- ✅ Data export: CSV/PDF

#### Audit Trail

- ✅ Request ID tracking
- ✅ Timestamp UTC per ogni operazione
- ✅ User action logging (admin operations)
- ✅ Backup automatico con retention 3 copie

---

### Security Checklist

#### Pre-Deploy

- [ ] `npm audit --production` → 0 vulnerabilità critical/high
- [ ] `npm run check:ci` → PASS
- [ ] Environment variables validate
- [ ] Secrets rotation (se >90 giorni)
- [ ] Backup snapshot creato
- [ ] Rollback plan ready

#### Post-Deploy

- [ ] `/api/health` → 200 OK
- [ ] Smoke test login + timbratura
- [ ] Monitoring attivo (UptimeRobot)
- [ ] Logs verificati (no errori 5xx)
- [ ] Feature flags verificati

---

### Reporting Security Issues

**Hall of Fame:**

Ringraziamo i seguenti security researchers per le loro segnalazioni:

- (Nessuna segnalazione ricevuta finora)

**Rewards:**

- Riconoscimento pubblico (se desiderato)
- Crediti nel CHANGELOG
- Swag BadgeNode (per vulnerabilità High/Critical)

---

**Last Updated:** 2025-11-01  
**Version:** 1.0.0  
**Maintainer:** BadgeNode Security Team
