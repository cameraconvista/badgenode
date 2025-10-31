import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { loadTurniFull, buildStoricoDataset, StoricoDatasetV5 } from '@/services/storico.service';
import { GiornoLogicoDettagliato } from '@/lib/storico/types';
import type { TurnoFull } from '@/services/storico/types';
import { UtentiService } from '@/services/utenti.service';
import { TimbratureService } from '@/services/timbrature.service';
// Lazy-load condizionale per export (feature flag VITE_FEATURE_LAZY_EXPORT)
// import { useStoricoExport } from '@/hooks/useStoricoExport';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import {
  invalidateStoricoGlobale,
  invalidateTotaliGlobali,
  debounce,
} from '@/state/timbrature.cache';
import { formatDateLocal, getMeseItaliano } from '@/lib/time';

// Funzione di mapping puro per compatibilità tipi
function toGiornoLogicoDettagliato(rows: TurnoFull[]): GiornoLogicoDettagliato[] {
  return rows.map(turno => ({
    ...turno,
    sessioni: [], // TurnoFull non ha sessioni, aggiungi array vuoto per compatibilità
  }));
}

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- supabase realtime payload non tipizzabile rapidamente
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
  const storicoQueryKey = ['storico-dataset-v5', filters];
  const {
    data: storicoDatasetV5 = [],
    isLoading: isLoadingTimbrature,
    error: storicoError,
  } = useQuery({
    queryKey: storicoQueryKey,
    queryFn: () => {
      return buildStoricoDataset({ pin: filters.pin, from: filters.dal, to: filters.al });
    },
    enabled: !!dipendente,
  }) as { data: StoricoDatasetV5[]; isLoading: boolean; error: unknown };
  
  // Effect per monitoraggio dati in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[STORICO][DATA] dataset-v5 updated:', { 
        length: storicoDatasetV5.length, 
        filters, 
        timestamp: new Date().toISOString() 
      });
    }
  }, [storicoDatasetV5, filters]);

  if (storicoError) {
  }

  // Query per turni completi (legacy, per compatibilità componenti)
  const turniQuery = useQuery({
    queryKey: ['turni-completi-legacy', filters],
    queryFn: () => loadTurniFull({ pin: filters.pin, from: filters.dal, to: filters.al }),
    enabled: !!dipendente,
  });

  const turniGiornalieri = toGiornoLogicoDettagliato(turniQuery.data ?? []);
  const isLoadingLegacy = turniQuery.isLoading;
  const turniError = turniQuery.error;

  if (turniError) {
  }

  // Trasforma dataset v5 in formato StoricoRowData per tabella con sotto-righe
  const storicoDataset = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dataset transformation structure varies
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

  // Hook per export - Lazy-load condizionale (feature flag)
  const LAZY_EXPORT = import.meta.env.VITE_FEATURE_LAZY_EXPORT !== '0';

  const handleExportPDF = useCallback(async () => {
    if (LAZY_EXPORT) {
      // Lazy-load: carica useStoricoExport solo al click
      const { useStoricoExport } = await import('@/hooks/useStoricoExport');
      const exportHook = useStoricoExport({
        dipendente,
        timbrature: turniGiornalieri,
        filters,
      });
      return exportHook.handleExportPDF();
    } else {
      // Fallback: import statico (per rollback)
      const { useStoricoExport } = await import('@/hooks/useStoricoExport');
      const exportHook = useStoricoExport({
        dipendente,
        timbrature: turniGiornalieri,
        filters,
      });
      return exportHook.handleExportPDF();
    }
  }, [LAZY_EXPORT, dipendente, turniGiornalieri, filters]);

  const handleExportXLS = useCallback(async () => {
    if (LAZY_EXPORT) {
      // Lazy-load: carica useStoricoExport solo al click
      const { useStoricoExport } = await import('@/hooks/useStoricoExport');
      const exportHook = useStoricoExport({
        dipendente,
        timbrature: turniGiornalieri,
        filters,
      });
      return exportHook.handleExportXLS();
    } else {
      // Fallback: import statico (per rollback)
      const { useStoricoExport } = await import('@/hooks/useStoricoExport');
      const exportHook = useStoricoExport({
        dipendente,
        timbrature: turniGiornalieri,
        filters,
      });
      return exportHook.handleExportXLS();
    }
  }, [LAZY_EXPORT, dipendente, turniGiornalieri, filters]);

  // Hook per mutations (deprecato - ora gestito direttamente in StoricoTimbrature)
  // const { updateMutation, deleteMutation } = useStoricoMutations(...);

  const _handleRealtimeChange = useCallback((_payload: unknown) => { void _payload; }, []);

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
    setSelectedGiorno,
  };
}
