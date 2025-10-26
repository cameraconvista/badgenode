import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { callUpdateTimbro } from '@/services/timbratureRpc';
import { useRefetchAll } from './shared';
import type { UpdateData, LegacyTimbratura } from './types';

export function useUpdateMutation(pin: number, onSuccess?: () => void) {
  const { toast } = useToast();
  const refetchAll = useRefetchAll(pin);

  return useMutation({
    mutationFn: async (updates: UpdateData) => {
      if (process.env.NODE_ENV === 'development') console.log('[MODALE] onSave (LEGACY) →', updates);
      
      // Legacy: non più usato, rimosso per compatibilità
      const entrate: LegacyTimbratura[] = [];
      const uscite: LegacyTimbratura[] = [];

      const results = [];

      // Aggiorna entrata se presente
      if (entrate.length > 0) {
        const entrata = entrate[0];
        const entrataUpdate = {
          data_locale: updates.dataEntrata,
          ora_locale: `${updates.oraEntrata}:00`,
          giorno_logico: updates.dataEntrata,
        };
        if (process.env.NODE_ENV === 'development') console.log('[HOOK] updating entrata →', { id: entrata.id, update: entrataUpdate });
        const result = await callUpdateTimbro({ id: entrata.id, updateData: entrataUpdate });
        results.push(result);
      }

      // Aggiorna uscita se presente
      if (uscite.length > 0) {
        const uscita = uscite[0];
        const uscitaUpdate = {
          data_locale: updates.dataUscita,
          ora_locale: `${updates.oraUscita}:00`,
          giorno_logico: updates.dataUscita,
        };
        if (process.env.NODE_ENV === 'development') console.log('[HOOK] updating uscita →', { id: uscita.id, update: uscitaUpdate });
        const result = await callUpdateTimbro({ id: uscita.id, updateData: uscitaUpdate });
        results.push(result);
      }

      return results;
    },
    onSuccess: async (_results) => {
      if (process.env.NODE_ENV === 'development') console.log('[HOOK] mutation success, starting refetch');
      
      await refetchAll();
      
      toast({
        title: 'Timbrature aggiornate',
        description: 'Le modifiche sono state salvate con successo',
      });
      
      console.log('[HOOK] refetch completed, calling onSuccess');
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : "Errore durante l'aggiornamento",
        variant: 'destructive',
      });
    },
  });
}
