import { supabase } from '@/lib/supabaseClient';
import { expandDaysRange, getMeseItaliano, formatDateLocal } from '@/lib/time';

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

interface TimbratureRaw {
  pin: number;
  tipo: 'entrata' | 'uscita';
  ore: string;
  giornologico: string;
  created_at: string;
  nome?: string;
  cognome?: string;
}

/**
 * Normalizza data in formato YYYY-MM-DD (Europe/Rome, no UTC)
 */
function normalizeDate(date: string): string {
  if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date; // Già in formato corretto
  }
  return formatDateLocal(new Date(date));
}

/**
 * Aggrega timbrature per giorno logico (client-side)
 */
function aggregateTimbratureByGiornoLogico(timbrature: TimbratureRaw[], pin: number): TurnoFull[] {
  // Group by giornologico
  const grouped = timbrature.reduce((acc, t) => {
    const key = t.giornologico;
    if (!acc[key]) {
      acc[key] = { entrate: [], uscite: [] };
    }
    
    if (t.tipo === 'entrata') {
      acc[key].entrate.push(t);
    } else if (t.tipo === 'uscita') {
      acc[key].uscite.push(t);
    }
    
    return acc;
  }, {} as Record<string, { entrate: TimbratureRaw[]; uscite: TimbratureRaw[] }>);

  // Calcola aggregati per ogni giorno
  return Object.entries(grouped).map(([giorno, data]) => {
    // Ordina per orario
    const entrate = data.entrate.sort((a, b) => a.ore.localeCompare(b.ore));
    const uscite = data.uscite.sort((a, b) => b.ore.localeCompare(a.ore)); // Desc per ultima uscita
    
    const primaEntrata = entrate[0]?.ore || null;
    const ultimaUscita = uscite[0]?.ore || null;
    
    // Calcola ore lavorate
    let ore = 0;
    if (primaEntrata && ultimaUscita) {
      const entrata = new Date(`${giorno}T${primaEntrata}`);
      const uscita = new Date(`${giorno}T${ultimaUscita}`);
      
      // Se uscita < entrata, turno notturno (aggiungi 24h)
      if (uscita < entrata) {
        uscita.setDate(uscita.getDate() + 1);
      }
      
      const diffMs = uscita.getTime() - entrata.getTime();
      ore = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 2 decimali
    }
    
    return {
      pin,
      giorno,
      mese_label: getMeseItaliano(giorno),
      entrata: primaEntrata,
      uscita: ultimaUscita,
      ore,
      extra: 0 // Calcolato successivamente se necessario
    };
  });
}


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
    const dbResult = aggregateTimbratureByGiornoLogico(data ?? [], pin);

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
    const result: TurnoFull[] = allDays.map(day => {
      const existing = dbResult.find((r: TurnoFull) => r.giorno === day);
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
