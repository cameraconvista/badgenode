// Servizio per gestione timbrature - SEMPLIFICATO: lettura diretta da public.timbrature
// Pairing e totali lato client, scrittura offline-first con insert diretto

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
  // SEMPLIFICATO - Lettura diretta da tabella public.timbrature
  static async getTimbratureByRange(params: TimbratureRangeParams): Promise<TimbraturaCanon[]> {
    try {
      let query = supabase
        .from('timbrature')
        .select('id, pin, tipo, created_at, data_locale, ora_locale, giorno_logico, ts_order, client_event_id');

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
        console.error('❌ [timbrature.service] getTimbratureByRange error (table direct):', {
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
  // LEGACY: Reindirizzato a tabella diretta
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

  // LEGACY: Reindirizzato a tabella diretta
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

  // DEBUG: Lettura da tabella diretta (fonte unica)
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

  // MIGRATO: Usa offline-first adapter con insert diretto
  static async timbra(pin: number, tipo: 'entrata' | 'uscita'): Promise<number> {
    // Importazione lazy per evitare dipendenze circolari
    const { timbratureSync } = await import('./timbrature-sync');
    const result = await timbratureSync.insertNowOrEnqueue({ pin, tipo });
    return result.ok ? 1 : 0; // 1 = sync immediato, 0 = accodato
  }

  // Funzione per refresh storico dopo timbratura - SEMPLIFICATO: tabella diretta
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
