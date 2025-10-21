# BadgeNode - Sistema Timbrature Enterprise

Sistema PWA per la gestione delle timbrature aziendali con PIN, progettato per dispositivi mobile e desktop con sincronizzazione offline avanzata.

## 🚀 Quick Start (5 minuti)

### Prerequisiti
- **Node.js** ≥18.0.0 (LTS raccomandato)
- **npm** ≥9.0.0
- **Git** ≥2.30.0

### Setup Rapido
```bash
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
```

## 🏗️ Architettura

### Stack Tecnologico
- **Frontend**: React 18.3.1 + TypeScript 5.6.3 + Vite 5.4.20
- **UI Framework**: Radix UI + TailwindCSS + Lucide Icons
- **Backend**: Express.js + TypeScript
- **Database**: Supabase PostgreSQL (timezone Europe/Rome)
- **PWA**: Service Worker + Offline Support
- **State Management**: TanStack Query + React Context

### Struttura Progetto
```
BadgeNode/
├── client/          # Frontend React PWA
├── server/          # Backend Express API
├── shared/          # Tipi condivisi
├── scripts/         # Automazione e utility
├── DOCS/           # Documentazione enterprise
└── supabase/       # Migrazioni database
```

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
- [**Icons Guide**](DOCS/06_icons_guide.md) - Sistema icone

## 🔧 Scripts Principali

### Development
```bash
npm run dev          # Avvia dev server (porta 10000)
npm run build        # Build production
npm run start        # Avvia server production
npm run check        # TypeScript check
npm run lint         # ESLint check
```

### Quality Assurance
```bash
npm run check:ci     # Validazione CI completa
npm run smoke:runtime # Test connettività Supabase
npm run diagnose     # Diagnosi progetto completa
```

### Utility
```bash
npm run esegui:backup    # Backup automatico
npm run docs:consolidate # Aggiorna documentazione
npm run health:check     # Verifica sistema
```

## ⚙️ Configurazione

### Environment Variables (.env.local)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Development Settings
NODE_ENV=development
PORT=10000

# Feature Flags
VITE_FEATURE_OFFLINE_QUEUE=false
VITE_FEATURE_OFFLINE_BADGE=false
```

### Database Setup
1. Crea progetto Supabase
2. Applica migrazioni: `supabase/migrations/`
3. Configura RLS policies (incluse nelle migrazioni)
4. Verifica connessione: `npm run smoke:runtime`

## 🚨 Troubleshooting

### Problemi Comuni

#### Port già in uso
```bash
# Trova processo sulla porta 10000
lsof -ti:10000

# Termina processo
kill $(lsof -ti:10000)
```

#### Errori TypeScript
```bash
# Clean e rebuild
npm run build:clean
npm run check
```

#### Problemi Supabase
```bash
# Verifica configurazione
npm run smoke:runtime

# Check environment
echo $VITE_SUPABASE_URL
```

### Log e Diagnostica
- **Health Check**: `GET /api/health`
- **Diagnostica**: `npm run diagnose`
- **Logs Server**: Console output in development
- **PWA Debug**: DevTools > Application > Service Workers

## 🏢 Enterprise Features

### Governance
- **File Length Guard**: ≤220 righe hard limit
- **Pre-commit Hooks**: ESLint + TypeScript + Prettier
- **Backup Automatico**: Rotazione 3 copie
- **Documentazione**: Enterprise-grade completa

### Sicurezza
- **Row Level Security**: Policies Supabase attive
- **API Server-Only**: SERVICE_ROLE_KEY protetta
- **Request Tracking**: ID univoci per audit
- **Environment Validation**: Controlli automatici

### Monitoring
- **Health Endpoints**: `/api/health`, `/api/ready`, `/api/version`
- **Performance Targets**: Build <10s, Bundle <1MB
- **Quality Gates**: TypeScript strict, ESLint, tests

## 📱 Utilizzo

### Timbrature (Mobile)
1. Apri app su dispositivo mobile
2. Inserisci PIN (1-99)
3. Seleziona ENTRATA/USCITA
4. Conferma timbratura

### Gestione Admin (Desktop)
1. Accedi con PIN amministratore
2. Gestisci utenti e PIN
3. Visualizza storico timbrature
4. Export dati (CSV/PDF)

### Modalità Offline
- Timbrature salvate localmente
- Sincronizzazione automatica al ritorno online
- Badge diagnostico (development)

## 🤝 Contributi

### Development Workflow
1. Fork del repository
2. Crea branch feature: `git checkout -b feature/nome-feature`
3. Commit con messaggi descrittivi
4. Push e crea Pull Request
5. Review e merge

### Coding Standards
- **TypeScript Strict**: Tipi espliciti obbligatori
- **ESLint**: Configurazione enterprise
- **File Length**: Max 220 righe per file
- **Testing**: Coverage minima 80%

## 📄 Licenza

MIT License - vedi file LICENSE per dettagli.

## 🆘 Supporto

- **Documentazione**: [DOCS/](DOCS/)
- **Issues**: GitHub Issues
- **Troubleshooting**: [DOCS/10_troubleshooting.md](DOCS/10_troubleshooting.md)
- **Setup**: [DOCS/05_setup_sviluppo.md](DOCS/05_setup_sviluppo.md)

---

> **BadgeNode v5.0** - Enterprise Stable  
> Sistema timbrature PWA con sincronizzazione offline avanzata
