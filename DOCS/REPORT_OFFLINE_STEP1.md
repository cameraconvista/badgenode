# BadgeNode — Offline Timbrature (Step 1 • Preparazione minima lato client)

## Scopo
Predisporre lo scaffolding offline-first (disattivato di default) senza impattare UI/UX o logiche esistenti.

## File creati/aggiornati
- `client/src/config/featureFlags.ts`
  - `FEATURE_OFFLINE_QUEUE` (default OFF)
  - `isOfflineQueueEnabled()`
- `client/src/lib/deviceId.ts`
  - `getDeviceId()` con persistenza `localStorage` (fallback in-memory)
- `client/src/offline/types.ts`
  - Tipi: `OfflineTimbro`, `OfflineStatus`, `QueueItemStatus`
- `client/src/offline/queue.ts`
  - Stub API: `enqueue`, `peek`, `dequeue`, `count`, `clearAll` (in-memory + localStorage)
  - Tutto protetto da feature flag
- `client/src/offline/syncRunner.ts`
  - `runSyncOnce()` → NO-OP (solo log diagnostico in DEV quando flag ON)
- `client/src/offline/diagnostic.ts`
  - `installOfflineDiagnostics()` → espone `window.__BADGENODE_DIAG__.offline`
- `client/src/main.tsx`
  - Import dinamico opzionale diagnostica in DEV, attivata solo se flag ON

## Come attivare (solo sviluppo)
1. Aggiungi al tuo `.env.local`:
   ```bash
   VITE_FEATURE_OFFLINE_QUEUE=true
   ```
2. Riavvia dev server. In DevTools Console verifica:
   ```js
   window.__BADGENODE_DIAG__
   // → { offline: { enabled: true, deviceId: "...", queueCount: 0, ... } }
   ```

## DEVICE_ID
- Letto/creato tramite `getDeviceId()` in `client/src/lib/deviceId.ts`.
- Persistenza: `localStorage` (fallback in-memory se non disponibile).
- Esposto in diagnostica solo con flag ON.

## Diagnostica
- Abilitata solo in DEV e solo con `VITE_FEATURE_OFFLINE_QUEUE=true`.
- Oggetto esposto: `window.__BADGENODE_DIAG__.offline = { enabled, deviceId, queueCount }`.
- Log compatti in console: `[offline:diag]`, `[offline:sync]`.

## Limiti di questo step
- Nessun wiring nella UI/servizi reali.
- Nessuna chiamata RPC o modifica DB.
- Nessuna IndexedDB/Dexie/Service Worker (arriveranno nei prossimi step).

## Prossimi passi
- Step 2: DB e server
  - Vincolo UNIQUE (`device_id`, `client_seq`) lato DB.
  - RPC idempotente per inserimento timbro.
  - Introduzione IndexedDB (Dexie) e SW per resilienza.
- Step 3: Integrazione UI e sync reale
  - Cattura timbro offline → enqueue.
  - Runner di sync con backoff, rete ripristinata → invio batch.
  - Notifiche/indicatori UI discreti (feature‑flagged).

## Verifiche manuali
- Flag OFF (default): nessun log, nessun `__BADGENODE_DIAG__`.
- Flag ON: `window.__BADGENODE_DIAG__` presente, `deviceId` stabile tra reload, `queueCount`=0.
- Import dei moduli offline non causa network extra né errori console.

## Conformità Governance
- Modifiche modulari, nessuna nuova dipendenza, file nei limiti dimensione.
- Feature flag default OFF, zero side‑effect quando disattivato.
- Lint/Typecheck: i file rispettano TypeScript strict e import aliased (`@/`).
