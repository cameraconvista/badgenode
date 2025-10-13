# BADGENODE — README PROGETTO
**Versione:** 4.1 - Production Ready + User Management Fixed  
**Data:** 13 Ottobre 2025  
**Stato:** ✅ **CODEBASE PULITO AL 100% + GESTIONE UTENTI FUNZIONANTE**

---

## 🎯 PANORAMICA

BadgeNode è un sistema di timbrature per dipendenti con interfaccia touch-friendly e backend Supabase. Architettura moderna React + TypeScript + Express con validazione automatica e controlli di qualità.

---

## 📁 STRUTTURA CARTELLE

```
BadgeNode/
├── client/                    # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/        # Componenti UI riutilizzabili
│   │   │   ├── ui/           # shadcn/ui components (60 files)
│   │   │   ├── home/         # Componenti pagina Home
│   │   │   ├── storico/      # Componenti Storico Timbrature
│   │   │   ├── admin/        # Pannello amministrazione
│   │   │   └── auth/         # Componenti autenticazione
│   │   ├── pages/            # Pagine principali
│   │   │   ├── Home/         # 🆕 Struttura modulare (3 file)
│   │   │   ├── Login/        # Pagina login
│   │   │   └── *.tsx         # Altre pagine
│   │   ├── services/         # Servizi API e business logic
│   │   │   ├── storico/      # Servizi storico timbrature
│   │   │   └── *.service.ts  # Servizi principali
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility e configurazioni
│   │   ├── types/            # Definizioni TypeScript
│   │   ├── state/            # Gestione stato globale
│   │   └── utils/            # Funzioni di utilità
│   └── public/               # Asset statici
├── server/                   # Backend Express + TypeScript
│   ├── index.ts             # Entry point server
│   ├── routes.ts            # API routes
│   └── *.ts                 # Moduli server
├── shared/                   # Tipi condivisi client/server
│   ├── types/               # Definizioni TypeScript condivise
│   └── constants/           # Costanti condivise
├── scripts/                  # Script di utilità e CI/CD
│   ├── ci/                  # 🆕 Script validazione automatica
│   ├── utils/               # Utility per script
│   └── *.ts                 # Script vari
├── supabase/                # Configurazione database
│   └── migrations/          # Migrazioni SQL
└── DOCS/                    # Documentazione completa
    ├── DOC IMPORTANTI/      # Documentazione critica
    ├── REPORT_GENERICI/     # Report tecnici
    └── *.md                 # Guide e manuali
```

---

## 🛡️ POLICY PRE-COMMIT

### **Controlli Automatici**
Ogni commit viene validato automaticamente tramite Husky:

```bash
# .husky/pre-commit
npm run lint           # ESLint check
npm run check          # TypeScript check  
npm run check:ci       # Validazione completa
node scripts/file-length-guard.cjs  # Controllo lunghezza file
```

### **Limiti File**
- **Hard limit**: 220 righe → **COMMIT BLOCCATO**
- **Soft limit**: 180-220 righe → **WARNING** (commit permesso)
- **Scope**: Solo file `*.ts` e `*.tsx` in `client/src/`

### **Controlli Qualità**
- ✅ **0 errori TypeScript**
- ✅ **0 console.log/FIXME/HACK**
- ✅ **Solo TODO(BUSINESS) permessi**
- ✅ **Build production funzionante**
- ✅ **Smoke test Supabase OK**

---

## 🚀 COMANDI PRINCIPALI

### **Sviluppo**
```bash
npm run dev              # Avvia dev server (http://localhost:3001)
npm run check            # TypeScript check
npm run lint             # ESLint check
npm run format           # Prettier format
```

### **Build & Deploy**
```bash
npm run build            # Build production
npm run start            # Avvia server production
```

### **Validazione Automatica** 🆕
```bash
npm run check:ci         # Validazione completa (typecheck + build + grep)
npm run smoke:runtime    # Test connettività Supabase + RPC
```

### **Utility**
```bash
npm run esegui:backup    # Backup automatico progetto
npm run diagnose         # Diagnosi sistema
npm run health:check     # Health check server
```

---

## 🔧 CONFIGURAZIONE AMBIENTE

### **File Richiesti**
```bash
# .env.local (NON committare)
VITE_SUPABASE_URL=https://tutllgsjrbxkmrwseogz.supabase.co
VITE_SUPABASE_ANON_KEY=***TUA_CHIAVE_ANON***
```

### **Setup Iniziale**
```bash
# 1. Clone repository
git clone https://github.com/cameraconvista/badgenode.git
cd badgenode

# 2. Install dependencies  
npm install

# 3. Configura environment
cp .env.sample .env.local
# Modifica .env.local con le tue chiavi Supabase

# 4. Avvia sviluppo
npm run dev
```

---

## 📊 ARCHITETTURA TECNICA

### **Stack Tecnologico**
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Radix UI + TailwindCSS + shadcn/ui
- **Backend**: Express + TypeScript + ESBuild
- **Database**: Supabase PostgreSQL + Drizzle ORM
- **State**: TanStack Query + Context API
- **Build**: Vite + ESBuild
- **Quality**: ESLint + Prettier + Husky

### **Principi Architetturali**
- **Separation of Concerns**: Componenti, servizi, hooks separati
- **Type Safety**: TypeScript strict mode
- **Code Quality**: Pre-commit hooks + validazione automatica
- **Modularity**: Struttura a cartelle per feature
- **Performance**: Bundle splitting + lazy loading

---

## 🧪 TESTING & VALIDAZIONE

### **Pipeline CI/CD**
```bash
# Validazione automatica (4 secondi)
▶ TypeScript check     # 0 errori
▶ Build production     # Bundle 626KB
▶ Grep guard          # 0 debug residui  
▶ Smoke test          # Supabase connectivity
✅ All checks passed
```

### **Smoke Test**
- ✅ Connessione Supabase
- ✅ Query tabella `utenti`
- ✅ RPC `insert_timbro_v2` funzionante
- ✅ Validazione PIN

---

## 📋 WORKFLOW SVILUPPO

### **Branching Strategy**
- `main`: Branch production (protetto)
- `feature/*`: Feature branches
- Pre-commit hooks obbligatori

### **Commit Guidelines**
```bash
# Esempi commit messages
feat(home): add new PIN validation
fix(api): resolve RPC timeout issue  
chore(deps): update dependencies
docs(readme): update setup guide
```

### **File Splitting Policy**
Se un file supera 220 righe:
1. **Identifica responsabilità** (UI, logic, types)
2. **Estrai componenti** in sottocartelle
3. **Mantieni API pubblica** invariata
4. **Testa funzionalità** dopo split

---

## 🚨 TROUBLESHOOTING

### **Errori Comuni**

#### **Build Fallisce**
```bash
# Verifica TypeScript
npm run check

# Verifica dipendenze
npm install

# Clean build
rm -rf dist node_modules/.vite
npm install && npm run build
```

#### **Pre-commit Bloccato**
```bash
# File troppo lungo (>220 righe)
# Splitta il file seguendo la policy

# Errori TypeScript
npm run check
# Fix errori e riprova commit

# Debug residui
# Rimuovi console.log/FIXME/HACK
# Usa solo TODO(BUSINESS)
```

#### **Server Non Parte**
```bash
# Verifica environment
cat .env.local

# Verifica porta
lsof -i :3001

# Health check
curl http://localhost:3001/api/health
```

---

## 📞 SUPPORTO

### **Documentazione**
- `DOCS/DOC IMPORTANTI/`: Guide critiche
- `DOCS/REPORT_VALIDAZIONE.md`: Stato validazione
- `DOCS/REPORT_DIAGNOSI_COMPLETA.md`: Analisi codebase

### **Script Diagnostici**
```bash
npm run diagnose        # Diagnosi completa sistema
npm run check:ci        # Validazione qualità codice
npm run health:check    # Status server e database
```

---

## ✅ STATO PROGETTO

**🎯 Production Ready**: Codebase pulito al 100%  
**🛡️ Quality Gates**: Tutti i controlli attivi  
**📊 Metrics**: 0 errori, 626KB bundle, 4s validation  
**🚀 Performance**: Ottimizzato per production  

**Ultimo aggiornamento**: 12 Ottobre 2025 - FASE 4/4 completata
