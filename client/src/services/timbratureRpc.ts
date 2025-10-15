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
 * Aggiorna timbratura esistente via PATCH REST diretta (FORCED TEST)
 * Bypassa il wrapper Supabase per verifica finale
 */
export async function callUpdateTimbro({
  id,
  updateData,
}: UpdateTimbroParams): Promise<UpdateTimbroResult> {
  try {
    console.info('[SERVICE] callUpdateTimbro (FORCED PATCH) →', { id, updateData });
    
    // Verifica che ci siano campi da aggiornare
    if (!updateData || Object.keys(updateData).length === 0) {
      console.log('[SERVICE] update SKIP → updateData vuoto');
      return {
        success: true,
        data: [],
      };
    }

    // Prima verifica schema e record esistente
    const checkUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/timbrature?id=eq.${id}&select=*`;
    const checkHeaders = {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };

    const checkRes = await fetch(checkUrl, { headers: checkHeaders });
    const existingData = await checkRes.json().catch(() => []);
    console.info('[SERVICE] SCHEMA CHECK →', { 
      id, 
      exists: existingData?.length > 0, 
      schema: existingData?.[0] ? Object.keys(existingData[0]) : [],
      record: existingData?.[0]
    });

    if (!existingData || existingData.length === 0) {
      throw new Error(`Record id=${id} non trovato nella tabella timbrature`);
    }

    // Adatta updateData ai campi reali della tabella
    const record = existingData[0];
    let adaptedUpdateData = { ...updateData };
    
    // Se la tabella usa 'data' invece di 'data_locale'
    if ('data' in record && !('data_locale' in record)) {
      if (updateData.data_locale) {
        adaptedUpdateData = { ...adaptedUpdateData, data: updateData.data_locale };
        delete adaptedUpdateData.data_locale;
      }
    }
    
    // Se la tabella usa 'ore' invece di 'ora_locale'
    if ('ore' in record && !('ora_locale' in record)) {
      if (updateData.ora_locale) {
        adaptedUpdateData = { ...adaptedUpdateData, ore: updateData.ora_locale };
        delete adaptedUpdateData.ora_locale;
      }
    }

    console.info('[SERVICE] ADAPTED updateData →', { original: updateData, adapted: adaptedUpdateData });

    // PATCH REST diretta verso Supabase
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/timbrature?id=eq.${id}`;
    const headers = {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(adaptedUpdateData),
    });

    const data = await res.json().catch(() => []);
    console.info('[SERVICE] PATCH response →', { status: res.status, rows: data?.length || 0, data });

    if (!res.ok) {
      console.log('[SERVICE] update ERR →', { id, error: `PATCH Supabase (${res.status})` });
      throw new Error(`Errore PATCH Supabase (${res.status})`);
    }
    
    if (!data || data.length === 0) {
      console.log('[SERVICE] update ERR →', { id, error: `nessuna riga aggiornata (id=${id})` });
      throw new Error(`Update fallito: nessuna riga aggiornata (id=${id})`);
    }

    console.log('[SERVICE] update OK →', { id, rows: data?.length });
    return {
      success: true,
      data,
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
