// Tipi per sistema sync offline-first BadgeNode
// Gestione coda locale con retry automatico e idempotenza

export type TimbraturaTipo = 'entrata' | 'uscita';

export type PendingEvent = {
  client_event_id: string; // uuid v4
  pin: number;
  tipo: TimbraturaTipo;
  created_at: string; // ISO string tz (timestamptz)
  attempts: number; // retry count
  last_error?: string; // optional
  created_local_ts: number; // Date.now() per ordering locale
};

export type SyncResult = {
  ok: boolean;
  client_event_id: string;
  error?: string;
};
