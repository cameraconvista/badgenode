# 12 📦 DEPENDENCY MANAGEMENT - BadgeNode

**Gestione dipendenze, security e audit automatico**  
**Versione**: 5.0 • **Data**: 2025-10-21 • **Stato**: Enterprise Stable

---

## 📋 Contenuti

1. [Audit Strategy](#audit-strategy)
2. [Package Categories](#package-categories)
3. [Cleanup Procedures](#cleanup-procedures)
4. [Security Updates](#security-updates)

---

## 🔍 Audit Strategy

### **Monthly Dependency Review**
```bash
# Audit completo mensile
npm audit --audit-level=moderate
npm outdated
npm run depcheck

# Report dettagliato
npm audit --json > security-report.json
npm outdated --json > outdated-report.json
```

### **Unused Packages Detection**
```bash
# Scan dipendenze non utilizzate
npm run depcheck

# Analisi avanzata con knip
npm run analyze:knip

# TypeScript unused exports
npm run tsprune
```

### **Vulnerability Scanning**
```bash
# Security audit con fix automatico
npm audit fix

# Audit solo production dependencies
npm audit --production

# Check vulnerabilities specifiche
npm audit --audit-level=high --json
```

---

## 📚 Package Categories

### **Runtime Dependencies**
```json
{
  "critical": [
    "react",
    "react-dom", 
    "@supabase/supabase-js",
    "express"
  ],
  "ui_framework": [
    "@radix-ui/react-*",
    "tailwindcss",
    "lucide-react"
  ],
  "business_logic": [
    "@tanstack/react-query",
    "wouter",
    "zod"
  ],
  "utilities": [
    "date-fns",
    "clsx",
    "nanoid"
  ]
}
```

### **Development Tools**
```json
{
  "build_tools": [
    "vite",
    "typescript", 
    "esbuild"
  ],
  "quality_tools": [
    "eslint",
    "prettier",
    "@typescript-eslint/*"
  ],
  "testing": [
    "vitest",
    "@playwright/test"
  ]
}
```

### **Optional Dependencies**
```json
{
  "export_features": [
    "jspdf",
    "exceljs"
  ],
  "pwa_tools": [
    "vite-plugin-pwa"
  ],
  "development_only": [
    "sharp",
    "source-map-explorer"
  ]
}
```

---

## 🧹 Cleanup Procedures

### **Safe Removal Process**
```bash
# 1. Backup prima della rimozione
npm run esegui:backup

# 2. Identifica dipendenze non utilizzate
npm run depcheck > unused-deps.txt

# 3. Verifica import nel codice
for pkg in $(cat unused-deps.txt); do
  echo "Checking $pkg..."
  grep -r "$pkg" client/src/ server/ || echo "  -> Safe to remove"
done

# 4. Rimuovi dipendenza
npm uninstall package-name

# 5. Test completo
npm run check:ci && npm run build

# 6. Commit se tutto OK
git add package.json package-lock.json
git commit -m "deps: remove unused package-name"
```

### **Testing Checklist**
```bash
# Dopo rimozione dipendenze
✅ npm install          # Install senza errori
✅ npm run check        # TypeScript check OK
✅ npm run lint         # ESLint check OK  
✅ npm run build        # Build production OK
✅ npm run dev          # Dev server OK
✅ npm run smoke:runtime # Runtime test OK
```

### **Rollback Strategy**
```bash
# Se problemi dopo rimozione
git restore package.json package-lock.json
npm install

# Oppure reinstalla specifica versione
npm install package-name@^1.2.3
```

---

## 🔒 Security Updates

### **Automated Scanning Setup**
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:fix": "npm audit fix --force",
    "security:report": "npm audit --json > security-audit.json",
    "deps:outdated": "npm outdated --json > outdated-deps.json",
    "deps:update": "npm update",
    "deps:check": "npm run depcheck && npm run security:audit"
  }
}
```

### **Update Prioritization**
```bash
# 1. CRITICAL - Security vulnerabilities
npm audit --audit-level=critical

# 2. HIGH - Breaking changes in major versions
npm outdated | grep -E "Red|Major"

# 3. MEDIUM - Minor/patch updates
npm update --save

# 4. LOW - Development dependencies
npm update --save-dev
```

### **Breaking Changes Management**
```bash
# Test major updates in isolation
npm install package-name@latest --no-save
npm run check:ci

# Se OK, salva l'update
npm install package-name@latest --save

# Se problemi, rollback
npm install package-name@previous-version --save
```

### **Security Policies**
```json
{
  "security_rules": {
    "max_vulnerability_age": "30 days",
    "allowed_severity": ["low", "moderate"],
    "auto_fix": true,
    "notification_channels": ["email", "slack"],
    "scan_frequency": "weekly"
  }
}
```

---

## 🔄 Automated Workflows

### **GitHub Actions Security**
```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday 9 AM
  push:
    paths: ['package.json', 'package-lock.json']

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Security audit
        run: npm audit --audit-level=moderate
      
      - name: Check outdated packages
        run: npm outdated --json > outdated.json || true
      
      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: |
            security-audit.json
            outdated.json
```

### **Pre-commit Hooks**
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Security check before commit
npm audit --audit-level=high --json > /tmp/audit.json

CRITICAL_COUNT=$(jq '.metadata.vulnerabilities.critical' /tmp/audit.json)
HIGH_COUNT=$(jq '.metadata.vulnerabilities.high' /tmp/audit.json)

if [ "$CRITICAL_COUNT" -gt 0 ] || [ "$HIGH_COUNT" -gt 0 ]; then
  echo "❌ Security vulnerabilities found:"
  echo "  Critical: $CRITICAL_COUNT"
  echo "  High: $HIGH_COUNT"
  echo "Run 'npm audit fix' before committing"
  exit 1
fi

echo "✅ Security audit passed"
```

---

## 📊 Dependency Analytics

### **Bundle Impact Analysis**
```bash
# Analizza impatto di ogni dipendenza sul bundle
npm run analyze:bundle --analyzer-mode=json > bundle-stats.json

# Trova dipendenze più pesanti
jq '.assets[] | select(.name | contains(".js")) | {name, size}' bundle-stats.json | \
sort -k2 -nr | head -10
```

### **Usage Tracking**
```typescript
// Script per tracciare uso dipendenze
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const dependencies = Object.keys(packageJson.dependencies || {});

for (const dep of dependencies) {
  try {
    const usage = execSync(`grep -r "from '${dep}'" client/src/ server/`, { encoding: 'utf8' });
    console.log(`${dep}: ${usage.split('\n').length - 1} usages`);
  } catch {
    console.log(`${dep}: 0 usages - CANDIDATE FOR REMOVAL`);
  }
}
```

### **Performance Impact**
```bash
# Misura impatto performance di dipendenze
npm run build

# Prima della rimozione
BEFORE_SIZE=$(du -sk dist/public/assets | cut -f1)

# Dopo rimozione dipendenza
npm uninstall heavy-package
npm run build
AFTER_SIZE=$(du -sk dist/public/assets | cut -f1)

echo "Bundle size reduction: $((BEFORE_SIZE - AFTER_SIZE))KB"
```

---

## 🎯 Best Practices

### **Dependency Selection Criteria**
```markdown
✅ GOOD Dependencies:
- Actively maintained (commits < 6 months)
- Good TypeScript support
- Small bundle size impact
- Stable API (semantic versioning)
- Good documentation

❌ AVOID Dependencies:
- Abandoned projects (no commits > 1 year)
- Large bundle impact (>100KB)
- Frequent breaking changes
- Poor TypeScript support
- Security vulnerabilities
```

### **Update Strategy**
```bash
# 1. Test updates in feature branch
git checkout -b deps/update-packages

# 2. Update non-breaking first
npm update

# 3. Test major updates individually
npm install react@latest --no-save
npm run check:ci

# 4. Commit working updates
git add package.json package-lock.json
git commit -m "deps: update to latest stable versions"
```

### **Documentation Requirements**
```markdown
Per ogni nuova dipendenza documentare:
- Motivo dell'aggiunta
- Alternative considerate
- Impatto bundle size
- Piano di migrazione/rimozione
- Responsabile manutenzione
```

---

## 🚨 Emergency Procedures

### **Critical Vulnerability Response**
```bash
# 1. Immediate assessment
npm audit --audit-level=critical

# 2. Quick fix attempt
npm audit fix --force

# 3. If fix breaks build
npm install package-name@safe-version --save

# 4. Emergency deployment
npm run build && npm run deploy

# 5. Post-incident review
# Document in DNA/security-incidents/
```

### **Dependency Lockdown**
```json
{
  "scripts": {
    "deps:freeze": "npm shrinkwrap",
    "deps:verify": "npm ci --audit=false",
    "deps:emergency-update": "npm audit fix --force && npm run check:ci"
  }
}
```

---

**Nota**: Mantenere sempre un equilibrio tra sicurezza, stabilità e funzionalità. Prioritizzare fix di sicurezza ma testare thoroughly prima del deploy.

---

> **Documento aggiornato alla baseline Enterprise Stable (v1.0.0 — 2025-10-21)**  
> Autore: BadgeNode / Cascade AI
