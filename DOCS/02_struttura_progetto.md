# 02 🏗️ STRUTTURA PROGETTO - BadgeNode

**Mappa directory e responsabilità del repository**  
**Versione**: 2.0 • **Data**: 2025-10-09

---

## 📋 Contenuti

1. [Overview Repository](#overview-repository)
2. [Cartelle Principali](#cartelle-principali)
3. [Frontend Structure](#frontend-structure)
4. [Backend Structure](#backend-structure)
5. [Governance e Regole](#governance-e-regole)

---

## 🗂️ Overview Repository

```
BadgeNode/
├── 📁 DOCS/                    # Documentazione progetto
├── 📁 ARCHIVE/                 # File archiviati e backup storici
├── 📁 Backup_Automatico/       # Sistema backup rotazione (3 copie)
├── 📁 client/                  # Frontend React + TypeScript
├── 📁 server/                  # Backend Express + Supabase
├── 📁 scripts/                 # Utility automazione e manutenzione
├── 📁 shared/                  # Tipi condivisi frontend/backend
├── 📁 public/                  # Asset statici pubblici
├── 📁 dist/                    # Build output (generato)
├── 📁 node_modules/            # Dipendenze (gitignored)
├── 📄 package.json             # Configurazione npm e scripts
├── 📄 vite.config.ts           # Build configuration
├── 📄 tsconfig.json            # TypeScript configuration
└── 📄 .env.example             # Template variabili ambiente
```

---

## 📁 Cartelle Principali

### **DOCS/** - Documentazione

```
DOCS/
├── 01_database_api.md          # Schema DB e API endpoints
├── 02_struttura_progetto.md    # Questo file
├── 03_scripts_utilita.md       # Manuale scripts automazione
├── 04_config_sviluppo.md       # Setup locale e convenzioni
├── 05_setup_sviluppo.md        # Onboarding rapido
├── ICONS_GUIDE.md              # Guida unplugin-icons
├── LOGICA_GIORNO_LOGICO.md     # Logica business timbrature
├── UI_HOME_KEYPAD.md           # Specifiche UI tastierino
└── REPORT_CONSOLIDATO.txt      # Auto-generato da script
```

### **ARCHIVE/** - Archiviazione

```
ARCHIVE/
├── _unused/                    # Componenti/file non utilizzati
│   └── YYYYMMDD_HHMM/         # Timestamp archiviazione
├── oversize_components/        # File >200 righe archiviati
└── orphaned_files/             # File orfani identificati
```

### **Backup_Automatico/** - Sistema Backup

```
Backup_Automatico/
├── backup_YYYY.MM.DD_HH.MM.tar # Backup rotazione (max 3)
├── README_BACKUP.txt           # Istruzioni sistema backup
└── REPORT_BACKUP.txt           # Log operazioni backup
```

---

## 🎨 Frontend Structure

### **client/** - Applicazione React

```
client/
├── public/                     # Asset statici
│   ├── icons/                  # Icone PWA (192px, 512px)
│   ├── logo_app.png           # Logo principale app
│   ├── favicon.ico            # Favicon
│   └── manifest.webmanifest   # PWA manifest
├── src/
│   ├── components/            # Componenti UI organizzati
│   │   ├── home/             # Tastierino PIN e home
│   │   ├── admin/            # Gestione utenti admin
│   │   ├── storico/          # Report e storico timbrature
│   │   ├── theme/            # Provider temi dark/light
│   │   └── ui/               # Componenti base (Radix UI)
│   ├── pages/                # Pagine principali
│   │   ├── Home.tsx          # Tastierino timbrature
│   │   ├── StoricoTimbrature.tsx # Report storico
│   │   ├── ArchivioDipendenti.tsx # Gestione utenti
│   │   └── Login/            # Autenticazione admin
│   ├── services/             # Business logic e API
│   │   ├── timbrature.service.ts
│   │   ├── utenti.service.ts
│   │   └── storico.service.ts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility e configurazioni
│   │   ├── supabaseClient.ts
│   │   ├── queryClient.ts
│   │   └── time.ts
│   ├── contexts/             # React contexts
│   └── state/                # State management
└── index.html                # Entry point HTML
```

### **Regole Frontend**

- **Componenti**: Max 200 righe, warning ≥150
- **Organizzazione**: Per funzione, non per tipo
- **Naming**: PascalCase per componenti, camelCase per utility
- **Import**: Alias `@/` per src/, `@shared/` per shared/

---

## ⚙️ Backend Structure

### **server/** - API Express

```
server/
├── index.ts                   # Entry point server
├── routes.ts                  # API routes definition
├── supabase.ts               # Supabase admin client
├── vite.ts                   # Vite dev integration
└── storage.ts                # File storage utilities
```

### **shared/** - Tipi Condivisi

```
shared/
└── schema.ts                 # TypeScript interfaces comuni
```

---

## 🛠️ Scripts e Automazione

### **scripts/** - Utility

```
scripts/
├── backup.ts                 # Sistema backup automatico
├── backup-restore.ts         # Ripristino backup
├── diagnose.ts              # Diagnosi progetto
├── consolidate-docs.ts      # Genera REPORT_CONSOLIDATO.txt
├── template-component.ts    # Scaffold componenti
├── auto-start-dev.ts       # Avvio automatico dev
├── health-check-runner.ts   # Health check sistema
└── utils/                   # Utility condivise
    ├── diagnose-core.ts
    └── docs-core.ts
```

### **Scripts NPM Principali**

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build && esbuild server/index.ts",
  "start": "NODE_ENV=production node dist/index.js",
  "esegui:backup": "tsx scripts/backup.ts",
  "docs:consolidate": "tsx scripts/consolidate-docs.ts",
  "diagnose": "tsx scripts/diagnose.ts",
  "lint": "eslint . --ext ts,tsx",
  "check": "tsc -p tsconfig.json --noEmit"
}
```

---

## 📏 Governance e Regole

### **File Length Guard**

```
Limiti STRICT (STRICT_200=true):
- ≤200 righe: OK
- ≥150 righe: WARNING
- >200 righe: BLOCK commit

Eccezioni:
- File di configurazione
- File auto-generati
- File in ARCHIVE/
```

### **Backup System**

```
Rotazione automatica:
- Max 3 backup simultanei
- Nomenclatura: backup_YYYY.MM.DD_HH.MM.tar
- Trigger: manuale (npm run esegui:backup)
- Cleanup: automatico (elimina più vecchi)
```

### **Git Workflow**

```
Branch strategy:
- main: production ready
- chore/*: manutenzione e fix
- feature/*: nuove funzionalità

Commit rules:
- Micro-commit frequenti
- Messaggi descrittivi
- Backup before merge
- Pre-commit hooks attivi
```

### **Code Quality**

```
Tools attivi:
- ESLint: linting JavaScript/TypeScript
- Prettier: code formatting
- Husky: git hooks
- TypeScript: type checking strict

Standards:
- No console.log in production
- Prefer const over let
- Explicit return types
- JSDoc per funzioni pubbliche
```

---

## 🎯 Responsabilità Cartelle

### **Development**

- `client/src/`: Frontend development
- `server/`: Backend API development
- `scripts/`: Automation e maintenance
- `shared/`: Shared types e utilities

### **Documentation**

- `DOCS/`: Project documentation
- `README.md`: Quick start guide
- `.env.example`: Environment setup

### **Operations**

- `Backup_Automatico/`: Backup management
- `ARCHIVE/`: File archival
- `dist/`: Production builds
- `.husky/`: Git hooks configuration

### **Assets**

- `public/`: Static assets
- `client/public/`: PWA assets
- Logo: `/logo_app.png` (PNG, transparent, max 60px height)

---

## 🔧 Configuration Files

### **Root Level**

```
package.json          # Dependencies e scripts
tsconfig.json         # TypeScript configuration
vite.config.ts        # Build configuration Vite
eslint.config.js      # ESLint rules
.prettierrc           # Prettier formatting
.gitignore            # Git ignore patterns
.env.example          # Environment variables template
```

### **Specialized Config**

```
tailwind.config.ts    # Tailwind CSS configuration
postcss.config.js     # PostCSS plugins
drizzle.config.ts     # Database ORM configuration
components.json       # Radix UI components config
```

---

## 📊 Metriche Progetto

### **Dimensioni Target**

- File singolo: ≤200 righe
- Componente: ≤150 righe (warning)
- Build size: ≤1MB gzipped
- Bundle chunks: ottimizzati per lazy loading

### **Performance**

- Build time: <10 secondi
- Dev server start: <5 secondi
- Hot reload: <1 secondo
- Type check: <3 secondi

---

**Nota**: Questa struttura è ottimizzata per sviluppo team, manutenibilità e scalabilità. Ogni cartella ha responsabilità specifiche e regole di governance per mantenere il codice pulito e organizzato.
