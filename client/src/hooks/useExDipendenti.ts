import { useQuery } from '@tanstack/react-query';
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
    staleTime: 30 * 1000, // 30 secondi - conservativo per non stressare la rete
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1, // Solo un retry per evitare spam
  });
}
