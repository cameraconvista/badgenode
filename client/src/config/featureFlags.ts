// client/src/config/featureFlags.ts
// Feature flags centralizzati. Default: OFF per sicurezza.

// Lettura boolean da env runtime (Vite) con fallback sicuro a false.
function readBoolEnv(name: string, defaultValue = false): boolean {
  const raw = (import.meta as any)?.env?.[name];
  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
  }
  return defaultValue;
}

export const FEATURE_OFFLINE_QUEUE = readBoolEnv('VITE_FEATURE_OFFLINE_QUEUE', false);
export const FEATURE_OFFLINE_BADGE = readBoolEnv('VITE_FEATURE_OFFLINE_BADGE', false);

export function isOfflineQueueEnabled(): boolean {
  return FEATURE_OFFLINE_QUEUE === true;
}

export const FEATURE_FLAGS = {
  offlineQueue: FEATURE_OFFLINE_QUEUE,
  offlineBadge: FEATURE_OFFLINE_BADGE,
} as const;

export function isOfflineBadgeEnabled(): boolean {
  return FEATURE_OFFLINE_BADGE === true;
}

export function getOfflineFlags() {
  return {
    queue: isOfflineQueueEnabled(),
    badge: isOfflineBadgeEnabled(),
    env: (import.meta as any)?.env?.MODE ?? undefined,
  } as const;
}
