// server/lib/logger.ts
// BadgeNode Logger Adapter — Sprint 2
// Feature-flagged structured logger with console fallback
// Zero external dependencies (pino optional)

/**
 * Logger adapter con fallback console.
 * 
 * Se pino è disponibile, usa structured logging.
 * Altrimenti fallback a console.* nativo.
 * 
 * Feature flag: VITE_FEATURE_LOGGER_ADAPTER (default: false)
 */

type LogArgs = unknown[];
type ContextLevel = 'info' | 'warn' | 'error' | 'debug';
type ContextPayload = Record<string, unknown>;

interface LoggerInterface {
  info: (...args: LogArgs) => void;
  warn: (...args: LogArgs) => void;
  error: (...args: LogArgs) => void;
  debug: (...args: LogArgs) => void;
  http: (...args: LogArgs) => void;
}

type ContextLogger = Record<ContextLevel, (context: ContextPayload, message: string) => void>;

// Tenta import pino (opzionale)
let pinoLogger: LoggerInterface | null = null;
let pinoContextLogger: ContextLogger | null = null;
try {
   
  const pino = require('pino');
  
  const transport =
    process.env.NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: { 
            colorize: true, 
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        };

  const instance = pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      base: { service: 'badgenode' },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport
  );
  pinoLogger = instance as unknown as LoggerInterface;
  pinoContextLogger = instance as unknown as ContextLogger;
} catch {
  // Pino non disponibile, usa console fallback
  pinoLogger = null;
  pinoContextLogger = null;
}

/**
 * Logger strutturato con fallback console.
 * 
 * Usage:
 * ```ts
 * import { logger } from './lib/logger';
 * 
 * logger.info('Server started', { port: 10000 });
 * logger.error('Database error', { error: err.message });
 * ```
 */
export const logger: LoggerInterface = pinoLogger || {
  info: (...args: LogArgs) => console.log('[INFO]', ...args),
  warn: (...args: LogArgs) => console.warn('[WARN]', ...args),
  error: (...args: LogArgs) => console.error('[ERROR]', ...args),
  debug: (...args: LogArgs) => {
    if (process.env.DEBUG_ENABLED === '1') {
      console.debug('[DEBUG]', ...args);
    }
  },
  http: (...args: LogArgs) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[HTTP]', ...args);
    }
  },
};

/**
 * Wrapper compatibilità console.
 * 
 * Permette migrazione graduale da console.* a logger.*
 * senza breaking changes.
 */
export const log = {
  info: (...args: LogArgs) => logger.info(...args),
  warn: (...args: LogArgs) => logger.warn(...args),
  error: (...args: LogArgs) => logger.error(...args),
  debug: (...args: LogArgs) => logger.debug(...args),
  http: (...args: LogArgs) => logger.http(...args),
};

/**
 * Helper per logging strutturato con context.
 * 
 * Usage:
 * ```ts
 * logWithContext('info', 'User login', { userId: '123', ip: req.ip });
 * ```
 */
export function logWithContext(
  level: ContextLevel,
  message: string,
  context?: ContextPayload
): void {
  if (pinoContextLogger) {
    pinoContextLogger[level](context || {}, message);
  } else {
    logger[level](message, context ? JSON.stringify(context) : '');
  }
}

// Export default per import semplificato
export default logger;
