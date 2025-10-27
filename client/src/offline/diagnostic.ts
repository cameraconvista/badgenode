// BadgeNode Offline — Enterprise Stable (v1.0)
// Step 6 — Consolidamento finale, non modificare logiche senza riaprire pipeline.
// client/src/offline/diagnostic.ts
// Diagnostica non invasiva per offline (Step 1). Esegue SOLO se flag ON.

import { featureFlags, isOfflineQueueEnabled } from '@/config/featureFlags';
import { isOfflineEnabled, isDeviceAllowed } from '@/offline/gating';
import { getDeviceId } from '@/lib/deviceId';
import { count } from './queue';
import { peekClientSeq } from './seq';

export async function getAcceptanceSnapshot(): Promise<{
  deviceId: string;
  allowed: boolean;
  queueCount: number;
  lastSeq: number;
  online: boolean;
  lastSyncAt: string | null;
  appVersion: string | null;
}> {
  const deviceId = getDeviceId();
  const allowed = isOfflineEnabled(deviceId);
  const queueCount = await count();
  const lastSeq = peekClientSeq();
  const online = navigator.onLine === true;
  const lastSyncAt = (globalThis as any).__BADGENODE_DIAG__?.offline?.lastSyncAt ?? null;
  const appVersion = ((import.meta as any)?.env?.VITE_APP_VERSION as string | undefined) ?? null;
  return { deviceId, allowed, queueCount, lastSeq, online, lastSyncAt, appVersion };
}

export async function installOfflineDiagnostics(): Promise<void> {
  const g = globalThis as any;
  const deviceId = getDeviceId();
  const enabled = isOfflineQueueEnabled();
  const allowed = isDeviceAllowed(deviceId);
  
  // Always expose feature flags for diagnostics
  g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
  g.__BADGENODE_DIAG__.featureFlags = featureFlags;
  
  // Expose offline status regardless of enabled state
  g.__BADGENODE_DIAG__.offline = {
    enabled,
    allowed,
    deviceId,
    queueCount: async () => {
      // Always try to get count for diagnostics, even if offline disabled
      try {
        const { idbCount, STORE_TIMBRI } = await import('./idb');
        return await idbCount(STORE_TIMBRI);
      } catch {
        return 0;
      }
    },
    peekLast: async () => {
      // Mask PIN for security in diagnostics
      const items = await import('./queue').then(m => m.getAllPending());
      const last = items[items.length - 1];
      return last ? { ...last, pin: '***' } : null;
    },
    getDeviceId,
    peekClientSeq,
    acceptance: () => getAcceptanceSnapshot(),
  };
  
  if (enabled && allowed) {
    const queueCount = await count();
    if (import.meta.env.DEV) {
      console.debug('[offline:diag] enabled, allowed=%s, queueCount=%s', allowed, queueCount);
    }
  }
}
