# 📁 Struttura Progetto - BadgeNode

## Indice

- [Panoramica](#panoramica)
- [Cartelle Principali](#cartelle-principali)
- [Responsabilità](#responsabilità)
- [Convenzioni](#convenzioni)

---

## Panoramica

**Architettura**: Monorepo client/server  
**Frontend**: React + TypeScript + Vite  
**Backend**: Express + TypeScript  
**Database**: Supabase PostgreSQL + Drizzle ORM

---

## Cartelle Principali

```
BadgeNode/
├── client/                 # Frontend React
│   ├── index.html         # Entry point HTML
│   ├── public/            # Asset statici
│   └── src/               # Codice sorgente client
│       ├── components/    # Componenti React
│       ├── hooks/         # Custom hooks
│       ├── lib/           # Utilities client
│       ├── pages/         # Pagine/route
│       ├── App.tsx        # App principale
│       └── main.tsx       # Entry point React
├── server/                # Backend Express
│   ├── index.ts          # Server principale
│   ├── routes.ts         # Route API
│   ├── storage.ts        # Gestione storage
│   └── vite.ts           # Integrazione Vite
├── shared/               # Codice condiviso
│   └── schema.ts         # Schema DB Drizzle
├── DOCS/                 # Documentazione progetto
├── scripts/              # Script utility
├── ARCHIVE/              # File archiviati
├── Backup_Automatico/    # Backup automatici
└── public/               # Asset pubblici build
```

---

## Responsabilità

### `/client`

- **Componenti UI**: Radix UI + TailwindCSS
- **State Management**: React Query + hooks
- **Routing**: Wouter
- **Build**: Vite + TypeScript

### `/server`

- **API REST**: Express + middleware
- **Autenticazione**: Passport.js
- **Database**: Drizzle ORM
- **Session**: Express-session

### `/shared`

- **Schema DB**: Definizioni Drizzle
- **Types**: Tipi condivisi client/server
- **Validazione**: Zod schemas

### `/DOCS`

- **Documentazione**: Markdown files
- **Guide**: Setup, API, database
- **Report**: Diagnosi, backup

### `/scripts`

- **Backup**: Archiviazione automatica
- **Diagnosi**: Controlli qualità
- **Utility**: Template, consolidamento

---

## Convenzioni

### File Naming

- **Componenti**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con `use` (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Pages**: PascalCase (`Dashboard.tsx`)

### Import Order

1. React/librerie esterne
2. Componenti interni
3. Hooks/utilities
4. Types/interfaces
5. Costanti/config

### Limiti

- **Max 200 righe** per file (hard limit)
- **Warning ≥150 righe**
- **Split obbligatorio** se superato

### Branch Naming

- `feature/nome-feature`
- `fix/nome-bug`
- `chore/nome-task`
- `docs/nome-doc`

---

**Aggiornato**: Post-setup BeigeNode2 - 08/10/2024
