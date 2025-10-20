// Validazione alternanza per timbrature
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { computeGiornoLogico } from '../../shared/time/computeGiornoLogico';
import type { ValidationResult } from './types';

/**
 * Valida alternanza con logica di ancoraggio per turni notturni
 */
export async function validateAlternanza(
  pin: number,
  tipo: 'entrata' | 'uscita',
  data: string,
  ora: string,
  anchorDate?: string
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

  // Trova ultimo timbro sul giorno logico ancorato
  const { data: lastTimbros, error: queryError } = await supabaseAdmin
    .from('timbrature')
    .select('tipo, data_locale, ora_locale')
    .eq('pin', pin)
    .eq('giorno_logico', giorno_logico)
    .order('ts_order', { ascending: false })
    .limit(1);

  if (queryError) {
    console.warn('[VALIDATION] Query error:', queryError.message);
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
      return {
        success: false,
        error: 'Alternanza violata: entrata consecutiva nello stesso giorno logico',
        code: 'ALTERNANZA_DUPLICATA'
      };
    }
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
      return {
        success: false,
        error: 'Manca ENTRATA di ancoraggio per questa uscita',
        code: 'MISSING_ANCHOR_ENTRY'
      };
    }

    // Nessun controllo durata turno: rimosso limite 20h per richiesta business

    // Ultima difesa: alternanza consecutiva
    if (lastTimbro?.tipo === 'uscita') {
      return {
        success: false,
        error: 'Alternanza violata: uscita consecutiva nello stesso giorno logico',
        code: 'ALTERNANZA_DUPLICATA'
      };
    }

    return {
      success: true,
      anchorEntry
    };
  }
}
