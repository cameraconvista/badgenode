// Servizio per gestione timbrature e storico
// TODO: Integrare con Supabase quando disponibile

import { Timbratura } from '@/lib/time';
import { TimbratureStatsService, TimbratureStats } from './timbrature-stats.service';
import { supabase } from '@/lib/supabaseClient';

// Minimal mock data for fallback (only PIN 7 for current user)
const mockTimbrature: Timbratura[] = [
  {
    id: 'mock-1',
    pin: 7,
    tipo: 'entrata',
    data: '2024-10-08',
    ore: '08:00:00',
    giornologico: '2024-10-08',
    nome: 'Mock',
    cognome: 'User',
    created_at: '2024-10-08T08:00:00Z'
  }
];

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
      console.log('📊 [Supabase] Caricamento timbrature per periodo:', filters);
      
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
        // Fallback to mock data if Supabase fails
        console.warn('📊 Fallback to mock data');
        return mockTimbrature.filter(t => {
          return t.pin === filters.pin &&
                 t.giornologico >= filters.dal &&
                 t.giornologico <= filters.al;
        }).sort((a, b) => {
          const dateCompare = a.giornologico.localeCompare(b.giornologico);
          if (dateCompare !== 0) return dateCompare;
          return a.ore.localeCompare(b.ore);
        });
      }

      console.log('✅ [Supabase] Timbrature caricate:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getTimbraturePeriodo:', error);
      // Fallback to mock data
      return mockTimbrature.filter(t => {
        return t.pin === filters.pin &&
               t.giornologico >= filters.dal &&
               t.giornologico <= filters.al;
      });
    }
  }

  // Ottieni timbrature per singolo giorno logico
  static async getTimbratureGiorno(pin: number, giornologico: string): Promise<Timbratura[]> {
    try {
      console.log('📊 [Supabase] Caricamento timbrature giorno:', { pin, giornologico });
      
      const { data, error } = await supabase
        .from('v_turni_giornalieri')
        .select('*')
        .eq('pin', pin)
        .eq('giornologico', giornologico)
        .order('ore', { ascending: true });

      if (error) {
        console.error('[Supabase] Error loading timbrature giorno:', error);
        // Fallback to mock data
        return mockTimbrature.filter(t => 
          t.pin === pin && t.giornologico === giornologico
        ).sort((a, b) => a.ore.localeCompare(b.ore));
      }

      console.log('✅ [Supabase] Timbrature giorno caricate:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getTimbratureGiorno:', error);
      // Fallback to mock data
      return mockTimbrature.filter(t => 
        t.pin === pin && t.giornologico === giornologico
      ).sort((a, b) => a.ore.localeCompare(b.ore));
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
      
      console.log('[Storico] loadStoricoRaw loaded:', data?.length || 0, 'records');
      return data ?? [];
    } catch (error) {
      console.error('❌ Error in loadStoricoRaw:', error);
      return [];
    }
  }

  // RPC: Inserisci timbratura via Supabase
  static async timbra(pin: number, tipo: 'entrata' | 'uscita', when?: string): Promise<void> {
    try {
      // Normalizza tipo
      const p_tipo = tipo?.toLowerCase() === 'uscita' ? 'uscita' : 'entrata';
      const p_ts = when || null;
      
      const args = { p_pin: pin, p_tipo, ...(p_ts && { p_ts }) };
      
      console.log('[Supabase RPC] insert_timbro args:', { ...args, p_ts: p_ts ?? '(default NOW on DB)' });
      
      const { data, error } = await supabase.rpc('insert_timbro', args);

      if (error) {
        console.error('[Supabase RPC ERROR insert_timbro]', error);
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          throw new Error('Non autorizzato: controlla PIN/ruolo');
        }
        throw error;
      }

      console.log('[Supabase RPC OK insert_timbro]', data);
    } catch (error) {
      console.error('❌ Errore timbratura:', error);
      throw error;
    }
  }
}
