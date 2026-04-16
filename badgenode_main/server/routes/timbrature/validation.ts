// Validazione alternanza per timbrature
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { computeGiornoLogico } from '../../shared/time/computeGiornoLogico';
import type { ValidationResult } from './types';
import { log } from '../../lib/logger';

/**
 * Valida alternanza con logica di ancoraggio per turni notturni
 */
export async function validateAlternanza(
  pin: number,
  tipo: 'entrata' | 'uscita',
  data: string,
  ora: string,
  anchorDate?: string,
  traceId?: string
): Promise<ValidationResult> {
  if (!supabaseAdmin) {
    return {
      success: false,
      error: 'Supabase admin client non disponibile',
      code: 'INTERNAL_ERROR'
    };
  }

  // Calcola giorno logico usando la funzione unificata
  const { giorno_logico } = computeGiornoLogico({
    data,
    ora,
    tipo,
    dataEntrata: anchorDate
  });

  log.info({
    traceId,
    pin,
    tipo,
    data,
    ora,
    giorno_logico,
    anchorDate: anchorDate ?? null,
    route: 'timbrature:validation',
  }, 'diagnostic validation start');

  // Trova ultimo timbro sul giorno logico ancorato
  const { data: lastTimbros, error: queryError } = await supabaseAdmin
    .from('timbrature')
    .select('tipo, data_locale, ora_locale')
    .eq('pin', pin)
    .eq('giorno_logico', giorno_logico)
    .order('ts_order', { ascending: false })
    .limit(1);

  if (queryError) {
    log.warn({
      traceId,
      pin,
      tipo,
      giorno_logico,
      error: queryError.message,
      route: 'timbrature:validation',
    }, 'diagnostic validation query_error');
    return {
      success: false,
      error: 'Errore durante validazione alternanza',
      code: 'QUERY_ERROR'
    };
  }

  const lastTimbro = lastTimbros && lastTimbros.length > 0 ? lastTimbros[0] as { tipo: string; data_locale: string; ora_locale: string } : null;

  if (tipo === 'entrata') {
    // ENTRATA: verifica che ultimo timbro ancorato non sia ENTRATA
    if (lastTimbro?.tipo === 'entrata') {
      log.warn({
        traceId,
        pin,
        tipo,
        giorno_logico,
        source: 'server-validateAlternanza',
        blockReason: 'duplicate-entrata',
        lastTimbroTipo: lastTimbro.tipo,
        route: 'timbrature:validation',
      }, 'diagnostic validation blocked');
      return {
        success: false,
        error: 'Alternanza violata: entrata consecutiva nello stesso giorno logico',
        code: 'ALTERNANZA_DUPLICATA'
      };
    }
    log.info({
      traceId,
      pin,
      tipo,
      giorno_logico,
      source: 'server-validateAlternanza',
      lastTimbroTipo: lastTimbro?.tipo ?? null,
      route: 'timbrature:validation',
    }, 'diagnostic validation passed');
    return { success: true };
  } else {
    // USCITA: cerca entrata di ancoraggio
    let anchorEntry = null;

    // 1) Prova su ancora corrente
    const { data: currentEntries } = await supabaseAdmin
      .from('timbrature')
      .select('id, giorno_logico, data_locale, ora_locale')
      .eq('pin', pin)
      .eq('tipo', 'entrata')
      .eq('giorno_logico', giorno_logico)
      .order('ts_order', { ascending: false })
      .limit(1);

    if (currentEntries && currentEntries.length > 0) {
      anchorEntry = currentEntries[0];
    } else {
      // 2) Fallback: giorno precedente entro 20h
      const prevDate = new Date(giorno_logico + 'T00:00:00');
      prevDate.setDate(prevDate.getDate() - 1);
      const giornoPrev = prevDate.toISOString().split('T')[0];

      const { data: prevEntries } = await supabaseAdmin
        .from('timbrature')
        .select('id, giorno_logico, data_locale, ora_locale')
        .eq('pin', pin)
        .eq('tipo', 'entrata')
        .eq('giorno_logico', giornoPrev)
        .order('ts_order', { ascending: false })
        .limit(1);

      if (prevEntries && prevEntries.length > 0) {
        // Nessun limite di durata: accetta qualsiasi entrata aperta nel giorno precedente
        anchorEntry = prevEntries[0] as { id: string; giorno_logico: string; data_locale: string; ora_locale: string };
      }
    }

    // 3) Override esplicito con anchorDate
    if (!anchorEntry && anchorDate) {
      const { data: explicitEntries } = await supabaseAdmin
        .from('timbrature')
        .select('id, giorno_logico, data_locale, ora_locale')
        .eq('pin', pin)
        .eq('tipo', 'entrata')
        .eq('giorno_logico', anchorDate)
        .order('ts_order', { ascending: false })
        .limit(1);

      if (explicitEntries && explicitEntries.length > 0) {
        anchorEntry = explicitEntries[0];
      }
    }

    // Verifica se trovata entrata di ancoraggio
    if (!anchorEntry) {
      log.warn({
        traceId,
        pin,
        tipo,
        giorno_logico,
        source: 'server-validateAlternanza',
        blockReason: 'missing-anchor-entry',
        lastTimbroTipo: lastTimbro?.tipo ?? null,
        route: 'timbrature:validation',
      }, 'diagnostic validation blocked');
      return {
        success: false,
        error: 'Manca ENTRATA di ancoraggio per questa uscita',
        code: 'MISSING_ANCHOR_ENTRY'
      };
    }

    // Nessun controllo durata turno: rimosso limite 20h per richiesta business

    // Ultima difesa: alternanza consecutiva
    if (lastTimbro?.tipo === 'uscita') {
      log.warn({
        traceId,
        pin,
        tipo,
        giorno_logico,
        source: 'server-validateAlternanza',
        blockReason: 'duplicate-uscita',
        anchorEntryId: (anchorEntry as { id?: string } | null)?.id ?? null,
        lastTimbroTipo: lastTimbro.tipo,
        route: 'timbrature:validation',
      }, 'diagnostic validation blocked');
      return {
        success: false,
        error: 'Alternanza violata: uscita consecutiva nello stesso giorno logico',
        code: 'ALTERNANZA_DUPLICATA'
      };
    }

    log.info({
      traceId,
      pin,
      tipo,
      giorno_logico,
      source: 'server-validateAlternanza',
      anchorEntryId: (anchorEntry as { id?: string } | null)?.id ?? null,
      lastTimbroTipo: lastTimbro?.tipo ?? null,
      route: 'timbrature:validation',
    }, 'diagnostic validation passed');
    return {
      success: true,
      anchorEntry
    };
  }
}
