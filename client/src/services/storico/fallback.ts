// Funzioni fallback per quando viste v5 non sono disponibili
import { supabase } from '@/lib/supabaseClient';
import { TotaleGiornoV5, SessioneV5 } from './types';

/**
 * Fallback: carica totali da tabella timbrature quando viste v5 non esistono
 */
export async function loadTotaliLegacy({
  pin,
  from,
  to
}: {
  pin: number;
  from: string;
  to: string;
}): Promise<TotaleGiornoV5[]> {
  try {
    // Usa le sessioni legacy per calcolare i totali
    const sessioni = await loadSessioniLegacy({ pin, from, to });
    
    // Raggruppa per giorno e somma le ore
    const totaliMap = new Map<string, number>();
    sessioni.forEach(s => {
      const current = totaliMap.get(s.giorno_logico) || 0;
      totaliMap.set(s.giorno_logico, current + s.ore_sessione);
    });
    
    return Array.from(totaliMap.entries()).map(([giorno, ore]) => ({
      giorno_logico: giorno,
      ore_totali_chiuse: ore,
      sessioni_chiuse: 0,
      sessioni_totali: 0
    }));
  } catch (error) {
    console.error('❌ Error in loadTotaliLegacy:', error);
    return [];
  }
}

/**
 * Fallback: carica sessioni da tabella timbrature quando viste v5 non esistono
 */
export async function loadSessioniLegacy({
  pin,
  from,
  to
}: {
  pin: number;
  from: string;
  to: string;
}): Promise<(SessioneV5 & { giorno_logico: string })[]> {
  try {
    console.log('🔄 [loadSessioniLegacy] Query params:', { pin, from, to });
    
    // Query diretta su tabella timbrature per creare sessioni
    const { data, error } = await supabase
      .from('timbrature')
      .select('id, pin, tipo, ore, giornologico, created_at')
      .eq('pin', pin)
      .gte('giornologico', from)
      .lte('giornologico', to)
      .order('giornologico', { ascending: true })
      .order('ore', { ascending: true });

    if (error) {
      console.error('❌ [storico.service] loadSessioniLegacy error:', error);
      return [];
    }

    console.log('🔄 [loadSessioniLegacy] Raw data from timbrature:', (data || []).length, 'records for PIN', pin);

    // Raggruppa per giorno logico e crea sessioni
    const sessioniMap = new Map<string, any[]>();
    (data || []).forEach(row => {
      const giorno = row.giornologico;
      if (!sessioniMap.has(giorno)) {
        sessioniMap.set(giorno, []);
      }
      sessioniMap.get(giorno)!.push(row);
    });

    const sessioni: (SessioneV5 & { giorno_logico: string })[] = [];
    
    sessioniMap.forEach((timbrature, giorno) => {
      // Accoppia entrate e uscite
      const entrate = timbrature.filter(t => t.tipo === 'entrata');
      const uscite = timbrature.filter(t => t.tipo === 'uscita');
      
      entrate.forEach((entrata, index) => {
        const uscita = uscite.find(u => u.ore > entrata.ore);
        const ore_sessione = uscita ? 
          (new Date(`1970-01-01T${uscita.ore}`).getTime() - new Date(`1970-01-01T${entrata.ore}`).getTime()) / (1000 * 60 * 60) : 0;
        
        // IMPORTANTE: Includi TUTTE le sessioni, anche quelle aperte (ore_sessione = 0)
        sessioni.push({
          giorno_logico: giorno,
          entrata_id: entrata.id,
          entrata_ore: entrata.ore,
          uscita_id: uscita?.id || null,
          uscita_ore: uscita?.ore || null,
          ore_sessione,
          sessione_num: index + 1
        });
      });
    });

    return sessioni;
  } catch (error) {
    console.error('❌ Error in loadSessioniLegacy:', error);
    return [];
  }
}
