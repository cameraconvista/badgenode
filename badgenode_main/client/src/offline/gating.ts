// client/src/offline/gating.ts
// Gating per-device per l'abilitazione offline

import { featureFlags, isOfflineQueueEnabled } from '@/config/featureFlags';

export function getWhitelistedDevices(): string[] {
  const raw = featureFlags.whitelist;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.toLowerCase());
}

export function isDeviceAllowed(deviceId: string): boolean {
  if (!deviceId) return false;
  const list = getWhitelistedDevices();
  // Handle wildcard '*' for all devices
  if (list.includes('*')) return true;
  return list.includes(deviceId.toLowerCase());
}

// Centralized enablement: global flag AND device whitelisted
export function isOfflineEnabled(deviceId?: string): boolean {
  if (!isOfflineQueueEnabled()) return false;
  const id = deviceId ?? '';
  return isDeviceAllowed(id);
}
