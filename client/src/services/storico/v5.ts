// Funzioni per viste v5 giorno logico
import { supabase } from '@/lib/supabaseClient';
import { TotaleGiornoV5, SessioneV5, StoricoDatasetV5 } from './types';
import { loadTotaliLegacy, loadSessioniLegacy } from './fallback';

/**
 * Genera range di date complete (YYYY-MM-DD) per periodo specificato.
 * Normalizzazione Europe/Rome: usa Date locale senza conversioni UTC.
 */
export function generateDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const start = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  
  // Normalizzazione Europe/Rome: mantieni date locali senza shift UTC
  const current = new Date(start);
  while (current <= end) {
    // Formato YYYY-MM-DD senza conversioni timezone
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Carica totali per giorno logico da vista v5.
 */
export async function loadTotaliGiornoLogico({
  pin,
  from,
  to
}: {
  pin: number;
  from: string;
  to: string;
}): Promise<TotaleGiornoV5[]> {
  try {
    const { data, error } = await supabase
      .from('v_turni_giornalieri_totali_v4')
      .select('pin, giornologico, ore_totali_chiuse')
      .eq('pin', pin)
      .gte('giornologico', from)
      .lte('giornologico', to)
      .order('giornologico', { ascending: true });

    if (error) {
      console.error('❌ [storico.service] loadTotaliGiornoLogico error:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      // Fallback: se viste v5 non esistono, usa query legacy
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('🔄 [storico.service] Viste v5 non disponibili, fallback a query legacy per totali PIN:', pin);
        const fallbackTotali = await loadTotaliLegacy({ pin, from, to });
        console.log('🔄 [storico.service] Fallback totali result:', fallbackTotali.length, 'giorni trovati');
        return fallbackTotali;
      }
      
      return [];
    }

    return (data || []).map(row => ({
      giorno_logico: row.giornologico,
      ore_totali_chiuse: Number(row.ore_totali_chiuse) || 0,
      sessioni_chiuse: 0, // Non più presente in vista v4
      sessioni_totali: 0  // Non più presente in vista v4
    }));
  } catch (error) {
    console.error('❌ Error in loadTotaliGiornoLogico:', error);
    return [];
  }
}

/**
 * Carica sessioni dettagliate da vista v5.
 */
export async function loadSessioniGiornoLogico({
  pin,
  from,
  to
}: {
  pin: number;
  from: string;
  to: string;
}): Promise<(SessioneV5 & { giorno_logico: string })[]> {
  try {
    const { data, error } = await supabase
      .from('v_turni_giornalieri_v4')
      .select('pin, giornologico, entrata_id, entrata_ore, uscita_id, uscita_ore, ore_sessione')
      .eq('pin', pin)
      .gte('giornologico', from)
      .lte('giornologico', to)
      .order('giornologico', { ascending: true })
      .order('entrata_ore', { ascending: true });

    if (error) {
      console.error('❌ [storico.service] loadSessioniGiornoLogico error:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      // Fallback: se viste v5 non esistono, usa query legacy su tabella timbrature
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('🔄 [storico.service] Viste v5 non disponibili, fallback a query legacy per PIN:', pin);
        const fallbackResult = await loadSessioniLegacy({ pin, from, to });
        console.log('🔄 [storico.service] Fallback sessioni result:', fallbackResult.length, 'sessioni trovate');
        return fallbackResult;
      }
      
      return [];
    }

    return (data || []).map(row => ({
      giorno_logico: row.giornologico,
      entrata_id: Number(row.entrata_id),
      entrata_ore: row.entrata_ore,
      uscita_id: row.uscita_id ? Number(row.uscita_id) : null,
      uscita_ore: row.uscita_ore,
      ore_sessione: Number(row.ore_sessione) || 0,
      sessione_num: 1 // Calcolato lato client se necessario
    }));
  } catch (error) {
    console.error('❌ Error in loadSessioniGiornoLogico:', error);
    return [];
  }
}

/**
 * Costruisce dataset completo per UI storico con viste v5.
 * Include tutti i giorni del range (anche senza timbrature) con ore 0.00.
 */
export async function buildStoricoDataset({
  pin,
  from,
  to
}: {
  pin: number;
  from: string;
  to: string;
}): Promise<StoricoDatasetV5[]> {
  try {
    // 1. Genera tutti i giorni del range
    const allDays = generateDateRange(from, to);
    
    // 2. Carica totali e sessioni in parallelo
    const [totali, sessioni] = await Promise.all([
      loadTotaliGiornoLogico({ pin, from, to }),
      loadSessioniGiornoLogico({ pin, from, to })
    ]);
    
    // 3. Crea mappe per lookup efficiente
    const totaliMap = new Map<string, TotaleGiornoV5>();
    totali.forEach(t => totaliMap.set(t.giorno_logico, t));
    
    const sessioniMap = new Map<string, SessioneV5[]>();
    sessioni.forEach(s => {
      if (!sessioniMap.has(s.giorno_logico)) {
        sessioniMap.set(s.giorno_logico, []);
      }
      sessioniMap.get(s.giorno_logico)!.push({
        entrata_id: s.entrata_id,
        entrata_ore: s.entrata_ore,
        uscita_id: s.uscita_id,
        uscita_ore: s.uscita_ore,
        ore_sessione: s.ore_sessione,
        sessione_num: s.sessione_num
      });
    });
    
    // 4. Costruisci dataset finale ordinato
    return allDays.map(day => {
      const totale = totaliMap.get(day);
      const sessioniGiorno = sessioniMap.get(day) || [];
      
      return {
        giorno_logico: day,
        ore_totali_chiuse: totale?.ore_totali_chiuse || 0,
        sessioni: sessioniGiorno
      };
    });
  } catch (error) {
    console.error('❌ Error in buildStoricoDataset:', error);
    return [];
  }
}


