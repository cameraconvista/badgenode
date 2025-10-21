// BadgeNode Offline — Enterprise Stable (v1.0)
// Step 6 — Consolidamento finale, non modificare logiche senza riaprire pipeline.
// client/src/offline/syncRunner.ts
// Sync Runner (Step 3): invia FIFO verso RPC insert_timbro_offline

import { isOfflineEnabled } from '@/offline/gating';
import { getDeviceId } from '@/lib/deviceId';
import { getAllPending, markSending, markSent, markReview, remove } from './queue';

const SYNC_TIMEOUT_MS = 12000;
const SYNC_DEV_BACKOFF_MS = [10000, 20000, 30000];

function supabaseRpcUrl(): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  return `${base}/rest/v1/rpc/insert_timbro_offline`;
}

async function postRpc(body: Record<string, unknown>, signal?: AbortSignal): Promise<any> {
  const url = supabaseRpcUrl();
  const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`,
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = (j?.message || j?.error || msg); } catch {}
    throw new Error(msg);
  }
  try { return await res.json(); } catch { return {}; }
}

export async function runSyncOnce(): Promise<void> {
  if (!isOfflineEnabled(getDeviceId())) return;
  if (navigator.onLine !== true) return;
  const items = await getAllPending();
  if (items.length === 0) return;

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort('timeout'), SYNC_TIMEOUT_MS);
  try {
    for (const it of items) {
      try {
        await markSending(it.client_seq);
        const payload = {
          p_device_id: it.device_id,
          p_client_seq: it.client_seq,
          p_pin: it.pin,
          p_tipo: it.tipo,
          p_timestamp_raw: it.timestamp_raw,
        };
        const resp = await postRpc(payload, ctrl.signal);
        const status = (resp?.status || 'OK') as string;
        if (status === 'OK') {
          await markSent(it.client_seq);
          await remove(it.client_seq);
          if (import.meta.env.DEV) console.debug('[offline:sync] sent', it.client_seq);
          // update lastSyncAt diagnostics if present
          const g = globalThis as any;
          if (g.__BADGENODE_DIAG__?.offline) {
            g.__BADGENODE_DIAG__.offline.lastSyncAt = new Date().toISOString();
          }
        } else if (status === 'ALREADY_EXISTS') {
          await remove(it.client_seq);
          if (import.meta.env.DEV) console.debug('[offline:sync] dedup', it.client_seq);
          const g = globalThis as any;
          if (g.__BADGENODE_DIAG__?.offline) {
            g.__BADGENODE_DIAG__.offline.lastSyncAt = new Date().toISOString();
          }
        } else if (status === 'REVIEW_REQUIRED') {
          await markReview(it.client_seq, resp?.reason || 'review');
          if (import.meta.env.DEV) console.debug('[offline:sync] review', it.client_seq);
        } else {
          // ERROR generico → interrompi per evitare martellamento
          if (import.meta.env.DEV) console.debug('[offline:sync] error', it.client_seq, resp?.reason);
          break;
        }
      } catch (e) {
        if (import.meta.env.DEV) console.debug('[offline:sync] network/error', it.client_seq, (e as Error).message);
        // Stop on first failure to avoid hammering
        break;
      }
    }
  } finally {
    clearTimeout(to);
  }
}

let triggersInstalled = false;
export function installSyncTriggers(): void {
  if (triggersInstalled) return;
  if (!isOfflineEnabled(getDeviceId())) return;
  triggersInstalled = true;
  window.addEventListener('online', () => { void runSyncOnce(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { void runSyncOnce(); }
  });
  if (import.meta.env.DEV) {
    let i = 0;
    const tick = async () => {
      if (!isOfflineEnabled(getDeviceId())) return;
      await runSyncOnce();
      i = Math.min(SYNC_DEV_BACKOFF_MS.length - 1, i + 1);
      setTimeout(tick, SYNC_DEV_BACKOFF_MS[i]);
    };
    setTimeout(tick, SYNC_DEV_BACKOFF_MS[0]);
  }
}
