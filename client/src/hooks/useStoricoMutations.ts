import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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
      
      console.log('[SERVICE] ids →', { idEntrata, idUscita });

      // Aggiorna entrata se esiste
      if (idEntrata) {
        const updateDataEntrata = {
          data_locale: updates.dataEntrata,
          ora_locale: updates.oraEntrata + ':00'
        };
        console.log('[SERVICE] payloads → updateDataEntrata:', updateDataEntrata);
        
        await TimbratureService.updateTimbratura({
          id: idEntrata,
          updateData: updateDataEntrata,
        });
      }

      // Aggiorna uscita se esiste
      if (idUscita) {
        const updateDataUscita = {
          data_locale: updates.dataUscita,
          ora_locale: updates.oraUscita + ':00'
        };
        console.log('[SERVICE] payloads → updateDataUscita:', updateDataUscita);
        
        await TimbratureService.updateTimbratura({
          id: idUscita,
          updateData: updateDataUscita,
        });
      }
    },
    onSuccess: () => {
      toast({
        title: 'Timbrature aggiornate',
        description: 'Le modifiche sono state salvate con successo',
      });
      queryClient.invalidateQueries({ queryKey: ['timbrature'] });
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
