// client/src/offline/OfflineBadge.tsx
// Micro badge opzionale per pilota: mostra stato offline/queue/sync
// Montato solo in DEV quando sia offline feature che badge flag sono attivi.

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { isOfflineEnabled } from '@/config/featureFlags';
import { count } from '@/offline/queue';

function computeStatus(queueCount: number, online: boolean): { text: string; color: string } {
  if (!online && queueCount > 0) return { text: `offline • queued: ${queueCount}`, color: '#f59e0b' };
  if (online && queueCount > 0) return { text: `syncing… (${queueCount})`, color: '#60a5fa' };
  if (!online) return { text: 'offline', color: '#ef4444' };
  return { text: 'ok', color: '#10b981' };
}

function Badge() {
  const [q, setQ] = useState<number>(0);
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try { const c = await count(); if (mounted) setQ(c); } catch {}
      if (mounted) setTimeout(poll, 2000);
    };
    poll();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      mounted = false;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const s = computeStatus(q, online);
  return (
    <div
      style={{
        position: 'fixed',
        left: 8,
        bottom: 8,
        padding: '2px 6px',
        background: '#0f172a',
        color: s.color,
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 6,
        fontSize: 11,
        lineHeight: '14px',
        opacity: 0.8,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      {s.text}
    </div>
  );
}

export function mountOfflineBadge(): void {
  if (!import.meta.env.DEV) return;
  if (!isOfflineEnabled()) return;
  const id = 'bn-offline-badge';
  if (document.getElementById(id)) return;
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  const root = createRoot(el);
  root.render(<Badge />);
}
