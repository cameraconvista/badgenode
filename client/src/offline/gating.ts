// client/src/offline/gating.ts
// Gating per-device per l'abilitazione offline

export function getWhitelistedDevices(): string[] {
  const raw = (import.meta as any)?.env?.VITE_OFFLINE_DEVICE_WHITELIST as string | undefined;
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
  return list.includes(deviceId.toLowerCase());
}

// Centralized enablement: global flag AND device whitelisted
import { isOfflineQueueEnabled } from '@/config/featureFlags';

export function isOfflineEnabled(deviceId?: string): boolean {
  if (!isOfflineQueueEnabled()) return false;
  const id = deviceId ?? '';
  return isDeviceAllowed(id);
}
