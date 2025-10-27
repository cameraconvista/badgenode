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

// Offline system initialization - lazy and protected
(async () => {
  try {
    const mod = await import('./offline/index');
    await mod.initOfflineSystem?.({ diag: true });
  } catch (e) {
    // Never block the boot
    if (import.meta.env.DEV) {
      console.debug('[offline:init] skipped', e);
    }
    // Minimal fallback diagnostics
    const g = globalThis as any;
    g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
    g.__BADGENODE_DIAG__.offline = g.__BADGENODE_DIAG__.offline || { 
      enabled: false, 
      allowed: false,
      deviceId: 'BN-fallback-' + Date.now(),
      queueCount: async () => 0,
      peekLast: async () => null,
    };
  }
})();
