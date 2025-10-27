# client/src/offline/index.ts

## initOfflineSystem Function (righe 8-102)

```typescript
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
    
    // Always install diagnostics (safe)
    installDiagnostics({ enabled, allowed, deviceId, q, b, wl });
    
    // Only proceed if enabled
    if (!enabled) return;
    
    // Initialize IndexedDB safely
    try {
      const { idbOpen } = await import('./idb');
      await idbOpen();
    } catch (e) {
      return;
    }
    
    // Install event listeners safely
    // ... (event listeners setup)
    
  } catch (e) {
    // Never throw - just log and continue
  }
}
```

**ANALISI**: Funzione sicura con guardie multiple. Non dovrebbe causare side-effects a import time.
