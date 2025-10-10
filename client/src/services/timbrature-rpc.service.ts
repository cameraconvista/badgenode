// Servizio per RPC timbrature Supabase
// Separato per rispettare governance 200 righe

import { supabase } from '@/lib/supabaseClient';

export class TimbratureRpcService {
  // RPC: Inserisci timbratura via Supabase (RETURNS bigint)
  static async timbra(pin: number, tipo: 'entrata' | 'uscita'): Promise<number> {
    try {
      // Normalizza tipo
      const p_tipo = tipo?.toLowerCase() === 'uscita' ? 'uscita' : 'entrata';
      
      // TENTATIVO 1: Nuova RPC v2 con alternanza corretta
      let { data, error } = await supabase.rpc('insert_timbro_v2', { 
        p_pin: pin, 
        p_tipo: p_tipo 
      });

      // FALLBACK: Se RPC v2 non esiste, usa quella legacy
      if (error && (error.code === '42883' || error.message.includes('function') || error.message.includes('does not exist'))) {
        console.warn('[RPC v2] Funzione non disponibile, fallback a legacy');
        const legacyResult = await supabase.rpc('insert_timbro_rpc', { 
          p_pin: pin, 
          p_tipo: p_tipo 
        });
        data = legacyResult.data;
        error = legacyResult.error;
      }

      if (error) {
        console.error('[Supabase RPC ERROR insert_timbro_rpc]', error);
        
        // Gestione errori user-friendly
        if (error.message.includes('PIN') && error.message.includes('inesistente')) {
          throw new Error('PIN non riconosciuto');
        }
        if (error.message.includes('due entrata consecutive')) {
          throw new Error('Hai già fatto entrata oggi');
        }
        if (error.message.includes('due uscita consecutive')) {
          throw new Error('Hai già fatto uscita');
        }
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          throw new Error('Non autorizzato');
        }
        
        // Errore generico
        throw new Error('Errore di sistema');
      }
      
      // RPC v2 ritorna table, v1 ritorna bigint
      if (Array.isArray(data) && data.length > 0) {
        return data[0].id; // RPC v2
      } else if (typeof data === 'number') {
        return data; // RPC v1 legacy
      }

      throw new Error('RPC: ritorno inatteso');
    } catch (error) {
      console.error('❌ Errore timbratura:', error);
      throw error;
    }
  }
}
