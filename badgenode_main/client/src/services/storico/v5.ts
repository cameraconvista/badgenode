// Funzioni per storico - SEMPLIFICATO: lettura diretta da public.timbrature
import { TimbratureService } from '../timbrature.service';
import { pairTimbrature, buildDailyTotals } from '../../utils/timbrature-pairing';
import { TotaleGiornoV5, SessioneV5, StoricoDatasetV5 } from './types';
import { asError } from '@/lib/safeError';
// reserved: api-internal (non rimuovere senza migrazione)
// import { TurnoGiornaliero } from './types';
// TimbraturaCanon, TimbraturaPair reserved for future API

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
 * Carica totali giornalieri - SEMPLIFICATO: tabella diretta + pairing client.
 */
export async function loadTotaliGiornoLogico({
  pin,
  from,
  to,
}: {
  pin: number;
  from: string;
  to: string;
}): Promise<TotaleGiornoV5[]> {
  try {
    // 1. Carica timbrature da fonte unica
    const timbrature = await TimbratureService.getTimbratureByRange({ pin, from, to });

    // 2. Pairing lato client
    const pairs = pairTimbrature(timbrature);

    // 3. Calcola totali giornalieri
    const dailyTotals = buildDailyTotals(pairs);

    // 4. Converti al formato legacy per compatibilità
    return dailyTotals.map((total) => ({
      giorno_logico: total.giorno_logico,
      ore_totali_chiuse: total.ore_totali_sec / 3600, // sec → ore
      sessioni_chiuse: 0, // TODO(BUSINESS): calcolare se necessario
      sessioni_totali: 0, // TODO(BUSINESS): calcolare se necessario
    }));
  } catch (e) {
    const err = asError(e);
    console.error('[BadgeNode] Error loading totali:', err.message);
    return [];
  }
}

/**
 * Carica sessioni dettagliate - SEMPLIFICATO: tabella diretta + pairing client.
 */
export async function loadSessioniGiornoLogico({
  pin,
  from,
  to,
}: {
  pin: number;
  from: string;
  to: string;
}): Promise<(SessioneV5 & { giorno_logico: string })[]> {
  try {
    // 1. Carica timbrature da fonte unica
    const timbrature = await TimbratureService.getTimbratureByRange({ pin, from, to });

    // 2. Pairing lato client
    const pairs = pairTimbrature(timbrature);

    // 3. Converti pairs al formato legacy per compatibilità
    const sessioni: (SessioneV5 & { giorno_logico: string })[] = [];

    pairs.forEach((pair, index) => {
      sessioni.push({
        giorno_logico: pair.giorno_logico,
        entrata_id: pair.entrata?.id || 0,
        entrata_ore: pair.entrata?.ora_locale || '',
        uscita_id: pair.uscita?.id || null,
        uscita_ore: pair.uscita?.ora_locale || null,
        ore_sessione: pair.durata_sec ? pair.durata_sec / 3600 : 0, // sec → ore
        sessione_num: index + 1,
      });
    });

    return sessioni;
  } catch (e) {
    const err = asError(e);
    console.error('[BadgeNode] Error loading totali:', err.message);
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
  to,
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
      loadSessioniGiornoLogico({ pin, from, to }),
    ]);

    // 3. Crea mappe per lookup efficiente
    const totaliMap = new Map<string, TotaleGiornoV5>();
    totali.forEach((t) => totaliMap.set(t.giorno_logico, t));

    const sessioniMap = new Map<string, SessioneV5[]>();
    sessioni.forEach((s) => {
      if (!sessioniMap.has(s.giorno_logico)) {
        sessioniMap.set(s.giorno_logico, []);
      }
      sessioniMap.get(s.giorno_logico)!.push({
        entrata_id: s.entrata_id,
        entrata_ore: s.entrata_ore,
        uscita_id: s.uscita_id,
        uscita_ore: s.uscita_ore,
        ore_sessione: s.ore_sessione,
        sessione_num: s.sessione_num,
      });
    });

    // 4. Costruisci dataset finale ordinato
    const result = allDays.map((day) => {
      const totale = totaliMap.get(day);
      const sessioniGiorno = sessioniMap.get(day) || [];

      return {
        giorno_logico: day,
        ore_totali_chiuse: totale?.ore_totali_chiuse || 0,
        sessioni: sessioniGiorno,
      };
    });
    
    // Clone profondo per evitare structural sharing
    
    // Clonazione profonda per test structural sharing
    return JSON.parse(JSON.stringify(result));
  } catch (e) {
    const err = asError(e);
    console.error('[BadgeNode] Error loading totali:', err.message);
    return [];
  }
}
