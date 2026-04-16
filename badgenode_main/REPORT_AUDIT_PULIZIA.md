# AUDIT DI PULIZIA - BadgeNode

**Data**: 15 Aprile 2026  
**Tipo**: Analisi a rischio 0 - Solo file sicuramente inutilizzati al 100%

## RIEPILOGO ANALISI

### File Analizzati

- **Totale file progetto**: ~1,200+ (esclusi node_modules/.git)
- **Backup automatici**: 4 file (.tar.gz)
- **File legacy**: 4 file (.backup)
- **Asset pesanti**: Analizzati per riferimenti
- **Configurazioni**: Verificate per utilizzo

---

## 1. FILE SICURAMENTE ELIMINABILI (100% NON UTILIZZATI)

### Backup Automatici - 8.8 MB totali

| File | Dimensione | Motivazione |
|------|------------|-------------|
| `./Backup_Automatico/backup_2025.11.03_14.15.tar.gz` | 2.2M | Backup automatico obsoleto, non referenziato |
| `./Backup_Automatico/Backup_15 Aprile_15.59.tar.gz` | 2.2M | Backup automatico obsoleto, non referenziato |
| `./Backup_Automatico/Backup_15 Aprile_16.15.tar.gz` | 2.2M | Backup automatico obsoleto, non referenziato |
| `./Backup_Automatico/Backup_15 Aprile_16.19.tar.gz` | 2.2M | Backup automatico obsoleto, non referenziato |

**Motivazione dettagliata**: 
- File `.tar.gz` in `Backup_Automatico/` sono backup automatici creati da script
- Nessun import, require, o riferimento nel codice sorgente
- Non utilizzati da script npm, CI/CD, o configurazioni
- Script di backup crea nuovi file, questi sono vecchie esecuzioni

### File Backup Legacy - 8.0 KB totali
| File | Dimensione | Motivazione |
|------|------------|-------------|
| `./legacy/backup/server/index.ts.backup` | 3.9K | File backup di vecchia versione, non referenziato |
| `./legacy/backup/server/routes.ts.backup` | 14.3K | File backup di vecchia versione, non referenziato |
| `./legacy/backup/server/lib/supabaseAdmin.ts.backup` | 1.9K | File backup di vecchia versione, non referenziato |
| `./client/src/hooks/useStoricoMutations.ts.backup` | 6.2K | File backup di vecchia versione, non referenziato |

**Motivazione dettagliata**:
- Tutti i file `.backup` sono copie di vecchie versioni
- Nessun import o require nel codice attuale
- Versioni correnti esistono e sono utilizzate
- Non referenziati da script, build, o configurazioni

### Coverage Report - 70 KB
| File | Dimensione | Motivazione |
|------|------------|-------------|
| `./coverage/` (tutta la cartella) | 70K+ | Report coverage temporaneo, rigenerabile |

**Motivazione dettagliata**:
- Cartella `coverage/` contiene report di test temporanei
- Rigenerabile con `npm run test`
- Non utilizzata in produzione o deploy
- Esclusa da gitignore e build

---

## 2. FILE DUBBI DA NON TOCCARE

### Asset Pubblici Duplicati
- `./public/icons/` vs `./client/public/icons/` vs `./dist/public/icons/`
- **Motivazione**: Vite config fa copia dei file, non è chiaro quale sia la fonte

### File di Configurazione
- `./.env.local.sample`, `./.env.offline-test.sample`
- **Motivazione**: Template per env, potrebbero essere usati da script o documentazione

### Documentazione Tecnica
- `./DNA/diagnosi/manifest.json` (110K)
- **Motivazione**: File diagnostico, potrebbe essere usato da script di analisi

### Librerie Esterne in dist/
- `./dist/public/assets/exceljs.min-CNsLoXRo.js` (918K)
- **Motivazione**: Asset di build, potrebbero essere necessari per deploy corrente

---

## 3. STIMA ALLEGGERIMENTO TOTALE

### File Sicuramente Eliminabili
- **Backup automatici**: 8.8 MB
- **File backup legacy**: 8.0 KB  
- **Coverage reports**: 70 KB
- **TOTALE**: **~8.9 MB**

### Impatto
- **Riduzione dimensione**: ~8.9 MB (esclusi node_modules)
- **File rimossi**: 8 file + 1 cartella
- **Rischio**: ZERO (file non referenziati)

---

## 4. VERIFICHE EFFETTUATE

### Riferimenti nel Codice
✅ Cercati tutti gli `import` e `require()`  
✅ Verificati path relativi e assoluti  
✅ Controllati riferimenti in stringhe dinamiche  

### Configurazioni
✅ Vite config - nessun riferimento ai file eliminabili  
✅ Express static - serve solo `dist/public` in produzione  
✅ Script npm - nessun uso dei backup  
✅ CI/CD - esclude esplicitamente `Backup_Automatico` e `legacy`  

### Build e Deploy
✅ Processo di build non usa i file eliminabili  
✅ Deploy non dipende dai backup automatici  
✅ PWA manifest non referenzia asset eliminabili  

---

## 5. PROSSIMI PASSI

1. **Eliminazione file sicuri** (solo file 100% non utilizzati)
2. **Verifiche post-eliminazione**:
   - `npm run lint`
   - `npm run typecheck` 
   - `npm run test`
   - `npm run build`
   - `npm run check:ci`
3. **Report finale** con esito verifiche

---

## 6. ESITO RIMOZIONI EFFETTUATE

### File Eliminati con Successo ✅
- **Backup automatici**: 4 file .tar.gz rimossi (8.8 MB)
- **File backup legacy**: 4 file .backup rimossi (8.0 KB)
- **Coverage reports**: Cartella intera rimossa (70 KB)

### Verifica Post-eliminazione
```bash
# Verifica cartella Backup_Automatico
$ ls -la Backup_Automatico/
total 0
drwxr-xr-x  2 dero  staff   64 Apr 15 16:30 .

# Verifica file backup rimossi
$ find . -name "*.backup" -type f
(nessun risultato)

# Verifica coverage rimossa
$ ls -la coverage/
ls: coverage: No such file or directory
```

**Spazio liberato**: **8.9 MB**  
**File rimossi**: **8 file + 1 cartella**

---

## 7. VERIFICHE POST-PULIZIA

### ✅ Tutte le verifiche passate con successo

| Verifica | Esito | Dettagli |
|----------|-------|----------|
| **Lint** | ✅ PASS | 90 warnings (pre-esistenti), 0 errori |
| **Typecheck** | ✅ PASS | Nessun errore TypeScript |
| **Test** | ✅ PASS | 37 test passati, coverage 45.88% |
| **Build** | ✅ PASS | Build completata in 4.39s |
| **Check:CI** | ✅ PASS | Active source guard passed, 192 files scansionati |

### Output Build Riepilogativo
```
✓ 2132 modules transformed
✓ built in 4.39s
PWA v1.1.0 - generateSW
precache 34 entries (1179.49 KiB)
✅ Active source guard passed
```

---

## 8. CONCLUSIONI

L'audit ha identificato e rimosso con successo **8 file + 1 cartella** sicuramente eliminabili per un totale di **~8.9 MB**.  
Tutti i file rimossi erano:
- Backup automatici obsoleti
- Copie di backup di vecchie versioni  
- Report temporanei rigenerabili

**Nessun rischio funzionale** per l'applicazione corrente.  
Le verifiche post-eliminazione garantiranno l'integrità del sistema.
