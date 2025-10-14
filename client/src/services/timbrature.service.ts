// Servizio per gestione timbrature - SEMPLIFICATO: lettura diretta da public.timbrature
// Pairing e totali lato client, scrittura offline-first con insert diretto

import type { Timbratura } from '@/types/timbrature';
import { TimbratureStatsService, TimbratureStats } from './timbrature-stats.service';
import { supabase } from '@/lib/supabaseClient';
import { callInsertTimbro, callUpdateTimbro, UpdateTimbroParams } from './timbratureRpc';
import { asError } from '@/lib/safeError';
import type { TimbraturaCanon, TimbratureRangeParams } from '../../../shared/types/timbrature';

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
        .select(
          'id, pin, tipo, created_at, data_locale, ora_locale, giorno_logico, ts_order, client_event_id'
        );

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
        throw error;
      }

      return data || [];
    } catch (error) {
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
        to: filters.al,
      });

      // Converti al formato legacy per compatibilità
      return timbrature.map((t) => ({
        id: t.id,
        pin: t.pin,
        tipo: t.tipo,
        data_locale: t.data_locale,
        ora_locale: t.ora_locale,
        giorno_logico: t.giorno_logico,
        ts_order: t.ts_order,
        nome: '',
        cognome: '',
        created_at: t.created_at,
      }));
    } catch (error) {
      throw error;
    }
  }

  // LEGACY: Reindirizzato a tabella diretta
  static async getTimbratureGiorno(pin: number, giorno_logico: string): Promise<Timbratura[]> {
    try {
      // Reindirizza al nuovo sistema
      const timbrature = await this.getTimbratureByRange({
        pin,
        from: giorno_logico,
      });

      // Converti al formato legacy per compatibilità
      return timbrature.map((t) => ({
        id: t.id,
        pin: t.pin,
        tipo: t.tipo,
        data_locale: t.data_locale,
        ora_locale: t.ora_locale,
        giorno_logico: t.giorno_logico,
        ts_order: t.ts_order,
        nome: '',
        cognome: '',
        created_at: t.created_at,
      }));
    } catch (error) {
      throw error;
    }
  }

  // CRUD operations
  static async updateTimbratura(params: UpdateTimbroParams): Promise<void> {
    const result = await callUpdateTimbro(params);
    if (!result.success) {
      throw new Error(result.error || 'Errore durante aggiornamento timbratura');
    }
  }

  static async deleteById(_id: number, _input: unknown): Promise<void> {
    void _id; void _input;
    throw new Error('deleteTimbratura not implemented - use Supabase RPC functions');
  }

  // Calcola statistiche periodo
  static async getStatsPeriodo(
    filters: TimbratureFilters,
    oreContrattuali: number
  ): Promise<TimbratureStats> {
    const timbrature = await this.getTimbraturePeriodo(filters);
    return TimbratureStatsService.calculateStats(timbrature, oreContrattuali);
  }

  // DEBUG: Lettura da tabella diretta (fonte unica)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- debug function returns raw data
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
        .map((t) => ({
          id: t.id,
          pin: t.pin,
          tipo: t.tipo,
          data_locale: t.data_locale,
          ora_locale: t.ora_locale,
          giorno_logico: t.giorno_logico,
          created_at: t.created_at,
        }));
    } catch (e) {
      const err = asError(e);
      console.error('[BadgeNode] Error loading timbrature:', err.message);
      return [];
    }
  }

  // REFACTOR: Usa RPC unico centralizzato
  static async timbra(pin: number, tipo: 'entrata' | 'uscita'): Promise<number> {
    const result = await callInsertTimbro({ pin, tipo });
    return result.success ? 1 : 0; // 1 = successo, 0 = errore
  }

  // Funzione per refresh storico dopo timbratura - SEMPLIFICATO: tabella diretta
  static async getById(_id: number): Promise<Timbratura | null> {
    try {
      const timbrature = await this.getTimbratureByRange({});

      // Ordina per created_at desc per compatibilità
      return timbrature
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .find((t) => t.id === _id) || null;
    } catch (error) {
      throw error;
    }
  }
}
