// Servizio per RPC timbrature Supabase
// MIGRATO a offline-first adapter con coda locale

import { supabase } from '@/lib/supabaseClient';
import { timbratureSync } from './timbrature-sync';

export class TimbratureRpcService {
  // MIGRATO: Usa offline-first adapter con coda locale
  static async timbra(pin: number, tipo: 'entrata' | 'uscita'): Promise<number> {
    try {
      const result = await timbratureSync.insertNowOrEnqueue({ pin, tipo });
      
      // Per compatibilità con API esistente, ritorna un ID fittizio
      // Il vero ID sarà assegnato dal database quando sincronizzato
      return result.ok ? 1 : 0; // 1 = sync immediato, 0 = accodato
      
    } catch (error) {
      console.error('❌ Errore timbratura offline-first:', error);
      throw error;
    }
  }

  // LEGACY: Mantiene RPC diretta per casi speciali
  static async timbraDirectRPC(pin: number, tipo: 'entrata' | 'uscita'): Promise<number> {
    try {
      const p_tipo = tipo?.toLowerCase() === 'uscita' ? 'uscita' : 'entrata';
      
      // Tentativo RPC v2
      let { data, error } = await supabase.rpc('insert_timbro_v2', { 
        p_pin: pin, 
        p_tipo: p_tipo 
      });

      // Fallback RPC v1
      if (error && (error.code === '42883' || error.message.includes('function'))) {
        console.warn('[RPC v2] Fallback a legacy');
        const legacyResult = await supabase.rpc('insert_timbro_rpc', { 
          p_pin: pin, 
          p_tipo: p_tipo 
        });
        data = legacyResult.data;
        error = legacyResult.error;
      }

      if (error) {
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
        throw new Error('Errore di sistema');
      }
      
      return Array.isArray(data) && data.length > 0 ? data[0].id : (data || 0);
    } catch (error) {
      console.error('❌ Errore RPC diretta:', error);
      throw error;
    }
  }
}
