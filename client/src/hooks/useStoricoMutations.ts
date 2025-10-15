import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { callUpdateTimbro } from '@/services/timbratureRpc';
import { TimbratureService } from '@/services/timbrature.service';
import type { Timbratura } from '@/types/timbrature';

interface UpdateData {
  dataEntrata: string;
  oraEntrata: string;
  dataUscita: string;
  oraUscita: string;
}

export function useStoricoMutations(timbratureGiorno: Timbratura[], onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: UpdateData) => {
      console.log('[MODALE] onSave →', updates);
      
      const entrate = timbratureGiorno.filter((t) => t.tipo === 'entrata');
      const uscite = timbratureGiorno.filter((t) => t.tipo === 'uscita');

      const idEntrata = entrate[0]?.id;
      const idUscita = uscite[0]?.id;
      
      console.log('[HOOK] ids →', { idEntrata, idUscita });

      const results = [];

      // Aggiorna entrata se esiste
      if (idEntrata) {
        const updateDataEntrata = {
          data_locale: updates.dataEntrata,
          ora_locale: updates.oraEntrata + ':00'
        };
        console.log('[HOOK] updating entrata →', { id: idEntrata, updateDataEntrata });
        
        const result = await callUpdateTimbro({
          id: idEntrata,
          updateData: updateDataEntrata,
        });
        results.push(result.data);
      }

      // Aggiorna uscita se esiste
      if (idUscita) {
        const updateDataUscita = {
          data_locale: updates.dataUscita,
          ora_locale: updates.oraUscita + ':00'
        };
        console.log('[HOOK] updating uscita →', { id: idUscita, updateDataUscita });
        
        const result = await callUpdateTimbro({
          id: idUscita,
          updateData: updateDataUscita,
        });
        results.push(result.data);
      }

      return results;
    },
    onSuccess: (results, variables) => {
      toast({
        title: 'Timbrature aggiornate',
        description: 'Le modifiche sono state salvate con successo',
      });
      
      // Invalida tutte le query rilevanti per aggiornare la UI
      queryClient.invalidateQueries({ queryKey: ['storico'] });
      queryClient.invalidateQueries({ queryKey: ['timbrature'] });
      queryClient.invalidateQueries({ queryKey: ['turni-completi-legacy'] });
      
      // Invalida query specifiche per PIN se disponibile
      const pin = timbratureGiorno[0]?.pin;
      if (pin) {
        queryClient.invalidateQueries({ queryKey: ['storico', pin] });
        queryClient.invalidateQueries({ queryKey: ['timbrature', pin] });
      }
      
      console.log('[HOOK] cache invalidated, calling onSuccess');
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : "Errore durante l'aggiornamento",
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      for (const timbratura of timbratureGiorno) {
        await TimbratureService.deleteById(timbratura.id, {});
      }
    },
    onSuccess: () => {
      toast({
        title: 'Timbrature eliminate',
        description: 'Le timbrature del giorno sono state eliminate',
      });
      queryClient.invalidateQueries({ queryKey: ['timbrature'] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : "Errore durante l'eliminazione",
        variant: 'destructive',
      });
    },
  });

  return { updateMutation, deleteMutation };
}
