// Utility per pairing timbrature e calcolo totali giornalieri
// Logica pura lato client - no dipendenze DB

import type { TimbraturaCanon, TimbraturaPair, DailyTotal } from '../../../shared/types/timbrature';

// TASK 2 - Pairing lato client
export function pairTimbrature(rows: TimbraturaCanon[]): TimbraturaPair[] {
  const pairs: TimbraturaPair[] = [];

  // 1) Group by {pin, giorno_logico}
  const groups = new Map<string, TimbraturaCanon[]>();

  rows.forEach((row) => {
    const key = `${row.pin}-${row.giorno_logico}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  // 2) Processa ogni gruppo
  groups.forEach((groupRows, key) => {
    const [pin, giorno_logico] = key.split('-');

    // Sort per ts_order ASC (già ordinato da query, ma per sicurezza)
    groupRows.sort((a, b) => a.ts_order.localeCompare(b.ts_order));

    // 3) Scansiona e accoppia alternando
    let currentEntrata: TimbraturaCanon | undefined;

    groupRows.forEach((row) => {
      if (row.tipo === 'entrata') {
        // Se c'era già un'entrata aperta, chiudila come "aperta"
        if (currentEntrata) {
          pairs.push({
            pin: parseInt(pin),
            giorno_logico,
            entrata: currentEntrata,
            // uscita mancante
          });
        }
        // Inizia nuova entrata
        currentEntrata = row;
      } else if (row.tipo === 'uscita') {
        if (currentEntrata) {
          // Accoppia entrata → uscita
          const durata_sec = Math.max(
            0,
            (new Date(row.created_at).getTime() - new Date(currentEntrata.created_at).getTime()) /
              1000
          );

          pairs.push({
            pin: parseInt(pin),
            giorno_logico,
            entrata: currentEntrata,
            uscita: row,
            durata_sec,
          });

          currentEntrata = undefined;
        } else {
          // Uscita senza entrata
          pairs.push({
            pin: parseInt(pin),
            giorno_logico,
            uscita: row,
            // entrata mancante
          });
        }
      }
    });

    // Se rimane un'entrata aperta alla fine
    if (currentEntrata) {
      pairs.push({
        pin: parseInt(pin),
        giorno_logico,
        entrata: currentEntrata,
        // uscita mancante
      });
    }
  });

  return pairs;
}

// TASK 3 - Totali giornalieri
export function buildDailyTotals(pairs: TimbraturaPair[]): DailyTotal[] {
  const totalsMap = new Map<string, DailyTotal>();

  pairs.forEach((pair) => {
    const key = `${pair.pin}-${pair.giorno_logico}`;

    if (!totalsMap.has(key)) {
      totalsMap.set(key, {
        pin: pair.pin,
        giorno_logico: pair.giorno_logico,
        ore_totali_sec: 0,
        ore_extra_sec: 0, // TODO(BUSINESS): definire standard giornaliero
      });
    }

    const total = totalsMap.get(key)!;

    // Somma solo coppie chiuse (con durata)
    if (pair.durata_sec) {
      total.ore_totali_sec += pair.durata_sec;
    }
  });

  return Array.from(totalsMap.values());
}

// Utility helper per conversioni
export function secondsToHours(seconds: number): number {
  return seconds / 3600;
}

export function hoursToSeconds(hours: number): number {
  return hours * 3600;
}
