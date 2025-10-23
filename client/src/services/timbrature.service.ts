// Servizio per gestione timbrature - SEMPLIFICATO: lettura diretta da public.timbrature
// Pairing e totali lato client, scrittura offline-first con insert diretto

import type { Timbratura } from '@/types/timbrature';
import { TimbratureStatsService, TimbratureStats } from './timbrature-stats.service';
import { supabase } from '@/lib/supabaseClient';
import { callInsertTimbro, callUpdateTimbro, UpdateTimbroParams } from './timbratureRpc';
import { isOfflineEnabled } from '@/offline/gating';
import { getDeviceId } from '@/lib/deviceId';
import { buildBaseItem, enqueue } from '@/offline/queue';
import { runSyncOnce } from '@/offline/syncRunner';
import { asError } from '@/lib/safeError';
import { safeFetchJson } from '@/lib/safeFetch';
import { isError } from '@/types/api';
import type { TimbraturaCanon, TimbratureRangeParams } from '../../../shared/types/timbrature';

export interface TimbratureFilters {
  pin: number;
  dal: string;
  al: string;
}

// Interface moved to timbrature-stats.service.ts

export class TimbratureService {
  private static _lastSubmitMs = 0;
  private static async validatePinApi(pin: number): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        // Offline: non bloccare la coda offline
        return true;
      }
      const resp = await safeFetchJson<{ ok: boolean }>(`/api/pin/validate?pin=${encodeURIComponent(pin)}`);
      // 4xx: safeFetchJson returns { success:false, status, message }
      if (isError(resp)) {
        if (import.meta.env.DEV) {
          console.debug('[pin] PIN non registrato');
        }
        return false;
      }
      return resp.data?.ok === true;
    } catch (e) {
      // network/5xx → considerare non valido per ora (non bloccare crash UI)
      if (import.meta.env.DEV) console.debug('[pin] validate error', (e as Error).message);
      return false;
    }
  }
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
      } else if (params.to) {
        query = query.lte('giorno_logico', params.to);
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
    // Pre-validazione PIN lato server senza toccare UI
    const isValid = await TimbratureService.validatePinApi(pin);
    if (!isValid) {
      // PIN non registrato o errore 4xx → non procedere
      return 0;
    }
    // Feature OFF → comportamento invariato
    if (!isOfflineEnabled(getDeviceId())) {
      const result = await callInsertTimbro({ pin, tipo });
      return result.success ? 1 : 0;
    }

    // Debounce minimo per evitare doppio tap ravvicinato (solo con flag ON)
    const now = Date.now();
    if (now - TimbratureService._lastSubmitMs < 600) {
      if (import.meta.env.DEV) console.debug('[offline:guard] debounce drop');
      return 0;
    }
    TimbratureService._lastSubmitMs = now;

    // Se siamo online, prova percorso attuale
    if (navigator.onLine === true) {
      try {
        const result = await callInsertTimbro({ pin, tipo });
        if (result.success) return 1;
        // se fallisce per motivi non di rete, restituisci 0 (comportamento attuale)
        return 0;
      } catch (e) {
        // errore fetch/timeout → fallback offline
        if (import.meta.env.DEV) console.debug('[offline:fallback] network error → queue');
      }
    }

    // Offline o errore rete → enqueue
    try {
      const base = buildBaseItem(pin, tipo);
      await enqueue(base);
      // Fire-and-forget: tenta una sync se torna la rete
      void runSyncOnce();
      if (import.meta.env.DEV) console.debug('[offline:enqueue] queued');
      // Considera l'operazione accettata lato client
      return 1;
    } catch (e) {
      if (import.meta.env.DEV) console.debug('[offline:enqueue] failed', (e as Error).message);
      return 0;
    }
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
