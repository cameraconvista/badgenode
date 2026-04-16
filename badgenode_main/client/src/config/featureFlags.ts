// client/src/config/featureFlags.ts
// Feature flags centralizzati. Default: OFF per sicurezza.

type RuntimeEnv = Record<string, string | undefined>;

function getRuntimeEnv(): RuntimeEnv | undefined {
  return (import.meta as ImportMeta & { env?: RuntimeEnv }).env;
}

// Lettura boolean da env runtime (Vite) con fallback sicuro a false.
function readBoolEnv(name: string, defaultValue = false): boolean {
  const raw = getRuntimeEnv()?.[name];
  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
  }
  return defaultValue;
}

// Lettura string da env runtime (Vite) con fallback sicuro.
function readStringEnv(name: string, defaultValue = ''): string {
  const raw = getRuntimeEnv()?.[name];
  return typeof raw === 'string' ? raw : defaultValue;
}

export const FEATURE_OFFLINE_QUEUE = readBoolEnv('VITE_FEATURE_OFFLINE_QUEUE', false);
export const FEATURE_OFFLINE_BADGE = readBoolEnv('VITE_FEATURE_OFFLINE_BADGE', false);
export const OFFLINE_DEVICE_WHITELIST = readStringEnv('VITE_OFFLINE_DEVICE_WHITELIST', '');

// Immutable feature flags object
export const featureFlags = {
  queue: FEATURE_OFFLINE_QUEUE,
  badge: FEATURE_OFFLINE_BADGE,
  whitelist: OFFLINE_DEVICE_WHITELIST,
} as const;

export function isOfflineQueueEnabled(): boolean {
  return FEATURE_OFFLINE_QUEUE === true;
}

// Alias per compatibilità con OfflineBadge.tsx
export const isOfflineEnabled = isOfflineQueueEnabled;

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
    env: getRuntimeEnv()?.MODE ?? undefined,
  } as const;
}
