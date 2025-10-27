# Bundle Analysis - BadgeNode

## Build Output Completo

```
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
```

## Analisi Criticità

### 🚨 Asset Critici (>150KB)
1. **exceljs.min-BkizK1Q8.js**: 939.78 kB (271.16 kB gzipped)
   - **Impatto**: Maggiore contributor al bundle size
   - **Utilizzo**: Solo per export Excel in admin
   - **Raccomandazione**: Lazy loading obbligatorio

2. **jspdf.es.min-Cg9jlrEt.js**: 202.36 kB (48.04 kB gzipped)
   - **Impatto**: Alto, utilizzato per PDF export
   - **Utilizzo**: Funzionalità admin/storico
   - **Raccomandazione**: Dynamic import

3. **html2canvas.esm-B0tyYwQk.js**: 159.49 kB (53.47 kB gzipped)
   - **Impatto**: Alto, per screenshot/export
   - **Utilizzo**: Feature specifica admin
   - **Raccomandazione**: Lazy loading

### ✅ Ottimizzazioni Buone
- **Code Splitting**: Librerie isolate correttamente
- **Gzip Ratio**: Buona compressione (media ~35%)
- **Core Bundle**: React + Supabase + Radix sotto 500kB totali

## Raccomandazioni Implementazione

### 1. Lazy Loading Immediato
```typescript
// Invece di import statico
const ExcelJS = () => import('exceljs');
const jsPDF = () => import('jspdf');
const html2canvas = () => import('html2canvas');
```

### 2. Route-based Splitting
- Admin features in chunk separato
- Export utilities on-demand
- PDF generation solo quando richiesto

### 3. Bundle Analysis Tools
- Implementare `rollup-plugin-visualizer`
- Monitoraggio size in CI
- Threshold alerts per chunk >200kB
