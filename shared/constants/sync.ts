// Costanti per sistema sync offline BadgeNode
// Configurazione retry, backoff e limiti

export const SYNC_DB_NAME = 'badgenode-sync';
export const SYNC_DB_STORE = 'pending_timbrature';
export const SYNC_MAX_ATTEMPTS = 8;

// Backoff exponential in millisecondi per retry
export const SYNC_RETRY_BACKOFF_MS = [
  2_000, // 2s
  5_000, // 5s
  10_000, // 10s
  30_000, // 30s
  60_000, // 1m
  120_000, // 2m
  300_000, // 5m
  600_000, // 10m
];

// RPC name per insert idempotente
export const SYNC_RPC_NAME = 'bn_insert_timbratura';
