# REPORT DIAGNOSI OFFLINE — BadgeNode White Screen & Offline Queue

**Data**: 27 Ottobre 2025, 23:50 UTC+01:00  
**Versione**: Enterprise Stable v5.0  
**Commit**: f3aeca4  
**Analista**: Cascade AI  

---

## 1. Sommario Esecutivo

### Stato Attuale
- **App**: ❌ **WHITE SCREEN** - Build fallisce completamente
- **Dev Server**: ✅ Vite attivo su porta 5173, Backend su porta 10000
- **Causa Root**: **Import di funzioni non esistenti** in `syncRunner.ts`

### Probabili Macro-Cause (Priorità)

| Causa | Probabilità | Severità | Evidenze |
|-------|-------------|----------|----------|
| **Import funzioni mancanti** | **ALTA** | **CRITICA** | Build fallisce, TypeScript errors |
| Side-effect a import time | BASSA | MEDIA | Offline init è lazy e protetto |
| Accesso IndexedDB non sicuro | BASSA | MEDIA | Guardie presenti in idb.ts |
| Vite config/alias issues | BASSA | BASSA | Alias configurati correttamente |

### Livello di Rischio
- **CRITICO**: Sistema completamente non funzionante
- **Blocco Totale**: Build e TypeScript check falliscono
- **Zero Regressioni**: Problema isolato al sistema offline

---

## 2. Passi di Riproduzione

### Ambiente
- **Browser**: Chrome/Safari DevTools
- **URL Dev**: http://localhost:5173/
- **ENV**: Development mode con feature flags offline attivi
- **Comandi**: `npm run dev` + `npm run dev:client`

### Sequenza Riproduzione White Screen
1. Clonare repository BadgeNode (commit f3aeca4)
2. Configurare `.env.local` con feature flags offline
3. Eseguire `npm run build` → **FALLISCE**
4. Eseguire `npm run dev:client` → Vite parte ma app non si carica
5. Aprire DevTools → Console mostra errori di import
6. Risultato: **Pagina bianca** con errori JavaScript

### Log Errori Principali
```
"markSending" is not exported by "client/src/offline/queue.ts"
"markSent" is not exported by "client/src/offline/queue.ts"  
"markReview" is not exported by "client/src/offline/queue.ts"
```

---

## 3. Albero delle Dipendenze Coinvolte

### Grafo Sintetico
```
main.tsx (bootstrap sicuro)
  ↓ (lazy import)
offline/index.ts (initOfflineSystem - protetto)
  ↓ (conditional import)
offline/idb.ts (IndexedDB wrapper - sicuro)
  ↓ (import statico) 
offline/queue.ts (✅ funzioni base)
  ↑ (import FALLITO)
offline/syncRunner.ts (❌ import funzioni mancanti)
```

### Import Time Effects
- **main.tsx**: ✅ Lazy import protetto con try/catch
- **offline/index.ts**: ✅ Nessun side-effect, solo funzioni pure
- **idb.ts**: ✅ Guardie per `indexedDB` availability
- **queue.ts**: ✅ Solo export di funzioni
- **syncRunner.ts**: ❌ **Import statico di funzioni non esistenti**

### Cicli Circolari
- **Nessun ciclo rilevato**: Dipendenze lineari e ben strutturate

---

## 4. Feature Flags & ENV

### Flag Rilevati vs ENV Dichiarate
| Flag | ENV Key | Valore | Status |
|------|---------|--------|--------|
| Queue | `VITE_FEATURE_OFFLINE_QUEUE` | *** | ✅ Configurato |
| Badge | `VITE_FEATURE_OFFLINE_BADGE` | *** | ✅ Configurato |
| Whitelist | `VITE_OFFLINE_DEVICE_WHITELIST` | *** | ✅ Configurato |
| App Version | `VITE_APP_VERSION` | *** | ✅ Configurato |

### Regole di Gating
- **Queue**: `enabled = !!q && allowed`
- **Whitelist**: `allowed = wl === '*' ? true : wl.includes(deviceId)`
- **Device ID**: Generato con `crypto.randomUUID()` + localStorage fallback

### Valutazione Coerenza
- **ENV**: ✅ Tutte le variabili presenti e configurate
- **Gating Logic**: ✅ Logica corretta in `offline/index.ts`
- **Feature Flags**: ✅ Non causano il white screen

---

## 5. IndexedDB & Storage

### Configurazione Database
- **DB Name**: `badgenode_offline`
- **Version**: 2 (incrementata per safe upgrade)
- **Store**: `timbri_v1` (keyPath: `client_seq`)

### Indici Previsti
```typescript
os.createIndex('by_ts', 'ts_client_ms', { unique: false });
os.createIndex('status_idx', 'status', { unique: false });
os.createIndex('client_seq_idx', 'client_seq', { unique: true });
```

### Fallback Strategy
- **In-Memory**: `memDB` object per private mode/SSR
- **Guardie**: `hasIDB()` check prima di ogni operazione
- **Error Handling**: Try/catch su tutte le operazioni IDB

### Evidenze Problemi
- **Nessun problema IDB**: Wrapper ben protetto con fallback
- **Upgrade Safe**: Version increment e controllo store existence
- **No Early Access**: IndexedDB init solo dopo gating check

---

## 6. Hook Enqueue-On-Error

### Verifica Import Lazy
```typescript
// In offline/index.ts - riga 69
const { flushPending } = await import('./queue');
```
- **Status**: ✅ Import lazy protetto con try/catch
- **Fallback**: Console debug in caso di errore

### Gestione crypto.randomUUID
```typescript
// In queue.ts - riga 35
client_event_id: crypto.randomUUID?.() ?? String(Date.now())
```
- **Status**: ✅ Fallback sicuro implementato

### Propagazione Eccezioni
- **queue.ts**: ✅ Funzioni non propagano eccezioni fatali
- **offline/index.ts**: ✅ Tutti i try/catch in place
- **main.tsx**: ✅ Bootstrap protetto con error boundary

---

## 7. Build/Type/Lint

### Errori TypeScript (CRITICI)
```
client/src/offline/syncRunner.ts:8:25 - error TS2305: 
Module '"./queue"' has no exported member 'markSending'.

client/src/offline/syncRunner.ts:8:38 - error TS2305: 
Module '"./queue"' has no exported member 'markSent'.

client/src/offline/syncRunner.ts:8:48 - error TS2305: 
Module '"./queue"' has no exported member 'markReview'.
```

### Build Vite (FALLITO)
```
"markSending" is not exported by "client/src/offline/queue.ts", 
imported by "client/src/offline/syncRunner.ts"
```

### ESLint (OK)
- **121 warnings**: Solo unused vars e explicit any
- **0 errors**: Nessun errore bloccante
- **Impatto**: Nessuno sul sistema offline

### Funzioni Disponibili vs Richieste

#### ✅ Disponibili in queue.ts:
- `enqueuePending()`
- `getAllPending()`
- `flushPending()`
- `count()`
- `remove()`
- `peekClientSeq()`

#### ❌ Mancanti (richieste da syncRunner.ts):
- `markSending(client_seq)` - riga 50
- `markSent(client_seq)` - riga 61
- `markReview(client_seq, reason)` - riga 77

---

## 8. Conformità Governance

### Modifiche Layout/UX
- ✅ **Nessuna modifica**: Solo sistema offline backend

### Side-Effect a Import Time
- ✅ **Criterio MUST rispettato**: Tutti i file offline sono side-effect free
- ✅ **Lazy Loading**: Import dinamici protetti con try/catch

### Accessi Oggetti Globali
- ✅ **window**: Guardie `typeof window === 'undefined'`
- ✅ **indexedDB**: Check `'indexedDB' in window`
- ✅ **crypto**: Fallback `crypto?.randomUUID?.() ?? String(Date.now())`
- ✅ **import.meta.env**: Safe string conversion

### File Length Guard
- ✅ **Tutti i file ≤220 righe**: Governance rispettata
- ✅ **Nessun warning**: File ben strutturati

---

## 9. Conclusioni & Raccomandazioni (NO FIX)

### Azioni Consigliate (Priorità Decrescente)

1. **[CRITICO] Implementare funzioni mancanti in queue.ts**
   - File: `client/src/offline/queue.ts`
   - Aggiungere: `markSending()`, `markSent()`, `markReview()`
   - Motivazione: Risolvere import errors che bloccano build

2. **[ALTO] Aggiornare schema QueueItem con campo status**
   - File: `client/src/offline/types.ts`
   - Aggiungere: `status: 'pending' | 'sending' | 'sent' | 'review'`
   - Motivazione: Supportare state machine della queue

3. **[MEDIO] Implementare state transitions in IndexedDB**
   - File: `client/src/offline/idb.ts`
   - Aggiungere: Update operations per status field
   - Motivazione: Persistenza stato sync items

4. **[MEDIO] Testare sync runner con mock RPC**
   - File: `client/src/offline/syncRunner.ts`
   - Verificare: Logica FIFO e error handling
   - Motivazione: Validare flusso completo offline→online

5. **[BASSO] Aggiornare diagnostics con sync status**
   - File: `client/src/offline/index.ts`
   - Aggiungere: `lastSyncAt`, `syncErrors` in diagnostics
   - Motivazione: Migliorare osservabilità sistema

6. **[BASSO] Ottimizzare bundle size offline modules**
   - File: `vite.config.ts`
   - Verificare: Tree-shaking e code splitting
   - Motivazione: Performance e lazy loading

7. **[BASSO] Aggiungere unit tests per queue operations**
   - File: `tests/offline/queue.test.ts`
   - Coprire: State transitions e error scenarios
   - Motivazione: Regression prevention

8. **[BASSO] Documentare offline system in DOCS/**
   - File: `DOCS/09_offline.md`
   - Aggiornare: Con nuove funzioni e state machine
   - Motivazione: Mantenere documentazione allineata

---

## 10. Appendice

### Artefatti Raccolti
- `diagnostics/_artifacts/node_version.txt` - Node v22.17.1
- `diagnostics/_artifacts/npm_version.txt` - NPM 10.9.2
- `diagnostics/_artifacts/package.json.snip` - Dependencies e scripts
- `diagnostics/_artifacts/vite_config.txt` - Configurazione Vite
- `diagnostics/_artifacts/tsconfig.snip` - TypeScript config
- `diagnostics/_artifacts/env_keys.txt` - Environment variables (redatte)
- `diagnostics/_artifacts/build.log` - Build failure log
- `diagnostics/_artifacts/tsc_noemit.log` - TypeScript errors
- `diagnostics/_artifacts/eslint.log` - ESLint warnings
- `diagnostics/_artifacts/console_startup.log` - Runtime diagnostics
- `diagnostics/_artifacts/code_snippets/` - Sorgenti critici estratti

### Stacktrace Principale
```
client/src/offline/syncRunner.ts:8:24
import { getAllPending, markSending, markSent, markReview, remove } from './queue';
                        ^
"markSending" is not exported by "client/src/offline/queue.ts"
```

### Network Requests
- **Dev Server**: ✅ Vite su http://localhost:5173/
- **API Backend**: ✅ Express su http://localhost:10000/
- **Proxy Config**: ✅ `/api` → `localhost:3001` (nota: server su 10000)

### Browser Preview
- **URL**: http://127.0.0.1:60629 (proxy attivo)
- **Status**: ❌ White screen per build failure
- **Console**: Import errors visibili in DevTools

---

**DIAGNOSI COMPLETATA**  
**Causa Root Identificata**: Import di funzioni non esistenti in `syncRunner.ts`  
**Impatto**: Build failure → White screen  
**Severità**: CRITICA  
**Fix Stimato**: 2-4 ore per implementare funzioni mancanti e testare
