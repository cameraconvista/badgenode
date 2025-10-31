// Service unico per letture storici BadgeNode
// STEP B: Consolidamento server-only - usa solo /api endpoints

import { safeFetchJson } from '@/lib/safeFetch';
import { isError, isSuccess } from '@/types/api';
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

  // Costruisci query params per API
  const queryParams = new URLSearchParams({
    pin: pin.toString()
  });
  
  if (from) queryParams.set('dal', from);
  if (to) queryParams.set('al', to);

  const response = await safeFetchJson<Timbratura[]>(`/api/storico?${queryParams.toString()}`);
  
  if (isError(response)) {
    throw new Error(response.error || 'Errore durante il recupero dello storico');
  }

  return response.data ?? [];
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

  // Caso 1: API aggregata dal server (giorno_logico + entrata/uscita/ore)
  const looksAggregated = Array.isArray(timbrature) && timbrature.length > 0 &&
    Object.prototype.hasOwnProperty.call(timbrature[0], 'entrata') &&
    Object.prototype.hasOwnProperty.call(timbrature[0], 'uscita') &&
    Object.prototype.hasOwnProperty.call(timbrature[0], 'ore');

  if (looksAggregated) {
    const turni: TurnoFull[] = (timbrature as unknown as Array<{
      giorno_logico: string;
      entrata: string | null;
      uscita: string | null;
      ore: number;
    }>).map((row) => ({
      pin: params.pin,
      giorno: row.giorno_logico,
      mese_label: new Date(row.giorno_logico).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
      entrata: row.entrata || null,
      uscita: row.uscita || null,
      ore: Math.round((row.ore || 0) * 100) / 100,
      extra: Math.max(0, (row.ore || 0) - 8),
    }));
    return turni;
  }

  // Caso 2: Legacy — timbrature raw con tipo/data/ora
  const byDay = new Map<string, Timbratura[]>();
  for (const t of timbrature) {
    if (!byDay.has(t.giorno_logico)) {
      byDay.set(t.giorno_logico, []);
    }
    byDay.get(t.giorno_logico)!.push(t);
  }

  const turni: TurnoFull[] = [];
  for (const [giorno, timbraturesGiorno] of Array.from(byDay.entries())) {
    const entrate = timbraturesGiorno.filter((t: Timbratura) => (t as any).tipo === 'entrata');
    const uscite = timbraturesGiorno.filter((t: Timbratura) => (t as any).tipo === 'uscita');

    const primaEntrata = entrate.sort((a: Timbratura, b: Timbratura) =>
      ((a as any).ora_locale || '').localeCompare((b as any).ora_locale || '')
    )[0];
    const ultimaUscita = uscite.sort((a: Timbratura, b: Timbratura) =>
      ((b as any).ora_locale || '').localeCompare((a as any).ora_locale || '')
    )[0];

    let ore = 0;
    if (
      (primaEntrata as any)?.ora_locale &&
      (ultimaUscita as any)?.ora_locale
    ) {
      const entrataTime = String((primaEntrata as any).ora_locale).substring(0, 5) + ':00';
      const uscitaTime = String((ultimaUscita as any).ora_locale).substring(0, 5) + ':00';
      const entrata = new Date(`${giorno}T${entrataTime}`);
      const uscita = new Date(`${giorno}T${uscitaTime}`);
      if (uscita < entrata) {
        uscita.setDate(uscita.getDate() + 1);
      }
      ore = (uscita.getTime() - entrata.getTime()) / (1000 * 60 * 60);
    }

    turni.push({
      pin: params.pin,
      giorno,
      mese_label: new Date(giorno).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }),
      entrata: (primaEntrata as any)?.ora_locale || null,
      uscita: (ultimaUscita as any)?.ora_locale || null,
      ore: Math.round(ore * 100) / 100,
      extra: Math.max(0, ore - 8),
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
            entrata_ore: turno.entrata || null,
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
 * @param dataset - Array di giorni con ore totali chiuse
 * @param oreContrattuali - Ore contrattuali giornaliere del dipendente (default 8)
 */
export function calcolaTotaliV5(
  dataset: StoricoDatasetV5[],
  oreContrattuali: number = 8
): {
  totaleOre: number;
  totaleExtra: number;
} {
  const giorniLavorati = dataset.filter(d => d.ore_totali_chiuse > 0);
  const totaleOre = giorniLavorati.reduce((sum, d) => sum + d.ore_totali_chiuse, 0);
  
  // Calcola extra sommando l'extra di ogni singolo giorno
  // (ore_giorno - ore_contrattuali) se positivo, altrimenti 0
  const totaleExtra = giorniLavorati.reduce((sum, d) => {
    const extraGiorno = Math.max(0, d.ore_totali_chiuse - oreContrattuali);
    return sum + extraGiorno;
  }, 0);

  return { totaleOre, totaleExtra };
}
