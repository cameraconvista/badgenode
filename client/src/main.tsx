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

// Offline system initialization
(async () => {
  try {
    const { initOfflineSystem } = await import('./offline/index');
    await initOfflineSystem();
    
    // Badge is optional and mounted after initialization
    if (import.meta.env.DEV) {
      const { featureFlags } = await import('./config/featureFlags');
      if (featureFlags.badge) {
        setTimeout(() => {
          void import('./offline/OfflineBadge').then((m) => m.mountOfflineBadge());
        }, 0);
      }
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.debug('[offline:bootstrap] skipped:', (e as Error)?.message);
    }
  }
})();

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
