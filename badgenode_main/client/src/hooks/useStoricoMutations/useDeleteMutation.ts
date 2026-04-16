import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { isError } from '@/types/api';
import { deleteTimbratureGiornata } from '@/services/timbratureRpc';
import { useRefetchAll } from './shared';

export function useDeleteMutation(pin: number, onSuccess?: () => void) {
  const { toast } = useToast();
  const refetchAll = useRefetchAll(pin);

  return useMutation({
    mutationFn: async ({ giorno }: { giorno: string }) => {
      if (process.env.NODE_ENV === 'development') console.log('[HOOK] deleteMutation started →', { pin, giorno });
      
      const result = await deleteTimbratureGiornata({ pin, giorno });
      
      if (process.env.NODE_ENV === 'development') console.log('[HOOK] deleteMutation completed →', { 
        pin, 
        giorno, 
        deletedCount: isError(result) ? 0 : (result as any)?.deleted_count ?? 0 
      });
      
      return result;
    },
    onSuccess: async (result) => {
      if (process.env.NODE_ENV === 'development') console.log('[HOOK] delete success, starting refetch');
      
      // Refetch obbligato di tutte le query attive
      await refetchAll();
      
      toast({
        title: 'Timbrature eliminate',
        description: `${isError(result) ? 0 : (result as any)?.deleted_count ?? 0} timbrature eliminate con successo`,
      });
      
      if (process.env.NODE_ENV === 'development') console.log('[HOOK] delete refetch completed, calling onSuccess');
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
}
