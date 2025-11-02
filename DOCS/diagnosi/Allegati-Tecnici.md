# Allegati-Tecnici

_Sorgenti consolidate: 2_

## bundle-analysis.md

```markdown
# Bundle Analysis - BadgeNode

## Build Output Completo

`` `
../dist/public/registerSW.js                                0.13 kB
../dist/public/manifest.webmanifest                         0.17 kB
../dist/public/index.html                                   1.67 kB │ gzip:   0.70 kB
../dist/public/assets/index-DknX29qL.css                   85.05 kB │ gzip:  14.93 kB
../dist/public/assets/circle-alert-Bdj5aLzj.js              0.42 kB │ gzip:   0.29 kB
../dist/public/assets/triangle-alert-ZenIobhx.js            0.72 kB │ gzip:   0.36 kB
../dist/public/assets/recharts-Cl7DEQbn.js                  0.88 kB │ gzip:   0.51 kB
../dist/public/assets/label-Ck5t6L2I.js                     1.11 kB │ gzip:   0.59 kB
../dist/public/assets/button-D7ZgI3S5.js                    1.23 kB │ gzip:   0.62 kB
../dist/public/assets/user-B-_Q5cZz.js                      1.26 kB │ gzip:   0.51 kB
../dist/public/assets/not-found-Dh3U_CNn.js                 1.72 kB │ gzip:   0.67 kB
../dist/public/assets/LoginPage-CNmV9nos.js                 2.02 kB │ gzip:   0.95 kB
../dist/public/assets/ConfirmDialogs-CTrPdtqt.js           12.14 kB │ gzip:   2.95 kB
../dist/public/assets/ExDipendenti-BkTdjvPb.js             14.74 kB │ gzip:   4.63 kB
../dist/public/assets/purify.es-B6FQ9oRL.js                22.57 kB │ gzip:   8.74 kB
../dist/public/assets/ArchivioDipendenti-DVmsIa0C.js       28.14 kB │ gzip:   6.33 kB
../dist/public/assets/jspdf.plugin.autotable-iy_ebv8X.js   31.03 kB │ gzip:   9.89 kB
../dist/public/assets/query-BAtO99_7.js                    34.87 kB │ gzip:  10.32 kB
../dist/public/assets/StoricoWrapper-HFleZxMU.js           59.21 kB │ gzip:  17.63 kB
../dist/public/assets/index-B2GL4wbj.js                    72.71 kB │ gzip:  24.65 kB
../dist/public/assets/radix-fCMCooRX.js                    90.28 kB │ gzip:  31.42 kB
../dist/public/assets/react-Ckhrjn13.js                   142.38 kB │ gzip:  45.67 kB
../dist/public/assets/supabase-DytNkWzc.js                154.69 kB │ gzip:  40.42 kB
../dist/public/assets/html2canvas.esm-B0tyYwQk.js         159.49 kB │ gzip:  53.47 kB
../dist/public/assets/jspdf.es.min-Cg9jlrEt.js            202.36 kB │ gzip:  48.04 kB
../dist/public/assets/exceljs.min-BkizK1Q8.js             939.78 kB │ gzip: 271.16 kB
`` `

## Analisi Criticità

### 🚨 Asset Critici (>150KB)
1. **exceljs.min-BkizK1Q8.js**: 939.78 kB (271.16 kB gzipped)
   - **Impatto**: Maggiore contributor al bundle size
   - **Utilizzo**: Solo per export Excel in admin
   - **Raccomanda

*…contenuto abbreviato; vedi file originale nell'archivio estratto.*
```

## circular-deps.md

```markdown
# Circular Dependencies Analysis - BadgeNode

## Madge Analysis Results

`` `bash
npx madge --circular --extensions ts,tsx client/src
Processed 177 files (960ms) (78 warnings)

✖ Found 1 circular dependency!
1) components/ui/sidebar.tsx
`` `

## Dettaglio Dipendenza Circolare

### File Coinvolto
- **components/ui/sidebar.tsx** (auto-riferimento)

### Causa Probabile
Il file `sidebar.tsx` probabilmente:
1. Esporta componenti sidebar
2. Importa da barrel export `components/ui/index.ts`
3. Il barrel export re-importa da `sidebar.tsx`
4. Crea ciclo: `sidebar.tsx` → `index.ts` → `sidebar.tsx`

### Struttura Attuale (Ipotesi)
`` `
components/ui/
├── sidebar.tsx          # Definisce componenti
├── sidebar/
│   ├── index.ts         # Barrel export
│   └── SidebarContext.tsx
└── index.ts             # Main barrel export
`` `

## Impatto e Rischi

### Impatto Attuale: **BASSO**
- ✅ Build funziona correttamente
- ✅ Runtime stabile
- ✅ Limitato a componenti UI

### Rischi Potenziali
- ⚠️ Problemi con tree-shaking
- ⚠️ Confusione in sviluppo
- ⚠️ Possibili memory leaks in HMR

## Soluzioni Raccomandate

### 1. Riorganizzazione Sidebar (Preferita)
`` `typescript
// components/ui/sidebar/index.ts
export { Sidebar } from './Sidebar';
export { SidebarProvider } from './SidebarProvider';
export { useSidebar } from './SidebarContext';

// components/ui/index.ts
export * from './sidebar';  // No direct import da sidebar.tsx
`` `

### 2. Eliminazione Barrel Export
`` `typescript
// Import diretti invece di barrel
import { Sidebar } from '@/components/ui/sidebar/Sidebar';
// Invece di
import { Sidebar } from '@/components/ui';
`` `

### 3. Separazione Concerns
`` `typescript
// sidebar/
├── Sidebar.tsx          # Componente principale
├── SidebarProvider.tsx  # Context provider
├── SidebarContext.tsx   # Hook e context
├── types.ts            # Types condivisi
└── index.ts            # Barrel export pulito
`` `

## Prevenzione Futura

### 1. ESLint Rule
`` `json
{
  "import/no-cycle": ["error", { "maxDepth": 2 }]
}
`` `

### 2. CI Check
`` `bash
npx madge --circular --extensions ts,tsx src/ --exit-code
`` `

### 3. Monitoring
- Integrazione madge in pre-commit hooks
- Alert automatici per nuovi cicli
- Review obbligatoria per modifiche barrel exports

## Azioni Immediate

1. **Analizzare struttura attuale** sidebar components
2. **Riorganizzare exports** per eliminare auto-riferimento  
3. **Testare build** dopo modifiche
4. **Implementare linting** per prevenzione
5. **Documentare pattern**

*…contenuto abbreviato; vedi file originale nell'archivio estratto.*
```
