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

```bash
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
```

---

## 🔄 Development Workflow

### Branch Naming Convention

```
<type>/<scope>-<short-description>

Esempi:
feature/offline-queue-retry
fix/pin-validation-404
docs/api-endpoints-guide
refactor/supabase-client-singleton
perf/bundle-lazy-loading
test/e2e-timbrature-flow
chore/deps-update-react
```

**Types:**
- `feature/` — Nuova funzionalità
- `fix/` — Bug fix
- `docs/` — Solo documentazione
- `refactor/` — Refactoring senza cambio funzionalità
- `perf/` — Performance improvement
- `test/` — Aggiunta/modifica test
- `chore/` — Manutenzione (deps, build, config)

### Workflow Steps

```bash
# 1. Sync con upstream
git checkout main
git pull upstream main

# 2. Crea branch feature
git checkout -b feature/my-new-feature

# 3. Sviluppa e testa
npm run dev
npm run check
npm run lint
npm run test

# 4. Commit (vedi sezione Commit Convention)
git add .
git commit -m "feat(offline): add retry backoff logic"

# 5. Push al tuo fork
git push origin feature/my-new-feature

# 6. Apri Pull Request su GitHub
```

---

## 💻 Coding Standards

### TypeScript

**Strict Mode:**
```typescript
// ✅ GOOD: Tipi espliciti
function validatePin(pin: string): boolean {
  return /^\d{1,2}$/.test(pin);
}

// ❌ BAD: any type
function validatePin(pin: any): any {
  return /^\d{1,2}$/.test(pin);
}
```

**Naming Conventions:**
```typescript
// ✅ GOOD
const MAX_RETRY_COUNT = 3;
class TimbratureService {}
interface UserData {}
type ApiResponse<T> = { data: T; error?: string };

// ❌ BAD
const max_retry_count = 3;
class timbrature_service {}
interface userData {}
```

### File Organization

**File Length Policy:**
- ⚠️ **Warning**: 220 righe
- 🔴 **Hard Limit**: 300 righe (pre-commit hook blocca)
- ✅ **Raccomandato**: <200 righe

**File Structure:**
```typescript
// 1. Imports (grouped: external → internal → types)
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { fetchUtenti } from '@/services/utenti.service';

import type { Utente } from '@/types/api';

// 2. Types/Interfaces
interface Props {
  userId: string;
}

// 3. Constants
const MAX_ITEMS = 10;

// 4. Component/Function
export function UserList({ userId }: Props) {
  // ...
}

// 5. Exports (if needed)
export type { Props };
```

### React Components

**Functional Components:**
```typescript
// ✅ GOOD: Named export, typed props
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// ❌ BAD: Default export, untyped
export default function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

**Hooks:**
```typescript
// ✅ GOOD: Custom hook con type safety
function useTimbrature(pin: string) {
  return useQuery({
    queryKey: ['timbrature', pin],
    queryFn: () => fetchTimbrature(pin),
  });
}

// ❌ BAD: Untyped, no query key
function useTimbrature(pin) {
  return useQuery(() => fetchTimbrature(pin));
}
```

### CSS/Styling

**TailwindCSS:**
```tsx
// ✅ GOOD: Utility classes, responsive
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6">
  <Button className="w-full md:w-auto" />
</div>

// ❌ BAD: Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  <Button style={{ width: '100%' }} />
</div>
```

---

## 📝 Commit Convention

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Descrizione | Esempio |
|------|-------------|---------|
| `feat` | Nuova feature | `feat(offline): add retry backoff` |
| `fix` | Bug fix | `fix(pin): handle 404 on validate` |
| `docs` | Documentazione | `docs(api): update endpoints guide` |
| `refactor` | Refactoring | `refactor(db): extract supabase client` |
| `perf` | Performance | `perf(bundle): lazy load export libs` |
| `test` | Test | `test(e2e): add timbrature flow` |
| `chore` | Manutenzione | `chore(deps): update react to 18.3.1` |
| `style` | Formatting | `style(lint): fix eslint warnings` |
| `ci` | CI/CD | `ci(github): add workflow checks` |

### Scope

Componente o area interessata:
- `offline`, `pin`, `timbrature`, `storico`, `admin`
- `ui`, `api`, `db`, `auth`, `pwa`
- `deps`, `build`, `config`, `docs`

### Subject

- Usa imperativo presente: "add" non "added"
- Non capitalizzare la prima lettera
- No punto finale
- Max 72 caratteri

### Body (opzionale)

- Spiega **cosa** e **perché**, non **come**
- Wrap a 72 caratteri
- Separa dal subject con riga vuota

### Footer (opzionale)

```
BREAKING CHANGE: descrizione breaking change

Fixes #123
Closes #456
Refs #789
```

### Examples

```bash
# Feature semplice
git commit -m "feat(offline): add exponential backoff retry"

# Bug fix con body
git commit -m "fix(pin): handle 404 on validation

PIN validation was failing with 404 when user not found.
Now returns proper error message instead of crashing."

# Breaking change
git commit -m "refactor(api): migrate from RPC to REST

BREAKING CHANGE: timbrature endpoint changed from
/api/rpc/insert_timbro to POST /api/timbrature

Closes #234"
```

---

## 🔀 Pull Request Process

### PR Checklist

Prima di aprire una PR, verifica:

- [ ] ✅ Branch aggiornato con `main` upstream
- [ ] ✅ `npm run check` → PASS (TypeScript)
- [ ] ✅ `npm run lint` → PASS (ESLint)
- [ ] ✅ `npm run build` → SUCCESS
- [ ] ✅ `npm run test` → PASS (se test modificati)
- [ ] ✅ `npm run check:ci` → PASS (validazione completa)
- [ ] ✅ File length ≤220 righe (guard attivo)
- [ ] ✅ Commit messages seguono convention
- [ ] ✅ Documentazione aggiornata (se necessario)
- [ ] ✅ CHANGELOG.md aggiornato (se feature/fix)

### PR Template

```markdown
## Description
Breve descrizione delle modifiche.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix o feature che causa breaking)
- [ ] Documentation update

## Testing
Descrivi i test eseguiti:
- [ ] Unit tests
- [ ] E2E tests
- [ ] Manual testing

## Screenshots (se UI changes)
Allega screenshot prima/dopo.

## Checklist
- [ ] TypeScript check passed
- [ ] ESLint passed
- [ ] Build successful
- [ ] Tests passed
- [ ] Documentation updated
- [ ] CHANGELOG updated

## Related Issues
Fixes #123
Refs #456
```

### Review Process

1. **Automated Checks**: CI/CD esegue `npm run check:ci`
2. **Code Review**: Almeno 1 approval richiesto
3. **Testing**: Reviewer testa manualmente (se UI/UX changes)
4. **Merge**: Squash and merge (mantiene history pulita)

### Merge Strategy

- **Squash and Merge**: Default per feature branches
- **Rebase and Merge**: Solo per hotfix critici
- **Merge Commit**: Mai (mantiene history lineare)

---

## 🧪 Testing Requirements

### Unit Tests (Vitest)

```typescript
// src/lib/time.test.ts
import { describe, it, expect } from 'vitest';
import { computeGiornoLogico } from './time';

describe('computeGiornoLogico', () => {
  it('should return same day before cutoff', () => {
    const result = computeGiornoLogico(new Date('2025-11-01T04:00:00'));
    expect(result).toBe('2025-10-31');
  });

  it('should return same day after cutoff', () => {
    const result = computeGiornoLogico(new Date('2025-11-01T06:00:00'));
    expect(result).toBe('2025-11-01');
  });
});
```

**Run Tests:**
```bash
npm run test           # Run once
npm run test:watch     # Watch mode
npm run test -- --coverage  # With coverage
```

### E2E Tests (Playwright)

```typescript
// e2e/timbrature.spec.ts
import { test, expect } from '@playwright/test';

test('should create timbratura entrata', async ({ page }) => {
  await page.goto('http://localhost:10000');
  
  // Enter PIN
  await page.fill('[data-testid="pin-input"]', '1');
  
  // Click ENTRATA
  await page.click('[data-testid="btn-entrata"]');
  
  // Verify success toast
  await expect(page.locator('.toast-success')).toBeVisible();
});
```

**Run E2E:**
```bash
npm run e2e            # Headless
npm run e2e -- --headed  # With browser
npm run e2e -- --debug   # Debug mode
```

### Coverage Requirements

- **Minimum**: 80% coverage
- **Target**: 90% coverage
- **Critical paths**: 100% coverage (auth, timbrature, offline)

---

## 📚 Documentation

### Code Documentation

**JSDoc Comments:**
```typescript
/**
 * Valida un PIN dipendente (1-99).
 * 
 * @param pin - PIN da validare (string)
 * @returns true se valido, false altrimenti
 * 
 * @example
 * ```ts
 * validatePin('42') // true
 * validatePin('0')  // false
 * validatePin('100') // false
 * ```
 */
export function validatePin(pin: string): boolean {
  return /^[1-9]\d?$/.test(pin);
}
```

### README Updates

Se aggiungi una feature, aggiorna:
- `README.md` — Quick Start, Features
- `DOCS/` — Guide specifiche
- `CHANGELOG.md` — Entry nella versione corrente

### API Documentation

Per nuovi endpoint, documenta in `DOCS/01_database_api.md`:
```markdown
### POST /api/my-endpoint

**Auth:** Required (SERVICE_ROLE)

**Request:**
```json
{
  "param": "value"
}
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

**Errors:**
- 400: Invalid parameters
- 401: Unauthorized
- 500: Server error
```

---

## ⚠️ Important Constraints

### What NOT to Change

❌ **Zero modifiche** a:
- Database schema (senza approval)
- API breaking changes (senza versioning)
- UX/UI major changes (senza design review)
- Build configuration (senza testing completo)
- Security policies (senza security review)

### File Length Policy

- **Warning**: 220 righe (ESLint warning)
- **Hard Limit**: 300 righe (pre-commit hook **blocca**)
- **Raccomandato**: <200 righe

**Eccezioni:**
- File di configurazione (vite.config.ts, eslint.config.js)
- Test files (*.test.ts, *.spec.ts)
- Legacy files (server/legacy/*)

### Pre-Commit Hooks

Husky esegue automaticamente:
1. `npm run lint` — ESLint check
2. `npm run check` — TypeScript check
3. `npm run check:ci` — Validazione completa
4. `node scripts/file-length-guard.cjs` — File length check

Se fallisce, il commit è **bloccato**.

---

## 🆘 Getting Help

### Resources

- **Documentation**: [DOCS/](DOCS/)
- **Troubleshooting**: [DOCS/10_troubleshooting.md](DOCS/10_troubleshooting.md)
- **Setup Guide**: [DOCS/05_setup_sviluppo.md](DOCS/05_setup_sviluppo.md)
- **API Reference**: [DOCS/01_database_api.md](DOCS/01_database_api.md)

### Contact

- **GitHub Issues**: Per bug e feature requests
- **GitHub Discussions**: Per domande generali
- **Email**: dev@badgenode.example.com

---

## 🎉 Recognition

Contributors sono riconosciuti in:
- `CHANGELOG.md` — Per ogni release
- GitHub Contributors page
- Hall of Fame (per contributi significativi)

---

**Thank you for contributing to BadgeNode!** 🚀

**Last Updated:** 2025-11-01  
**Version:** 1.0.0
