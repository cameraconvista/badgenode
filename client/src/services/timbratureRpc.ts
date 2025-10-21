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
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Crea nuova timbratura manuale dal Modale via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function createTimbroManual({ pin, tipo, giorno, ora }: {
  pin: number; 
  tipo: 'ENTRATA'|'USCITA'; 
  giorno: string; 
  ora: string;
}) {
  console.info('[SERVICE] createTimbroManual →', { pin, tipo, giorno, ora });
  
  try {
    const result = await safeFetchJsonPost<{ id: number }>('/api/timbrature/manual', { pin, tipo, giorno, ora });
    
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
 */
export async function insertTimbroServer({ pin, tipo, ts }: { pin: number; tipo: 'entrata'|'uscita'; ts?: string }): Promise<{ id: number }> {
  console.info('[SERVICE] insertTimbroServer →', { pin, tipo, ts });
  
  try {
    const result = await safeFetchJsonPost<{ id: number }>('/api/timbrature', { pin, tipo, ts });
    
    if (isError(result)) {
      throw new Error(result.error);
    }
    
    console.info('[SERVICE] insertTimbroServer OK →', { 
      pin, 
      tipo, 
      id: result.data?.id 
    });
    return result.data; // Solo i dati, non l'ApiResponse wrapper
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVICE] insertTimbroServer ERR →', { pin, tipo, error: errorMsg });
    throw error;
  }
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
      deletedCount: result.data.deleted_count 
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
