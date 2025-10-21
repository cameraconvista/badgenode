// Utility di debug per React Query - Diagnosi refetch
import { QueryClient } from '@tanstack/react-query';

export function logStoricoQueries(qc: QueryClient, context = '') {
  const entries = qc.getQueriesData({ queryKey: ['storico'] });
  const legacyEntries = qc.getQueriesData({ queryKey: ['turni-completi-legacy'] });
  const datasetEntries = qc.getQueriesData({ queryKey: ['storico-dataset-v5'] });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[RQ-DEBUG] ${context} legacy queries:`, {
    storico: entries.map(([key, data]) => ({ 
      key, 
      hasData: !!data, 
      len: Array.isArray(data) ? data.length : undefined,
      type: typeof data
    })),
    legacy: legacyEntries.map(([key, data]) => ({ 
      key, 
      hasData: !!data, 
      len: Array.isArray(data) ? data.length : undefined 
    })),
    dataset: datasetEntries.map(([key, data]) => ({ 
      key, 
      hasData: !!data, 
      len: Array.isArray(data) ? data.length : undefined 
    }))
    });
  }
}

export function logActiveQueries(qc: QueryClient, context = '') {
  const cache = qc.getQueryCache();
  const queries = cache.getAll();
  
  const storicoQueries = queries.filter(q => 
    q.queryKey[0] === 'storico' || 
    q.queryKey[0] === 'turni-completi-legacy' ||
    q.queryKey[0] === 'storico-dataset-v5'
  );
  
  console.log(`[RQ-DEBUG] ${context} active storico queries:`, 
    storicoQueries.map(q => ({
      key: q.queryKey,
      state: q.state.status,
      // isFetching: q.isFetching(), // TODO: fix type
      observers: q.getObserversCount(),
      dataUpdatedAt: new Date(q.state.dataUpdatedAt).toISOString()
    }))
  );
}
