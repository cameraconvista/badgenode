// BadgeNode Offline — Enterprise Stable (v1.0)
// Step 6 — Consolidamento finale, non modificare logiche senza riaprire pipeline.
// client/src/offline/queue.ts
// Coda offline persistente (Step 3): IndexedDB con key client_seq
// Protetta da feature flag. Nessun side-effect quando OFF.

import { isOfflineEnabled } from '@/offline/gating';
import { STORE_TIMBRI, idbAdd, idbGetAll, idbPut, idbDelete, idbCount } from './idb';
import type { QueueItem } from './types';
import { nextClientSeq } from './seq';
import { getDeviceId } from '@/lib/deviceId';

function nowIso(): string {
  return new Date().toISOString();
}

export async function enqueue(itemBase: Omit<QueueItem, 'client_seq' | 'status' | 'created_at' | 'updated_at'>): Promise<QueueItem> {
  if (!isOfflineEnabled(getDeviceId())) throw new Error('offline queue disabled');
  const qi: QueueItem = {
    client_seq: nextClientSeq(),
    device_id: itemBase.device_id,
    pin: itemBase.pin,
    tipo: itemBase.tipo,
    timestamp_raw: itemBase.timestamp_raw,
    status: 'pending',
    created_at: nowIso(),
  };
  await idbAdd(STORE_TIMBRI, qi);
  if (import.meta.env.DEV) console.debug('[offline:enqueue]', qi.client_seq);
  return qi;
}

export async function getAllPending(): Promise<QueueItem[]> {
  if (!isOfflineEnabled(getDeviceId())) return [];
  const all = await idbGetAll<QueueItem>(STORE_TIMBRI);
  return all
    .filter((x) => x.status === 'pending' || x.status === 'sending' || !x.status)
    .sort((a, b) => a.client_seq - b.client_seq);
}

async function updateStatus(client_seq: number, status: QueueItem['status'], reason?: string): Promise<void> {
  const all = await idbGetAll<QueueItem>(STORE_TIMBRI);
  const item = all.find((x) => x.client_seq === client_seq);
  if (!item) return;
  item.status = status;
  item.updated_at = nowIso();
  if (reason) item.last_error = reason;
  await idbPut(STORE_TIMBRI, item);
}

export function markSending(client_seq: number): Promise<void> { return updateStatus(client_seq, 'sending'); }
export function markSent(client_seq: number): Promise<void> { return updateStatus(client_seq, 'sent'); }
export function markReview(client_seq: number, reason?: string): Promise<void> { return updateStatus(client_seq, 'review', reason); }

export async function remove(client_seq: number): Promise<void> {
  await idbDelete(STORE_TIMBRI, client_seq);
}

export async function count(): Promise<number> {
  if (!isOfflineEnabled(getDeviceId())) return 0;
  return idbCount(STORE_TIMBRI);
}

export function buildBaseItem(pin: number, tipo: 'entrata'|'uscita'): Omit<QueueItem, 'client_seq'|'status'|'created_at'|'updated_at'> {
  return {
    device_id: getDeviceId(),
    pin: String(pin),
    tipo,
    timestamp_raw: new Date().toISOString(),
  };
}
