/**
 * Normalizza errori di vario tipo in stringhe leggibili per l'UI
 * Evita "[object Object]" e gestisce strutture API complesse
 */

interface ApiErrorStructure {
  code?: string;
  message?: string;
  error?: string;
  issues?: unknown[];
  status?: number;
}

/**
 * Converte qualsiasi errore in stringa leggibile
 */
export function normalizeError(e: unknown): string {
  // Null/undefined
  if (!e) return 'Errore sconosciuto';
  
  // Già stringa
  if (typeof e === 'string') return e;
  
  // Error object standard
  if (e instanceof Error) return e.message || 'Errore sconosciuto';
  
  // Struttura API con code/message
  if (typeof e === 'object') {
    const apiErr = e as ApiErrorStructure;
    
    // Formato API strutturato
    if (apiErr.code && apiErr.message) {
      return `${apiErr.code}: ${apiErr.message}`;
    }
    
    // Solo message
    if (apiErr.message) return apiErr.message;
    
    // Solo error field
    if (apiErr.error) return apiErr.error;
    
    // Issues array (validazione)
    if (Array.isArray(apiErr.issues) && apiErr.issues.length > 0) {
      const firstIssue = apiErr.issues[0];
      if (typeof firstIssue === 'string') return firstIssue;
      if (firstIssue && typeof firstIssue === 'object') {
        return JSON.stringify(firstIssue).slice(0, 100);
      }
    }
  }
  
  // Fallback: JSON stringify limitato
  try {
    const jsonStr = JSON.stringify(e);
    if (jsonStr && jsonStr !== '{}') {
      return jsonStr.slice(0, 200);
    }
  } catch {
    // JSON.stringify failed
  }
  
  // Ultimo fallback
  return 'Errore durante l\'operazione';
}

/**
 * Normalizza errori specifici per operazioni utenti
 */
export function normalizeUserError(e: unknown): string {
  const base = normalizeError(e);
  
  // Mappature specifiche per codici comuni
  if (typeof e === 'object' && e) {
    const apiErr = e as ApiErrorStructure;
    
    switch (apiErr.code) {
      case 'DUPLICATE_PIN':
      case 'PIN_TAKEN':
        return 'PIN già in uso, scegli un numero diverso';
      case 'INVALID_PIN':
        return 'PIN deve essere tra 1 e 99';
      case 'MISSING_PARAMS':
        return 'Campi obbligatori mancanti';
      case 'QUERY_ERROR':
        return 'Errore del database, riprova più tardi';
      case 'SERVICE_UNAVAILABLE':
        return 'Servizio temporaneamente non disponibile';
      default:
        return base;
    }
  }
  
  return base;
}
