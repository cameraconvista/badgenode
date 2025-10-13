import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadTurniFull, buildStoricoDataset, StoricoDatasetV5 } from '@/services/storico.service';
import { GiornoLogicoDettagliato } from '@/lib/storico/types';
import { UtentiService } from '@/services/utenti.service';
import { TimbratureService } from '@/services/timbrature.service';
import { useStoricoExport } from '@/hooks/useStoricoExport';
import { useStoricoMutations } from '@/hooks/useStoricoMutations';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import {
  invalidateStoricoGlobale,
  invalidateTotaliGlobali,
  debounce,
} from '@/state/timbrature.cache';
import { formatDateLocal, getMeseItaliano } from '@/lib/time';

export function useStoricoTimbrature(pin: number) {
  const { isAdmin } = useAuth();

  // State per filtri
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    return {
      pin,
      dal: formatDateLocal(new Date(today.getFullYear(), today.getMonth(), 1)),
      al: formatDateLocal(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
    };
  });

  // State per modale modifica
  const [selectedGiorno, setSelectedGiorno] = useState<string | null>(null);

  // Realtime subscription per admin (tutti i PIN)
  useEffect(() => {
    if (!isAdmin) return;

    const debouncedInvalidate = debounce(() => {
      invalidateStoricoGlobale();
      invalidateTotaliGlobali();
    }, 250);

    const unsubscribe = subscribeTimbrature({
      onChange: (_data: any) => {
        debouncedInvalidate();
      },
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Query per dati dipendente
  const { data: dipendente, error: dipendenteError } = useQuery({
    queryKey: ['utente', pin],
    queryFn: async () => {
      const utenti = await UtentiService.getUtenti();
      return utenti.find((u) => u.pin === pin);
    },
  });

  if (dipendenteError) {
  }

  // Query per dataset v5 (include tutti i giorni del range)
  const {
    data: storicoDatasetV5 = [],
    isLoading: isLoadingTimbrature,
    error: storicoError,
  } = useQuery({
    queryKey: ['storico-dataset-v5', filters],
    queryFn: () => buildStoricoDataset({ pin: filters.pin, from: filters.dal, to: filters.al }),
    enabled: !!dipendente,
  }) as { data: StoricoDatasetV5[]; isLoading: boolean; error: any };

  if (storicoError) {
  }

  // Query per turni completi (legacy, per compatibilità componenti)
  const {
    data: turniGiornalieri = [],
    isLoading: isLoadingLegacy,
    error: turniError,
  } = useQuery({
    queryKey: ['turni-completi-legacy', filters],
    queryFn: () => loadTurniFull({ pin: filters.pin, from: filters.dal, to: filters.al }),
    enabled: !!dipendente,
  }) as { data: GiornoLogicoDettagliato[]; isLoading: boolean; error: any };

  if (turniError) {
  }

  // Trasforma dataset v5 in formato StoricoRowData per tabella con sotto-righe
  const storicoDataset = useMemo(() => {
    const dataset: any[] = [];

    storicoDatasetV5.forEach((item) => {
      // Riga principale giorno
      const giornoDettagliato: GiornoLogicoDettagliato = {
        pin: filters.pin,
        giorno: item.giorno_logico,
        mese_label: getMeseItaliano(item.giorno_logico),
        entrata: item.sessioni.length > 0 ? item.sessioni[0].entrata_ore : null,
        uscita:
          item.sessioni.length > 0 ? item.sessioni[item.sessioni.length - 1].uscita_ore : null,
        ore: item.ore_totali_chiuse,
        extra: Math.max(0, item.ore_totali_chiuse - (dipendente?.ore_contrattuali || 8)),
        sessioni: item.sessioni.map((s) => ({
          numeroSessione: s.sessione_num,
          entrata: s.entrata_ore,
          uscita: s.uscita_ore,
          ore: s.ore_sessione,
          isAperta: !s.uscita_ore,
        })),
      };

      dataset.push({
        type: 'giorno',
        giorno: giornoDettagliato,
      });

      // Sotto-righe sessioni (dalla 2ª in poi, come da spec v2.1)
      if (item.sessioni.length > 1) {
        item.sessioni.slice(1).forEach((sessione) => {
          dataset.push({
            type: 'sessione',
            sessione: {
              numeroSessione: sessione.sessione_num,
              entrata: sessione.entrata_ore,
              uscita: sessione.uscita_ore,
              ore: sessione.ore_sessione,
              isAperta: !sessione.uscita_ore,
            },
            giornoParent: item.giorno_logico,
          });
        });
      }
    });

    return dataset;
  }, [storicoDatasetV5, dipendente?.ore_contrattuali, filters.pin]);

  // Query per timbrature del giorno selezionato (per modale)
  const { data: timbratureGiorno = [] } = useQuery({
    queryKey: ['timbrature-giorno', pin, selectedGiorno],
    queryFn: () => TimbratureService.getTimbratureGiorno(pin, selectedGiorno!),
    enabled: !!selectedGiorno,
  });

  // Hook per export
  const { handleExportPDF, handleExportXLS } = useStoricoExport({
    dipendente,
    timbrature: turniGiornalieri,
    filters,
  });

  // Hook per mutations
  const { updateMutation, deleteMutation } = useStoricoMutations(timbratureGiorno, () =>
    setSelectedGiorno(null)
  );

  const handleRealtimeChange = useCallback((newFilters: { dal: string; al: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleFiltersChange = (newFilters: { dal: string; al: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleEditTimbrature = (giornologico: string) => {
    setSelectedGiorno(giornologico);
  };

  return {
    dipendente,
    filters,
    selectedGiorno,
    turniGiornalieri,
    storicoDataset,
    storicoDatasetV5,
    timbratureGiorno,
    isLoading: isLoadingTimbrature || isLoadingLegacy,
    handleFiltersChange,
    handleEditTimbrature,
    handleExportPDF,
    handleExportXLS,
    updateMutation,
    deleteMutation,
    setSelectedGiorno,
  };
}
