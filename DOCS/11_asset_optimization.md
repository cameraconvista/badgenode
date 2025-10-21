# 11 🎨 ASSET OPTIMIZATION - BadgeNode

**Gestione ottimizzata asset e monitoraggio bundle size**  
**Versione**: 5.0 • **Data**: 2025-10-21 • **Stato**: Enterprise Stable

---

## 📋 Contenuti

1. [PWA Icons Strategy](#pwa-icons-strategy)
2. [Bundle Size Monitoring](#bundle-size-monitoring)
3. [Asset Cleanup Procedures](#asset-cleanup-procedures)
4. [Performance Budgets](#performance-budgets)

---

## 🎯 PWA Icons Strategy

### **Dimensioni Standard**
```
Required PWA Icons:
├── icon-192x192.png (192×192px) - Standard PWA
├── icon-256x256.png (256×256px) - Enhanced quality  
├── icon-384x384.png (384×384px) - Large displays
├── icon-512x512.png (512×512px) - High-res displays
└── maskable-512x512.png (512×512px) - Android adaptive
```

### **Formato e Compressione**
- **Formato**: PNG con trasparenza
- **Compressione**: Ottimizzata per web (80-90% quality)
- **Colori**: sRGB color space
- **Dimensioni file target**: <50KB per icon

### **Eliminazione Duplicati**
```bash
# Rimuovere duplicati senza dimensioni nel nome
rm client/public/icons/icon-192.png    # Mantieni icon-192x192.png
rm client/public/icons/icon-512.png    # Mantieni icon-512x512.png

# Verifica manifest.webmanifest references
grep -r "icon-" client/public/manifest.webmanifest
```

### **Generazione Automatica**
```bash
# Script per generare tutte le dimensioni da source
npm run icons:generate

# Verifica integrità dopo generazione
npm run build && npm run check:ci
```

---

## 📊 Bundle Size Monitoring

### **Target Size Limits**
```
Bundle Size Targets:
├── Total Bundle: <1MB gzipped
├── Main Chunk: <500KB gzipped  
├── Vendor Chunk: <300KB gzipped
└── Asset Files: <200KB total
```

### **Analysis Tools Setup**
```bash
# Bundle analysis completa
npm run analyze:bundle

# Visualizzazione interattiva
npm run build && npx vite-bundle-visualizer

# Source map exploration
npm run analyze:map
```

### **Performance Budgets**
```javascript
// vite.config.ts - Performance budgets
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-button'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 500 // KB
  }
});
```

### **Monitoring Continuo**
```bash
# Pre-commit hook per size check
echo "npm run analyze:bundle" >> .git/hooks/pre-commit

# CI/CD integration
npm run build && npm run analyze:bundle --json > bundle-report.json
```

---

## 🧹 Asset Cleanup Procedures

### **Audit Checklist**
```bash
# 1. Trova asset non referenziati
find client/public -name "*.png" -o -name "*.jpg" -o -name "*.svg" | \
while read file; do
  basename=$(basename "$file")
  if ! grep -r "$basename" client/src/ >/dev/null 2>&1; then
    echo "Unreferenced: $file"
  fi
done

# 2. Verifica duplicati per dimensione
find client/public -name "*.png" -exec identify {} \; | \
sort -k3 | uniq -f2 -D

# 3. Check manifest references
jq '.icons[].src' client/public/manifest.webmanifest
```

### **Unused File Detection**
```bash
# Script automatico per rilevare file inutilizzati
npm run analyze:deps | grep "unused files"

# Verifica manuale con grep
for file in client/public/*.png; do
  basename=$(basename "$file")
  echo "Checking $basename..."
  grep -r "$basename" client/src/ || echo "  -> NOT FOUND"
done
```

### **Safe Removal Process**
```bash
# 1. Backup prima della rimozione
npm run esegui:backup

# 2. Rimuovi file non referenziati
rm client/public/unused-asset.png

# 3. Test build completo
npm run build

# 4. Test PWA manifest
npm run check:ci

# 5. Commit se tutto OK
git add . && git commit -m "cleanup: remove unused assets"
```

---

## 🎯 Performance Budgets

### **Bundle Size Targets**
```typescript
// Performance budgets per categoria
const PERFORMANCE_BUDGETS = {
  // Bundle totale
  totalBundle: {
    target: '800KB',
    warning: '900KB', 
    error: '1MB'
  },
  
  // Chunk principali
  mainChunk: {
    target: '400KB',
    warning: '450KB',
    error: '500KB'
  },
  
  // Asset statici
  staticAssets: {
    target: '150KB',
    warning: '180KB', 
    error: '200KB'
  },
  
  // Icone PWA
  pwaIcons: {
    target: '300KB',
    warning: '400KB',
    error: '500KB'
  }
};
```

### **Automated Optimization**
```bash
# Ottimizzazione immagini automatica
npm install -g imagemin-cli
imagemin client/public/icons/*.png --out-dir=client/public/icons/optimized

# Compressione PNG lossless
pngquant --quality=80-90 client/public/icons/*.png --ext=.png --force

# Verifica dimensioni post-ottimizzazione
du -sh client/public/icons/*
```

### **CI/CD Integration**
```yaml
# .github/workflows/performance.yml
- name: Bundle Size Check
  run: |
    npm run build
    npm run analyze:bundle --json > bundle-stats.json
    
    # Fail if bundle > 1MB
    BUNDLE_SIZE=$(jq '.assets[0].size' bundle-stats.json)
    if [ "$BUNDLE_SIZE" -gt 1048576 ]; then
      echo "Bundle size exceeded 1MB: $BUNDLE_SIZE bytes"
      exit 1
    fi
```

### **Performance Monitoring**
```bash
# Lighthouse CI per PWA metrics
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage

# Bundle analyzer report
npm run analyze:bundle --analyzer-mode=server --analyzer-port=8888
```

---

## 🔧 Utility Scripts

### **Asset Management Scripts**
```json
{
  "scripts": {
    "assets:audit": "node scripts/audit-assets.js",
    "assets:optimize": "imagemin client/public/**/*.{png,jpg} --out-dir=dist/optimized",
    "assets:unused": "node scripts/find-unused-assets.js",
    "icons:generate": "node scripts/generate-pwa-icons.js",
    "bundle:analyze": "vite-bundle-analyzer dist/assets",
    "bundle:report": "npm run build && npm run bundle:analyze --json > bundle-report.json"
  }
}
```

### **Pre-commit Hooks**
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Check bundle size before commit
npm run build >/dev/null 2>&1
BUNDLE_SIZE=$(du -sk dist/public/assets | cut -f1)

if [ "$BUNDLE_SIZE" -gt 1024 ]; then
  echo "❌ Bundle size too large: ${BUNDLE_SIZE}KB (max: 1024KB)"
  echo "Run 'npm run bundle:analyze' to investigate"
  exit 1
fi

echo "✅ Bundle size OK: ${BUNDLE_SIZE}KB"
```

---

## 📈 Optimization Strategies

### **Code Splitting**
```typescript
// Lazy loading per route pesanti
const StoricoTimbrature = lazy(() => import('./pages/StoricoTimbrature'));
const ArchivioDipendenti = lazy(() => import('./pages/ArchivioDipendenti'));

// Dynamic imports per librerie pesanti
const loadPDFExport = () => import('./utils/pdf-export');
const loadExcelExport = () => import('./utils/excel-export');
```

### **Tree Shaking**
```typescript
// Import specifici per tree shaking
import { Button } from '@radix-ui/react-button';        // ✅ Good
import * as RadixUI from '@radix-ui/react-button';      // ❌ Bad

// Configurazione Vite per tree shaking
export default defineConfig({
  build: {
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false
      }
    }
  }
});
```

### **Asset Optimization**
```bash
# Ottimizzazione automatica build
npm run build && npm run assets:optimize

# Compressione gzip per deploy
gzip -9 dist/public/assets/*.js
gzip -9 dist/public/assets/*.css
```

---

**Nota**: Mantenere sempre un equilibrio tra ottimizzazione e maintainability. Prioritizzare ottimizzazioni con maggior impatto su performance utente.

---

> **Documento aggiornato alla baseline Enterprise Stable (v1.0.0 — 2025-10-21)**  
> Autore: BadgeNode / Cascade AI
