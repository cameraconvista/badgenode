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
  updateData: Record<string, any>;
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
export async function callUpdateTimbro({ id, updateData }: { id: number; updateData: Record<string, any> }) {
  console.info('[SERVICE] callUpdateTimbro (ENDPOINT) →', { id, updateData });
  
  const res = await fetch(`/api/timbrature/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorMsg = err?.error ?? `PATCH /api/timbrature/${id} failed (${res.status})`;
    console.error('[SERVICE] update ERR →', { id, error: errorMsg });
    throw new Error(errorMsg);
  }
  
  const result = await res.json();
  console.info('[SERVICE] update OK →', { id, success: result.success });
  return result; // { success: true, data: { ... } }
}
