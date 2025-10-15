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
  const qc = useQueryClient();
  
  // Pin per refetch specifici
  const pin = timbratureGiorno[0]?.pin;

  // Refetch obbligato di tutte le query attive
  const refetchAll = async () => {
    console.log('[HOOK] refetchAll started →', { pin });
    await Promise.all([
      qc.refetchQueries({ queryKey: ['storico'], type: 'active' }),
      qc.refetchQueries({ queryKey: ['timbrature'], type: 'active' }),
      qc.refetchQueries({ queryKey: ['turni-completi-legacy'], type: 'active' }),
      pin ? qc.refetchQueries({ queryKey: ['storico', pin], type: 'active' }) : Promise.resolve(),
      pin ? qc.refetchQueries({ queryKey: ['timbrature', pin], type: 'active' }) : Promise.resolve(),
    ]);
    console.log('[HOOK] refetchAll completed');
  };

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
    onSuccess: async (results) => {
      console.log('[HOOK] mutation success, starting refetch');
      
      // Refetch obbligato di tutte le query attive
      await refetchAll();
      
      toast({
        title: 'Timbrature aggiornate',
        description: 'Le modifiche sono state salvate con successo',
      });
      
      console.log('[HOOK] refetch completed, calling onSuccess');
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
      qc.invalidateQueries({ queryKey: ['timbrature'] });
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
