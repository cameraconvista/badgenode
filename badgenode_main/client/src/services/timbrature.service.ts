// Servizio per gestione timbrature - SEMPLIFICATO: lettura diretta da public.timbrature
// Pairing e totali lato client, scrittura offline-first con insert diretto

import type { Timbratura } from '@/types/timbrature';
import { TimbratureStatsService, TimbratureStats } from './timbrature-stats.service';
import { supabase } from '@/lib/supabaseClient';
import { callInsertTimbro, callUpdateTimbro, UpdateTimbroParams } from './timbratureRpc';
import { isOfflineEnabled } from '@/offline/gating';
import { OfflineValidatorService } from './offline-validator.service';
import { getDeviceId } from '@/lib/deviceId';
// Offline queue now handled internally by callInsertTimbro
import { asError } from '@/lib/safeError';
import type { TimbraturaCanon, TimbratureRangeParams } from '../../../shared/types/timbrature';
import { logTimbraturaDiag } from '@/lib/timbraturaDiagnostics';
import { validatePinApi } from './timbrature.validate-pin';
import {
  normalizeTimbraResult,
  sortByCreatedAtDesc,
  toLegacyTimbratura,
} from './timbrature.service.helpers';

export interface TimbratureFilters {
  pin: number;
  dal: string;
  al: string;
}

// Interface moved to timbrature-stats.service.ts

export class TimbratureService {
  private static _lastSubmitMs = 0;

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
      return timbrature.map(toLegacyTimbratura);
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
      return timbrature.map(toLegacyTimbratura);
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
      return sortByCreatedAtDesc(timbrature)
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
  static async timbra(
    pin: number,
    tipo: 'entrata' | 'uscita',
    traceId?: string,
    options?: { skipValidation?: boolean },
  ): Promise<{ ok: boolean; code?: string; message?: string; id?: number }> {
    logTimbraturaDiag('service.timbra_start', {
      traceId,
      pin,
      tipo,
      source: 'timbrature-service',
      offlineEnabled: isOfflineEnabled(getDeviceId()),
    });
    // Pre-validazione PIN lato server senza toccare UI
    const shouldValidate = !(options?.skipValidation ?? false);
    const isValid = shouldValidate ? await validatePinApi(pin, tipo, traceId) : true;
    if (!isValid) {
      logTimbraturaDiag('service.timbra_blocked_invalid_pin', {
        traceId,
        pin,
        tipo,
        source: 'timbrature-service',
      });
      return { ok: false, code: 'PIN_NOT_FOUND', message: 'PIN non registrato' };
    }
    // Feature OFF → comportamento invariato
    if (!isOfflineEnabled(getDeviceId())) {
      const result = await callInsertTimbro({ pin, tipo, traceId });
      const { id } = normalizeTimbraResult(result);
      if (result.success && typeof id === 'number') {
        if (id > 0) {
          logTimbraturaDiag('service.timbra_result', {
            traceId,
            pin,
            tipo,
            source: 'timbrature-service',
            ok: true,
            id,
            mode: 'online-no-offline-feature',
          });
          return { ok: true, id }; // Success online
        } else if (id === -1) {
          logTimbraturaDiag('service.timbra_result', {
            traceId,
            pin,
            tipo,
            source: 'timbrature-service',
            ok: true,
            id,
            mode: 'queued-no-offline-feature',
          });
          return { ok: true, id: -1 }; // Success offline (queued even if feature disabled)
        }
      }
      logTimbraturaDiag('service.timbra_result', {
        traceId,
        pin,
        tipo,
        source: 'timbrature-service',
        ok: false,
        code: result.code,
        error: result.error,
        mode: 'online-no-offline-feature',
      });
      return { ok: false, code: result.code || 'SERVER_ERROR', message: result.error };
    }

    // Debounce minimo per evitare doppio tap ravvicinato (solo con flag ON)
    const now = Date.now();
    if (now - TimbratureService._lastSubmitMs < 600) {
      if (import.meta.env.DEV) console.debug('[offline:guard] debounce drop');
      logTimbraturaDiag('service.timbra_blocked_debounce', {
        traceId,
        pin,
        tipo,
        source: 'timbrature-service',
      });
      return { ok: false, code: 'DEBOUNCE_DROP' };
    }
    TimbratureService._lastSubmitMs = now;

    // AGGIUNTA: Validazione offline business logic (non-invasiva)
    try {
      const offlineValidation = await OfflineValidatorService.validateOfflineTimbratura(pin, tipo, traceId);
      if (!offlineValidation.valid) {
        if (import.meta.env.DEV) {
          console.debug('[offline:validation] Blocked:', offlineValidation.message);
        }
        logTimbraturaDiag('service.timbra_blocked_offline_validator', {
          traceId,
          pin,
          tipo,
          source: 'offline-validator',
          code: offlineValidation.code,
          message: offlineValidation.message,
        });
        return {
          ok: false,
          code: offlineValidation.code || 'VALIDATION_ERROR',
          message: offlineValidation.message || 'Validazione fallita'
        };
      }
    } catch (validationError) {
      // Fallback sicuro: se validazione offline fallisce per errori tecnici, permetti
      if (import.meta.env.DEV) {
        console.debug('[offline:validation] Error, allowing:', (validationError as Error)?.message);
      }
      logTimbraturaDiag('service.timbra_offline_validator_error_allow', {
        traceId,
        pin,
        tipo,
        source: 'offline-validator',
        error: (validationError as Error)?.message,
      });
    }

    // Unified flow - callInsertTimbro handles both online and offline fallback
    try {
      const result = await callInsertTimbro({ pin, tipo, traceId });
      const { id } = normalizeTimbraResult(result);
      if (result.success && typeof id === 'number') {
        if (id > 0) {
          // Success online - aggiorna cache per future validazioni offline
          void OfflineValidatorService.updateCacheAfterSuccess(pin, tipo);
          logTimbraturaDiag('service.timbra_result', {
            traceId,
            pin,
            tipo,
            source: 'timbrature-service',
            ok: true,
            id,
            mode: 'online',
          });
          return { ok: true, id }; // Success online
        } else if (id === -1) {
          // Success offline - aggiorna cache per future validazioni
          void OfflineValidatorService.updateCacheAfterSuccess(pin, tipo);
          logTimbraturaDiag('service.timbra_result', {
            traceId,
            pin,
            tipo,
            source: 'timbrature-service',
            ok: true,
            id,
            mode: 'queued-offline',
          });
          return { ok: true, id: -1 }; // Success offline (queued)
        }
      }
      logTimbraturaDiag('service.timbra_result', {
        traceId,
        pin,
        tipo,
        source: 'timbrature-service',
        ok: false,
        code: result.code,
        error: result.error,
        mode: 'online-or-offline-feature',
      });
      return { ok: false, code: result.code || 'SERVER_ERROR', message: result.error };
    } catch (e) {
      // Should not reach here as callInsertTimbro handles all fallbacks internally
      const errorMsg = e instanceof Error ? e.message : 'Errore sconosciuto';
      if (import.meta.env.DEV) console.debug('[offline:service] unexpected error:', errorMsg);
      logTimbraturaDiag('service.timbra_exception', {
        traceId,
        pin,
        tipo,
        source: 'timbrature-service',
        error: errorMsg,
      });
      return { ok: false, code: 'UNEXPECTED_ERROR', message: errorMsg };
    }
  }

  // Funzione per refresh storico dopo timbratura - SEMPLIFICATO: tabella diretta
  static async getById(_id: number): Promise<Timbratura | null> {
    try {
      const timbrature = await this.getTimbratureByRange({});

      // Ordina per created_at desc per compatibilità
      return sortByCreatedAtDesc(timbrature).find((t) => t.id === _id) || null;
    } catch (error) {
      throw error;
    }
  }
}
