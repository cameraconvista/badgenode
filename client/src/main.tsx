import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// PWA Service Worker registration (only in production)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail - PWA is optional
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
