# 04 ⚙️ CONFIG SVILUPPO - BadgeNode

**Setup locale e convenzioni di sviluppo**  
**Versione**: 5.0 • **Data**: 2025-10-21 • **Stato**: Enterprise Stable

---

## 📋 Contenuti

1. [Requisiti Sistema](#requisiti-sistema)
2. [Environment Setup](#environment-setup)
3. [Scripts NPM](#scripts-npm)
4. [Configurazioni PWA](#configurazioni-pwa)
5. [Git e Commit](#git-e-commit)

---

## 💻 Requisiti Sistema

### **Software Richiesto**

```
Node.js: ≥18.0.0 (LTS recommended)
npm: ≥9.0.0 (o yarn ≥3.0.0)
Git: ≥2.30.0
TypeScript: ≥5.0.0 (global o local)

OS Support:
- macOS: ≥12.0 (Monterey)
- Windows: ≥10 (WSL2 recommended)
- Linux: Ubuntu ≥20.04, Debian ≥11

Editor raccomandato:
- VS Code con estensioni TypeScript/React
- WebStorm (configurazione inclusa)
```

### **Verifiche Pre-Setup**

```bash
# Check versioni
node --version          # ≥18.0.0
npm --version           # ≥9.0.0
git --version           # ≥2.30.0

# Verifica spazio disco
df -h                   # ≥2GB liberi per node_modules

# Test connessione
curl -I https://registry.npmjs.org/
```

---

## 🔧 Environment Setup

### **Aggiornamento Runtime 2026-04-18 (sicurezza default)**

```bash
# Auth (default sicuri)
VITE_FEATURE_AUTH_BYPASS=false
VITE_FEATURE_AUTH_ROUTE_GUARDS=true

# Proxy API frontend dev (opzionale)
VITE_API_PROXY_TARGET=http://localhost:3001
```

Note:
- I route guards sono attivi solo se bypass disattivato.
- In sviluppo, se il backend gira su porta diversa da `3001`, impostare `VITE_API_PROXY_TARGET`.

### **.env.sample** - Template Semplificato (NUOVO)

```bash
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
```

> **Nota v4.1:** Service role key necessaria per gestione utenti (bypassa RLS)

### **.env.example** - Template Configurazione Completa

```bash
# === SUPABASE CONFIGURATION ===
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

# === SERVER CONFIGURATION (Admin only) ===
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# === DEVELOPMENT SETTINGS ===
NODE_ENV=development
PORT=3001
VITE_DEV_SERVER=true

# === FILE LENGTH GUARD (AGGIORNATO FASE 4/4) ===
STRICT_220=true                # Hard limit 220 righe
WARNING_180=true               # Soft limit 180 righe

# === PWA DEVELOPMENT ===
VITE_PWA_DEV_ENABLED=false
VITE_PWA_OFFLINE_ENABLED=true

# === BACKUP CONFIGURATION ===
BACKUP_RETENTION=3
BACKUP_AUTO_CLEANUP=true

# === LOGGING ===
LOG_LEVEL=info
DEBUG_MODE=false
```

### **File Environment Locali**

```
.env.local              # Configurazione locale (gitignored)
.env.development.local  # Override per development
.env.production.local   # Override per production (server only)

Priorità caricamento:
1. .env.local
2. .env.development.local (se NODE_ENV=development)
3. .env.production.local (se NODE_ENV=production)
4. .env.example (fallback)
```

### **Variabili Obbligatorie**

```bash
# Client (pubbliche, prefisso VITE_)
VITE_SUPABASE_URL         # URL progetto Supabase
VITE_SUPABASE_ANON_KEY    # Chiave anonima Supabase

# Server (private, solo backend)
SUPABASE_SERVICE_ROLE_KEY # Chiave admin Supabase (opzionale)

# Development
STRICT_220                # File length guard hard limit (true/false)
WARNING_180               # File length guard soft limit (true/false)
```

---

## 📦 Scripts NPM

### **Development Scripts**

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "build:clean": "rimraf dist && npm run build",
  "start": "NODE_ENV=production node dist/index.js",
  "preview": "vite preview"
}
```

### **Quality Assurance**

```json
{
  "lint": "eslint . --ext ts,tsx",
  "lint:fix": "eslint . --ext ts,tsx --fix",
  "format": "prettier --write .",
  "check": "tsc -p tsconfig.json --noEmit",
  "check:dev": "tsx scripts/check-dev.ts",
  "check:ci": "bash scripts/ci/checks.sh",
  "smoke:runtime": "tsx scripts/ci/smoke-runtime.ts"
}
```

### **Database & Environment**

```json
{
  "db:push": "drizzle-kit push",
  "env:write": "node scripts/write-env.mjs",
  "seed:auth": "node scripts/seed-auth.mjs"
}
```

### **Utility Scripts**

```json
{
  "esegui:backup": "tsx scripts/backup.ts",
  "backup:list": "ls -lah Backup_Automatico",
  "backup:restore": "tsx scripts/backup-restore.ts",
  "diagnose": "tsx scripts/diagnose.ts",
  "docs:consolidate": "tsx scripts/consolidate-docs.ts",
  "gen:component": "tsx scripts/template-component.ts"
}
```

---

## 🌐 Configurazioni PWA

### **PWA Development Settings**

```typescript
// vite.config.ts - PWA Configuration
VitePWA({
  registerType: 'autoUpdate',
  devOptions: {
    enabled: false, // Disabilitato in development
  },
  includeAssets: ['favicon.ico', 'logo_app.png', 'robots.txt'],
  manifest: {
    name: 'BadgeNode',
    short_name: 'BadgeNode',
    description: 'Sistema timbrature con PIN',
    theme_color: '#510357',
    background_color: '#0b0b10',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: 'icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
});
```

### **Service Worker Guard**

```typescript
// Protezione Service Worker in development
if (import.meta.env.DEV) {
  // Disabilita SW su porta 8080 e localhost:3001
  if (location.port === '8080' || location.port === '3001') {
    navigator.serviceWorker?.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }
}
```

### **Logo App Configuration**

```
Asset principale: /logo_app.png
- Formato: PNG trasparente
- Dimensioni: max-height 60px
- Proporzioni: mantenute integre
- Posizione: public/logo_app.png
- Utilizzo: Header app, PWA icon fallback

Icone PWA:
- public/icons/icon-192.png (192×192px)
- public/icons/icon-512.png (512×512px)
- Formato: PNG, background opaco
```

---

## 🔄 Git e Commit

### **Commit Sicuri**

```bash
# ✅ METODI SICURI (raccomandati)

# Metodo 1: Multipli -m
git commit -m "feat: aggiungi tastierino PIN" -m "- Implementa griglia 3x4" -m "- Aggiunge validazione input"

# Metodo 2: File temporaneo
echo "feat: aggiungi tastierino PIN

- Implementa griglia 3x4
- Aggiunge validazione input
- Fix responsive mobile" > commit_msg.txt
git commit -F commit_msg.txt
rm commit_msg.txt

# Metodo 3: Editor configurato
git config core.editor "code --wait"
git commit  # Apre VS Code per messaggio
```

### **Commit NON Sicuri (evitare)**

```bash
# ❌ EVITARE - Problemi con terminale
git commit -m "messaggio con 'apici' problematici"
git commit -m "messaggio
su più righe"  # Causa dquote> prompt

# ❌ SOLO IN EMERGENZA
git commit --no-verify -m "emergency fix"
```

### **Pre-commit Checklist**

```bash
# Verifica automatica (Husky hooks - AGGIORNATO FASE 4/4)
1. ESLint: 0 errori
2. Prettier: formattazione corretta
3. TypeScript: 0 errori compilazione
4. File length: ≤220 righe hard limit, ≥180 warning
5. Validazione CI: npm run check:ci
6. Grep guard: no console.log/FIXME/HACK/TODO non-business

# Verifica manuale
npm run lint && npm run check && npm run check:ci
```

### **Branch Strategy**

```
main              # Production ready
├── chore/*       # Manutenzione, fix, cleanup
├── feature/*     # Nuove funzionalità
├── hotfix/*      # Fix critici production
└── docs/*        # Aggiornamenti documentazione

Naming convention:
- chore/fix-backup-rotation
- feature/admin-dashboard
- hotfix/critical-security-patch
- docs/update-api-reference
```

---

## 🛠️ Development Tools

### **VS Code Extensions (raccomandato)**

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "antfu.iconify"
  ]
}
```

### **VS Code Settings**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### **Debug Configuration**

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "program": "${workspaceFolder}/server/index.ts",
  "env": {
    "NODE_ENV": "development"
  },
  "runtimeArgs": ["-r", "tsx/cjs"]
}
```

---

## 🔍 Troubleshooting

### **Problemi Comuni**

#### **Environment Variables Non Caricate**

```bash
# Verifica file .env
cat .env.local

# Test caricamento
node -e "console.log(process.env.VITE_SUPABASE_URL)"

# Riavvia dev server
npm run dev
```

#### **Port 3001 Occupato**

```bash
# Trova processo
lsof -ti:3001

# Kill processo
kill $(lsof -ti:3001)

# Usa porta alternativa
PORT=3002 npm run dev
```

#### **Build Failures**

```bash
# Clean build
npm run build:clean

# Verifica TypeScript
npm run check

# Reset node_modules
rm -rf node_modules package-lock.json
npm install
```

#### **PWA Issues in Dev**

```bash
# Disabilita SW manualmente
# In DevTools > Application > Service Workers > Unregister

# Verifica configurazione
grep -r "registerSW" client/src/

# Clear cache
# DevTools > Application > Storage > Clear storage
```

---

## 📊 Performance Targets

### **Development**

- Dev server start: <5 secondi
- Hot reload: <1 secondo
- TypeScript check: <3 secondi
- Build time: <10 secondi

### **Bundle Size**

- Total bundle: <1MB gzipped
- Main chunk: <500KB
- Vendor chunk: <300KB
- CSS: <100KB

---

**Nota**: Questa configurazione è ottimizzata per sviluppo locale efficiente. Per production, consultare la documentazione di deploy specifica.

---

> **Documento aggiornato alla baseline Enterprise Stable (v1.0.0 — 2025-10-21)**  
> Autore: BadgeNode / Cascade AI
