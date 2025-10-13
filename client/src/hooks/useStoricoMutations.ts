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
      const entrate = timbratureGiorno.filter((t) => t.tipo === 'entrata');
      const uscite = timbratureGiorno.filter((t) => t.tipo === 'uscita');

      if (entrate.length > 0) {
        await TimbratureService.updateTimbratura(entrate[0].id.toString(), {
          data: updates.dataEntrata,
          ore: updates.oraEntrata + ':00',
        });
      }

      if (uscite.length > 0) {
        await TimbratureService.updateTimbratura(uscite[0].id.toString(), {
          data: updates.dataUscita,
          ore: updates.oraUscita + ':00',
          dataEntrata: updates.dataEntrata,
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
