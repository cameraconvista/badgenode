// Helper offline-queue estratto da timbratureRpc.ts
// Isola la logica di accodamento offline su errori di rete (comportamento invariato)

import { logTimbraturaDiag } from '@/lib/timbraturaDiagnostics';

/**
 * Tenta l'accodamento offline di una timbratura su errore di rete (protetto).
 * Replica esattamente la logica originariamente inline in insertTimbroServer:
 * rileva network error, verifica i flag offline, importa dinamicamente la queue
 * (con fallback al global __BADGENODE_QUEUE__) e chiama enqueuePending.
 *
 * Ritorna { queued: true, id: -1 } se accodato con successo.
 * In OGNI altro caso ritorna { queued: false }: il chiamante rilancia `throw error`
 * (errore originale), preservando il comportamento precedente.
 */
export async function tryEnqueueOffline(params: {
  pin: number;
  tipo: 'entrata' | 'uscita';
  error: unknown;
  traceId?: string;
}): Promise<{ queued: true; id: number } | { queued: false }> {
  const { pin, tipo, error, traceId } = params;

  // Try offline queue if enabled and this is a network error (protected)
  try {
    // Check if this is a network error that should trigger offline queue
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const isNetworkError = (
      error instanceof TypeError && error.message.includes('fetch') ||
      error instanceof TypeError && error.message.includes('Failed to fetch') ||
      (error as { code?: string })?.code === 'ERR_INTERNET_DISCONNECTED' ||
      (error as { name?: string })?.name === 'NetworkError' ||
      isOnline === false
    );

    if (isNetworkError) {
      // Try diagnostics first, then fallback to environment check
      const offline = (globalThis as { __BADGENODE_DIAG__?: { offline?: { enabled?: boolean; allowed?: boolean } } })?.__BADGENODE_DIAG__?.offline;
      let shouldQueue = false;

      if (offline?.enabled && offline?.allowed) {
        shouldQueue = true;
      } else {
        // Fallback: check environment directly if diagnostics not ready
        const queueEnabled = String(import.meta.env?.VITE_FEATURE_OFFLINE_QUEUE ?? 'false') === 'true';
        const isTestMode = String(import.meta.env?.MODE ?? '') === 'test';
        if (queueEnabled && !isTestMode) {
          shouldQueue = true;
          if (import.meta.env.DEV) {
            console.debug('[SERVICE] Using environment fallback for offline queue');
          }
        }
      }

      if (shouldQueue) {
        try {
          // Try dynamic import first, fallback to global queue if available
          let enqueuePending;
          try {
            const queueModule = await import('../offline/queue');
            enqueuePending = queueModule.enqueuePending;
          } catch {
            // Fallback: use pre-loaded queue from global diagnostics
            const globalQueue = (globalThis as { __BADGENODE_QUEUE__?: { enqueuePending?: (ev: { pin: number; tipo: 'entrata' | 'uscita' }) => Promise<unknown> } })?.__BADGENODE_QUEUE__;
            if (globalQueue?.enqueuePending) {
              enqueuePending = globalQueue.enqueuePending;
            } else {
              throw new Error('Queue module not available offline');
            }
          }

          await enqueuePending({
            pin,
            tipo
          });

          if (import.meta.env.DEV) {
            console.debug('[SERVICE] insertTimbroServer → queued offline', { pin, tipo });
          }
          logTimbraturaDiag('rpc.insertTimbroServer_result', {
            traceId,
            pin,
            tipo,
            source: 'timbrature-rpc',
            success: true,
            id: -1,
            mode: 'queued-offline',
          });

          // Return a synthetic success response for offline queue
          return { queued: true, id: -1 }; // Negative ID indicates queued
        } catch (queueError) {
          if (import.meta.env.DEV) {
            console.debug('[SERVICE] queue failed:', (queueError as Error)?.message);
          }
          // If queue fails, still return error to user (caller re-throws original error)
          return { queued: false };
        }
      }
    }
  } catch (offlineError) {
    if (import.meta.env.DEV) {
      console.debug('[SERVICE] offline queue failed:', (offlineError as Error)?.message);
    }
  }

  return { queued: false };
}
