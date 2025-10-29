import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './components/ui/ToastKit.css';

// Disable console.log in production (preserve warn/error)
if (import.meta.env.PROD) {
  // eslint-disable-next-line no-console
  console.log = () => {};
}

// PWA Service Worker registration (only in production)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA is optional
    });
  });
}

try {
  const root = document.getElementById('root');
  if (!root) {
    document.body.innerHTML = '<div style="color: white; background: #0f0a1a; padding: 20px;">ERROR: Root element not found</div>';
  } else {
    createRoot(root).render(<App />);
  }
} catch (error) {
  console.error('App render error:', error);
  document.body.innerHTML = `<div style="color: white; background: #0f0a1a; padding: 20px;">
    <h1>BadgeNode - Error</h1>
    <p>Error: ${error}</p>
    <p>Check console for details</p>
  </div>`;
}

// Offline system initialization - immediate fallback, then async init
(() => {
  // Immediate fallback diagnostics to ensure system works from start
  const g = globalThis as any;
  g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
  
  // Check environment for immediate availability
  const queueEnabled = String(import.meta.env?.VITE_FEATURE_OFFLINE_QUEUE ?? 'false') === 'true';
  const deviceId = 'BN-immediate-' + Date.now();
  
  g.__BADGENODE_DIAG__.offline = { 
    enabled: queueEnabled, 
    allowed: queueEnabled, // In immediate mode, if enabled then allowed
    deviceId,
    queueCount: async () => {
      try {
        const { count } = await import('./offline/queue');
        return await count();
      } catch {
        return 0;
      }
    },
    peekLast: async () => {
      try {
        const { getAllPending } = await import('./offline/queue');
        const items = await getAllPending();
        return items.length > 0 ? { ...items[items.length - 1], pin: '***' } : null;
      } catch {
        return null;
      }
    },
    // Manual flush trigger for debugging
    flushNow: async () => {
      try {
        const { flushPending } = await import('./offline/queue');
        await flushPending();
        if (import.meta.env.DEV) {
          console.debug('[offline:manual] Flush triggered manually');
        }
        return true;
      } catch (e) {
        if (import.meta.env.DEV) {
          console.debug('[offline:manual] Flush error:', (e as Error)?.message);
        }
        return false;
      }
    },
  };
  
  // Install flush triggers immediately if offline is enabled
  if (queueEnabled) {
    let flushTimeout: number | null = null;
    const debouncedFlush = () => {
      if (flushTimeout) clearTimeout(flushTimeout);
      flushTimeout = window.setTimeout(async () => {
        try {
          const { flushPending } = await import('./offline/queue');
          await flushPending();
          if (import.meta.env.DEV) {
            console.debug('[offline:immediate] Flush completed');
          }
        } catch (e) {
          if (import.meta.env.DEV) {
            console.debug('[offline:immediate] Flush error:', (e as Error)?.message);
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
      console.debug('[offline:immediate] Flush triggers installed');
    }
  }
  
  if (import.meta.env.DEV) {
    console.debug('[offline:immediate] Fallback diagnostics installed', { enabled: queueEnabled, deviceId });
  }
})();

// Async initialization to upgrade diagnostics
(async () => {
  try {
    const mod = await import('./offline/index');
    await mod.initOfflineSystem?.({ diag: true });
    if (import.meta.env.DEV) {
      console.debug('[offline:async] Full system initialized');
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.debug('[offline:async] Init failed, keeping fallback', e);
    }
  }
})();
