# Task-Fix

_Sorgenti consolidate: 6_

## FIX_FINALE_GIORNO_LOGICO.md

```markdown
# ✅ Fix Finale • Bug Giorno Logico (Timbrature Post-Mezzanotte)

**Data**: 2 novembre 2025, ore 01:47  
**Status**: 🟢 **RISOLTO E TESTATO**

---

## 🎯 Problema Risolto

**Scenario Bug**: Utente PIN 14 timbra ENTRATA sabato 1 novembre ore 18:56, poi tenta USCITA domenica 2 novembre ore 01:14 → pulsante USCITA disabilitato ❌

**Causa Root**: **Triplo problema client-server**

1. ❌ **Client Home**: cercava timbrature su "oggi" (data reale) invece di giorno logico
2. ❌ **Validazione offline**: usava cache localStorage inaffidabile per turni notturni
3. ❌ **Server**: non recuperava automaticamente `anchorDate` per uscite notturne

---

## 🔧 Soluzione Implementata (3 Fix)

### **Fix 1: Client Home - Calcolo Giorno Logico** ⭐ CRITICO

**File**: `client/src/pages/Home/index.tsx` (linee 47-56)

**Problema**: Alle 01:45 del 2 novembre, il client cercava timbrature su "2025-11-02" ma l'entrata era registrata su giorno logico "2025-11-01".

**Soluzione**: Calcola giorno logico considerando cutoff 05:00 prima di query database.

`` `typescript
// PRIMA (❌ ERRATO)
const today = formatDateLocal(new Date()); // "2025-11-02" alle 01:45
const list = await TimbratureService.getTimbratureGiorno(Number(pin), today);

// DOPO (✅ CORRETTO)
const now = new Date();
let targetDate = new Date(now);

// Se ora < 05:00, cerca sul giorno precedente (giorno logico)
if (now.getHours() < 5) {
  targetDate.setDate(targetDate.getDate() - 1);
}

const giornoLogico = formatDateLocal(targetDate); // "2025-11-01" alle 01:45
const list = await TimbratureService.getTimbratureGiorno(Number(pin), giornoLogico);
`` `

**Risultato**: Pulsante USCITA ora abilitato correttamente per turni notturni ✅

---

### **Fix 2: Server - Auto-Recovery anchorDate**

**File**: `server/routes/timbrature/postTimbratura.ts` (linee 82-98)

**Problema**: Client non invia `anchorDate` nelle timbrature normali, solo manuali.

**Soluzione**: Server recupera automaticamente `giorno_logico` dell'ultima ENTRATA per uscite notturne (00:00-05:00).

`` `typescript
// AUTO-RECOVERY per uscite notturne senza anchorDate
if (tipo === 'uscita' && !anchorDate && nowRome.getHours() >= 0 && nowRome.getHours() < 5) {
  const { data: lastEntries } = await supabaseAdmin!
    .from('timbrature')
    .select('giorno_logico')
    .eq('pin', pinNum)
    .eq('tipo', 'entrata')
    .order('ts_order', { ascending: false })
    .limit(1);
  
  if (lastEntries && lastEntries.length > 0) {
    anchorDate = (lastEntries[0] as { giorno_logico: string }).

*…contenuto abbreviato; vedi file originale nell'archivio estratto.*
```

## LOGTAIL_PRODUCTION_ACTIVATION.md

```markdown
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


*…contenuto abbreviato; vedi file originale nell'archivio estratto.*
```

## LOGTAIL_SETUP.md

```markdown
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

`` `bash
VITE_FEATURE_LOGGER_ADAPTER=true
NODE_ENV=staging
LOG_LEVEL=debug
LOGTAIL_TOKEN=<STAGING_SOURCE_TOKEN>
`` `

### Production

**Render Dashboard → badgenode-production → Environment:**

`` `bash
VITE_FEATURE_LOGGER_ADAPTER=true
NODE_ENV=production
LOG_LEVEL=info
LOGTAIL_TOKEN=<PRODUCTION_SOURCE_TOKEN>
`` `

**⚠️ NOTA:** Non aggiungere `LOGTAIL_TOKEN` in `.env.example` o `.env.local`!

---

## 📡 Step 3: Configurazione Log Streaming (Render)

### Opzione A: Render Native Streaming (Raccomandato)

**File:** `render.yaml` (già presente, solo documentazione)

`` `yaml
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
`` `

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

`` `bash
npm install pino pino-logtail
`` `

**File:** `server/lib/logger.ts` (modifica futura)

`` `typescript
import pino from 

*…contenuto abbreviato; vedi file originale nell'archivio estratto.*
```

## OFFLINE_DEVICE_IDS.md

```markdown
# Device ID per Offline Queue - BadgeNode

## Come Ottenere il Device ID

1. Apri l'app BadgeNode nel browser del dispositivo
2. Apri DevTools (F12) → Console
3. Esegui: `window.__BADGENODE_DIAG__.offline.deviceId`

## Device ID Autorizzati per Produzione

`` `
# Aggiornare questa lista con i device ID reali
# Formato: ID1,ID2,ID3 (separati da virgola, no spazi)

# Esempio:
# BN_DEV_abc123def456,BN_DEV_789xyz012,BN_PROD_mobile001

# TODO: Sostituire con device ID reali prima del deploy in produzione
BN_DEV_localhost_demo
`` `

## Configurazione ENV

Aggiornare `VITE_OFFLINE_DEVICE_WHITELIST` in `.env` di produzione:

`` `bash
VITE_OFFLINE_DEVICE_WHITELIST=BN_DEV_abc123def456,BN_DEV_789xyz012,BN_PROD_mobile001
`` `

⚠️ **IMPORTANTE**: Non usare mai `*` in produzione!
```

## README.md

```markdown
# BadgeNode - Sistema Timbrature Enterprise

Sistema PWA per la gestione delle timbrature aziendali con PIN, progettato per dispositivi mobile e desktop con sincronizzazione offline avanzata.

## 🚀 Quick Start (5 minuti)

### Prerequisiti
- **Node.js** ≥18.0.0 (LTS raccomandato)
- **npm** ≥9.0.0
- **Git** ≥2.30.0

### Setup Rapido
`` `bash
# 1. Clona il repository
git clone https://github.com/cameraconvista/badgenode.git
cd badgenode

# 2. Installa dipendenze
npm install

# 3. Configura environment
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Supabase

# 4. Verifica setup
npm run check && npm run check:ci

# 5. Avvia development server
npm run dev

# 6. Apri l'applicazione
open http://localhost:10000
`` `

## 🏗️ Architettura

### Stack Tecnologico
- **Frontend**: React 18.3.1 + TypeScript 5.6.3 + Vite 5.4.20
- **UI Framework**: Radix UI + TailwindCSS + Lucide Icons
- **Backend**: Express.js + TypeScript
- **Database**: Supabase PostgreSQL (timezone Europe/Rome)
- **PWA**: Service Worker + Offline Support
- **State Management**: TanStack Query + React Context

### Struttura Progetto
`` `
BadgeNode/
├── client/          # Frontend React PWA
├── server/          # Backend Express API
├── shared/          # Tipi condivisi
├── scripts/         # Automazione e utility
├── DOCS/           # Documentazione enterprise
└── supabase/       # Migrazioni database
`` `

### Funzionalità Principali
- **Timbrature PIN**: Sistema 1-99 con validazione
- **Giorno Logico**: Gestione turni notturni (cutoff 05:00)
- **Offline-First**: Sincronizzazione automatica
- **Admin Dashboard**: Gestione utenti e storico
- **PWA**: Installabile su mobile/desktop
- **Multi-sessione**: Più entrate/uscite per giorno

## 📚 Documentazione

### Guide Essenziali
- [**Setup Sviluppo**](DOCS/05_setup_sviluppo.md) - Onboarding completo
- [**Struttura Progetto**](DOCS/02_struttura_progetto.md) - Architettura dettagliata
- [**Database & API**](DOCS/01_database_api.md) - Schema e endpoints
- [**Troubleshooting**](DOCS/10_troubleshooting.md) - Risoluzione problemi

### Documentazione Tecnica
- [**Scripts Utilità**](DOCS/03_scripts_utilita.md) - Automazione e backup
- [**Configurazione**](DOCS/04_config_sviluppo.md) - Environment e tools
- [**Sistema Offline**](DOCS/09_offline.md) - Sincronizzazione avanzata
- [**UI Guidelines**](DOCS/08_ui_home_keypad.md) - Design system

### Logica Business
- [**Giorno Logico**](DOCS/07_logica_giorno_logico.md) - Regole timbrature
- [**Icons Gui

*…contenuto abbreviato; vedi file originale nell'archivio estratto.*
```

## TS_TODO.md

```markdown
# TypeScript TODO List

## Supabase Type Issues

### Server Routes - Insert/Update Operations

**Files affected:**
- `server/routes/timbrature/postManual.ts:147`
- `server/routes/timbrature/postTimbratura.ts:134`
- `server/routes/timbrature/updateTimbratura.ts:61`

**Issue:** Supabase client types are too restrictive, causing `never` type conflicts with our DTO objects.

**Current workaround:**
`` `typescript
// TODO(ts): replace with exact Supabase types
.insert([dto as any])
.update(patch as any)
`` `

**Proper solution:** 
1. Update Supabase client to latest version with better type inference
2. Generate proper database types with `supabase gen types typescript`
3. Use proper generic typing: `.from<'timbrature', TimbratureInsert>('timbrature')`

**Priority:** Medium - functionality works, only type safety is compromised
```
