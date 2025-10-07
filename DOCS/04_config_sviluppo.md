# ⚙️ Configurazione Sviluppo - BadgeNode

## Indice

- [Setup Locale](#setup-locale)
- [Variabili Ambiente](#variabili-ambiente)
- [Comandi Base](#comandi-base)
- [Lint & Format](#lint--format)
- [Troubleshooting](#troubleshooting)

---

## Setup Locale

### Prerequisiti

- **Node.js**: ≥18.0.0
- **npm**: ≥8.0.0
- **Git**: ≥2.30.0

### Installazione

```bash
# Clone repository
git clone <repository-url>
cd BadgeNode

# Installa dipendenze
npm install

# Copia configurazione ambiente
cp .env.example .env
# Configura le variabili in .env
```

### Avvio Sviluppo

```bash
# Avvia server dev (default porta 5000)
npm run dev

# Avvia su porta specifica
PORT=3000 npm run dev
```

---

## Variabili Ambiente

### File `.env` (da configurare)

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database
DATABASE_URL=your-database-url

# Session
SESSION_SECRET=your-session-secret

# Sviluppo
NODE_ENV=development
PORT=3000

# File Length Guard
STRICT_200=false  # true in produzione
```

### Sicurezza

- ❌ **Mai committare `.env`**
- ✅ **Usare `.env.example` per template**
- ✅ **Rotare chiavi regolarmente**

---

## Comandi Base

### Sviluppo

```bash
npm run dev          # Server sviluppo
npm run build        # Build produzione
npm run start        # Avvia build produzione
npm run check        # Type checking
```

### Database

```bash
npm run db:push      # Push schema a database
npm run db:generate  # Genera migrazioni
npm run db:migrate   # Applica migrazioni
```

### Utility

```bash
npm run esegui:backup    # Backup automatico
npm run diagnose         # Diagnosi codebase
npm run docs:consolidate # Consolida documentazione
```

---

## Lint & Format

### Configurazione

- **ESLint**: `.eslintrc.cjs` (React/TS preset)
- **Prettier**: `.prettierrc` (100 char width)
- **Husky**: Pre-commit hooks

### Comandi

```bash
npm run lint         # Lint check
npm run lint:fix     # Lint + auto-fix
npm run format       # Format con Prettier
npm run format:check # Check formatting
```

### Pre-commit Hook

Esegue automaticamente:

1. `npm run lint`
2. `npm run check` (TypeScript)
3. `node scripts/file-length-guard.js`

---

## Logging

### Server Logs

- **API calls**: Automatico per `/api/*`
- **Errori**: Stack trace completo
- **Performance**: Timing richieste

### Client Logs

- **React Query**: DevTools in dev
- **Errori**: Error boundaries
- **Navigation**: Wouter debug

---

## Error Reporting

### Sviluppo

- **TypeScript**: Errori compile-time
- **ESLint**: Errori code quality
- **Vite**: Hot reload errors
- **React**: Error boundaries

### Produzione

- **Supabase**: Error tracking
- **Express**: Error middleware
- **Build**: Static analysis

---

## Troubleshooting

### Problemi Comuni

#### Server non si avvia

```bash
# Controlla porta in uso
lsof -i :3000

# Cambia porta
PORT=3001 npm run dev
```

#### Build fallisce

```bash
# Pulisci cache
rm -rf node_modules dist
npm install
npm run build
```

#### TypeScript errori

```bash
# Check completo
npm run check

# Rigenera types
rm -rf node_modules/@types
npm install
```

#### Database connection

```bash
# Verifica env vars
echo $DATABASE_URL

# Test connessione
npm run db:push
```

### Performance

#### Bundle size

```bash
# Analizza bundle
npm run build:analyze

# Controlla dipendenze
npm run deps:check
```

#### Memory leaks

```bash
# Monitor memoria
node --inspect npm run dev

# Profiling
npm run dev:profile
```

---

## IDE Setup

### VS Code Extensions

- TypeScript Hero
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

**Nota**: Configurazione ottimizzata per sviluppo locale
