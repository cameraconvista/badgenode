# 03 🔧 SCRIPTS UTILITÀ - BadgeNode

**Manuale completo degli script di automazione e manutenzione**  
**Versione**: 4.0 • **Data**: 2025-10-12

---

## 📋 Contenuti

1. [Overview Scripts](#overview-scripts)
2. [Sistema Backup](#sistema-backup)
3. [Diagnosi e Manutenzione](#diagnosi-e-manutenzione)
4. [Documentazione](#documentazione)
5. [Development Tools](#development-tools)

---

## 🛠️ Overview Scripts

### **Comandi NPM Disponibili**

```bash
# Backup e Restore
npm run esegui:backup          # Backup automatico con rotazione
npm run backup:list            # Lista backup esistenti
npm run backup:restore         # Ripristino interattivo

# Validazione Automatica (NUOVO - FASE 4/4)
npm run check:ci               # Validazione completa (typecheck + build + grep)
npm run smoke:runtime          # Test runtime Supabase (utenti + RPC)

# Diagnosi e Manutenzione
npm run diagnose               # Diagnosi completa progetto
npm run diagnose:force         # Forza diagnosi (ignora cache)
npm run health:check           # Health check sistema

# Documentazione
npm run docs:consolidate       # Genera REPORT_CONSOLIDATO.txt
npm run gen:component          # Scaffold nuovo componente

# Development
npm run auto:start             # Avvio automatico dev server
npm run ensure:dev             # Verifica e avvia se necessario
```

---

## ✅ Validazione Automatica (FASE 4/4)

### **scripts/ci/checks.sh** - Validazione Completa

```
Funzionalità:
- TypeScript check (0 errori)
- Build production test (626KB bundle)
- Grep guard (blocca console.log/FIXME/HACK/TODO non-business)
- Verifica presenza file SQL smoke test

Comando: npm run check:ci

Processo:
1. npm run check (TypeScript compilation)
2. npm run build (Vite + ESBuild)
3. Grep guard per debug residui
4. Verifica file scripts/sql/smoke-test-supabase.sql
5. Report finale con timing

Tempo esecuzione: ~4.3 secondi
Exit code: 0 se tutti i controlli passano, 1 se fallisce
```

### **scripts/ci/smoke-runtime.ts** - Test Runtime

```
Funzionalità:
- Test connettività Supabase
- Query tabella utenti (SELECT pin LIMIT 3)
- Test RPC insert_timbro_v2 (dry run con PIN 3)
- Validazione response format

Comando: npm run smoke:runtime

Processo:
1. Carica environment variables (.env.local)
2. Crea client Supabase (no auth persistence)
3. Test SELECT su tabella utenti
4. Test RPC insert_timbro_v2 (gestisce errori business)
5. Verifica format response

Tempo esecuzione: ~0.5 secondi
Output: "OK smoke runtime" se successo
```

Nota: in ambienti con RLS attivo e uso di `VITE_SUPABASE_ANON_KEY`, una RPC che comporti scritture può restituire errore `42501` (violazione RLS). Questo è atteso se non si utilizza la service role key lato server ed è indice di policy correttamente applicate, non di malfunzionamento dell'applicazione.

---

## 💾 Sistema Backup

### **backup.ts** - Backup Automatico

```
Funzionalità:
- Archiviazione completa progetto
- Rotazione automatica (max 3 backup)
- Esclusione cartelle non necessarie
- Log operazioni in REPORT_BACKUP.txt

Comando: npm run esegui:backup

Processo:
1. Verifica backup esistenti
2. Rimuove backup più vecchi (se >3)
3. Crea nuovo archivio tar.gz
4. Aggiorna log operazioni
5. Mostra statistiche finali

Esclusioni automatiche:
- node_modules/
- dist/
- build/
- .git/
- .cache/
- coverage/
- temp/
- tmp/
- .DS_Store
- Backup_Automatico/ (evita ricorsione)

Output: backup_YYYY.MM.DD_HH.MM.tar
Posizione: Backup_Automatico/
```

### **backup-restore.ts** - Ripristino Backup

```
Funzionalità:
- Lista backup disponibili
- Preview contenuti archivio
- Ripristino selettivo o completo
- Conferma interattiva

Comando: npm run backup:restore

Processo:
1. Scansiona Backup_Automatico/
2. Mostra lista backup con dimensioni
3. Permette selezione backup
4. Preview contenuti (opzionale)
5. Conferma ripristino
6. Estrae e ripristina file

Sicurezza:
- Backup corrente prima ripristino
- Conferma multipla per operazioni distruttive
- Log dettagliato operazioni
```

---

## 🔍 Diagnosi e Manutenzione

### **diagnose.ts** - Diagnosi Progetto

```
Funzionalità:
- Scansione file duplicati
- Ricerca TODO/FIXME nel codice
- Verifica lunghezza file (>200 righe)
- Analisi dipendenze non utilizzate
- Check configurazioni

Comando: npm run diagnose

Controlli eseguiti:
1. File Length Guard
   - Identifica file >200 righe
   - Warning per file ≥150 righe
   - Suggerisce refactoring

2. Code Quality
   - TODO/FIXME non risolti
   - Console.log in production
   - Import non utilizzati
   - Variabili non usate

3. Project Health
   - Configurazioni mancanti
   - File orfani
   - Dipendenze obsolete
   - Build warnings

Output: REPORT_DIAGNOSI_INIZIALE.txt
Cache: .diagnose_done (evita ri-esecuzione)
Force: npm run diagnose:force (ignora cache)
```

### **health-check-runner.ts** - Health Check

```
Funzionalità:
- Verifica servizi esterni (Supabase)
- Test connessioni database
- Controllo environment variables
- Validazione configurazioni

Comando: npm run health:check

Controlli:
1. Environment
   - Variabili richieste presenti
   - Formato URL valido
   - Chiavi API configurate

2. Database
   - Connessione Supabase
   - Tabelle esistenti
   - Policies configurate

3. Build System
   - TypeScript compilation
   - Vite configuration
   - Dependencies integrity

4. Runtime
   - Port availability
   - File permissions
   - Disk space

Output: Report console + log file
```

---

## 📚 Documentazione

### **consolidate-docs.ts** - Consolidamento DOCS

```
Funzionalità:
- Raccoglie tutti i file DOCS/
- Genera indice automatico
- Crea REPORT_CONSOLIDATO.txt
- Verifica link interni

Comando: npm run docs:consolidate

Processo:
1. Scansiona cartella DOCS/
2. Legge contenuto file .md
3. Estrae titoli e sezioni
4. Genera indice navigabile
5. Consolida in file unico
6. Verifica link e riferimenti

Input: DOCS/*.md
Output: DOCS/REPORT_CONSOLIDATO.txt

Formato output:
- Indice generale
- Contenuto per sezione
- Timestamp generazione
- Statistiche (file processati, dimensioni)
```

### **template-component.ts** - Scaffold Componenti

```
Funzionalità:
- Genera template componente React
- Rispetta file length guard (<140 righe)
- Include TypeScript interfaces
- Aggiunge import standard

Comando: npm run gen:component

Template generato:
- Componente React funzionale
- Props interface TypeScript
- Import Radix UI se necessario
- Styling Tailwind base
- JSDoc documentation

Opzioni:
- Nome componente (PascalCase)
- Cartella destinazione
- Tipo (page/component/hook)
- Include props interface

Output: client/src/components/[nome]/[Nome].tsx
Dimensioni: <140 righe (garantito)
```

---

## 🚀 Development Tools

### **auto-start-dev.ts** - Avvio Automatico

```
Funzionalità:
- Verifica se dev server è attivo
- Avvia automaticamente se necessario
- Gestisce port conflicts
- Configura environment

Comando: npm run auto:start

Processo:
1. Check porta 3001 disponibile
2. Verifica environment variables
3. Avvia server se necessario
4. Configura hot reload
5. Apre browser (opzionale)

Configurazioni:
- PORT: 3001 (default)
- NODE_ENV: development
- Hot reload: abilitato
- TypeScript watch: attivo
```

### **cascade-auto-wrapper.ts** - Integrazione Cascade

```
Funzionalità:
- Wrapper per integrazione Cascade AI
- Verifica compatibilità sistema
- Gestisce sessioni development
- Auto-recovery errori

Comando: npm run cascade:verify

Features:
- Session management
- Error recovery
- Compatibility check
- Performance monitoring
```

---

## 🔧 Utility Condivise

### **scripts/utils/diagnose-core.ts**

```
Funzioni principali:
- scanFileLength(): verifica lunghezza file
- findDuplicates(): identifica file duplicati
- checkDependencies(): analizza dipendenze
- validateConfig(): verifica configurazioni

Utilizzato da:
- diagnose.ts
- health-check-runner.ts
- backup.ts (validazione pre-backup)
```

### **scripts/utils/docs-core.ts**

```
Funzioni principali:
- parseMarkdown(): parsing file MD
- generateIndex(): crea indici automatici
- validateLinks(): verifica link interni
- consolidateContent(): merge contenuti

Utilizzato da:
- consolidate-docs.ts
- template-component.ts
```

---

## ⚙️ Configurazioni Script

### **Environment Variables**

```bash
# Script Configuration
STRICT_200=true                # Abilita file length guard strict
BACKUP_RETENTION=3             # Numero backup da mantenere
DIAGNOSE_CACHE=true           # Abilita cache diagnosi
AUTO_START_BROWSER=false      # Auto-apri browser in dev

# Development
NODE_ENV=development          # Environment mode
PORT=3001                     # Dev server port
VITE_DEV_SERVER=true         # Abilita Vite dev server
```

### **File Configurazione**

```
.diagnose_done               # Cache diagnosi (timestamp)
REPORT_BACKUP.txt           # Log operazioni backup
REPORT_DIAGNOSI_INIZIALE.txt # Output diagnosi
REPORT_CONSOLIDATO.txt      # Documentazione consolidata
```

---

## 🚨 Troubleshooting

### **Errori Comuni**

#### **Backup Fails**

```bash
# Verifica permessi
ls -la Backup_Automatico/

# Spazio disco
df -h

# Forza cleanup
rm Backup_Automatico/backup_*.tar
npm run esegui:backup
```

#### **Diagnose Issues**

```bash
# Reset cache
rm .diagnose_done
npm run diagnose:force

# Verifica TypeScript
npm run check

# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### **Dev Server Problems**

```bash
# Kill existing process
pkill -f "tsx server/index.ts"

# Check port
lsof -ti:3001

# Restart clean
npm run auto:start
```

---

## 📊 Metriche Script

### **Performance Target**

- Backup: <30 secondi (progetto completo)
- Diagnosi: <10 secondi (cache attiva)
- Consolidate docs: <5 secondi
- Component generation: <2 secondi

### **Reliability**

- Backup success rate: >99%
- Diagnosi accuracy: >95%
- Auto-recovery: attivo per dev tools
- Error logging: completo per troubleshooting

---

**Nota**: Tutti gli script sono progettati per essere sicuri, idempotenti e con rollback automatico in caso di errori. Utilizzare sempre i comandi npm invece di eseguire direttamente i file TypeScript.
