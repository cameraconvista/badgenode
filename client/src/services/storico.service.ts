import { supabase } from '@/lib/supabaseClient';

export type TurnoGiornaliero = {
  pin: number;
  giorno: string;        // ISO date (YYYY-MM-DD)
  mese_label: string;    // "October 2025" (fornita dal DB)
  entrata: string | null; // "HH:MM:SS" o null
  uscita: string | null;  // "HH:MM:SS" o null
  ore: number;           // ore decimali
  extra: number;         // ore extra decimali
};

/**
 * Carica turni giornalieri tramite RPC turni_giornalieri
 * che usa la view v_turni_giornalieri_v2
 */
export async function loadTurniGiornalieri(pin: number, dal: string, al: string): Promise<TurnoGiornaliero[]> {
  try {
    console.log('📊 [RPC] turni_giornalieri args:', { p_pin: pin, p_dal: dal, p_al: al });
    
    const { data, error } = await supabase.rpc('turni_giornalieri', {
      p_pin: pin,
      p_dal: dal, // 'YYYY-MM-DD'
      p_al: al,   // 'YYYY-MM-DD'
    });

    if (error) {
      console.error('❌ [RPC] turni_giornalieri error:', error);
      throw error;
    }

    const result = (data ?? []) as TurnoGiornaliero[];
    console.log('✅ [RPC] turni_giornalieri loaded:', result.length, 'records');
    console.debug('📋 [RPC] Sample data:', result.slice(0, 3));
    
    return result;
  } catch (error) {
    console.error('❌ Error in loadTurniGiornalieri:', error);
    throw error;
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
 * Calcola totali da array di turni
 */
export function calcolaTotali(turni: TurnoGiornaliero[]) {
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
