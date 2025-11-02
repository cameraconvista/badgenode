# Decisioni-Regole

_Sorgenti consolidate: 1_

## CONTRIBUTING.md

```markdown
# BadgeNode — Contributing Guidelines

Grazie per il tuo interesse nel contribuire a BadgeNode! Questo documento fornisce le linee guida per contribuire al progetto.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Convention](#commit-convention)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)

---

## 🤝 Code of Conduct

### Our Pledge

Ci impegniamo a rendere la partecipazione al nostro progetto un'esperienza priva di molestie per tutti, indipendentemente da età, corporatura, disabilità, etnia, identità di genere, livello di esperienza, nazionalità, aspetto personale, razza, religione o identità e orientamento sessuale.

### Our Standards

**Comportamenti Positivi:**
- ✅ Linguaggio accogliente e inclusivo
- ✅ Rispetto per punti di vista ed esperienze diverse
- ✅ Accettazione costruttiva delle critiche
- ✅ Focus su ciò che è meglio per la community
- ✅ Empatia verso altri membri

**Comportamenti Inaccettabili:**
- ❌ Linguaggio o immagini sessualizzate
- ❌ Trolling, insulti o attacchi personali
- ❌ Molestie pubbliche o private
- ❌ Pubblicazione di informazioni private altrui
- ❌ Condotta non professionale

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥18.0.0 (LTS raccomandato)
- **npm** ≥9.0.0
- **Git** ≥2.30.0
- **Editor** con supporto EditorConfig

### Initial Setup

`` `bash
# 1. Fork del repository
# Vai su GitHub e clicca "Fork"

# 2. Clona il tuo fork
git clone https://github.com/YOUR_USERNAME/badgenode.git
cd badgenode

# 3. Aggiungi upstream remote
git remote add upstream https://github.com/cameraconvista/badgenode.git

# 4. Installa dipendenze
npm install

# 5. Configura environment
cp .env.example .env.local
# Modifica .env.local con le tue credenziali Supabase

# 6. Verifica setup
npm run check && npm run check:ci

# 7. Avvia development server
npm run dev
`` `

---

## 🔄 Development Workflow

### Branch Naming Convention

`` `
<type>/<scope>-<short-description>

Esempi:
feature/offline-queue-retry
fix/pin-validation-404
docs/api-endpoints-guide
refactor/supabase-client-singleton
perf/bundle-lazy-loading
test/e2e-timbrature-flow
chore/deps-update-react
`` `

**Types:**
- `feature/` — Nuova funzionalità
- `fix/` — Bug fix
- `docs/` — Solo documentazione
- `refactor/` — Refactoring senza cambio fu

*…contenuto abbreviato; vedi file originale nell'archivio estratto.*
```
