// Funzioni legacy per compatibilità
import { supabase } from '@/lib/supabaseClient';
import { expandDaysRange, getMeseItaliano } from '@/lib/time';
import { normalizeDate, aggregateTimbratureByGiornoLogico } from '@/lib/storico/aggregate';
import { GiornoLogicoDettagliato } from '@/lib/storico/types';
import { TurnoGiornaliero, TurnoFull } from './types';

/**
 * Carica lo storico giornaliero completo per il periodo selezionato,
 * usando query diretta su vista v_turni_giornalieri (sostituisce RPC mancante).
 * @deprecated Usa buildStoricoDataset per viste v5
 */
export async function loadTurniFull(
  pin: number,
  dal: string,  // 'YYYY-MM-DD'
  al: string,   // 'YYYY-MM-DD'
  oreContrattuali: number = 8
): Promise<GiornoLogicoDettagliato[]> {
  try {
    if (!pin) {
      return [];
    }

    
    // [FIX-STORICO] Query diretta su tabella timbrature (bypass vista v_turni_giornalieri)
    const { data, error } = await supabase
      .from('timbrature')
      .select('pin, tipo, ore, giornologico, created_at, nome, cognome')
      .eq('pin', pin)
      .gte('giornologico', normalizeDate(dal))
      .lte('giornologico', normalizeDate(al))
      .order('giornologico', { ascending: true })
      .order('ore', { ascending: true });

    if (error) {
      console.error('❌ [storico.service] timbrature table error:', { pin, dal, al, error });
      return [];
    }

    // [FIX-STORICO] Aggregazione client-side per giorno logico
    const dbResult = aggregateTimbratureByGiornoLogico(data ?? [], pin, oreContrattuali);

    // [FIX-STORICO] fallback vista dismesso
    // const { data, error } = await supabase
    //   .from('v_turni_giornalieri')
    //   .select('*')
    //   .eq('pin', pin)
    //   .gte('giornologico', dal)
    //   .lte('giornologico', al)
    //   .order('giornologico', { ascending: true });

    // Genera tutti i giorni del periodo (anche senza timbrature)
    const allDays = expandDaysRange(dal, al);
    const result: GiornoLogicoDettagliato[] = allDays.map(day => {
      const existing = dbResult.find((r: GiornoLogicoDettagliato) => r.giorno === day);
      return existing || {
        pin,
        giorno: day,
        mese_label: getMeseItaliano(day),
        entrata: null,
        uscita: null,
        ore: 0,
        extra: 0,
        sessioni: []  // NUOVO: Array vuoto per giorni senza timbrature
      };
    });

    
    return result;
  } catch (error) {
    console.error('❌ Error in loadTurniFull:', error);
    return [];
  }
}

/**
 * Formatta orario per visualizzazione
 * "HH:MM:SS.sss" → "HH:MM" o "—" se null
 */
export function formatTimeOrDash(time?: string | null): string {
  if (!time) return '—';
  // time è "HH:MM:SS" → mostra "HH:MM"
  return time.slice(0, 5);
}

/**
 * Formatta ore decimali per visualizzazione
 */
export function formatOre(ore: number): string {
  return ore.toFixed(2);
}

/**
 * Calcola totali da array di turni (compatibile con TurnoGiornaliero, TurnoFull e GiornoLogicoDettagliato)
 */
export function calcolaTotali(turni: (TurnoGiornaliero | TurnoFull | GiornoLogicoDettagliato)[]) {
  const totOre = turni.reduce((acc, r) => acc + (Number(r.ore) || 0), 0);
  const totExtra = turni.reduce((acc, r) => acc + (Number(r.extra) || 0), 0);
  const giorniLavorati = turni.filter(r => (Number(r.ore) || 0) > 0).length;
  
  return {
    totOre,
    totExtra,
    giorniLavorati,
    totGiorni: turni.length
  };
}
