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

interface LoggerInterface {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  http: (...args: any[]) => void;
}

// Tenta import pino (opzionale)
let pinoLogger: any = null;
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

  pinoLogger = pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      base: { service: 'badgenode' },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport
  );
} catch {
  // Pino non disponibile, usa console fallback
  pinoLogger = null;
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
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  debug: (...args: any[]) => {
    if (process.env.DEBUG_ENABLED === '1') {
      console.debug('[DEBUG]', ...args);
    }
  },
  http: (...args: any[]) => {
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
  info: (...args: any[]) => logger.info(...args),
  warn: (...args: any[]) => logger.warn(...args),
  error: (...args: any[]) => logger.error(...args),
  debug: (...args: any[]) => logger.debug(...args),
  http: (...args: any[]) => logger.http(...args),
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
  level: 'info' | 'warn' | 'error' | 'debug',
  message: string,
  context?: Record<string, any>
): void {
  if (pinoLogger) {
    pinoLogger[level](context || {}, message);
  } else {
    logger[level](message, context ? JSON.stringify(context) : '');
  }
}

// Export default per import semplificato
export default logger;
