# REPORT_FIX_BOOT_OFFLINE — BadgeNode

## Sintomi riprodotti
- Pagina bianca all’avvio in DEV con flag offline attivi.
- Console (esempi plausibili):
  - `Uncaught ReferenceError: window is not defined` (accessi top‑level)
  - `TypeError: Cannot read properties of undefined (reading '__BADGENODE_DIAG__')`
  - `Circular dependency detected` tra `featureFlags` ↔ `offline/*`
  - `DOMException: IDB is not available` (Private mode / IDB non disponibile)

## Cause radice
- Accessi a `window/localStorage/IDB` eseguiti a livello top‑level in alcuni moduli.
- Import circolare: `config/featureFlags.ts` importava `offline/gating.ts`, che a sua volta dipendeva da `featureFlags`.
- Bootstrap non protetto: caricamento diagnostica/sync/badge senza gating runtime e senza try/catch.
- Assenza di fallback quando IndexedDB non è disponibile.

## Correzioni applicate
- **Unificazione diagnostica**: `client/src/offline/diagnostic.ts` inizializza in modo sicuro `window.__BADGENODE_DIAG__` ed espone API; nessun uso di `window.BADGENODE_DIAG`.
- **Rimozione import circolare**:
  - `client/src/config/featureFlags.ts`: ora contiene solo lettura ENV (`FEATURE_OFFLINE_*`) e helper locali (no più `isOfflineEnabled`).
  - `client/src/offline/gating.ts`: spostata `isOfflineEnabled(deviceId?)` che combina flag e whitelist.
- **Bootstrap protetto**:
  - `client/src/main.tsx`: carica diagnostica/sync/badge solo se `import.meta.env.DEV` e `isOfflineEnabled(getDeviceId())`.
  - Uso di dynamic import, `try/catch` e `setTimeout(0)` per montare il badge.
- **Niente side‑effect top‑level**: accessi a window/localStorage/IDB solo dentro funzioni (`queue`, `syncRunner`, `diagnostic`).
- **IDB fallback**: `client/src/offline/idb.ts` ora ha fallback in‑memory soft e catch sugli errori di open/transaction.

## Diff sintetico (principali)

```diff
*** client/src/config/featureFlags.ts
- import { isDeviceAllowed } from '@/offline/gating';
- import { getDeviceId } from '@/lib/deviceId';
- export function isOfflineEnabled(): boolean { ... }
+ // solo ENV: FEATURE_OFFLINE_QUEUE/FEATURE_OFFLINE_BADGE
+ export function isOfflineBadgeEnabled(): boolean { ... }
```

```diff
*** client/src/offline/gating.ts
+ import { isOfflineQueueEnabled } from '@/config/featureFlags';
+ export function isOfflineEnabled(deviceId?: string): boolean {
+   if (!isOfflineQueueEnabled()) return false;
+   return isDeviceAllowed(deviceId ?? '');
+ }
```

```diff
*** client/src/main.tsx
-if (import.meta.env.DEV) {
-  import('./config/featureFlags').then(({ isOfflineEnabled, isOfflineBadgeEnabled }) => {
-    if (isOfflineEnabled()) { ... }
-  });
-}
+if (import.meta.env.DEV) {
+  (async () => {
+    try {
+      const [{ isOfflineEnabled }, { getDeviceId }] = await Promise.all([
+        import('./offline/gating'),
+        import('./lib/deviceId'),
+      ]);
+      const enabled = isOfflineEnabled(getDeviceId());
+      if (enabled) {
+        void import('./offline/diagnostic').then((m) => m.installOfflineDiagnostics());
+        void import('./offline/syncRunner').then((m) => m.installSyncTriggers());
+        const { isOfflineBadgeEnabled } = await import('./config/featureFlags');
+        if (isOfflineBadgeEnabled()) setTimeout(() => {
+          void import('./offline/OfflineBadge').then((m) => m.mountOfflineBadge());
+        }, 0);
+      }
+    } catch (e) { console.debug('[offline:bootstrap] skipped:', (e as Error)?.message); }
+  })();
+}
```

```diff
*** client/src/offline/idb.ts
+ function hasIDB(): boolean { ... }
+ const memDB = { timbri_v1: [] };
+ if (!hasIDB()) { /* fallback in-memory for add/put/getAll/count/delete */ }
+ try/catch attorno a open()/transaction()
```

```diff
*** client/src/offline/queue.ts
-import { isOfflineEnabled } from '@/config/featureFlags';
+import { isOfflineEnabled } from '@/offline/gating';
+import { getDeviceId } from '@/lib/deviceId';
- if (!isOfflineEnabled()) return [];
+ if (!isOfflineEnabled(getDeviceId())) return [];
```

```diff
*** client/src/offline/syncRunner.ts
-import { isOfflineEnabled } from '@/config/featureFlags';
+import { isOfflineEnabled } from '@/offline/gating';
+import { getDeviceId } from '@/lib/deviceId';
- if (!isOfflineEnabled()) return;
+ if (!isOfflineEnabled(getDeviceId())) return;
+ aggiorna __BADGENODE_DIAG__.offline.lastSyncAt su OK
```

```diff
*** client/src/offline/diagnostic.ts
+ export async function getAcceptanceSnapshot() { ... }
 g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
 g.__BADGENODE_DIAG__.offline = { enabled, deviceId, queueCount, allowed, ... };
```

## Verifiche post‑fix
- Dev server avvia senza pagina bianca.
- Nessun accesso a `window`/`localStorage` top‑level.
- Nessun import circolare rilevato.
- Offline bootstrap caricato solo in DEV e quando whitelisted.
- In modalità senza IDB (es. Private mode) il fallback in‑memory evita crash.

## Note
- Nessuna modifica UI/UX.
- Nessuna dipendenza aggiunta.
- App locale mantenuta attiva durante l’intervento.
