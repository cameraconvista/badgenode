// Service unico per letture storici BadgeNode
// Usa SOLO le nuove colonne: giorno_logico, data_locale, ora_locale

import { supabase } from '@/lib/supabaseClient';
import { expandDaysRange } from '@/lib/time';
import type { Timbratura, StoricoParams } from '@/types/timbrature';
import type { TurnoFull, StoricoDatasetV5 } from './storico/types';
// SessioneV5 reserved for future API

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

    const primaEntrata = entrate.sort((a: Timbratura, b: Timbratura) =>
      (a.ora_locale || '').localeCompare(b.ora_locale || '')
    )[0];
    const ultimaUscita = uscite.sort((a: Timbratura, b: Timbratura) =>
      (b.ora_locale || '').localeCompare(a.ora_locale || '')
    )[0];

    let ore = 0;
    if (
      primaEntrata?.ora_locale &&
      ultimaUscita?.ora_locale &&
      primaEntrata.data_locale &&
      ultimaUscita.data_locale
    ) {
      // Arrotonda al minuto per calcolo più user-friendly
      const entrataTime = primaEntrata.ora_locale.substring(0, 5) + ':00'; // HH:MM:00
      const uscitaTime = ultimaUscita.ora_locale.substring(0, 5) + ':00';   // HH:MM:00
      
      // FIX: Per turni notturni, usa giorno_logico come base per entrambe le date
      const entrata = new Date(`${giorno}T${entrataTime}`);
      let uscita = new Date(`${giorno}T${uscitaTime}`);
      
      // Se l'uscita è prima dell'entrata (turno notturno), aggiungi 1 giorno all'uscita
      // NOTA: uscita === entrata (stesso orario) = 0 ore, NON turno notturno
      if (uscita < entrata) {
        uscita = new Date(`${giorno}T${uscitaTime}`);
        uscita.setDate(uscita.getDate() + 1);
      }
      
      ore = (uscita.getTime() - entrata.getTime()) / (1000 * 60 * 60);
    }

    turni.push({
      pin: params.pin,
      giorno,
      mese_label: new Date(giorno).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
      entrata: primaEntrata?.ora_locale || null,
      uscita: ultimaUscita?.ora_locale || null,
      ore: Math.round(ore * 100) / 100,
      extra: Math.max(0, ore - 8), // Assumo 8 ore standard
    });
  }

  return turni;
}

/**
 * Costruisce dataset storico con TUTTI i giorni del range (anche senza timbrature)
 */
export async function buildStoricoDataset(params: StoricoParams): Promise<StoricoDatasetV5[]> {
  const { from, to } = params;
  
  // Usa la funzione importata staticamente
  
  // Ottieni tutti i giorni del range
  const tuttiIGiorni = expandDaysRange(from!, to!);
  
  // Ottieni solo i giorni con timbrature
  const turni = await loadTurniFull(params);
  const turniMap = new Map(turni.map(t => [t.giorno, t]));

  // Crea dataset per tutti i giorni
  return tuttiIGiorni.map((giorno) => {
    const turno = turniMap.get(giorno);
    
    if (turno) {
      // Giorno con timbrature
      return {
        giorno_logico: turno.giorno,
        ore_totali_chiuse: turno.ore,
        sessioni: [
          {
            entrata_id: 1,
            entrata_ore: turno.entrata || '00:00:00',
            uscita_id: turno.uscita ? 2 : null,
            uscita_ore: turno.uscita,
            ore_sessione: turno.ore,
            sessione_num: 1,
          },
        ],
      };
    } else {
      // Giorno senza timbrature
      return {
        giorno_logico: giorno,
        ore_totali_chiuse: 0,
        sessioni: [],
      };
    }
  });
}

/**
 * Calcola totali V5 (solo giorni lavorati)
 */
export function calcolaTotaliV5(dataset: StoricoDatasetV5[]): {
  totaleOre: number;
  totaleExtra: number;
} {
  const giorniLavorati = dataset.filter(d => d.ore_totali_chiuse > 0);
  const totaleOre = giorniLavorati.reduce((sum, d) => sum + d.ore_totali_chiuse, 0);
  const totaleExtra = Math.max(0, totaleOre - giorniLavorati.length * 8); // 8 ore standard

  return { totaleOre, totaleExtra };
}
