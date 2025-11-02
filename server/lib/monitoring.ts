/**
 * BadgeNode — Advanced Monitoring Module
 * 
 * Integrazione APM/Error Tracking per produzione
 * Feature-flagged: VITE_FEATURE_MONITORING
 * 
 * Provider supportati:
 * - Sentry (error tracking + performance)
 * - OpenTelemetry (distributed tracing)
 * 
 * @module monitoring
 * @since Sprint 8
 */

// S8: Advanced monitoring infrastructure

/**
 * Inizializza monitoring in produzione
 * 
 * Attivato solo se:
 * - NODE_ENV === 'production'
 * - VITE_FEATURE_MONITORING === 'true'
 * - SENTRY_DSN configurato
 */
export function initMonitoring(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const isEnabled = process.env.VITE_FEATURE_MONITORING === 'true';
  const hasDSN = !!process.env.SENTRY_DSN;

  if (!isProduction || !isEnabled || !hasDSN) {
    console.info('[Monitoring] Disabled (dev mode or feature flag OFF)');
    return;
  }

  try {
    // Sentry initialization (commented - requires npm install @sentry/node)
    /*
    import * as Sentry from '@sentry/node';
    
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'production',
      release: process.env.VITE_APP_VERSION || '1.0.0',
      
      // Performance Monitoring
      tracesSampleRate: 0.2, // 20% delle transazioni
      
      // Error Sampling
      sampleRate: 1.0, // 100% degli errori
      
      // Integrations
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
      ],
      
      // Filtering
      beforeSend(event, hint) {
        // Filtra PII
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
    
    console.info('[Monitoring] Sentry initialized');
    */

    console.info('[Monitoring] Ready (Sentry stub - install @sentry/node to activate)');
  } catch (error) {
    console.error('[Monitoring] Initialization failed:', error);
  }
}

/**
 * Cattura errore con context
 * 
 * @param error - Errore da tracciare
 * @param context - Context aggiuntivo (route, user, etc)
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const isEnabled = process.env.VITE_FEATURE_MONITORING === 'true';

  if (isEnabled) {
    // Sentry.captureException(error, { extra: context });
    console.error('[Monitoring] Error captured:', { error, context });
  } else {
    console.error('[Monitoring] Error (not sent):', error);
  }
}

/**
 * Cattura messaggio con severity
 * 
 * @param message - Messaggio da tracciare
 * @param level - Severity level
 * @param context - Context aggiuntivo
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  const isEnabled = process.env.VITE_FEATURE_MONITORING === 'true';

  if (isEnabled) {
    // Sentry.captureMessage(message, { level, extra: context });
    console.info('[Monitoring] Message captured:', { message, level, context });
  }
}

/**
 * Traccia performance transaction
 * 
 * @param name - Nome transazione
 * @param operation - Tipo operazione (http, db, etc)
 * @param callback - Funzione da tracciare
 */
export async function traceTransaction<T>(
  name: string,
  operation: string,
  callback: () => Promise<T>
): Promise<T> {
  const isEnabled = process.env.VITE_FEATURE_MONITORING === 'true';

  if (!isEnabled) {
    return callback();
  }

  const startTime = Date.now();

  try {
    // const transaction = Sentry.startTransaction({ name, op: operation });
    const result = await callback();
    // transaction.finish();

    const duration = Date.now() - startTime;
    console.info('[Monitoring] Transaction:', { name, operation, duration });

    return result;
  } catch (error) {
    captureError(error, { transaction: name, operation });
    throw error;
  }
}

/**
 * Configura user context per tracking
 * 
 * @param userId - ID utente (anonimizzato)
 * @param metadata - Metadata aggiuntivi
 */
export function setUserContext(userId: string, metadata?: Record<string, unknown>): void {
  const isEnabled = process.env.VITE_FEATURE_MONITORING === 'true';

  if (isEnabled) {
    // Sentry.setUser({ id: userId, ...metadata });
    console.info('[Monitoring] User context set:', { userId, metadata });
  }
}

/**
 * Pulisce user context
 */
export function clearUserContext(): void {
  const isEnabled = process.env.VITE_FEATURE_MONITORING === 'true';

  if (isEnabled) {
    // Sentry.setUser(null);
    console.info('[Monitoring] User context cleared');
  }
}

/**
 * Aggiunge breadcrumb per debugging
 * 
 * @param category - Categoria breadcrumb
 * @param message - Messaggio
 * @param data - Dati aggiuntivi
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  const isEnabled = process.env.VITE_FEATURE_MONITORING === 'true';

  if (isEnabled) {
    // Sentry.addBreadcrumb({ category, message, data, level: 'info' });
    console.debug('[Monitoring] Breadcrumb:', { category, message, data });
  }
}

/**
 * Health check monitoring
 * 
 * @returns Status monitoring
 */
export function getMonitoringStatus(): {
  enabled: boolean;
  provider: string;
  environment: string;
} {
  return {
    enabled: process.env.VITE_FEATURE_MONITORING === 'true',
    provider: 'sentry-stub',
    environment: process.env.NODE_ENV || 'development',
  };
}
