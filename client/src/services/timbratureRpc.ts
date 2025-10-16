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
 * Chiamata per inserimento timbrature via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS (risolve 401 Unauthorized)
 */
export async function callInsertTimbro({
  pin,
  tipo,
  client_event_id,
}: InsertTimbroParams): Promise<InsertTimbroResult> {
  try {
    console.log('[SERVICE] callInsertTimbro (SERVER ENDPOINT) →', { pin, tipo, client_event_id });
    
    // Usa il nuovo endpoint server invece della RPC diretta
    const result = await insertTimbroServer({ 
      pin, 
      tipo: tipo.toLowerCase() as 'entrata'|'uscita' 
    });

    console.log('[SERVICE] insert OK →', { pin, tipo, id: result.data?.id });
    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.log('[SERVICE] insert ERR →', { pin, tipo, error: message });
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
  
  const res = await fetch('/api/timbrature/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, tipo, giorno, ora }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorMsg = err?.error ?? `POST /api/timbrature/manual failed (${res.status})`;
    console.error('[SERVICE] createTimbroManual ERR →', { pin, tipo, giorno, ora, error: errorMsg });
    throw new Error(errorMsg);
  }
  
  const result = await res.json();
  console.info('[SERVICE] createTimbroManual OK →', { 
    pin, 
    tipo, 
    giorno, 
    ora,
    id: result.data?.id 
  });
  return result; // { success, data }
}

/**
 * Inserisce nuova timbratura via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function insertTimbroServer({ pin, tipo, ts }: { pin: number; tipo: 'entrata'|'uscita'; ts?: string }) {
  console.info('[SERVICE] insertTimbroServer →', { pin, tipo, ts });
  
  const res = await fetch('/api/timbrature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, tipo, ts }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorMsg = err?.error ?? `POST /api/timbrature failed (${res.status})`;
    console.error('[SERVICE] insertTimbroServer ERR →', { pin, tipo, error: errorMsg });
    throw new Error(errorMsg);
  }
  
  const result = await res.json();
  console.info('[SERVICE] insertTimbroServer OK →', { 
    pin, 
    tipo, 
    id: result.data?.id 
  });
  return result; // { success, data }
}

/**
 * Elimina tutte le timbrature di un giorno logico via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function deleteTimbratureGiornata({ pin, giorno }: { pin: number; giorno: string }) {
  console.info('[SERVICE] deleteTimbratureGiornata →', { pin, giorno });
  
  const url = `/api/timbrature/day?pin=${encodeURIComponent(pin)}&giorno=${encodeURIComponent(giorno)}`;
  const res = await fetch(url, { method: 'DELETE' });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const errorMsg = err?.error ?? `DELETE ${url} failed (${res.status})`;
    console.error('[SERVICE] deleteTimbratureGiornata ERR →', { pin, giorno, error: errorMsg });
    throw new Error(errorMsg);
  }
  
  const result = await res.json();
  console.info('[SERVICE] deleteTimbratureGiornata OK →', { 
    pin, 
    giorno, 
    deletedCount: result.deleted_count 
  });
  return result; // { success, deleted_count, ids, deleted_records }
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
