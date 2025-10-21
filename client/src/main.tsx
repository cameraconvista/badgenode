import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './components/ui/ToastKit.css';

// PWA Service Worker registration (only in production)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA is optional
    });
  });
}

// Offline diagnostics (Step 1): optional, DEV only, guarded by feature flag
if (import.meta.env.DEV) {
  (async () => {
    try {
      const [{ isOfflineEnabled }, { getDeviceId }] = await Promise.all([
        import('./offline/gating'),
        import('./lib/deviceId'),
      ]);
      const enabled = isOfflineEnabled(getDeviceId());
      if (enabled) {
        // Load diagnostics and sync triggers lazily
        void import('./offline/diagnostic').then((m) => m.installOfflineDiagnostics());
        void import('./offline/syncRunner').then((m) => m.installSyncTriggers());
        // Badge is optional and mounted after a tick to avoid boot blocking
        const { isOfflineBadgeEnabled } = await import('./config/featureFlags');
        if (isOfflineBadgeEnabled()) {
          setTimeout(() => {
            void import('./offline/OfflineBadge').then((m) => m.mountOfflineBadge());
          }, 0);
        }
      }
    } catch (e) {
      console.debug('[offline:bootstrap] skipped:', (e as Error)?.message);
    }
  })();
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
