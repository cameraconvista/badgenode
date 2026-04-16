// server/config/featureFlags.ts
// BadgeNode Feature Flags — Server-side
// Sprint 2: Logger adapter flag

/**
 * Feature flag per logger strutturato.
 * 
 * Quando true, usa logger adapter (server/lib/logger.ts).
 * Quando false, usa console.* nativo (comportamento originale).
 * 
 * Default: false (nessun impatto su runtime esistente)
 * 
 * Usage:
 * ```ts
 * import { FEATURE_LOGGER_ADAPTER } from './config/featureFlags';
 * 
 * if (FEATURE_LOGGER_ADAPTER) {
 *   logger.info('Message');
 * } else {
 *   console.log('Message');
 * }
 * ```
 */
export const FEATURE_LOGGER_ADAPTER =
  process.env.VITE_FEATURE_LOGGER_ADAPTER === 'true';

/**
 * Feature flag per debug logging.
 * 
 * Quando true, abilita log level debug.
 * 
 * Default: false (solo in development)
 */
export const DEBUG_ENABLED =
  process.env.DEBUG_ENABLED === '1' || process.env.NODE_ENV === 'development';

/**
 * Log level configurabile.
 * 
 * Valori: 'debug' | 'info' | 'warn' | 'error'
 * Default: 'info'
 */
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
