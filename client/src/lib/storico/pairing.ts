// Algoritmo pairing Entrata→Uscita per multi-sessione

import { SessioneTimbratura } from './types';

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
 * Pairing sessioni per giorno logico
 * Algoritmo: ogni entrata → prima uscita successiva disponibile
 */
export function pairSessionsForGiorno(timbrature: TimbratureRaw[]): SessioneTimbratura[] {
  // 1. Ordina per (ore, created_at tie-breaker)
  const sorted = timbrature.sort((a, b) => {
    const oreCompare = a.ore.localeCompare(b.ore);
    return oreCompare !== 0 ? oreCompare : a.created_at.localeCompare(b.created_at);
  });

  // 2. Pairing sequenziale
  const sessioni: SessioneTimbratura[] = [];
  const used = new Set<number>();
  let numeroSessione = 1;

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i) || sorted[i].tipo !== 'entrata') continue;

    const entrata = sorted[i];
    used.add(i);

    // Cerca prima uscita successiva disponibile
    let uscita: TimbratureRaw | null = null;
    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j) || sorted[j].tipo !== 'uscita') continue;
      uscita = sorted[j];
      used.add(j);
      break;
    }

    // Calcola ore sessione
    let ore = 0;
    const isAperta = !uscita;

    if (uscita) {
      ore = calculateSessionHours(entrata.ore, uscita.ore, entrata.giornologico);
    }

    sessioni.push({
      numeroSessione: numeroSessione++,
      entrata: entrata.ore,
      uscita: uscita?.ore || null,
      ore,
      isAperta,
    });
  }

  return sessioni;
}

/**
 * Calcola ore sessione con gestione turni notturni (Europe/Rome)
 */
export function calculateSessionHours(
  entrataHHMM: string,
  uscitaHHMM: string,
  giornoYYYYMMDD: string
): number {
  const entrata = new Date(`${giornoYYYYMMDD}T${entrataHHMM}`);
  const uscita = new Date(`${giornoYYYYMMDD}T${uscitaHHMM}`);

  // Se uscita < entrata, turno notturno (aggiungi 24h)
  if (uscita < entrata) {
    uscita.setDate(uscita.getDate() + 1);
  }

  const diffMs = uscita.getTime() - entrata.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 2 decimali
}
