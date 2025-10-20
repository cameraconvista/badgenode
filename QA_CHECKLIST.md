# BadgeNode - QA Checklist & Testing Strategy

**Version:** 1.0  
**Last Updated:** 2025-10-20  
**Coverage Target:** 80% business logic  

## 🎯 Critical User Flows

### Flow 1: Timbratura Dipendente (Core Flow)
**Priority:** CRITICAL  
**Frequency:** Every release  

#### Test Cases
| ID | Scenario | Input | Expected Output | Status |
|----|----------|-------|-----------------|--------|
| T1.1 | PIN valido - Entrata | PIN: 1, Tipo: Entrata | ✅ Timbratura registrata | ✅ |
| T1.2 | PIN valido - Uscita | PIN: 1, Tipo: Uscita | ✅ Timbratura registrata | ✅ |
| T1.3 | PIN invalido | PIN: 999 | ❌ Errore "PIN non valido" | ✅ |
| T1.4 | Alternanza corretta | Entrata → Uscita | ✅ Entrambe registrate | ✅ |
| T1.5 | Alternanza errata | Entrata → Entrata | ❌ Errore alternanza | ✅ |
| T1.6 | Turno notturno | Entrata 22:00 → Uscita 06:00 | ✅ Giorno logico corretto | ✅ |

#### Automation
```typescript
describe('Timbratura Flow', () => {
  it('should register valid PIN timbratura', async () => {
    await page.goto('/');
    await page.fill('[data-testid="pin-input"]', '1');
    await page.click('[data-testid="entrata-btn"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

### Flow 2: Gestione Admin Utenti
**Priority:** HIGH  
**Frequency:** Every release  

#### Test Cases
| ID | Scenario | Input | Expected Output | Status |
|----|----------|-------|-----------------|--------|
| A2.1 | Crea nuovo utente | PIN: 50, Nome: "Test", Cognome: "User" | ✅ Utente creato | ✅ |
| A2.2 | PIN duplicato | PIN esistente | ❌ Errore "PIN già esistente" | ✅ |
| A2.3 | Elimina utente | Utente esistente | ✅ Utente eliminato + timbrature | ✅ |
| A2.4 | Archivia dipendente | Utente attivo | ✅ Spostato in ex-dipendenti | ✅ |
| A2.5 | Modifica utente | Nuovi dati | ✅ Dati aggiornati | ✅ |

### Flow 3: Storico e Report
**Priority:** HIGH  
**Frequency:** Every release  

#### Test Cases
| ID | Scenario | Input | Expected Output | Status |
|----|----------|-------|-----------------|--------|
| S3.1 | Visualizza storico | PIN: 1, Mese corrente | ✅ Lista timbrature | ✅ |
| S3.2 | Filtro per periodo | Dal: 01/10, Al: 31/10 | ✅ Timbrature filtrate | ✅ |
| S3.3 | Calcolo ore giornaliere | Entrata 09:00, Uscita 17:00 | ✅ 8.00 ore | ✅ |
| S3.4 | Calcolo straordinari | 10 ore lavorate, 8 contratto | ✅ 2.00 extra | ✅ |
| S3.5 | Export PDF | Storico mese | ✅ PDF generato | ✅ |
| S3.6 | Export CSV | Storico mese | ✅ CSV scaricato | ✅ |

## 🔧 Unit Tests

### Services Layer
**Target Coverage:** 90%

#### TimbratureService
```typescript
describe('TimbratureService', () => {
  describe('validatePIN', () => {
    it('should return true for valid PIN', async () => {
      const result = await TimbratureService.validatePIN(1);
      expect(result).toBe(true);
    });

    it('should return false for invalid PIN', async () => {
      const result = await TimbratureService.validatePIN(999);
      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should create timbratura with valid data', async () => {
      const data = { pin: 1, tipo: 'entrata' as const };
      const result = await TimbratureService.create(data);
      expect(result.success).toBe(true);
    });
  });
});
```

#### UtentiService
```typescript
describe('UtentiService', () => {
  describe('create', () => {
    it('should create user with valid data', async () => {
      const userData = { pin: 50, nome: 'Test', cognome: 'User' };
      const result = await UtentiService.create(userData);
      expect(result.success).toBe(true);
    });

    it('should reject duplicate PIN', async () => {
      const userData = { pin: 1, nome: 'Test', cognome: 'User' };
      const result = await UtentiService.create(userData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('PIN già esistente');
    });
  });
});
```

### Utilities Layer
**Target Coverage:** 95%

#### Time Utilities
```typescript
describe('formatOre', () => {
  it('should format decimal hours correctly', () => {
    expect(formatOre(8.5)).toBe('8.30');
    expect(formatOre(2.75)).toBe('2.45');
    expect(formatOre(0.25)).toBe('0.15');
  });
});

describe('computeGiornoLogico', () => {
  it('should return previous day for early morning entries', () => {
    const result = computeGiornoLogico({ data: '2025-10-21', ora: '03:30' });
    expect(result.giorno_logico).toBe('2025-10-20');
  });

  it('should return same day for normal entries', () => {
    const result = computeGiornoLogico({ data: '2025-10-21', ora: '09:00' });
    expect(result.giorno_logico).toBe('2025-10-21');
  });
});
```

## 🌐 Integration Tests

### API Endpoints
**Target Coverage:** 100% critical paths

#### Health Endpoints
```typescript
describe('Health API', () => {
  it('GET /api/health should return 200', async () => {
    const response = await fetch('/api/health');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
  });

  it('GET /api/ready should return 200', async () => {
    const response = await fetch('/api/ready');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ready');
  });
});
```

#### Timbrature API
```typescript
describe('Timbrature API', () => {
  it('POST /api/timbrature should create with valid PIN', async () => {
    const response = await fetch('/api/timbrature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 1, tipo: 'entrata' })
    });
    expect(response.status).toBe(201);
  });

  it('POST /api/timbrature should reject invalid PIN', async () => {
    const response = await fetch('/api/timbrature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 999, tipo: 'entrata' })
    });
    expect(response.status).toBe(400);
  });
});
```

## 🎭 E2E Tests (Playwright)

### Setup
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
});
```

### Critical Path Tests
```typescript
// tests/e2e/timbratura-flow.spec.ts
test.describe('Timbratura Flow', () => {
  test('complete timbratura cycle', async ({ page }) => {
    await page.goto('/');
    
    // Enter PIN
    await page.fill('[data-testid="pin-display"]', '1');
    
    // Click Entrata
    await page.click('[data-testid="btn-entrata"]');
    
    // Verify success
    await expect(page.locator('[data-testid="feedback-banner"]')).toContainText('Entrata registrata');
    
    // Wait and click Uscita
    await page.waitForTimeout(1000);
    await page.click('[data-testid="btn-uscita"]');
    
    // Verify success
    await expect(page.locator('[data-testid="feedback-banner"]')).toContainText('Uscita registrata');
  });
});
```

## 🔒 Security Tests

### Authentication & Authorization
```typescript
describe('Security', () => {
  it('should block admin routes without auth', async () => {
    const response = await fetch('/admin');
    expect(response.status).toBe(401);
  });

  it('should not expose service role key', async () => {
    const response = await fetch('/api/debug/env');
    const data = await response.json();
    expect(data).not.toHaveProperty('SUPABASE_SERVICE_ROLE_KEY');
  });
});
```

### Input Validation
```typescript
describe('Input Validation', () => {
  it('should sanitize PIN input', async () => {
    const response = await fetch('/api/timbrature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: '<script>alert("xss")</script>', tipo: 'entrata' })
    });
    expect(response.status).toBe(400);
  });
});
```

## 🚀 Performance Tests

### Load Testing
```typescript
describe('Performance', () => {
  it('should handle concurrent timbrature', async () => {
    const promises = Array.from({ length: 10 }, (_, i) => 
      fetch('/api/timbrature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: i + 1, tipo: 'entrata' })
      })
    );
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status === 201).length;
    expect(successCount).toBeGreaterThan(8); // Allow some failures
  });
});
```

### Bundle Size Tests
```typescript
describe('Bundle Size', () => {
  it('should not exceed size limits', () => {
    const stats = require('../dist/stats.json');
    const mainChunk = stats.assets.find(a => a.name.includes('index'));
    expect(mainChunk.size).toBeLessThan(500 * 1024); // 500KB
  });
});
```

## 📊 Test Execution Matrix

### Environments
| Environment | Unit | Integration | E2E | Performance |
|-------------|------|-------------|-----|-------------|
| **Local Dev** | ✅ | ✅ | ✅ | ❌ |
| **CI/CD** | ✅ | ✅ | ✅ | ✅ |
| **Staging** | ❌ | ✅ | ✅ | ✅ |
| **Production** | ❌ | ❌ | ✅ | ✅ |

### Triggers
- **On commit:** Unit tests
- **On PR:** Unit + Integration tests
- **On merge:** Full test suite
- **Nightly:** Performance + E2E regression

## 🐛 Bug Reproduction Tests

### Known Issues (Regression Prevention)
```typescript
describe('Regression Tests', () => {
  it('should handle midnight timbrature correctly', async () => {
    // Reproduces bug where midnight entries were assigned wrong day
    const mockDate = new Date('2025-10-21T00:30:00');
    vi.setSystemTime(mockDate);
    
    const result = computeGiornoLogico({ data: '2025-10-21', ora: '00:30' });
    expect(result.giorno_logico).toBe('2025-10-20');
  });

  it('should prevent double timbrature of same type', async () => {
    // Reproduces bug where users could register Entrata → Entrata
    await TimbratureService.create({ pin: 1, tipo: 'entrata' });
    
    const result = await TimbratureService.create({ pin: 1, tipo: 'entrata' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('alternanza');
  });
});
```

## ✅ Test Execution Commands

```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Full test suite
npm run test:all

# Coverage report
npm run test:coverage

# Watch mode (development)
npm run test:watch
```

## 📈 Quality Gates

### Minimum Requirements (Blocks Deployment)
- ✅ **Unit test coverage:** ≥ 80%
- ✅ **Integration tests:** All passing
- ✅ **Critical E2E flows:** All passing
- ✅ **Security tests:** All passing
- ✅ **Performance budgets:** Within limits

### Quality Targets (Monitoring)
- 🎯 **Unit test coverage:** ≥ 90%
- 🎯 **E2E test coverage:** ≥ 95% critical paths
- 🎯 **Test execution time:** ≤ 5 minutes
- 🎯 **Flaky test rate:** ≤ 2%

---

**Test Strategy:** Pyramid approach - Many unit tests, fewer integration tests, critical E2E tests  
**Review Cycle:** Weekly test review, monthly strategy update  
**Tool Stack:** Vitest (unit), Playwright (E2E), Custom (performance)
