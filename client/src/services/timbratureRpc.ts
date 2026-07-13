// Service RPC unico per timbrature BadgeNode
// Centralizza tutte le chiamate verso insert_timbro_v2

import { safeFetchJsonPost } from '@/lib/safeFetch';
import { isError } from '@/types/api';
import { logTimbraturaDiag } from '@/lib/timbraturaDiagnostics';
import { tryEnqueueOffline } from './timbratureRpc.offline';

// reserved: api-internal (non rimuovere senza migrazione)
// import type { TimbraturePayload, RpcResult } from '@/types/rpc';

// Tipi spostati in timbratureRpc.types.ts: import locale (usati come annotazioni qui)
// + re-export per compatibilita import esistenti da './timbratureRpc'
import type { InsertTimbroParams, InsertTimbroResult, UpdateTimbroParams, UpdateTimbroResult } from './timbratureRpc.types';
export type { InsertTimbroParams, InsertTimbroResult, UpdateTimbroParams, UpdateTimbroResult };

/**
 * Chiamata per inserimento timbrature via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS (risolve 401 Unauthorized)
 */
export async function callInsertTimbro({
  pin,
  tipo,
  client_event_id,
  traceId,
}: InsertTimbroParams): Promise<InsertTimbroResult> {
  try {
    logTimbraturaDiag('rpc.callInsertTimbro_start', {
      traceId,
      pin,
      tipo,
      source: 'timbrature-rpc',
      client_event_id: client_event_id ?? null,
    });
    // Usa il nuovo endpoint server invece della RPC diretta
    const result = await insertTimbroServer({ 
      pin: pin, 
      tipo: tipo.toLowerCase() as 'entrata'|'uscita',
      client_event_id,
      traceId,
    });
    // Considera successo se il server ha restituito un id valido (incluso -1 per offline)
    const id = (result as { id?: number })?.id;
    if (typeof id === 'number') {
      if (id > 0) {
        logTimbraturaDiag('rpc.callInsertTimbro_result', {
          traceId,
          pin,
          tipo,
          source: 'timbrature-rpc',
          success: true,
          id,
          mode: 'online',
        });
        return { success: true, data: result }; // Success online
      } else if (id === -1) {
        logTimbraturaDiag('rpc.callInsertTimbro_result', {
          traceId,
          pin,
          tipo,
          source: 'timbrature-rpc',
          success: true,
          id,
          mode: 'queued',
        });
        return { success: true, data: result }; // Success offline (queued)
      }
    }
    logTimbraturaDiag('rpc.callInsertTimbro_result', {
      traceId,
      pin,
      tipo,
      source: 'timbrature-rpc',
      success: false,
      code: 'NO_ID',
    });
    return { success: false, error: 'Nessun id restituito dal server', code: 'NO_ID' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    const code = (error as { code?: string })?.code || extractCodeFromMessage(message);
    logTimbraturaDiag('rpc.callInsertTimbro_result', {
      traceId,
      pin,
      tipo,
      source: 'timbrature-rpc',
      success: false,
      code,
      error: message,
    });
    return { success: false, error: message, code };
  }
}

/**
 * Crea nuova timbratura manuale dal Modale via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function createTimbroManual({ pin, tipo, giorno, ora, anchorDate }: {
  pin: number; 
  tipo: 'ENTRATA'|'USCITA'; 
  giorno: string; 
  ora: string;
  anchorDate?: string; // Data entrata per ancoraggio uscite notturne
}) {
  console.info('[SERVICE] createTimbroManual →', { pin, tipo, giorno, ora, anchorDate });
  
  try {
    const result = await safeFetchJsonPost<{ id: number }>('/api/timbrature/manual', { pin, tipo, giorno, ora, anchorDate });
    
    if (isError(result)) {
      throw new Error(result.error);
    }
    
    console.info('[SERVICE] createTimbroManual OK →', { 
      pin, 
      tipo, 
      giorno, 
      ora,
      id: result.data?.id 
    });
    return result; // { success, data }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVICE] createTimbroManual ERR →', { pin, tipo, giorno, ora, error: errorMsg });
    throw error;
  }
}

/**
 * Inserisce nuova timbratura via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 * Con fallback offline queue su errori di rete
 */
export async function insertTimbroServer({ pin, tipo, ts, client_event_id, traceId }: { pin: number; tipo: 'entrata'|'uscita'; ts?: string; client_event_id?: string; traceId?: string }): Promise<{ id: number }> {
  console.info('[SERVICE] insertTimbroServer →', { pin, tipo, ts, client_event_id });
  logTimbraturaDiag('rpc.insertTimbroServer_start', {
    traceId,
    pin,
    tipo,
    source: 'timbrature-rpc',
    ts: ts ?? null,
  });
  
  try {
    const result = await safeFetchJsonPost<{ id: number }>('/api/timbrature', { pin, tipo, ts, client_event_id }, {
      headers: traceId ? { 'x-badgenode-trace': traceId } : undefined,
    });
    
    if (isError(result)) {
      const err = new Error(result.error) as Error & { code?: string };
      if ((result as { code?: string }).code) err.code = (result as { code?: string }).code;
      logTimbraturaDiag('rpc.insertTimbroServer_result', {
        traceId,
        pin,
        tipo,
        source: 'timbrature-rpc',
        success: false,
        code: (result as { code?: string }).code,
        error: result.error,
      });
      throw err;
    }
    
    console.info('[SERVICE] insertTimbroServer OK →', { 
      pin, 
      tipo, 
      id: result.data?.id 
    });
    logTimbraturaDiag('rpc.insertTimbroServer_result', {
      traceId,
      pin,
      tipo,
      source: 'timbrature-rpc',
      success: true,
      id: result.data?.id,
    });
    return result.data; // Solo i dati, non l'ApiResponse wrapper
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    const code = (error as { code?: string })?.code;
    console.error('[SERVICE] insertTimbroServer ERR →', { pin, tipo, error: errorMsg, code });

    const offlineResult = await tryEnqueueOffline({ pin, tipo, error, traceId });
    if (offlineResult.queued) {
      return { id: offlineResult.id };
    }
    throw error;
  }
}

function extractCodeFromMessage(msg: string | undefined): string | undefined {
  if (!msg) return undefined;
  const m = msg.match(/\[([A-Z0-9_\-]+)\]/);
  return m?.[1];
}

// Funzioni CRUD (delete/update) spostate in timbratureRpc.crud.ts
// + re-export per compatibilita import esistenti da './timbratureRpc'
export { deleteTimbratureGiornata, callUpdateTimbro } from './timbratureRpc.crud';
