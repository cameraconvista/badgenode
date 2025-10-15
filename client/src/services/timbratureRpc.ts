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
    
    // VERIFICA CRITICA: Il record esiste davvero?
    console.info('[SERVICE] SCHEMA CHECK →', { 
      id, 
      exists: existingData?.length > 0, 
      schema: existingData?.[0] ? Object.keys(existingData[0]) : [],
      record: existingData?.[0],
      fullResponse: existingData,
      checkUrl,
      checkStatus: checkRes.status
    });

    // Se il record non esiste nel GET, non esisterà nemmeno nel PATCH!
    if (!existingData || existingData.length === 0) {
      console.error('[SERVICE] RECORD NON TROVATO →', { 
        id, 
        checkUrl, 
        status: checkRes.status,
        message: 'Record inesistente o non accessibile con credenziali attuali'
      });
      
      // Verifica se esistono altri record nella tabella
      const allUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/timbrature?limit=5&select=id,tipo,data_locale,ora_locale`;
      const allRes = await fetch(allUrl, { headers: checkHeaders });
      const allData = await allRes.json().catch(() => []);
      console.info('[SERVICE] ALTRI RECORD →', { 
        count: allData?.length || 0, 
        records: allData?.map((r: any) => ({ id: r.id, tipo: r.tipo })) || []
      });
    }
    
    // Log dettagliato per debug
    if (existingData?.[0]) {
      const record = existingData[0];
      console.info('[SERVICE] RECORD FIELDS →', {
        hasDataLocale: 'data_locale' in record,
        hasData: 'data' in record,
        hasOraLocale: 'ora_locale' in record,
        hasOre: 'ore' in record,
        dataLocaleValue: record.data_locale,
        dataValue: record.data,
        oraLocaleValue: record.ora_locale,
        oreValue: record.ore,
        allFields: Object.keys(record)
      });
    }

    if (!existingData || existingData.length === 0) {
      throw new Error(`Record id=${id} non trovato nella tabella timbrature`);
    }

    // Adatta updateData ai campi reali della tabella
    const record = existingData[0];
    let adaptedUpdateData: any = {};
    
    console.info('[SERVICE] ADAPTATION LOGIC →', {
      originalUpdateData: updateData,
      recordHasDataLocale: 'data_locale' in record,
      recordHasData: 'data' in record,
      recordHasOraLocale: 'ora_locale' in record,
      recordHasOre: 'ore' in record
    });
    
    // Mappa data_locale → data se necessario
    if (updateData.data_locale) {
      if ('data_locale' in record) {
        adaptedUpdateData.data_locale = updateData.data_locale;
        console.info('[SERVICE] MAPPING → data_locale (field exists)');
      } else if ('data' in record) {
        adaptedUpdateData.data = updateData.data_locale;
        console.info('[SERVICE] MAPPING → data_locale → data');
      }
    }
    
    // Mappa ora_locale → ore se necessario  
    if (updateData.ora_locale) {
      if ('ora_locale' in record) {
        adaptedUpdateData.ora_locale = updateData.ora_locale;
        console.info('[SERVICE] MAPPING → ora_locale (field exists)');
      } else if ('ore' in record) {
        adaptedUpdateData.ore = updateData.ora_locale;
        console.info('[SERVICE] MAPPING → ora_locale → ore');
      }
    }

    console.info('[SERVICE] ADAPTED updateData →', { 
      original: updateData, 
      adapted: adaptedUpdateData,
      adaptedKeys: Object.keys(adaptedUpdateData),
      isEmpty: Object.keys(adaptedUpdateData).length === 0
    });

    // Verifica che ci siano campi da aggiornare dopo adattamento
    if (Object.keys(adaptedUpdateData).length === 0) {
      console.log('[SERVICE] update SKIP → adaptedUpdateData vuoto dopo mapping');
      throw new Error(`Nessun campo valido da aggiornare per id=${id}. Schema mismatch?`);
    }

    // TENTATIVO 1: PATCH normale per ID
    let url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/timbrature?id=eq.${id}`;
    const headers = {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    console.info('[SERVICE] PATCH REQUEST (TENTATIVO 1) →', {
      url,
      method: 'PATCH',
      body: adaptedUpdateData,
      headers: { ...headers, Authorization: '[HIDDEN]' },
      recordIdFromGet: existingData?.[0]?.id,
      idMatch: existingData?.[0]?.id === id
    });

    let res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(adaptedUpdateData),
    });

    let data = await res.json().catch(() => []);
    console.info('[SERVICE] PATCH response (TENTATIVO 1) →', { status: res.status, rows: data?.length || 0, data });

    // Se TENTATIVO 1 fallisce (rows=0), prova TENTATIVO 2 con filtri multipli
    if (res.ok && (!data || data.length === 0)) {
      const record = existingData[0];
      const multiFilterUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/timbrature?id=eq.${id}&tipo=eq.${record.tipo}&pin=eq.${record.pin}`;
      
      console.info('[SERVICE] PATCH REQUEST (TENTATIVO 2 - filtri multipli) →', {
        url: multiFilterUrl,
        filters: { id, tipo: record.tipo, pin: record.pin }
      });

      res = await fetch(multiFilterUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(adaptedUpdateData),
      });

      data = await res.json().catch(() => []);
      console.info('[SERVICE] PATCH response (TENTATIVO 2) →', { status: res.status, rows: data?.length || 0, data });
    }

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
