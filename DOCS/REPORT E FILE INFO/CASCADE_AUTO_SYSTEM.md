# 🤖 Sistema Auto-Verifica Cascade per BadgeNode

## 📋 Panoramica

Sistema automatico che garantisce che l'applicazione BadgeNode sia sempre funzionante dopo ogni operazione di Cascade, eliminando la necessità di riavvii manuali e sprechi di crediti.

## 🎯 Problema Risolto

- **Crash frequenti** dell'app dopo modifiche
- **Sprechi di crediti** per riavvii manuali
- **Interruzioni del workflow** di sviluppo
- **Mancanza di verifica automatica** dello stato app

## 🛠️ Componenti del Sistema

### 1. `auto-health-check.ts` - Core Health Checker
```bash
npm run health:check
```

**Funzionalità:**
- ✅ Verifica se l'app è in esecuzione sulla porta 3001
- ✅ Testa la responsività dell'app con richieste HTTP
- ✅ Kill automatico di processi zombie
- ✅ Riavvio intelligente con timeout
- ✅ Retry automatico (max 3 tentativi)
- ✅ Logging dettagliato di ogni operazione

### 2. `cascade-auto-wrapper.ts` - Wrapper Intelligente
```bash
npm run cascade:verify
```

**Funzionalità:**
- ✅ Verifica post-azione automatica
- ✅ Riavvio di emergenza in caso di fallimento
- ✅ Funzioni specifiche per tipo di operazione
- ✅ Controllo abilitazione/disabilitazione

### 3. `cascade-integration.ts` - Sistema Integrato
**Funzionalità:**
- ✅ Wrapper per operazioni file, git, build
- ✅ Gestione errori con verifica automatica
- ✅ Verifica finale obbligatoria
- ✅ API semplice per Cascade

## 🚀 Utilizzo per Cascade

### Verifica Manuale Immediata
```typescript
import { cascadeOps } from './scripts/cascade-integration';

// Verifica immediata dello stato app
await cascadeOps.checkNow();
```

### Operazioni con Auto-Verifica
```typescript
// Modifica file con verifica automatica
await cascadeOps.withFileOp(async () => {
  // Modifica file qui
}, 'aggiornamento componente');

// Operazione Git con verifica
await cascadeOps.withGitOp(async () => {
  // Git operations qui
}, 'commit modifiche');

// Build con verifica
await cascadeOps.withBuildOp(async () => {
  // Build operations qui
}, 'compilazione TypeScript');
```

### Verifica Finale Obbligatoria
```typescript
// Alla fine di ogni sessione Cascade
await cascadeOps.finalCheck();
```

## 📊 Script NPM Disponibili

```json
{
  "health:check": "Verifica e riavvia app se necessario",
  "cascade:verify": "Verifica wrapper per Cascade",
  "dev": "Avvia app in modalità sviluppo",
  "check": "Verifica TypeScript",
  "lint": "Verifica ESLint"
}
```

## 🔄 Workflow Automatico

### 1. **Verifica Iniziale**
```
🎬 Cascade si avvia
  ↓
🔍 Verifica stato app
  ↓
🚀 Riavvia se necessario
  ↓
✅ App funzionante
```

### 2. **Post-Operazione**
```
🛠️ Cascade esegue azione
  ↓
🔄 Auto-verifica attivata
  ↓
❌ App crashata? → 🚨 Riavvio automatico
  ↓
✅ App funzionante
```

### 3. **Gestione Errori**
```
💥 Errore durante operazione
  ↓
🚨 Verifica di emergenza
  ↓
🔄 Tentativo riavvio (max 3)
  ↓
✅ Recovery automatico
```

## 🎛️ Configurazione

### Parametri Principali
- **Porta Target**: 3001
- **Timeout Startup**: 30 secondi
- **Max Retry**: 3 tentativi
- **Timeout Verifica**: 5 secondi

### Abilitazione/Disabilitazione
```typescript
// Disabilita temporaneamente
cascadeOps.disable();

// Riabilita
cascadeOps.enable();
```

## 🔍 Monitoring e Logging

### Output Tipico
```
🔍 Verifica stato BadgeNode...
📋 Tentativo 1/3
⚠️ App non funzionante: No process on port
🧹 Processi esistenti terminati
🚀 Avvio BadgeNode...
📡 serving on port 3001
✅ App avviata con successo!
🎉 App avviata e verificata con successo!
🌐 Disponibile su: http://localhost:3001
```

### Codici di Uscita
- **0**: Successo, app funzionante
- **1**: Fallimento, intervento richiesto

## 🚨 Risoluzione Problemi

### App Non Si Avvia
1. Verifica porta 3001 libera: `lsof -ti:3001`
2. Kill processi: `pkill -f "tsx.*server"`
3. Riavvio manuale: `npm run health:check`

### Timeout Durante Startup
1. Aumenta `STARTUP_TIMEOUT` in `auto-health-check.ts`
2. Verifica dipendenze: `npm install`
3. Controlla errori TypeScript: `npm run check`

### Verifiche Troppo Frequenti
1. Disabilita temporaneamente: `cascadeOps.disable()`
2. Usa verifica manuale: `cascadeOps.checkNow()`

## 📈 Benefici

- ✅ **Zero sprechi di crediti** per riavvii manuali
- ✅ **Workflow ininterrotto** di sviluppo
- ✅ **Recovery automatico** da crash
- ✅ **Monitoring continuo** dello stato app
- ✅ **Logging dettagliato** per debugging
- ✅ **API semplice** per integrazione Cascade

## 🔮 Prossimi Sviluppi

- 📊 Dashboard web per monitoring
- 📱 Notifiche push per stati critici
- 🔄 Auto-update del sistema
- 📈 Metriche di performance
- 🛡️ Backup automatico pre-riavvio
