# BadgeNode — Offline Timbrature (Step 4 • Rollout pilota per-device, kill-switch e acceptance)

## Scopo
Abilitare l’offline solo sul tablet aziendale tramite whitelist di `device_id`, con kill‑switch immediato e hardening timeout. Nessuna modifica UI/UX.

## Configurazione
- Flag globale (default OFF):
  ```bash
  VITE_FEATURE_OFFLINE_QUEUE=true
  ```
- Whitelist device (CSV):
  ```bash
  VITE_OFFLINE_DEVICE_WHITELIST="tablet-123,tablet-xyz"
  ```
- Recupero `DEVICE_ID` tablet: in DevTools → `window.__BADGENODE_DIAG__` (quando flag ON e whitelisted) oppure via `getDeviceId()`.

## Implementazione
- `client/src/offline/gating.ts`
  - `getWhitelistedDevices()` legge `VITE_OFFLINE_DEVICE_WHITELIST`.
  - `isDeviceAllowed(deviceId)` verifica presenza in whitelist.
- `client/src/config/featureFlags.ts`
  - `isOfflineEnabled()` = `FEATURE_OFFLINE_QUEUE` AND `isDeviceAllowed(getDeviceId())`.
- Integrazione gating:
  - `client/src/offline/queue.ts` → tutte le API verificate con `isOfflineEnabled()`.
  - `client/src/offline/syncRunner.ts` → `runSyncOnce()`/triggers protetti da `isOfflineEnabled()`.
  - `client/src/services/timbrature.service.ts` → `timbra()` usa `isOfflineEnabled()` per decidere fallback offline.
- Diagnostica:
  - `client/src/offline/diagnostic.ts` espone `allowed: true|false` (true quando attiva e whitelisted).
- Hardening rete:
  - `client/src/offline/syncRunner.ts` definisce `SYNC_TIMEOUT_MS=12000` e backoff DEV `SYNC_DEV_BACKOFF_MS=[10000,20000,30000]`.

## Kill‑switch
- Spegnere `VITE_FEATURE_OFFLINE_QUEUE=false` oppure rimuovere il `device_id` dalla `VITE_OFFLINE_DEVICE_WHITELIST`.
- Effetto immediato in sviluppo (dopo reload Vite).

## Test pilota (manuali)
- Whitelisting: flag ON ma device non in whitelist → nessuna coda/offline. Aggiungendo il device → offline attivo.
- Offline puro: rete OFF → 2 timbri (E/U) → `queue.count()=2`; tornare online/foreground → sync → DB aggiornato senza duplicati.
- Timeout: simulare rete lenta → superare `SYNC_TIMEOUT_MS` → enqueue; sync successivo al ritorno rete.
- Kill‑switch: rimuovere device dalla whitelist → offline disabilitato senza build.
- Flag OFF: comportamento identico al pre‑offline.

## Note di governance
- Nessuna nuova dipendenza. File piccoli e modulari.
- Nessun cambiamento UI/UX.
- Zero side‑effect con flag OFF o device non whitelisted.

