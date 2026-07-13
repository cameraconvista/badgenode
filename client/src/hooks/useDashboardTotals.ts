import { useMemo } from 'react';
import { useQueries, keepPreviousData } from '@tanstack/react-query';
import { loadTurniFull, buildDatasetFromTurni, calcolaTotaliV5 } from '@/services/storico.service';
import { qk } from '@/state/timbrature.cache';
import type { Utente } from '@/services/utenti.service';

/** Riga Dashboard: anagrafica dipendente + totali del periodo filtrato. */
export interface DashboardRow {
  pin: number;
  nome: string;
  cognome: string;
  totaleOre: number;
  totaleExtra: number;
}

export interface DashboardFilters {
  dal: string;
  al: string;
}

/**
 * Totali Dashboard per TUTTI i dipendenti attivi nel periodo scelto.
 *
 * Strategia (decisione owner): riusa l'endpoint storico esistente con UNA query
 * per PIN, in parallelo (`useQueries`) e con cache condivisa (stesse chiavi dello
 * Storico → nessuna doppia chiamata quando si apre lo storico del singolo). Zero
 * modifiche a DB/server: le logiche consolidate restano intatte.
 *
 * I totali usano `calcolaTotaliV5`, identico allo Storico, così Dashboard e
 * Storico mostrano sempre gli stessi numeri (parità admin/user).
 */
export function useDashboardTotals(utenti: Utente[], filters: DashboardFilters) {
  const { dal, al } = filters;

  const results = useQueries({
    queries: utenti.map((u) => ({
      // Stessa chiave-totali dello Storico (per PIN + periodo): cache riusata.
      queryKey: [...qk.totaliByPin(u.pin), dal, al] as const,
      queryFn: async () => {
        const turni = await loadTurniFull({ pin: u.pin, from: dal, to: al });
        const dataset = buildDatasetFromTurni(turni, dal, al);
        return calcolaTotaliV5(dataset, u.ore_contrattuali || 8);
      },
      enabled: u.pin > 0 && !!dal && !!al,
      placeholderData: keepPreviousData,
      staleTime: 30_000,
    })),
  });

  // `results` è per-indice allineato a `utenti`: nessuna dipendenza aggiuntiva.
  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const rows = useMemo<DashboardRow[]>(
    () =>
      utenti.map((u, i) => ({
        pin: u.pin,
        nome: u.nome,
        cognome: u.cognome,
        totaleOre: results[i]?.data?.totaleOre ?? 0,
        totaleExtra: results[i]?.data?.totaleExtra ?? 0,
      })),
    // Ricalcola quando cambia la lista o quando una qualsiasi query aggiorna i dati
    // (dataUpdatedAt): stabile sui primitivi, evita dipendere dal riferimento di `results`.
    [utenti, results.map((r) => r.dataUpdatedAt).join(',')],
  );

  const totali = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          totaleOre: acc.totaleOre + r.totaleOre,
          totaleExtra: acc.totaleExtra + r.totaleExtra,
        }),
        { totaleOre: 0, totaleExtra: 0 },
      ),
    [rows],
  );

  return { rows, totali, isLoading, isError };
}
