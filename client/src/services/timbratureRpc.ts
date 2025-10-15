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
      body: JSON.stringify(updateData),
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
