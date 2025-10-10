// Servizio per gestione timbrature - Data source unica: public.v_timbrature_canon
// Migrazione completata: pairing e totali lato client

import { Timbratura } from '@/lib/time';
import { TimbratureStatsService, TimbratureStats } from './timbrature-stats.service';
import { supabase } from '@/lib/supabaseClient';
import type { 
  TimbraturaCanon, 
  TimbratureRangeParams 
} from '../../../shared/types/timbrature';

export interface TimbratureFilters {
  pin: number;
  dal: string;
  al: string;
}

// Interface moved to timbrature-stats.service.ts

export class TimbratureService {
  // NUOVA FUNZIONE PRINCIPALE - Data source unica: public.v_timbrature_canon
  static async getTimbratureByRange(params: TimbratureRangeParams): Promise<TimbraturaCanon[]> {
    try {
      let query = supabase
        .from('v_timbrature_canon')
        .select('id, pin, tipo, created_at, data_locale, ora_locale, giorno_logico, ts_order');

      // Filtri
      if (params.pin) {
        query = query.eq('pin', params.pin);
      }
      
      if (params.from && params.to) {
        query = query.gte('giorno_logico', params.from).lte('giorno_logico', params.to);
      } else if (params.from) {
        query = query.eq('giorno_logico', params.from);
      }

      // Ordinamento per ts_order
      query = query.order('ts_order', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('❌ [timbrature.service] getTimbratureByRange error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getTimbratureByRange:', error);
      throw error;
    }
  }
  // LEGACY: Reindirizzato a v_timbrature_canon
  static async getTimbraturePeriodo(filters: TimbratureFilters): Promise<Timbratura[]> {
    try {
      // Reindirizza al nuovo sistema
      const timbrature = await this.getTimbratureByRange({
        pin: filters.pin,
        from: filters.dal,
        to: filters.al
      });
      
      // Converti al formato legacy per compatibilità
      return timbrature.map(t => ({
        id: t.id.toString(),
        pin: t.pin,
        tipo: t.tipo,
        data: t.data_locale,
        ore: t.ora_locale,
        giornologico: t.giorno_logico,
        nome: '', // TODO: join con tabella utenti se necessario
        cognome: '', // TODO: join con tabella utenti se necessario
        created_at: t.created_at
      }));
    } catch (error) {
      console.error('❌ Error in getTimbraturePeriodo:', error);
      throw error;
    }
  }

  // LEGACY: Reindirizzato a v_timbrature_canon
  static async getTimbratureGiorno(pin: number, giornologico: string): Promise<Timbratura[]> {
    try {
      // Reindirizza al nuovo sistema
      const timbrature = await this.getTimbratureByRange({
        pin,
        from: giornologico
      });
      
      // Converti al formato legacy per compatibilità
      return timbrature.map(t => ({
        id: t.id.toString(),
        pin: t.pin,
        tipo: t.tipo,
        data: t.data_locale,
        ore: t.ora_locale,
        giornologico: t.giorno_logico,
        nome: '', // TODO: join con tabella utenti se necessario
        cognome: '', // TODO: join con tabella utenti se necessario
        created_at: t.created_at
      }));
    } catch (error) {
      console.error('❌ Error in getTimbratureGiorno:', error);
      throw error;
    }
  }

  // CRUD operations: TODO - use Supabase RPC functions
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

  // DEBUG: Lettura da v_timbrature_canon (fonte unica)
  static async loadStoricoRaw(pin?: number): Promise<any[]> {
    try {
      const params: TimbratureRangeParams = {};
      if (pin) {
        params.pin = pin;
      }
      
      const timbrature = await this.getTimbratureByRange(params);
      
      // Ordina per created_at desc per compatibilità
      return timbrature
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(t => ({
          id: t.id,
          pin: t.pin,
          tipo: t.tipo,
          data: t.data_locale,
          ore: t.ora_locale,
          giornologico: t.giorno_logico,
          created_at: t.created_at
        }));
    } catch (error) {
      console.error('❌ Error in loadStoricoRaw:', error);
      return [];
    }
  }

  // RPC: Inserisci timbratura via Supabase - vedi timbrature-rpc.service.ts
  static async timbra(pin: number, tipo: 'entrata' | 'uscita'): Promise<number> {
    // Importazione lazy per evitare dipendenze circolari
    const { TimbratureRpcService } = await import('./timbrature-rpc.service');
    return TimbratureRpcService.timbra(pin, tipo);
  }

  // Funzione per refresh storico dopo timbratura - MIGRATO a v_timbrature_canon
  static async getTimbratureByPin(pin: number): Promise<any[]> {
    try {
      const timbrature = await this.getTimbratureByRange({ pin });
      
      // Ordina per created_at desc per compatibilità
      return timbrature
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(t => ({
          id: t.id,
          pin: t.pin,
          tipo: t.tipo,
          data: t.data_locale,
          ore: t.ora_locale,
          giornologico: t.giorno_logico,
          created_at: t.created_at
        }));
    } catch (error) {
      console.error('❌ Error in getTimbratureByPin:', error);
      throw error;
    }
  }
}
