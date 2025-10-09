# 05 🚀 SETUP SVILUPPO - BadgeNode

**Onboarding rapido per sviluppatori**  
**Versione**: 2.0 • **Data**: 2025-10-09

---

## 📋 Contenuti

1. [Quick Start](#quick-start)
2. [Clonazione e Setup](#clonazione-e-setup)
3. [Workflow Development](#workflow-development)
4. [Checklist Pre-Commit](#checklist-pre-commit)
5. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### **Setup Completo (5 minuti)**
```bash
# 1. Clona repository
git clone https://github.com/cameraconvista/badgenode.git
cd badgenode

# 2. Installa dipendenze
npm install

# 3. Configura environment
cp .env.example .env.local
# Modifica .env.local con le tue configurazioni

# 4. Verifica setup
npm run check && npm run lint

# 5. Avvia development
npm run dev

# 6. Apri browser
open http://localhost:3001
```

### **Verifica Installazione**
```bash
# Test completo sistema
npm run health:check

# Backup iniziale
npm run esegui:backup

# Diagnosi progetto
npm run diagnose
```

---

## 📥 Clonazione e Setup

### **Repository Setup**
```bash
# Clonazione con SSH (raccomandato)
git clone git@github.com:cameraconvista/badgenode.git

# Clonazione con HTTPS
git clone https://github.com/cameraconvista/badgenode.git

# Entra nella directory
cd badgenode

# Verifica remote
git remote -v
```

### **Dependencies Installation**
```bash
# Installazione standard
npm install

# Installazione pulita (se problemi)
rm -rf node_modules package-lock.json
npm install

# Verifica installazione
npm list --depth=0
```

### **Environment Configuration**
```bash
# Copia template
cp .env.example .env.local

# Configura variabili obbligatorie
nano .env.local

# Variabili minime richieste:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
STRICT_200=true
```

---

## 🔄 Workflow Development

### **Branch Strategy**
```bash
# Checkout da main
git checkout main
git pull origin main

# Crea branch feature
git checkout -b chore/fix-backup-system

# Oppure branch feature
git checkout -b feature/admin-dashboard

# Workflow completo
git add .
git commit -m "feat: implementa dashboard admin" -m "- Aggiunge tabella utenti" -m "- Implementa filtri ricerca"
git push origin feature/admin-dashboard
```

### **Micro-Commit Pattern**
```bash
# Commit frequenti e piccoli
git add src/components/Dashboard.tsx
git commit -m "feat: crea componente Dashboard base"

git add src/components/UserTable.tsx  
git commit -m "feat: aggiungi tabella utenti"

git add src/hooks/useUsers.ts
git commit -m "feat: implementa hook gestione utenti"

# Push batch
git push origin feature/admin-dashboard
```

### **Backup Before Merge**
```bash
# SEMPRE backup prima di merge importanti
npm run esegui:backup

# Merge con main
git checkout main
git pull origin main
git merge feature/admin-dashboard

# Push finale
git push origin main
```

---

## ✅ Checklist Pre-Commit

### **Verifiche Automatiche (Husky)**
```bash
# Pre-commit hook esegue automaticamente:
1. ESLint check (0 errori richiesti)
2. Prettier formatting
3. TypeScript compilation
4. File length guard (≤200 righe)
5. Test suite (se presente)

# Bypass solo in emergenza
git commit --no-verify -m "emergency: critical hotfix"
```

### **Verifiche Manuali**
```bash
# 1. Lint e Type Check
npm run lint
npm run check

# 2. Build Test
npm run build

# 3. Dev Server Test  
npm run dev
# Verifica http://localhost:3001 funzionante

# 4. Diagnosi Progetto
npm run diagnose

# 5. Backup Preventivo
npm run esegui:backup
```

### **Code Quality Standards**
```typescript
// ✅ BUONE PRATICHE

// 1. File length ≤200 righe
// 2. Componenti funzionali React
export const UserDashboard: React.FC<Props> = ({ users }) => {
  // Implementation
};

// 3. TypeScript strict
interface UserProps {
  id: string;
  name: string;
  pin: number;
}

// 4. Import organizzati
import React from 'react';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useUsers';

// 5. Naming conventions
const handleUserClick = () => {}; // camelCase
const UserTable = () => {};       // PascalCase
const API_ENDPOINT = '';          // UPPER_CASE
```

---

## 🖥️ Development Environment

### **Prompt Unica Finestra Nera**
```bash
# Setup terminale per sviluppo efficiente

# 1. Avvia dev server in background
npm run dev &

# 2. Monitora logs in tempo reale
tail -f server.log &

# 3. Watch TypeScript
npm run check -- --watch &

# 4. Mantieni prompt disponibile per comandi
# Terminal pronto per git, npm, diagnose, etc.

# Kill tutti i processi background
jobs
kill %1 %2 %3
```

### **VS Code Workspace**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### **Debug Configuration**
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "runtimeArgs": ["-r", "tsx/cjs"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Client",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3001",
      "webRoot": "${workspaceFolder}/client"
    }
  ]
}
```

---

## 🔧 Utility Commands

### **Sviluppo Quotidiano**
```bash
# Avvio rapido
npm run dev

# Verifica salute progetto
npm run health:check

# Genera nuovo componente
npm run gen:component

# Backup rapido
npm run esegui:backup

# Consolidamento docs
npm run docs:consolidate
```

### **Manutenzione**
```bash
# Diagnosi completa
npm run diagnose

# Pulizia build
npm run build:clean

# Reset completo
rm -rf node_modules dist .next
npm install

# Aggiorna dipendenze
npm update
npm audit fix
```

### **Git Utilities**
```bash
# Status completo
git status
git log --oneline -10

# Cleanup branches
git branch -d feature/completed-feature
git remote prune origin

# Stash rapido
git stash push -m "WIP: dashboard improvements"
git stash pop
```

---

## 🚨 Troubleshooting

### **Problemi Setup Iniziale**

#### **npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Remove lock file
rm package-lock.json

# Reinstall
npm install

# Se persiste, usa yarn
yarn install
```

#### **Environment variables non funzionano**
```bash
# Verifica file .env.local esiste
ls -la .env*

# Controlla sintassi
cat .env.local

# Riavvia dev server
pkill -f "tsx server"
npm run dev
```

#### **TypeScript errors**
```bash
# Verifica tsconfig.json
npm run check

# Reinstall @types
npm install --save-dev @types/node @types/react

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### **Problemi Development**

#### **Port 3001 occupato**
```bash
# Trova processo
lsof -ti:3001

# Kill processo
kill $(lsof -ti:3001)

# Usa porta alternativa
PORT=3002 npm run dev
```

#### **Hot reload non funziona**
```bash
# Verifica Vite config
cat vite.config.ts | grep -A5 server

# Restart con cache clear
rm -rf node_modules/.vite
npm run dev
```

#### **Build fails**
```bash
# Verifica errori TypeScript
npm run check

# Build verbose
npm run build -- --verbose

# Clean build
npm run build:clean
```

### **Problemi Git**

#### **Commit bloccato da pre-commit**
```bash
# Verifica errori
npm run lint
npm run check

# Fix automatico
npm run lint:fix
npm run format

# Retry commit
git commit -m "fix: risolve errori linting"
```

#### **Merge conflicts**
```bash
# Backup preventivo
npm run esegui:backup

# Risolvi conflicts
git status
git diff

# Dopo risoluzione
git add .
git commit -m "resolve: merge conflicts"
```

---

## 📊 Performance Monitoring

### **Metriche Development**
```bash
# Build time
time npm run build

# Bundle analysis
npm run build -- --analyze

# Dev server startup
time npm run dev

# TypeScript check speed
time npm run check
```

### **Monitoring Tools**
```bash
# Processo monitoring
htop
ps aux | grep node

# Network monitoring
netstat -tulpn | grep 3001

# File watching
lsof +D . | grep node
```

---

## 🎯 Best Practices

### **Sviluppo Efficiente**
1. **Micro-commit**: commit piccoli e frequenti
2. **Backup preventivo**: prima di operazioni rischiose
3. **Test locale**: sempre prima di push
4. **Documentazione**: aggiorna docs con modifiche
5. **Code review**: auto-review prima di commit

### **Gestione Errori**
1. **Log dettagliati**: usa console.error con context
2. **Fallback graceful**: gestisci errori di rete
3. **User feedback**: mostra errori comprensibili
4. **Recovery automatico**: retry logic dove possibile

### **Performance**
1. **Lazy loading**: componenti non critici
2. **Code splitting**: bundle ottimizzati
3. **Caching**: React Query per API calls
4. **Debouncing**: input utente e ricerche

---

**Nota**: Questo setup è ottimizzato per produttività massima. Segui sempre il workflow documentato per evitare problemi e mantenere la qualità del codice.
