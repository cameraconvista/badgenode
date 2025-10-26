import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { callUpdateTimbro, createTimbroManual } from '@/services/timbratureRpc';
import { computeGiornoLogico } from '@/lib/time';
import { useRefetchAll } from './shared';

export function useSaveFromModalMutation(pin: number, onSuccess?: () => void) {
  const { toast } = useToast();
  const refetchAll = useRefetchAll(pin);

  return useMutation({
    mutationFn: async (vars: {
      idEntrata?: number; 
      idUscita?: number;
      dataEntrata?: string; 
      oraEntrata?: string;
      dataUscita?: string;  
      oraUscita?: string;
    }) => {
      if (process.env.NODE_ENV === 'development') console.log('[HOOK] saveFromModal →', vars);
      
      const entrataOps: Promise<any>[] = [];
      const uscitaOps: Promise<any>[] = [];

      // ENTRATA: create o update (sempre PRIMA)
      if (vars.dataEntrata && vars.oraEntrata) {
        if (vars.idEntrata) {
          if (process.env.NODE_ENV === 'development') console.log('[HOOK] updating entrata →', { id: vars.idEntrata });
          const giornoLogicoEntrata = computeGiornoLogico({
            data: vars.dataEntrata,
            ora: vars.oraEntrata,
            tipo: 'entrata'
          }).giorno_logico;
          
          entrataOps.push(callUpdateTimbro({ 
            id: vars.idEntrata, 
            updateData: {
              data_locale: vars.dataEntrata, 
              ora_locale: `${vars.oraEntrata}:00`, 
              giorno_logico: giornoLogicoEntrata
            }
          }));
        } else {
          if (process.env.NODE_ENV === 'development') console.log('[HOOK] creating entrata →', { pin, giorno: vars.dataEntrata, ora: vars.oraEntrata });
          entrataOps.push(createTimbroManual({ 
            pin, 
            tipo: 'ENTRATA', 
            giorno: vars.dataEntrata, 
            ora: vars.oraEntrata 
          }));
        }
      }

      // USCITA: create o update
      if (vars.dataUscita && vars.oraUscita) {
        if (vars.idUscita) {
          if (process.env.NODE_ENV === 'development') console.log('[HOOK] updating uscita →', { id: vars.idUscita });
          const giornoLogicoUscita = computeGiornoLogico({
            data: vars.dataUscita,
            ora: vars.oraUscita,
            tipo: 'uscita',
            dataEntrata: vars.dataEntrata // Passa data entrata per uscite notturne
          }).giorno_logico;
          
          uscitaOps.push(callUpdateTimbro({ 
            id: vars.idUscita, 
            updateData: {
              data_locale: vars.dataUscita, 
              ora_locale: `${vars.oraUscita}:00`, 
              giorno_logico: giornoLogicoUscita
            }
          }));
        } else {
          if (process.env.NODE_ENV === 'development') console.log('[HOOK] creating uscita →', { pin, giorno: vars.dataUscita, ora: vars.oraUscita, anchorDate: vars.dataEntrata });
          uscitaOps.push(createTimbroManual({ 
            pin, 
            tipo: 'USCITA', 
            giorno: vars.dataUscita, 
            ora: vars.oraUscita,
            anchorDate: vars.dataEntrata // Passa data entrata per ancoraggio uscite notturne
          }));
        }
      }

      const totalOps = entrataOps.length + uscitaOps.length;
      if (totalOps === 0) {
        throw new Error('Nessun dato valido da salvare');
      }

      // Esecuzione SEQUENZIALE: PRIMA entrate, POI uscite
      const results = [];
      
      // 1. Esegui tutte le operazioni ENTRATA
      for (const op of entrataOps) {
        const result = await op;
        results.push(result);
      }
      
      // 2. Esegui tutte le operazioni USCITA
      for (const op of uscitaOps) {
        const result = await op;
        results.push(result);
      }
      
      return results;
    },
    onSuccess: async (_results) => {
      if (process.env.NODE_ENV === 'development') console.log('[HOOK] saveFromModal success, starting refetch');
      
      await refetchAll();
      
      toast({
        title: 'Timbrature salvate',
        description: 'Le modifiche sono state salvate con successo',
      });
      
      console.log('[HOOK] refetch completed, calling onSuccess');
      onSuccess?.();
    },
    onError: (error) => {
      console.error('[HOOK] saveFromModal error →', error);
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : "Errore durante il salvataggio",
        variant: 'destructive',
      });
    },
  });
}
