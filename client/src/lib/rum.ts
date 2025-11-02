/**
 * BadgeNode — Real User Monitoring (RUM)
 * 
 * Tracciamento performance frontend e user experience
 * Feature-flagged: VITE_FEATURE_RUM
 * 
 * Provider supportati:
 * - Sentry Browser
 * - Google Analytics 4
 * - Custom metrics
 * 
 * @module rum
 * @since Sprint 8
 */

// S8: RUM infrastructure (frontend)

/**
 * Inizializza RUM in produzione
 * 
 * Attivato solo se:
 * - import.meta.env.PROD === true
 * - VITE_FEATURE_RUM === 'true'
 * - VITE_SENTRY_DSN configurato
 */
export function initRUM(): void {
  const isProduction = import.meta.env.PROD;
  const isEnabled = import.meta.env.VITE_FEATURE_RUM === 'true';
  const hasDSN = !!import.meta.env.VITE_SENTRY_DSN;

  if (!isProduction || !isEnabled || !hasDSN) {
    console.info('[RUM] Disabled (dev mode or feature flag OFF)');
    return;
  }

  try {
    // Sentry Browser initialization (commented - requires npm install @sentry/react)
    /*
    import * as Sentry from '@sentry/react';
    import { BrowserTracing } from '@sentry/tracing';
    
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE || 'production',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Performance Monitoring
      integrations: [new BrowserTracing()],
      tracesSampleRate: 0.1, // 10% delle transazioni
      
      // Error Sampling
      sampleRate: 1.0, // 100% degli errori
      
      // Filtering
      beforeSend(event, hint) {
        // Filtra PII
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
      
      // Ignore errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    });
    
    console.info('[RUM] Sentry initialized');
    */

    console.info('[RUM] Ready (Sentry stub - install @sentry/react to activate)');
  } catch (error) {
    console.error('[RUM] Initialization failed:', error);
  }
}

/**
 * Traccia page view
 * 
 * @param pageName - Nome pagina
 * @param metadata - Metadata aggiuntivi
 */
export function trackPageView(pageName: string, metadata?: Record<string, unknown>): void {
  const isEnabled = import.meta.env.VITE_FEATURE_RUM === 'true';

  if (isEnabled) {
    console.info('[RUM] Page view:', { pageName, metadata });
    // Sentry.addBreadcrumb({ category: 'navigation', message: pageName, data: metadata });
  }
}

/**
 * Traccia user action
 * 
 * @param action - Nome azione
 * @param category - Categoria azione
 * @param metadata - Metadata aggiuntivi
 */
export function trackAction(
  action: string,
  category: string,
  metadata?: Record<string, unknown>
): void {
  const isEnabled = import.meta.env.VITE_FEATURE_RUM === 'true';

  if (isEnabled) {
    console.info('[RUM] Action:', { action, category, metadata });
    // Sentry.addBreadcrumb({ category, message: action, data: metadata });
  }
}

/**
 * Traccia performance metric
 * 
 * @param metricName - Nome metrica
 * @param value - Valore metrica
 * @param unit - Unità di misura
 */
export function trackMetric(metricName: string, value: number, unit: string = 'ms'): void {
  const isEnabled = import.meta.env.VITE_FEATURE_RUM === 'true';

  if (isEnabled) {
    console.info('[RUM] Metric:', { metricName, value, unit });
    // Sentry.setMeasurement(metricName, value, unit);
  }
}

/**
 * Traccia errore frontend
 * 
 * @param error - Errore da tracciare
 * @param context - Context aggiuntivo
 */
export function trackError(error: unknown, context?: Record<string, unknown>): void {
  const isEnabled = import.meta.env.VITE_FEATURE_RUM === 'true';

  if (isEnabled) {
    console.error('[RUM] Error:', { error, context });
    // Sentry.captureException(error, { extra: context });
  } else {
    console.error('[RUM] Error (not sent):', error);
  }
}

/**
 * Configura user context
 * 
 * @param userId - ID utente (anonimizzato)
 * @param metadata - Metadata aggiuntivi
 */
export function setUserContext(userId: string, metadata?: Record<string, unknown>): void {
  const isEnabled = import.meta.env.VITE_FEATURE_RUM === 'true';

  if (isEnabled) {
    console.info('[RUM] User context set:', { userId, metadata });
    // Sentry.setUser({ id: userId, ...metadata });
  }
}

/**
 * Pulisce user context
 */
export function clearUserContext(): void {
  const isEnabled = import.meta.env.VITE_FEATURE_RUM === 'true';

  if (isEnabled) {
    console.info('[RUM] User context cleared');
    // Sentry.setUser(null);
  }
}

/**
 * Health check RUM
 * 
 * @returns Status RUM
 */
export function getRUMStatus(): {
  enabled: boolean;
  provider: string;
  environment: string;
} {
  return {
    enabled: import.meta.env.VITE_FEATURE_RUM === 'true',
    provider: 'sentry-stub',
    environment: import.meta.env.MODE || 'development',
  };
}

/**
 * Traccia Web Vitals
 * 
 * Metriche Core Web Vitals:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 */
export function trackWebVitals(): void {
  const isEnabled = import.meta.env.VITE_FEATURE_RUM === 'true';

  if (!isEnabled) return;

  // Web Vitals tracking (requires web-vitals package)
  /*
  import { getCLS, getFID, getLCP } from 'web-vitals';
  
  getCLS((metric) => trackMetric('CLS', metric.value, 'score'));
  getFID((metric) => trackMetric('FID', metric.value, 'ms'));
  getLCP((metric) => trackMetric('LCP', metric.value, 'ms'));
  */

  console.info('[RUM] Web Vitals tracking ready (install web-vitals to activate)');
}
