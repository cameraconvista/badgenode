// Servizio per gestione timbrature e storico
// TODO: Integrare con Supabase quando disponibile

import { Timbratura } from '@/lib/time';
import { TimbratureStatsService, TimbratureStats } from './timbrature-stats.service';
import { supabase } from '@/lib/supabaseClient';

// Empty mock data - database cleaned
const mockTimbrature: Timbratura[] = [];

export interface TimbratureFilters {
  pin: number;
  dal: string;
  al: string;
}

// Interface moved to timbrature-stats.service.ts

export class TimbratureService {
  // Ottieni timbrature per periodo (filtrate per giorno logico)
  static async getTimbraturePeriodo(filters: TimbratureFilters): Promise<Timbratura[]> {
    try {
      
      const { data, error } = await supabase
        .from('v_turni_giornalieri')
        .select('*')
        .eq('pin', filters.pin)
        .gte('giornologico', filters.dal)
        .lte('giornologico', filters.al)
        .order('giornologico', { ascending: true })
        .order('ore', { ascending: true });

      if (error) {
        console.error('[Supabase] Error loading timbrature:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getTimbraturePeriodo:', error);
      throw error;
    }
  }

  static async getTimbratureGiorno(pin: number, giornologico: string): Promise<Timbratura[]> {
    try {
      
      const { data, error } = await supabase
        .from('v_turni_giornalieri')
        .select('*')
        .eq('pin', pin)
        .eq('giornologico', giornologico)
        .order('ore', { ascending: true });

      if (error) {
        console.error('[Supabase] Error loading timbrature giorno:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getTimbratureGiorno:', error);
      throw error;
    }
  }

  // TODO: Implement Supabase CRUD operations for timbrature management
  static async updateTimbratura(id: string, input: { data: string; ore: string; dataEntrata?: string }): Promise<Timbratura> {
    throw new Error('updateTimbratura not implemented - use Supabase RPC functions');
  }

  static async deleteTimbratura(id: string): Promise<void> {
    throw new Error('deleteTimbratura not implemented - use Supabase RPC functions');
  }

  // Calcola statistiche periodo
  static async getStatsPeriodo(filters: TimbratureFilters, oreContrattuali: number): Promise<TimbratureStats> {
    const timbrature = await this.getTimbraturePeriodo(filters);
    return TimbratureStatsService.calculateStats(timbrature, oreContrattuali);
  }

  // DEBUG: Lettura diretta da tabella timbrature (per verificare inserimenti)
  static async loadStoricoRaw(pin?: number): Promise<any[]> {
    try {
      let query = supabase
        .from('timbrature')
        .select('id,pin,tipo,data,ore,giornologico,created_at')
        .order('created_at', { ascending: false });
      
      if (pin) {
        query = query.eq('pin', pin);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[Storico] loadStoricoRaw error:', error);
        throw error;
      }
      
      return data ?? [];
    } catch (error) {
      console.error('❌ Error in loadStoricoRaw:', error);
      return [];
    }
  }

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

  // Funzione per refresh storico dopo timbratura
  static async getTimbratureByPin(pin: number): Promise<any[]> {
    try {
      
      const { data, error } = await supabase
        .from('timbrature')
        .select('id,pin,tipo,data,ore,giornologico,created_at')
        .eq('pin', pin)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase] Error loading timbrature by PIN:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getTimbratureByPin:', error);
      throw error;
    }
  }
}
