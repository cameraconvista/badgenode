// Hook principale per mutations dello storico - Mantiene stessa interfaccia pubblica
import { useSaveFromModalMutation } from './useSaveFromModalMutation';
import { useDeleteMutation } from './useDeleteMutation';
import type { StoricoMutationsParams } from './types';

export function useStoricoMutations(params: StoricoMutationsParams, onSuccess?: () => void) {
  const { pin } = params;

  // Crea gli handler realmente consumati dallo storico
  const saveFromModal = useSaveFromModalMutation(pin, onSuccess);
  const deleteMutation = useDeleteMutation(pin, onSuccess);

  return {
    deleteMutation,
    saveFromModal,
  };
}

// Re-export dei tipi per compatibilità
export type { UpdateData, UpsertTimbroInput, UpsertTimbroResult, DeleteTimbroInput, LegacyTimbratura } from './types';
