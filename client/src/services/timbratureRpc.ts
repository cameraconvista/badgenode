// Service RPC unico per timbrature BadgeNode
// Centralizza tutte le chiamate verso insert_timbro_v2

import { supabase } from '@/lib/supabaseClient';

export interface InsertTimbroParams {
  pin: number;
  tipo: 'entrata' | 'uscita';
  client_event_id?: string;
}

export interface InsertTimbroResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Chiamata RPC unica per inserimento timbrature
 * Usa la RPC insert_timbro_v2 con validazione PIN e logica business completa
 */
export async function callInsertTimbro({ 
  pin, 
  tipo, 
  client_event_id 
}: InsertTimbroParams): Promise<InsertTimbroResult> {
  try {
    console.log('🚀 [TimbratureRPC] callInsertTimbro:', { pin, tipo, client_event_id });
    
    const { data, error } = await supabase
      .rpc('insert_timbro_v2', {
        p_pin: pin,
        p_tipo: tipo
        // TODO: client_event_id sarà aggiunto in step futuri per gestione offline queue
      });

    if (error) {
      console.error('❌ [TimbratureRPC] RPC Error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ [TimbratureRPC] RPC Success:', data);
    return {
      success: true,
      data
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('❌ [TimbratureRPC] Catch Error:', message);
    return {
      success: false,
      error: message
    };
  }
}

// TODO: Gestione offline queue sarà implementata in step successivi
// - Retry automatico in caso di errore di rete
// - Coda locale con IndexedDB
// - Sincronizzazione quando torna online
