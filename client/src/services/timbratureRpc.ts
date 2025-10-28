// Service RPC unico per timbrature BadgeNode
// Centralizza tutte le chiamate verso insert_timbro_v2

import { safeFetchJsonPost, safeFetchJsonPatch, safeFetchJsonDelete } from '@/lib/safeFetch';
import { isError, type DeleteResult } from '@/types/api';
import type { Timbratura, TimbratureUpdate } from '../../../shared/types/database';

// reserved: api-internal (non rimuovere senza migrazione)
// import type { TimbraturePayload, RpcResult } from '@/types/rpc';

export interface InsertTimbroParams {
  pin: number;
  tipo: 'entrata' | 'uscita';
  client_event_id?: string;
}

export interface InsertTimbroResult {
  success: boolean;
  data?: unknown;
  error?: string;
  code?: string;
}

export interface UpdateTimbroParams {
  id: number;
  updateData: Partial<TimbratureUpdate>;
}

export interface UpdateTimbroResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Chiamata per inserimento timbrature via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS (risolve 401 Unauthorized)
 */
export async function callInsertTimbro({
  pin,
  tipo,
  client_event_id,
}: InsertTimbroParams): Promise<InsertTimbroResult> {
  try {
    // Usa il nuovo endpoint server invece della RPC diretta
    const result = await insertTimbroServer({ 
      pin: pin, 
      tipo: tipo.toLowerCase() as 'entrata'|'uscita' 
    });
    // Considera successo se il server ha restituito un id valido (incluso -1 per offline)
    const id = (result as any)?.id;
    if (typeof id === 'number') {
      if (id > 0) {
        return { success: true, data: result }; // Success online
      } else if (id === -1) {
        return { success: true, data: result }; // Success offline (queued)
      }
    }
    return { success: false, error: 'Nessun id restituito dal server', code: 'NO_ID' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    const code = (error as any)?.code || extractCodeFromMessage(message);
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
export async function insertTimbroServer({ pin, tipo, ts }: { pin: number; tipo: 'entrata'|'uscita'; ts?: string }): Promise<{ id: number }> {
  console.info('[SERVICE] insertTimbroServer →', { pin, tipo, ts });
  
  try {
    const result = await safeFetchJsonPost<{ id: number }>('/api/timbrature', { pin, tipo, ts });
    
    if (isError(result)) {
      const err: any = new Error(result.error);
      if ((result as any).code) err.code = (result as any).code;
      throw err;
    }
    
    console.info('[SERVICE] insertTimbroServer OK →', { 
      pin, 
      tipo, 
      id: result.data?.id 
    });
    return result.data; // Solo i dati, non l'ApiResponse wrapper
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    const code = (error as any)?.code;
    console.error('[SERVICE] insertTimbroServer ERR →', { pin, tipo, error: errorMsg, code });
    
    // Try offline queue if enabled and this is a network error (protected)
    try {
      // Check if this is a network error that should trigger offline queue
      const isNetworkError = (
        error instanceof TypeError && error.message.includes('fetch') ||
        error instanceof TypeError && error.message.includes('Failed to fetch') ||
        (error as any)?.code === 'ERR_INTERNET_DISCONNECTED' ||
        (error as any)?.name === 'NetworkError' ||
        !navigator.onLine
      );
      
      if (isNetworkError) {
        const offline = (globalThis as any)?.__BADGENODE_DIAG__?.offline;
        if (offline?.enabled && offline?.allowed) {
          const { enqueuePending } = await import('../offline/queue');
          await enqueuePending({ 
            pin, 
            tipo
          });
          
          if (import.meta.env.DEV) {
            console.debug('[SERVICE] insertTimbroServer → queued offline', { pin, tipo });
          }
          
          // Return a synthetic success response for offline queue
          return { id: -1 }; // Negative ID indicates queued
        }
      }
    } catch (offlineError) {
      if (import.meta.env.DEV) {
        console.debug('[SERVICE] offline queue failed:', (offlineError as Error)?.message);
      }
    }
    
    throw error;
  }
}

function extractCodeFromMessage(msg: string | undefined): string | undefined {
  if (!msg) return undefined;
  const m = msg.match(/\[([A-Z0-9_\-]+)\]/);
  return m?.[1];
}

/**
 * Elimina tutte le timbrature di un giorno logico via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function deleteTimbratureGiornata({ pin, giorno }: { pin: number; giorno: string }) {
  console.info('[SERVICE] deleteTimbratureGiornata →', { pin, giorno });
  
  try {
    const result = await safeFetchJsonDelete<DeleteResult>('/api/timbrature/day', { 
      pin: String(pin), 
      giorno 
    });
    
    if (isError(result)) {
      throw new Error(result.error);
    }
    
    console.info('[SERVICE] deleteTimbratureGiornata OK →', { 
      pin, 
      giorno, 
      deletedCount: (result as any)?.deleted_count ?? 0 
    });
    return result; // { success, deleted_count, ids, deleted_records }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVICE] deleteTimbratureGiornata ERR →', { pin, giorno, error: errorMsg });
    throw error;
  }
}

/**
 * Aggiorna timbratura esistente via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function callUpdateTimbro({ id, updateData }: { id: number; updateData: Partial<TimbratureUpdate> }) {
  console.info('[SERVICE] callUpdateTimbro (ENDPOINT) →', { id, updateData });
  
  try {
    const result = await safeFetchJsonPatch(`/api/timbrature/${id}`, updateData);
    
    console.info('[SERVICE] update OK →', { id, success: result.success });
    return result; // { success: true, data: { ... } }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVICE] update ERR →', { id, error: errorMsg });
    throw error;
  }
}
