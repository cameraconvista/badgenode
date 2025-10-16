import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { callUpdateTimbro, deleteTimbratureGiornata } from '@/services/timbratureRpc';
import { TimbratureService } from '@/services/timbrature.service';
import { logStoricoQueries, logActiveQueries } from '@/lib/debugQuery';
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
    
    // Log stato PRIMA del refetch
    logActiveQueries(qc, 'BEFORE refetch');
    logStoricoQueries(qc, 'BEFORE refetch');
    
    // Refetch con chiavi specifiche e generiche
    await Promise.all([
      // Refetch generici
      qc.refetchQueries({ queryKey: ['storico'], type: 'active' }),
      qc.refetchQueries({ queryKey: ['timbrature'], type: 'active' }),
      qc.refetchQueries({ queryKey: ['turni-completi-legacy'], type: 'active' }),
      qc.refetchQueries({ queryKey: ['storico-dataset-v5'], type: 'active' }),
      
      // Refetch con PIN specifico
      pin ? qc.refetchQueries({ queryKey: ['storico', pin], type: 'active' }) : Promise.resolve(),
      pin ? qc.refetchQueries({ queryKey: ['timbrature', pin], type: 'active' }) : Promise.resolve(),
      
      // Refetch con filtri (pattern più probabile)
      qc.refetchQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Boolean(
            (key[0] === 'storico-dataset-v5' && key[1] && typeof key[1] === 'object') ||
            (key[0] === 'turni-completi-legacy' && key[1] && typeof key[1] === 'object')
          );
        }
      }),
    ]);
    
    // Log stato DOPO il refetch
    logActiveQueries(qc, 'AFTER refetch');
    logStoricoQueries(qc, 'AFTER refetch');
    
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
    mutationFn: async ({ giorno }: { giorno: string }) => {
      console.log('[HOOK] deleteMutation started →', { pin, giorno });
      
      const result = await deleteTimbratureGiornata({ pin, giorno });
      
      console.log('[HOOK] deleteMutation completed →', { 
        pin, 
        giorno, 
        deletedCount: result.deleted_count 
      });
      
      return result;
    },
    onSuccess: async (result) => {
      console.log('[HOOK] delete success, starting refetch');
      
      // Refetch obbligato di tutte le query attive
      await refetchAll();
      
      toast({
        title: 'Timbrature eliminate',
        description: `${result.deleted_count} timbrature eliminate con successo`,
      });
      
      console.log('[HOOK] delete refetch completed, calling onSuccess');
      onSuccess();
    },
    onError: (error) => {
      console.error('[HOOK] delete error →', error);
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : "Errore durante l'eliminazione",
        variant: 'destructive',
      });
    },
  });

  return { updateMutation, deleteMutation };
}
