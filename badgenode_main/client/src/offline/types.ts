// client/src/offline/types.ts
// Tipi condivisi per timbri offline (Step 1 - interfacce, nessun wiring)

export type QueueItemStatus = 'pending' | 'synced' | 'failed';

export interface OfflineTimbro {
  id: string;            // uuid v4 client
  deviceId: string;      // DEVICE_ID stabile del tablet
  clientSeq: number;     // contatore locale (per step 2: UNIQUE with deviceId)
  pin: number;           // 1-99
  tipo: 'entrata' | 'uscita';
  timestamp: string;     // ISO local time reference
  status: QueueItemStatus;
  lastError?: string;    // opzionale
}

export interface OfflineStatus {
  enabled: boolean;
  queueCount: number;
  deviceId?: string;
}

// Step 3: coda persistente (IndexedDB)
export type QueueItem = {
  client_seq: number;
  device_id: string;
  pin: string;
  tipo: 'entrata' | 'uscita';
  timestamp_raw: string; // ISO
  ts_client_ms: number; // timestamp in milliseconds for sorting
  client_event_id: string; // unique event ID for idempotency
  status: 'pending' | 'sending' | 'sent' | 'review';
  last_error?: string;
  created_at: string; // ISO (client)
  updated_at?: string; // ISO
};
