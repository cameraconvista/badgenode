import { useQueryClient } from '@tanstack/react-query';
import { logStoricoQueries, logActiveQueries } from '@/lib/debugQuery';

// Utility per refetch di tutte le query attive
export function useRefetchAll(pin: number) {
  const qc = useQueryClient();

  return async () => {
    const DEBUG = process.env.NODE_ENV !== 'production';
    if (DEBUG) console.log('[HOOK] refetchAll started →', { pin });
    
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
    
    if (DEBUG) console.log('[HOOK] refetchAll completed');
  };
}
