import { supabase } from '@/lib/supabaseClient';
import { expandDaysRange, getMeseItaliano } from '@/lib/time';

export type TurnoGiornaliero = {
  pin: number;
  giorno: string;        // ISO date (YYYY-MM-DD)
  mese_label: string;    // "October 2025" (fornita dal DB)
  entrata: string | null; // "HH:MM:SS" o null
  uscita: string | null;  // "HH:MM:SS" o null
  ore: number;           // ore decimali
  extra: number;         // ore extra decimali
};

export type TurnoFull = {
  pin: number;
  giorno: string;       // 'YYYY-MM-DD'
  mese_label: string;   // 'October 2025'
  entrata: string | null; // 'HH:MM:SS.sss' | null
  uscita: string | null;  // 'HH:MM:SS.sss' | null
  ore: number;            // ore decimali
  extra: number;          // ore decimali
};


/**
 * Carica lo storico giornaliero completo per il periodo selezionato,
 * usando query diretta su vista v_turni_giornalieri (sostituisce RPC mancante).
 */
export async function loadTurniFull(
  pin: number,
  dal: string,  // 'YYYY-MM-DD'
  al: string    // 'YYYY-MM-DD'
): Promise<TurnoFull[]> {
  try {
    if (!pin) {
      return [];
    }

    
    const { data, error } = await supabase
      .from('v_turni_giornalieri')
      .select('*')
      .eq('pin', pin)
      .gte('giornologico', dal)
      .lte('giornologico', al)
      .order('giornologico', { ascending: true });

    if (error) {
      console.error('❌ [storico.service] v_turni_giornalieri error:', { pin, dal, al, error });
      return [];
    }

    // Mappa i dati dalla vista al tipo TurnoFull
    const dbResult = (data ?? []).map((row: any) => ({
      pin: row.pin,
      giorno: row.giornologico,
      mese_label: row.mese_label || getMeseItaliano(row.giornologico),
      entrata: row.entrata,
      uscita: row.uscita,
      ore: Number(row.ore) || 0,
      extra: Number(row.extra) || 0,
    }));

    // Genera tutti i giorni del periodo (anche senza timbrature)
    const allDays = expandDaysRange(dal, al);
    const result: TurnoFull[] = allDays.map(day => {
      const existing = dbResult.find(r => r.giorno === day);
      return existing || {
        pin,
        giorno: day,
        mese_label: getMeseItaliano(day),
        entrata: null,
        uscita: null,
        ore: 0,
        extra: 0,
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
 * Calcola totali da array di turni (compatibile con TurnoGiornaliero e TurnoFull)
 */
export function calcolaTotali(turni: TurnoGiornaliero[] | TurnoFull[]) {
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
