// Hook principale per mutations dello storico - Mantiene stessa interfaccia pubblica
import { useSaveFromModalMutation } from './useSaveFromModalMutation';
import { useUpdateMutation } from './useUpdateMutation';
import { useDeleteMutation } from './useDeleteMutation';
import type { StoricoMutationsParams } from './types';

export function useStoricoMutations(params: StoricoMutationsParams, onSuccess?: () => void) {
  const { pin } = params;

  // Crea i tre handler mantenendo gli stessi nomi del file originale
  const saveFromModal = useSaveFromModalMutation(pin, onSuccess);
  const updateMutation = useUpdateMutation(pin, onSuccess);
  const deleteMutation = useDeleteMutation(pin, onSuccess);

  // Ritorna la stessa interfaccia del file originale
  return { 
    updateMutation, 
    deleteMutation, 
    saveFromModal 
  };
}

// Re-export dei tipi per compatibilità
export type { UpdateData, UpsertTimbroInput, UpsertTimbroResult, DeleteTimbroInput, LegacyTimbratura } from './types';
