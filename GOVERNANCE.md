# BadgeNode - Governance & Code Quality Standards

**Version:** 1.0  
**Last Updated:** 2025-10-20  
**Enforcement:** Pre-commit hooks + CI/CD  

## 📏 File Length Standards

### Hard Limits (Enforced by Pre-commit)
- **≤ 500 righe:** BLOCCO ASSOLUTO - Commit rifiutato
- **≤ 300 righe:** LIMITE CONSIGLIATO - Warning ma commit consentito
- **≤ 200 righe:** TARGET OTTIMALE - Nessun warning

### Eccezioni Motivate
I seguenti file possono superare 300 righe se giustificato:
- `server/routes.ts` - API routes centrali (da refactorare)
- `client/src/services/storico.service.ts` - Logica business complessa
- File di configurazione (vite.config.ts, tailwind.config.ts)
- File di test end-to-end completi

### Enforcement
```bash
# Pre-commit hook verifica lunghezza file
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 500 { exit 1 }'
```

## 🔧 TypeScript Standards

### Strict Mode Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Type Safety Rules
- ✅ **Explicit return types** per funzioni pubbliche
- ✅ **No `any` type** salvo adapter/legacy code
- ✅ **Strict null checks** attivi
- ✅ **Interface over type** per oggetti complessi
- ✅ **Enum over union types** per costanti

### Esempi
```typescript
// ✅ CORRETTO
export function formatOre(decimal: number): string {
  return `${Math.floor(decimal)}.${String(Math.round((decimal % 1) * 60)).padStart(2, '0')}`;
}

// ❌ SCORRETTO
export function formatOre(decimal) {
  return decimal.toString();
}
```

## 🎨 ESLint Rules

### Core Rules (Enforced)
```javascript
{
  "@typescript-eslint/no-unused-vars": "warn",
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "prefer-const": "error",
  "no-var": "error",
  "no-console": ["warn", { "allow": ["warn", "error"] }]
}
```

### Import Standards
```typescript
// ✅ CORRETTO - Absolute imports
import { formatOre } from '@/lib/time';
import { TimbratureService } from '@/services/timbrature.service';

// ❌ SCORRETTO - Relative imports profondi
import { formatOre } from '../../../lib/time';
```

### Component Rules
- **Max 150 righe** per componente React
- **Single responsibility** - un concern per componente
- **Props interface** sempre tipizzata
- **Default export** solo per pagine/route

## 📁 Architecture Standards

### Directory Structure
```
client/src/
├── components/          # UI components (max 150 righe)
│   ├── ui/             # Base UI components
│   ├── home/           # Home-specific components
│   ├── admin/          # Admin-specific components
│   └── storico/        # Storico-specific components
├── services/           # Business logic (max 300 righe)
├── lib/               # Utilities (max 200 righe)
├── hooks/             # Custom hooks (max 100 righe)
├── types/             # Type definitions
└── pages/             # Route components
```

### Naming Conventions
- **PascalCase:** Components, Types, Interfaces
- **camelCase:** Functions, variables, methods
- **kebab-case:** File names, CSS classes
- **SCREAMING_SNAKE_CASE:** Constants, env vars

### Service Layer Rules
```typescript
// ✅ CORRETTO - Service pattern
export class TimbratureService {
  private static readonly BASE_URL = '/api/timbrature';
  
  static async create(data: TimbratureInsert): Promise<ApiResponse<Timbratura>> {
    // Implementation
  }
}

// ❌ SCORRETTO - Mixed concerns
export const timbratureUtils = {
  create: async () => { /* API call */ },
  format: (data) => { /* formatting */ },
  validate: (data) => { /* validation */ }
};
```

## 🔒 Security Standards

### Supabase Usage
- ✅ **ANON_KEY only** nel client
- ✅ **SERVICE_ROLE_KEY only** nel server
- ✅ **RLS policies** sempre attive
- ❌ **NO hardcoded secrets** in codice

### Environment Variables
```typescript
// ✅ CORRETTO - Validation
const supabaseUrl = process.env.VITE_SUPABASE_URL;
if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL required');

// ❌ SCORRETTO - No validation
const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
```

## 🧪 Testing Standards

### Unit Tests
- **Coverage target:** 80% per services
- **Test file naming:** `*.test.ts`
- **Mock external dependencies**
- **Test business logic, not implementation**

### E2E Tests
- **Critical paths only:** PIN → Timbratura, Admin flows
- **Page Object Model** pattern
- **Environment isolation**

### Example Test Structure
```typescript
describe('TimbratureService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create timbratura with valid PIN', async () => {
    // Arrange
    const mockData = { pin: 1, tipo: 'entrata' };
    
    // Act
    const result = await TimbratureService.create(mockData);
    
    // Assert
    expect(result.success).toBe(true);
  });
});
```

## 📝 Documentation Standards

### Code Comments
```typescript
/**
 * Calcola il giorno logico per una timbratura.
 * Regola: entrate 00:00-04:59 → giorno precedente
 * 
 * @param data - Data in formato YYYY-MM-DD
 * @param ora - Ora in formato HH:mm
 * @returns Giorno logico calcolato
 */
export function computeGiornoLogico(data: string, ora: string): string {
  // Implementation
}
```

### README Standards
- **Setup rapido** (≤ 5 minuti)
- **Esempi pratici** di utilizzo
- **Troubleshooting** problemi comuni
- **Link documentazione** completa

## 🔄 Git Workflow

### Commit Messages
```bash
# ✅ CORRETTO - Conventional commits
feat(server): add /api/ready health endpoint
fix(client): resolve PIN validation in TimbratureActions
chore(deps): remove unused autoprefixer dependency
docs(governance): add file length standards

# ❌ SCORRETTO
fix bug
update files
changes
```

### Branch Strategy
- `main` - Production ready
- `feature/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance

### Pre-commit Hooks
```bash
#!/bin/sh
# File length check
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 500 { print "❌ File " $2 " exceeds 500 lines (" $1 ")"; exit 1 }'

# TypeScript check
npm run typecheck

# ESLint check
npm run lint

# Tests
npm run test
```

## 🚀 Performance Standards

### Bundle Size Targets
- **Initial load:** ≤ 500KB (gzipped)
- **Route chunks:** ≤ 100KB each
- **Vendor chunks:** ≤ 200KB each

### Code Splitting Strategy
```typescript
// ✅ CORRETTO - Lazy loading
const StoricoTimbrature = lazy(() => import('@/pages/StoricoTimbrature'));
const ArchivioDipendenti = lazy(() => import('@/pages/ArchivioDipendenti'));

// ❌ SCORRETTO - Everything in main bundle
import StoricoTimbrature from '@/pages/StoricoTimbrature';
```

### Performance Monitoring
- **Core Web Vitals** tracking
- **Bundle analysis** per release
- **Lighthouse CI** integration

## ✅ Enforcement Checklist

### Pre-commit (Automated)
- [ ] File length ≤ 500 righe
- [ ] TypeScript compilation
- [ ] ESLint passing
- [ ] Prettier formatting
- [ ] No console.log in production code

### Pre-push (Automated)
- [ ] All tests passing
- [ ] Build successful
- [ ] Bundle size within limits

### Code Review (Manual)
- [ ] Architecture patterns followed
- [ ] Security standards met
- [ ] Documentation updated
- [ ] Performance impact assessed

---

**Enforcement Level:** STRICT - Violations block commits/deployments  
**Review Cycle:** Monthly governance review  
**Updates:** Via PR to main branch
