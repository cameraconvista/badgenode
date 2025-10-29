// BadgeNode Offline — Enterprise Stable (v1.0)
// Step 6 — Consolidamento finale, non modificare logiche senza riaprire pipeline.
// client/src/offline/queue.ts
// Coda offline persistente (Step 3): IndexedDB con key client_seq
// Protetta da feature flag. Nessun side-effect quando OFF.

import { STORE_TIMBRI, idbAdd, idbGetAll, idbPut, idbDelete, idbCount, idbUpdateByKey } from './idb';
import type { QueueItem } from './types';
import { getDeviceId } from '@/lib/deviceId';

function nowIso(): string {
  return new Date().toISOString();
}

export async function peekClientSeq(): Promise<number> {
  try {
    const items = await idbGetAll<QueueItem>(STORE_TIMBRI);
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => item.client_seq));
  } catch {
    return 0;
  }
}

export async function enqueuePending(ev: { pin: number; tipo: 'entrata' | 'uscita' }): Promise<QueueItem> {
  try {
    const client_seq = (await peekClientSeq()) + 1;
    const qi: QueueItem = {
      client_seq,
      device_id: getDeviceId(),
      pin: String(ev.pin),
      tipo: ev.tipo,
      timestamp_raw: nowIso(),
      ts_client_ms: Date.now(),
      client_event_id: crypto.randomUUID?.() ?? String(Date.now()),
      status: 'pending',
      created_at: nowIso(),
    };
    await idbPut(STORE_TIMBRI, qi);
    if (import.meta.env.DEV) console.debug('[offline:enqueue]', qi.client_seq);
    return qi;
  } catch (e) {
    if (import.meta.env.DEV) console.debug('[offline:enqueue] failed:', (e as Error)?.message);
    throw e; // Re-throw for caller to handle
  }
}

export async function getAllPending(): Promise<QueueItem[]> {
  try {
    const items = await idbGetAll<QueueItem>(STORE_TIMBRI);
    return items
      .filter(item => item.status === 'pending' || !item.status)
      .sort((a, b) => (a.ts_client_ms || 0) - (b.ts_client_ms || 0));
  } catch {
    return [];
  }
}

export async function flushPending(): Promise<void> {
  try {
    if (!navigator.onLine) return;
    
    const pending = await getAllPending();
    if (pending.length === 0) return;

    if (import.meta.env.DEV) console.debug('[offline:flush] processing', pending.length, 'items');

    for (const item of pending) {
      try {
        const response = await fetch('/api/timbrature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pin: Number(item.pin),
            tipo: item.tipo,
            client_event_id: item.client_event_id,
          }),
        });

        if (response.ok) {
          // Success - remove from queue
          await idbDelete(STORE_TIMBRI, item.client_seq);
          if (import.meta.env.DEV) console.debug('[offline:flush] synced', item.client_seq);
        } else if (response.status >= 400 && response.status < 500) {
          // Client error - remove from queue (won't succeed on retry)
          await idbDelete(STORE_TIMBRI, item.client_seq);
          if (import.meta.env.DEV) console.debug('[offline:flush] discarded 4xx', item.client_seq);
        }
        // 5xx errors: keep in queue for retry
      } catch (e) {
        // Network error: keep in queue for retry
        if (import.meta.env.DEV) console.debug('[offline:flush] network error, keeping', item.client_seq);
      }
    }
  } catch (e) {
    // Never throw from flush - just log
    if (import.meta.env.DEV) console.debug('[offline:flush] general error:', (e as Error)?.message);
  }
}

// Utility functions
export async function count(): Promise<number> {
  try {
    return await idbCount(STORE_TIMBRI);
  } catch {
    return 0;
  }
}

export async function remove(client_seq: number): Promise<void> {
  await idbDelete(STORE_TIMBRI, client_seq);
}

// Unified offline queue - single entry point
// Legacy functions removed - use enqueuePending() directly

// State management functions removed - flushPending() handles status internally
