// BadgeNode Offline — Enterprise Stable (v1.0)
// Step 6 — Consolidamento finale, non modificare logiche senza riaprire pipeline.
// client/src/offline/diagnostic.ts
// Diagnostica non invasiva per offline (Step 1). Esegue SOLO se flag ON.

import { isOfflineEnabled } from '@/offline/gating';
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
  const allowed = isOfflineEnabled();
  const deviceId = getDeviceId();
  const queueCount = await count();
  const lastSeq = peekClientSeq();
  const online = navigator.onLine === true;
  const lastSyncAt = (globalThis as any).__BADGENODE_DIAG__?.offline?.lastSyncAt ?? null;
  const appVersion = ((import.meta as any)?.env?.VITE_APP_VERSION as string | undefined) ?? null;
  return { deviceId, allowed, queueCount, lastSeq, online, lastSyncAt, appVersion };
}

export async function installOfflineDiagnostics(): Promise<void> {
  if (!isOfflineEnabled()) return; // NO-OP quando OFF
  const g = globalThis as any;
  const deviceId = getDeviceId();
  const queueCount = await count();
  const allowed = true; // se siamo qui, la combinazione flag+whitelist è vera
  g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
  g.__BADGENODE_DIAG__.offline = {
    enabled: true,
    deviceId,
    queueCount,
    allowed,
    getDeviceId,
    getQueueCount: () => count(),
    peekClientSeq,
    acceptance: () => getAcceptanceSnapshot(),
  };
  if (import.meta.env.DEV) {
    console.debug('[offline:diag] enabled, allowed=%s, queueCount=%s', allowed, queueCount);
  }
}
