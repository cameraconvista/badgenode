// Service RPC unico per timbrature BadgeNode
// Centralizza tutte le chiamate verso insert_timbro_v2

import { supabase } from '@/lib/supabaseClient';
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
  updateData: {
    data_locale?: string;
    ora_locale?: string;
    // Supporto per schema alternativo
    data?: string;
    ore?: string;
    [key: string]: any; // Per adattamento dinamico
  };
}

export interface UpdateTimbroResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Chiamata RPC unica per inserimento timbrature
 * Usa la RPC insert_timbro_v2 con validazione PIN e logica business completa
 */
export async function callInsertTimbro({
  pin,
  tipo,
  client_event_id,
}: InsertTimbroParams): Promise<InsertTimbroResult> {
  try {
    const { data, error } = await supabase.rpc('insert_timbro_v2', {
      p_pin: pin,
      p_tipo: tipo,
      p_client_event_id: client_event_id,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
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
 * Aggiorna timbratura esistente via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function callUpdateTimbro({
  id,
  updateData,
}: UpdateTimbroParams): Promise<UpdateTimbroResult> {
  try {
    console.info('[SERVICE] callUpdateTimbro (SERVER ENDPOINT) →', { id, updateData });
    
    // Verifica che ci siano campi da aggiornare
    if (!updateData || Object.keys(updateData).length === 0) {
      console.log('[SERVICE] update SKIP → updateData vuoto');
      return {
        success: true,
        data: [],
      };
    }

    // Chiama endpoint server con SERVICE_ROLE_KEY
    const url = `/api/timbrature/${id}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    console.info('[SERVICE] SERVER REQUEST →', {
      url,
      method: 'PATCH',
      body: updateData,
    });

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateData),
    });

    const result = await res.json().catch(() => ({ success: false, error: 'Invalid JSON response' }));
    
    console.info('[SERVICE] SERVER RESPONSE →', { 
      status: res.status, 
      success: result.success,
      data: result.data,
      error: result.error
    });

    if (!res.ok || !result.success) {
      const errorMsg = result.error || `Server error (${res.status})`;
      console.log('[SERVICE] update ERR →', { id, error: errorMsg });
      throw new Error(errorMsg);
    }

    console.log('[SERVICE] update OK →', { id, updated: !!result.data });
    return {
      success: true,
      data: result.data ? [result.data] : [],
    };
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.log('[SERVICE] update ERR →', { id, error: message });
    return {
      success: false,
      error: message,
    };
  }
}
