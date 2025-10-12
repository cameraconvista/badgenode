// Service unico per letture storici BadgeNode
// Usa SOLO le nuove colonne: giorno_logico, data_locale, ora_locale

import { supabase } from '@/lib/supabaseClient';
import type { Timbratura, StoricoParams } from '@/types/timbrature';
import type { TurnoFull, StoricoDatasetV5, SessioneV5 } from './storico/types';

/**
 * Lettura storico timbrature per PIN con filtri opzionali
 * Usa solo colonne nuove DB, ordinamento per giorno_logico + ts_order
 */
export async function getStoricoByPin(params: StoricoParams): Promise<Timbratura[]> {
  const { pin, from, to } = params;
  
  // Validazione PIN obbligatoria
  if (!Number.isFinite(pin) || pin <= 0) {
    throw new Error(`PIN undefined/invalid: ${pin}`);
  }
  
  let q = supabase
    .from('timbrature')
    .select('id,pin,tipo,ts_order,giorno_logico,data_locale,ora_locale,client_event_id')
    .eq('pin', pin)
    .order('giorno_logico', { ascending: true })
    .order('ts_order', { ascending: true });

  if (from) q = q.gte('giorno_logico', from);
  if (to) q = q.lte('giorno_logico', to);

  const { data, error } = await q;
  if (error) throw error;
  
  return data ?? [];
}

/**
 * Lettura storico per range di date (compatibilità)
 */
export async function getTimbratureByRange(params: StoricoParams): Promise<Timbratura[]> {
  return getStoricoByPin(params);
}

// ===== FUNZIONI DI COMPATIBILITÀ =====
// Mantenute per non rompere l'UI esistente

// Re-export tipi legacy
export type { TurnoFull, StoricoDatasetV5, SessioneV5 } from './storico/types';

/**
 * Formatta orario con fallback
 */
export function formatTimeOrDash(time: string | null | undefined): string {
  if (!time) return '—';
  return time.substring(0, 5); // HH:MM
}

/**
 * Carica turni full (compatibilità)
 */
export async function loadTurniFull(params: StoricoParams): Promise<TurnoFull[]> {
  // Validazione PIN (delegata a getStoricoByPin)
  const timbrature = await getStoricoByPin(params);
  
  // Raggruppa per giorno_logico
  const byDay = new Map<string, Timbratura[]>();
  for (const t of timbrature) {
    if (!byDay.has(t.giorno_logico)) {
      byDay.set(t.giorno_logico, []);
    }
    byDay.get(t.giorno_logico)!.push(t);
  }
  
  // Converti a TurnoFull
  const turni: TurnoFull[] = [];
  for (const [giorno, timbraturesGiorno] of Array.from(byDay.entries())) {
    const entrate = timbraturesGiorno.filter((t: Timbratura) => t.tipo === 'entrata');
    const uscite = timbraturesGiorno.filter((t: Timbratura) => t.tipo === 'uscita');
    
    const primaEntrata = entrate.sort((a: Timbratura, b: Timbratura) => (a.ora_locale || '').localeCompare(b.ora_locale || ''))[0];
    const ultimaUscita = uscite.sort((a: Timbratura, b: Timbratura) => (b.ora_locale || '').localeCompare(a.ora_locale || ''))[0];
    
    let ore = 0;
    if (primaEntrata?.ora_locale && ultimaUscita?.ora_locale && primaEntrata.data_locale && ultimaUscita.data_locale) {
      const entrata = new Date(`${primaEntrata.data_locale}T${primaEntrata.ora_locale}`);
      const uscita = new Date(`${ultimaUscita.data_locale}T${ultimaUscita.ora_locale}`);
      if (uscita < entrata) uscita.setDate(uscita.getDate() + 1);
      ore = (uscita.getTime() - entrata.getTime()) / (1000 * 60 * 60);
    }
    
    turni.push({
      pin: params.pin,
      giorno,
      mese_label: new Date(giorno).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
      entrata: primaEntrata?.ora_locale || null,
      uscita: ultimaUscita?.ora_locale || null,
      ore: Math.round(ore * 100) / 100,
      extra: Math.max(0, ore - 8) // Assumo 8 ore standard
    });
  }
  
  return turni;
}

/**
 * Costruisce dataset storico (compatibilità)
 */
export async function buildStoricoDataset(params: StoricoParams): Promise<StoricoDatasetV5[]> {
  const turni = await loadTurniFull(params);
  
  return turni.map(turno => ({
    giorno_logico: turno.giorno,
    ore_totali_chiuse: turno.ore,
    sessioni: [{
      entrata_id: 1,
      entrata_ore: turno.entrata || '00:00:00',
      uscita_id: turno.uscita ? 2 : null,
      uscita_ore: turno.uscita,
      ore_sessione: turno.ore,
      sessione_num: 1
    }]
  }));
}

/**
 * Calcola totali V5 (compatibilità)
 */
export function calcolaTotaliV5(dataset: StoricoDatasetV5[]): { totaleOre: number; totaleExtra: number } {
  const totaleOre = dataset.reduce((sum, d) => sum + d.ore_totali_chiuse, 0);
  const totaleExtra = Math.max(0, totaleOre - (dataset.length * 8)); // 8 ore standard
  
  return { totaleOre, totaleExtra };
}
