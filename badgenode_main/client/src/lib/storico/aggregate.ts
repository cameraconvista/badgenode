// Utility per aggregazione timbrature per giorno logico (client-side)

import { formatDateLocal, getMeseItaliano } from '@/lib/time';
// reserved: api-internal (non rimuovere senza migrazione)
// import type { TurnoFull } from '@/services/storico/types';
import { GiornoLogicoDettagliato } from './types';
import { pairSessionsForGiorno } from './pairing';

interface TimbratureRaw {
  pin: number;
  tipo: 'entrata' | 'uscita';
  ore: string;
  giorno_logico: string;
  created_at: string;
  nome?: string;
  cognome?: string;
}

/**
 * Normalizza data in formato YYYY-MM-DD (Europe/Rome, no UTC)
 */
export function normalizeDate(date: string): string {
  if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date; // Già in formato corretto
  }
  return formatDateLocal(new Date(date));
}

/**
 * Aggrega timbrature per giorno logico (client-side)
 */
export function aggregateTimbratureByGiornoLogico(
  timbrature: TimbratureRaw[],
  pin: number,
  oreContrattuali: number = 8
): GiornoLogicoDettagliato[] {
  // Group by giorno_logico
  const grouped = timbrature.reduce(
    (acc, t) => {
      const key = t.giorno_logico;
      if (!acc[key]) {
        acc[key] = { entrate: [], uscite: [] };
      }

      if (t.tipo === 'entrata') {
        acc[key].entrate.push(t);
      } else if (t.tipo === 'uscita') {
        acc[key].uscite.push(t);
      }

      return acc;
    },
    {} as Record<string, { entrate: TimbratureRaw[]; uscite: TimbratureRaw[] }>
  );

  // Calcola aggregati per ogni giorno con multi-sessione
  return Object.entries(grouped).map(([giorno, data]) => {
    // Combina entrate e uscite per pairing
    const allTimbrature = [...data.entrate, ...data.uscite];

    // Calcola sessioni con pairing
    const sessioni = pairSessionsForGiorno(allTimbrature);

    // Calcola totali giorno (solo sessioni chiuse)
    const sessioniChiuse = sessioni.filter((s) => !s.isAperta);
    const oreTotali = sessioniChiuse.reduce((acc, s) => acc + s.ore, 0);
    const extra = Math.max(0, oreTotali - oreContrattuali);

    // Prima entrata e ultima uscita (per compatibilità)
    const primaEntrata = sessioni[0]?.entrata || null;
    const ultimaUscita = sessioniChiuse.slice(-1)[0]?.uscita || null;

    return {
      pin,
      giorno,
      mese_label: getMeseItaliano(giorno),
      entrata: primaEntrata,
      uscita: ultimaUscita,
      ore: oreTotali,
      extra,
      sessioni, // NUOVO: Array sessioni
    };
  });
}
