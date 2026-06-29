import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { UtentiService, ExDipendente } from '@/services/utenti.service';

/**
 * Hook per query ex-dipendenti in sola lettura
 * Usa staleTime conservativo per non stressare la rete
 */
export function useExDipendentiQuery() {
  return useQuery({
    queryKey: ['ex-dipendenti', { order: 'archived_at_desc' }],
    queryFn: async (): Promise<ExDipendente[]> => {
      try {
        return await UtentiService.getExDipendenti();
      } catch (error) {
        console.error('[useExDipendenti] Error fetching ex-dipendenti:', error);
        // Ritorna array vuoto invece di lanciare eccezione
        return [];
      }
    },
    staleTime: 60 * 1000, // 60s: allineato al default, evita refetch ad ogni navigazione
    placeholderData: keepPreviousData, // tiene i dati precedenti durante il refetch (no svuotamento tabella)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1, // Solo un retry per evitare spam
  });
}
