# 🚀 Setup Sviluppo - BadgeNode

## Indice

- [Onboarding](#onboarding)
- [Flusso Commit](#flusso-commit)
- [Naming Conventions](#naming-conventions)
- [Policy Backup](#policy-backup)
- [Best Practices](#best-practices)

---

## Onboarding

### Checklist Nuovo Sviluppatore

#### 1. Prerequisiti Sistema

- [ ] Node.js ≥18.0.0 installato
- [ ] Git configurato con SSH keys
- [ ] Editor con TypeScript support
- [ ] Accesso repository e Supabase

#### 2. Setup Progetto

```bash
# 1. Clone repository
git clone <repository-url>
cd BadgeNode

# 2. Installa dipendenze
npm install

# 3. Configura ambiente
cp .env.example .env
# Richiedi chiavi Supabase al team lead

# 4. Prima diagnosi
npm run diagnose

# 5. Test build
npm run build

# 6. Avvia sviluppo
npm run dev
```

#### 3. Verifica Setup

- [ ] App si avvia senza errori
- [ ] Lint passa: `npm run lint`
- [ ] TypeScript OK: `npm run check`
- [ ] Build completa: `npm run build`
- [ ] Backup funziona: `npm run esegui:backup`

---

## Flusso Commit

### 1. Pre-sviluppo

```bash
# Backup automatico
npm run esegui:backup

# Branch feature
git checkout -b feature/nome-feature

# Diagnosi iniziale
npm run diagnose
```

### 2. Durante Sviluppo

```bash
# Controlli frequenti
npm run lint
npm run check

# Test build
npm run build
```

### 3. Pre-commit

```bash
# Format automatico
npm run format

# Controlli finali
npm run lint && npm run check

# Commit (hook automatici attivi)
git add .
git commit -m "feat: descrizione feature"
```

### 4. Pre-merge

```bash
# Backup pre-merge
npm run esegui:backup

# Merge su main
git checkout main
git merge feature/nome-feature

# Cleanup
git branch -d feature/nome-feature
```

---

## Naming Conventions

### Branch Names

```bash
feature/user-authentication    # Nuove funzionalità
fix/login-validation-bug      # Bug fixes
chore/update-dependencies     # Maintenance
docs/api-documentation        # Documentazione
refactor/user-service         # Refactoring
```

### Commit Messages

Formato: `type(scope): description`

**Types**:

- `feat`: Nuova funzionalità
- `fix`: Bug fix
- `docs`: Documentazione
- `style`: Formatting, no logic change
- `refactor`: Code refactoring
- `test`: Test aggiunti/modificati
- `chore`: Maintenance tasks

**Esempi**:

```bash
feat(auth): add user login functionality
fix(timbrature): resolve timezone calculation bug
docs(api): update endpoint documentation
chore(deps): update React to v18.3.1
```

### File Names

- **Componenti**: `UserProfile.tsx`
- **Hooks**: `useAuth.ts`
- **Utils**: `dateHelpers.ts`
- **Pages**: `Dashboard.tsx`
- **Types**: `user.types.ts`

---

## Policy Backup

### Backup Automatici

- **Pre-commit**: Sempre
- **Pre-merge**: Obbligatorio
- **Pre-deploy**: Critico
- **Weekly**: Automatico via cron

### Rotazione

- **Locale**: Max 3 backup
- **Remote**: Max 10 backup
- **Archivio**: Mensile

### Ripristino

```bash
# Lista backup disponibili
npm run backup:list

# Preview contenuti
npm run backup:restore -- --preview backup_file.tar.gz

# Ripristino confermato
npm run backup:restore -- --confirm backup_file.tar.gz
```

---

## Best Practices

### Codice

#### Limiti File

- **Hard limit**: 200 righe
- **Warning**: ≥150 righe
- **Split obbligatorio** se superato

#### Organizzazione

```typescript
// 1. Imports esterni
import React from 'react';
import { useState } from 'react';

// 2. Imports interni
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 3. Types
import type { User } from '@/types/user';

// 4. Costanti
const MAX_RETRIES = 3;
```

#### Error Handling

```typescript
// ✅ Buono
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API call failed:', error);
  throw new Error('Failed to fetch data');
}

// ❌ Evitare
const result = await apiCall(); // No error handling
```

### Git

#### Commit Frequency

- **Piccoli commit**: Preferiti
- **Atomic changes**: Un concetto per commit
- **Working state**: Ogni commit deve buildare

#### Branch Strategy

- **main**: Sempre stabile
- **feature/\***: Sviluppo funzionalità
- **hotfix/\***: Fix critici
- **release/\***: Preparazione release

### Testing

#### Pre-commit

```bash
# Sempre eseguire
npm run lint
npm run check
npm run build

# Opzionale ma raccomandato
npm run test
npm run e2e
```

#### Continuous Integration

- **Lint**: Obbligatorio
- **TypeScript**: Obbligatorio
- **Build**: Obbligatorio
- **Tests**: Raccomandato

---

## Troubleshooting

### Problemi Comuni

#### Hook pre-commit fallisce

```bash
# Controlla file length
npm run diagnose

# Fix manuale
git commit --no-verify  # Solo in emergenza
```

#### Merge conflicts

```bash
# Backup prima del merge
npm run esegui:backup

# Risolvi conflitti
git mergetool

# Verifica post-merge
npm run build
```

#### Performance lenta

```bash
# Pulisci cache
rm -rf node_modules .cache dist
npm install

# Profiling
npm run dev:profile
```

---

## Supporto

### Documentazione

- **README.md**: Overview progetto
- **DOCS/**: Documentazione dettagliata
- **Wiki**: Guide avanzate

### Contatti

- **Tech Lead**: Per architettura
- **DevOps**: Per deployment
- **Team**: Slack #badgenode

---

**Welcome to the team! 🎉**
