import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { loadTurniFull, buildDatasetFromTurni, StoricoDatasetV5 } from '@/services/storico.service';
import { GiornoLogicoDettagliato } from '@/lib/storico/types';
import { aggregateTimbratureByGiornoLogico } from '@/lib/storico/aggregate';
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
import { getMeseItaliano } from '@/lib/time';
import { computeStoricoInitialFilters } from '@/hooks/useStoricoInitialFilters';
import { useToast } from '@/hooks/use-toast';

export function useStoricoTimbrature(pin: number) {
  const { isAdmin } = useAuth();

  // State per filtri (periodo iniziale: eredita ?dal/?al dall'URL, es. dalla
  // Dashboard, altrimenti mese corrente — vedi computeStoricoInitialFilters).
  const [filters, setFilters] = useState(() => computeStoricoInitialFilters(pin));

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
    queryFn: async () => await UtentiService.getUtenteByPin(pin),
    enabled: pin > 0,
  });

  const normalizedDipendente = dipendente ?? undefined;

  if (dipendenteError) {
  }

  // Query UNICA di base: carica i turni una sola volta dalla rete.
  // Sia il dataset v5 (tabella) sia i turni giornalieri (export) derivano da qui,
  // evitando la doppia chiamata a loadTurniFull (prima erano 2 query separate).
  const turniQuery = useQuery({
    queryKey: ['turni-base', filters],
    queryFn: () => loadTurniFull({ pin: filters.pin, from: filters.dal, to: filters.al }),
    enabled: !!dipendente,
    placeholderData: keepPreviousData,
  });

  const turniBase = turniQuery.data ?? [];

  // Query record GREZZI del range: servono per ricostruire le singole sessioni
  // (turni spezzati). Stessa fonte usata dalla modale di modifica.
  // I TOTALI restano governati da `storicoDatasetV5` (API) — qui aggiungiamo
  // solo il dettaglio sessioni alla tabella, senza alterare alcun calcolo.
  const rawQuery = useQuery({
    queryKey: ['timbrature-raw', filters],
    queryFn: () =>
      TimbratureService.getTimbratureByRange({ pin: filters.pin, from: filters.dal, to: filters.al }),
    enabled: !!dipendente,
    placeholderData: keepPreviousData,
  });

  const rawRows = rawQuery.data ?? [];
  const isLoadingTimbrature = turniQuery.isLoading || rawQuery.isLoading;

  // Dataset v5 derivato (trasformazione pura, nessuna seconda chiamata di rete).
  // RESTA la fonte di verità per i totali mensili (StoricoTotalsBar).
  const storicoDatasetV5 = useMemo<StoricoDatasetV5[]>(
    () => buildDatasetFromTurni(turniBase, filters.dal, filters.al),
    [turniBase, filters.dal, filters.al]
  );

  // Giorni con sessioni multiple ricostruite dai record grezzi (per la tabella).
  // Indicizzati per giorno_logico per un lookup O(1).
  const sessioniPerGiorno = useMemo(() => {
    const mapped = rawRows.map((r) => ({
      pin: filters.pin,
      tipo: String(r.tipo) as 'entrata' | 'uscita',
      ore: String(r.ora_locale ?? ''),
      giorno_logico: String(r.giorno_logico ?? r.data_locale ?? ''),
      created_at: String(r.created_at ?? r.ts_order ?? ''),
    }));
    const giorni = aggregateTimbratureByGiornoLogico(
      mapped,
      filters.pin,
      dipendente?.ore_contrattuali || 8
    );
    return new Map(giorni.map((g) => [g.giorno, g]));
  }, [rawRows, filters.pin, dipendente?.ore_contrattuali]);

  // Turni per export: derivati da storicoDatasetV5 così includono TUTTI i giorni
  // del periodo (anche quelli vuoti, come la tabella a video). Ore aggregate
  // invariate (fonte di verità API) + sessioni reali dai grezzi per gli spezzati.
  const oreContrattualiExport = dipendente?.ore_contrattuali || 8;
  const turniGiornalieri = useMemo(
    () =>
      storicoDatasetV5.map((item) => ({
        pin: filters.pin,
        giorno: item.giorno_logico,
        mese_label: getMeseItaliano(item.giorno_logico),
        entrata: item.sessioni.length > 0 ? item.sessioni[0].entrata_ore : null,
        uscita:
          item.sessioni.length > 0 ? item.sessioni[item.sessioni.length - 1].uscita_ore : null,
        ore: item.ore_totali_chiuse,
        extra: Math.max(0, item.ore_totali_chiuse - oreContrattualiExport),
        sessioni: sessioniPerGiorno.get(item.giorno_logico)?.sessioni ?? [],
      })),
    [storicoDatasetV5, sessioniPerGiorno, filters.pin, oreContrattualiExport]
  );

  // Trasforma dataset v5 in formato StoricoRowData per tabella con sotto-righe.
  // Le SESSIONI vengono dai record grezzi (turni spezzati reali); le ORE TOTALI
  // del giorno restano quelle dell'API (`storicoDatasetV5`) come fonte di verità:
  // la visualizzazione non può mai alterare un totale già corretto.
  const storicoDataset = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dataset transformation structure varies
    const dataset: any[] = [];
    const oreContrattuali = dipendente?.ore_contrattuali || 8;

    storicoDatasetV5.forEach((item) => {
      // Sessioni reali ricostruite dai grezzi per questo giorno (se presenti).
      const giornoSessioni = sessioniPerGiorno.get(item.giorno_logico);
      const sessioni = giornoSessioni?.sessioni ?? [];
      const hasSessioniReali = sessioni.length > 0;

      // Visualizzazione "due righe pari": la riga-giorno mostra la PRIMA sessione
      // (es. 09-13), NON l'intervallo compresso prima-entrata→ultima-uscita (che
      // per uno spezzato darebbe 09-02, fuorviante). Le sessioni successive sono
      // righe allo stesso livello. Le ORE della riga-giorno restano il TOTALE del
      // giorno (fonte di verità API), così il conteggio resta chiaro e corretto.
      const sessioniFallback = item.sessioni.map((s) => ({
        numeroSessione: s.sessione_num,
        entrata: s.entrata_ore,
        uscita: s.uscita_ore,
        ore: s.ore_sessione,
        isAperta: !s.uscita_ore,
      }));
      const sessioniGiorno = hasSessioniReali ? sessioni : sessioniFallback;
      const primaSessione = sessioniGiorno[0];

      const isSpezzato = sessioniGiorno.length > 1;

      const giornoDettagliato: GiornoLogicoDettagliato = {
        pin: filters.pin,
        giorno: item.giorno_logico,
        mese_label: getMeseItaliano(item.giorno_logico),
        // Entrata/uscita = PRIMA sessione (non intervallo compresso).
        entrata: primaSessione?.entrata ?? null,
        uscita: primaSessione?.isAperta ? null : (primaSessione?.uscita ?? null),
        // Ore: se spezzato, la riga-giorno mostra le ore della PRIMA sessione
        // (ogni riga = una sessione, "due righe pari"); il totale del giorno è
        // in una riga 'totale' dedicata. Se non spezzato, è già il totale.
        ore: isSpezzato ? (primaSessione?.ore ?? 0) : item.ore_totali_chiuse,
        // L'extra è una proprietà del GIORNO: si mostra solo sulla riga totale
        // (o sulla riga-giorno se non spezzato), mai sulla prima sessione.
        extra: isSpezzato ? 0 : Math.max(0, item.ore_totali_chiuse - oreContrattuali),
        sessioni: sessioniGiorno,
      };

      dataset.push({
        type: 'giorno',
        giorno: giornoDettagliato,
      });

      // Sotto-righe sessioni (dalla 2ª in poi): righe allo stesso livello.
      if (isSpezzato) {
        sessioniGiorno.slice(1).forEach((sessione) => {
          dataset.push({
            type: 'sessione',
            sessione,
            giornoParent: item.giorno_logico,
          });
        });
        // Riga totale del giorno: rende inequivocabile la somma delle sessioni.
        dataset.push({
          type: 'totale',
          giornoParent: item.giorno_logico,
          oreTotali: item.ore_totali_chiuse,
          extraTotale: Math.max(0, item.ore_totali_chiuse - oreContrattuali),
        });
      }
    });

    return dataset;
  }, [storicoDatasetV5, sessioniPerGiorno, dipendente?.ore_contrattuali, filters.pin]);

  // Query per timbrature del giorno selezionato (per modale)
  const { data: timbratureGiorno = [] } = useQuery({
    queryKey: ['timbrature-giorno', pin, selectedGiorno],
    queryFn: () => TimbratureService.getTimbratureGiorno(pin, selectedGiorno!),
    enabled: !!selectedGiorno,
  });

  // Export handlers - Lazy-load funzioni dirette (non hook)
  const { toast } = useToast();

  const handleExportPDF = useCallback(async () => {
    try {
      // Lazy-load: carica funzione export solo al click
      const { exportPDF } = await import('@/hooks/useStoricoExport');
      await exportPDF({
        dipendente: normalizedDipendente,
        timbrature: turniGiornalieri,
        filters,
        toast,
      });
    } catch (error) {
      console.error('[useStoricoTimbrature] Export PDF failed:', error);
    }
  }, [normalizedDipendente, turniGiornalieri, filters, toast]);

  const handleExportXLS = useCallback(async () => {
    try {
      // Lazy-load: carica funzione export solo al click
      const { exportXLS } = await import('@/hooks/useStoricoExport');
      await exportXLS({
        dipendente: normalizedDipendente,
        timbrature: turniGiornalieri,
        filters,
        toast,
      });
    } catch (error) {
      console.error('[useStoricoTimbrature] Export Excel failed:', error);
    }
  }, [normalizedDipendente, turniGiornalieri, filters, toast]);

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
    dipendente: normalizedDipendente,
    filters,
    selectedGiorno,
    turniGiornalieri,
    storicoDataset,
    storicoDatasetV5,
    timbratureGiorno,
    isLoading: isLoadingTimbrature,
    handleFiltersChange,
    handleEditTimbrature,
    handleExportPDF,
    handleExportXLS,
    setSelectedGiorno,
  };
}
