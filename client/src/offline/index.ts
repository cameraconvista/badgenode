// client/src/offline/index.ts
// Safe offline management with lazy init and no side-effects

// Device ID management
const DEVICE_ID_KEY = 'BN_DEVICE_ID';

// Safe init function - no side effects, pure function
export async function initOfflineSystem(opts?: { diag?: boolean }): Promise<void> {
  // Early guards - prevent any execution in unsafe environments
  if (typeof window === 'undefined') return;
  if (!('indexedDB' in window)) return;
  
  try {
    // Safe flag reading
    const q = String(import.meta.env?.VITE_FEATURE_OFFLINE_QUEUE ?? 'false') === 'true';
    const b = String(import.meta.env?.VITE_FEATURE_OFFLINE_BADGE ?? 'false') === 'true';
    const wl = String(import.meta.env?.VITE_OFFLINE_DEVICE_WHITELIST ?? '').trim();
    
    // Safe device ID management
    let deviceId: string;
    try {
      deviceId = localStorage.getItem(DEVICE_ID_KEY) ?? (crypto?.randomUUID?.() ?? String(Date.now()));
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    } catch {
      deviceId = `BN-fallback-${Date.now()}`;
    }
    
    // Gating calculation
    const allowed = wl === '*' ? true : (wl ? wl.split(',').map(s => s.trim()).includes(deviceId) : false);
    const enabled = !!q && allowed;
    
    if (import.meta.env.DEV) {
      console.debug('[offline:init] enabled=%s, allowed=%s, deviceId=%s', enabled, allowed, deviceId);
    }
    
    // Always install diagnostics (safe)
    installDiagnostics({ enabled, allowed, deviceId, q, b, wl });
    
    // Only proceed if enabled
    if (!enabled) {
      if (import.meta.env.DEV) {
        console.debug('[offline:init] disabled, skipping IndexedDB init');
      }
      return;
    }
    
    // Initialize IndexedDB safely
    try {
      const { idbOpen } = await import('./idb');
      await idbOpen();
      
      if (import.meta.env.DEV) {
        console.debug('[offline:init] IndexedDB initialized');
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug('[offline:init] IndexedDB failed:', (e as Error)?.message);
      }
      return;
    }
    
    // Install event listeners safely
    try {
      let flushTimeout: number | null = null;
      const debouncedFlush = () => {
        if (flushTimeout) clearTimeout(flushTimeout);
        flushTimeout = window.setTimeout(async () => {
          try {
            const { flushPending } = await import('./queue');
            await flushPending();
          } catch (e) {
            if (import.meta.env.DEV) {
              console.debug('[offline:flush] error:', (e as Error)?.message);
            }
          }
          flushTimeout = null;
        }, 2000);
      };
      
      window.addEventListener('online', debouncedFlush);
      window.addEventListener('visibilitychange', () => {
        if (!document.hidden && navigator.onLine) {
          debouncedFlush();
        }
      });
      
      if (import.meta.env.DEV) {
        console.debug('[offline:init] event listeners installed');
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.debug('[offline:init] listeners failed:', (e as Error)?.message);
      }
    }
    
  } catch (e) {
    // Never throw - just log and continue
    if (import.meta.env.DEV) {
      console.debug('[offline:init] general error:', (e as Error)?.message);
    }
  }
}

// Safe diagnostics installation
function installDiagnostics({ enabled, allowed, deviceId, q, b, wl }: {
  enabled: boolean;
  allowed: boolean;
  deviceId: string;
  q: boolean;
  b: boolean;
  wl: string;
}) {
  try {
    const g = globalThis as any;
    g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
    
    // Feature flags
    g.__BADGENODE_DIAG__.featureFlags = { queue: q, badge: b, whitelist: wl };
    
    // Offline status with safe functions
    g.__BADGENODE_DIAG__.offline = {
      enabled,
      allowed,
      deviceId,
      queueCount: async () => {
        try {
          const { count } = await import('./queue');
          return await count();
        } catch {
          return 0;
        }
      },
      peekLast: async () => {
        try {
          const { getAllPending } = await import('./queue');
          const items = await getAllPending();
          const last = items[items.length - 1];
          return last ? { ...last, pin: '***' } : null;
        } catch {
          return null;
        }
      },
      peekClientSeq: async () => {
        try {
          const { peekClientSeq } = await import('./queue');
          return await peekClientSeq();
        } catch {
          return 0;
        }
      },
      getDeviceId: () => deviceId,
      acceptance: () => ({ enabled, allowed, deviceId })
    };
    
  } catch (e) {
    // Never throw from diagnostics
    if (import.meta.env.DEV) {
      console.debug('[offline:diag] failed:', (e as Error)?.message);
    }
  }
}

// Safe utility functions
export function shouldUseOfflineQueue(): boolean {
  try {
    const offline = (globalThis as any)?.__BADGENODE_DIAG__?.offline;
    return offline?.enabled && offline?.allowed;
  } catch {
    return false;
  }
}

export function isOfflineError(error: any): boolean {
  if (!navigator.onLine) return true;
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error?.code === 'NETWORK_ERROR') return true;
  if (error?.name === 'NetworkError') return true;
  return false;
}
