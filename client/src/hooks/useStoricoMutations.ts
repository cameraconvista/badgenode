import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { callUpdateTimbro, deleteTimbratureGiornata, createTimbroManual } from '@/services/timbratureRpc';
import { logStoricoQueries, logActiveQueries } from '@/lib/debugQuery';
import { computeGiornoLogico } from '@/lib/time';

interface UpdateData {
  dataEntrata: string;
  oraEntrata: string;
  dataUscita: string;
  oraUscita: string;
}

export function useStoricoMutations(params: { pin: number; dal: string; al: string }, onSuccess?: () => void) {
  const { toast } = useToast();
  const qc = useQueryClient();
  
  // Parametri per refetch specifici
  const { pin } = params;

  // Refetch obbligato di tutte le query attive
  const refetchAll = async () => {
    const DEBUG = process.env.NODE_ENV !== 'production';
    DEBUG && console.log('[HOOK] refetchAll started →', { pin });
    
    // Log stato PRIMA del refetch
    DEBUG && logActiveQueries(qc, 'BEFORE refetch');
    DEBUG && logStoricoQueries(qc, 'BEFORE refetch');
    
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
    DEBUG && logActiveQueries(qc, 'AFTER refetch');
    DEBUG && logStoricoQueries(qc, 'AFTER refetch');
    
    DEBUG && console.log('[HOOK] refetchAll completed');
  };

  // Mutazione unificata per CREATE/UPDATE dal Modale
  const saveFromModal = useMutation({
    mutationFn: async (vars: {
      idEntrata?: number; 
      idUscita?: number;
      dataEntrata?: string; 
      oraEntrata?: string;
      dataUscita?: string;  
      oraUscita?: string;
    }) => {
      console.log('[HOOK] saveFromModal →', vars);
      
      const entrataOps: Promise<any>[] = [];
      const uscitaOps: Promise<any>[] = [];

      // ENTRATA: create o update (sempre PRIMA)
      if (vars.dataEntrata && vars.oraEntrata) {
        if (vars.idEntrata) {
          console.log('[HOOK] updating entrata →', { id: vars.idEntrata });
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
          console.log('[HOOK] creating entrata →', { pin, giorno: vars.dataEntrata, ora: vars.oraEntrata });
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
          console.log('[HOOK] updating uscita →', { id: vars.idUscita });
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
          console.log('[HOOK] creating uscita →', { pin, giorno: vars.dataUscita, ora: vars.oraUscita });
          uscitaOps.push(createTimbroManual({ 
            pin, 
            tipo: 'USCITA', 
            giorno: vars.dataUscita, 
            ora: vars.oraUscita 
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
      console.log('[HOOK] saveFromModal success, starting refetch');
      
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

  // Mantieni updateMutation per compatibilità (deprecato)
  const updateMutation = useMutation({
    mutationFn: async (updates: UpdateData) => {
      console.log('[MODALE] onSave (LEGACY) →', updates);
      
      // Legacy: non più usato, rimosso per compatibilità
      const entrate: any[] = [];
      const uscite: any[] = [];

      const results = [];

      // Aggiorna entrata se presente
      if (entrate.length > 0) {
        const entrata = entrate[0];
        const entrataUpdate = {
          data_locale: updates.dataEntrata,
          ora_locale: `${updates.oraEntrata}:00`,
          giorno_logico: updates.dataEntrata,
        };
        console.log('[HOOK] updating entrata →', { id: entrata.id, update: entrataUpdate });
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
        console.log('[HOOK] updating uscita →', { id: uscita.id, update: uscitaUpdate });
        const result = await callUpdateTimbro({ id: uscita.id, updateData: uscitaUpdate });
        results.push(result);
      }

      return results;
    },
    onSuccess: async (_results) => {
      console.log('[HOOK] mutation success, starting refetch');
      
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
      onSuccess?.();
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

  return { updateMutation, deleteMutation, saveFromModal };
}
