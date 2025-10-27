// client/src/offline/index.ts
// Centralized offline management with gating, initialization, and diagnostics

import { featureFlags } from '@/config/featureFlags';
import { getDeviceId } from '@/lib/deviceId';
import { idbOpen } from './idb';
import { flushPending, count, getAllPending, peekClientSeq } from './queue';

// Device ID management
const DEVICE_ID_KEY = 'BN_DEVICE_ID';

export function ensureDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID?.() ?? `BN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    // Fallback for environments without localStorage
    return (globalThis as any).__BN_DEVICE_ID__ ?? 
           ((globalThis as any).__BN_DEVICE_ID__ = `BN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }
}

// Gating logic
export function calculateGating() {
  const deviceId = ensureDeviceId();
  const enabled = !!featureFlags.queue;
  
  let allowed = false;
  if (featureFlags.whitelist === '*') {
    allowed = true;
  } else if (featureFlags.whitelist) {
    const whitelist = featureFlags.whitelist
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);
    allowed = whitelist.includes(deviceId.toLowerCase());
  }
  
  return { enabled, allowed, deviceId };
}

// Debounced flush function
let flushTimeout: number | null = null;
function debouncedFlush() {
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = window.setTimeout(() => {
    void flushPending();
    flushTimeout = null;
  }, 2000);
}

// Initialize offline system
export async function initOfflineSystem(): Promise<void> {
  const { enabled, allowed, deviceId } = calculateGating();
  
  if (import.meta.env.DEV) {
    console.debug('[offline:init] enabled=%s, allowed=%s, deviceId=%s', enabled, allowed, deviceId);
  }
  
  // Always install diagnostics
  installDiagnostics({ enabled, allowed, deviceId });
  
  // Only initialize IndexedDB and listeners if enabled and allowed
  if (enabled && allowed) {
    try {
      // Initialize IndexedDB (triggers onupgradeneeded if needed)
      await idbOpen();
      
      // Install online listener for auto-flush
      window.addEventListener('online', debouncedFlush);
      window.addEventListener('visibilitychange', () => {
        if (!document.hidden && navigator.onLine) {
          debouncedFlush();
        }
      });
      
      if (import.meta.env.DEV) {
        console.debug('[offline:init] IndexedDB and listeners initialized');
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug('[offline:init] failed to initialize IndexedDB:', (e as Error).message);
      }
    }
  }
}

// Install diagnostics
function installDiagnostics({ enabled, allowed, deviceId }: { enabled: boolean; allowed: boolean; deviceId: string }) {
  const g = globalThis as any;
  g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
  
  // Always expose feature flags
  g.__BADGENODE_DIAG__.featureFlags = featureFlags;
  
  // Expose offline status and functions
  g.__BADGENODE_DIAG__.offline = {
    enabled,
    allowed,
    deviceId,
    queueCount: async () => await count(),
    peekLast: async () => {
      const items = await getAllPending();
      const last = items[items.length - 1];
      return last ? { ...last, pin: '***' } : null;
    },
    peekClientSeq,
    getDeviceId: () => deviceId,
    acceptance: async () => ({
      deviceId,
      enabled,
      allowed,
      queueCount: await count(),
      lastSeq: await peekClientSeq(),
      online: navigator.onLine,
      timestamp: new Date().toISOString(),
    }),
  };
}

// Check if offline queue should be used
export function shouldUseOfflineQueue(): boolean {
  const { enabled, allowed } = calculateGating();
  return enabled && allowed;
}

// Check if request failed due to offline condition
export function isOfflineError(error: any): boolean {
  if (!navigator.onLine) return true;
  
  // Check for common network error patterns
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error?.code === 'NETWORK_ERROR') return true;
  if (error?.name === 'NetworkError') return true;
  
  return false;
}
