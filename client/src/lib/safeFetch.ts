/**
 * Wrapper robusto per fetch JSON che gestisce:
 * - Risposte 204 (No Content)
 * - Body vuoti o non-JSON
 * - Errori HTTP con parsing intelligente del body
 * - Prevenzione "Unexpected end of JSON input"
 */

export async function safeFetchJson(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  const contentType = res.headers.get('content-type') || '';
  
  // Se non ok, tenta di leggere JSON, altrimenti testo
  if (!res.ok) {
    let errBody: any = null;
    try {
      errBody = contentType.includes('application/json') ? await res.json() : await res.text();
    } catch { 
      // body vuoto o non parsabile
    }
    
    const msg = typeof errBody === 'string' ? errBody : (errBody?.error || `HTTP ${res.status}`);
    throw new Error(msg);
  }
  
  // 204 o body vuoto → torna oggetto minimo
  if (res.status === 204) {
    return { success: true };
  }
  
  // non JSON → non tentare parse
  if (!contentType.includes('application/json')) {
    return { success: true };
  }
  
  // JSON valido
  try { 
    return await res.json(); 
  } catch { 
    // evita "Unexpected end of JSON input"
    return { success: true }; 
  }
}

/**
 * Wrapper per POST JSON con headers automatici
 */
export async function safeFetchJsonPost(url: string, body: any, options?: RequestInit) {
  return safeFetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * Wrapper per PATCH JSON con headers automatici
 */
export async function safeFetchJsonPatch(url: string, body: any, options?: RequestInit) {
  return safeFetchJson(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * Wrapper per DELETE con query params
 */
export async function safeFetchJsonDelete(url: string, params?: Record<string, string>, options?: RequestInit) {
  const urlWithParams = params ? `${url}?${new URLSearchParams(params).toString()}` : url;
  return safeFetchJson(urlWithParams, {
    method: 'DELETE',
    ...options,
  });
}
