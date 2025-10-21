/**
 * Wrapper robusto per fetch JSON che gestisce:
 * - Risposte 204 (No Content)
 * - Body vuoti o non-JSON
 * - Errori HTTP con parsing intelligente del body
 * - Prevenzione "Unexpected end of JSON input"
 */
import { getApiBaseUrl } from './apiBase';

// Tipi per eliminare any types
interface ErrorResponse {
  code?: string;
  message?: string;
  error?: string;
  issues?: unknown[];
}

interface StructuredError {
  code?: string;
  message: string;
  issues?: unknown[];
  status: number;
}

interface SuccessResponse {
  success: true;
}

type ApiResponse = Record<string, unknown> | SuccessResponse;

export async function safeFetchJson(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResponse> {
  let finalInput: RequestInfo | URL = input;
  if (typeof input === 'string' && input.startsWith('/api/')) {
    finalInput = `${getApiBaseUrl()}${input}`;
  }
  const res = await fetch(finalInput, { credentials: 'include', ...(init || {}) });
  const contentType = res.headers.get('content-type') || '';
  
  // Se non ok, tenta di leggere JSON, altrimenti testo
  if (!res.ok) {
    let errBody: ErrorResponse | string | null = null;
    try {
      errBody = contentType.includes('application/json') ? await res.json() : await res.text();
    } catch {
      // body vuoto o non parsabile
    }

    // Se il server fornisce struttura { code, message, issues }, propagala
    if (errBody && typeof errBody === 'object' && (errBody.code || errBody.message)) {
      const structured: StructuredError = {
        code: errBody.code,
        message: errBody.message || errBody.error || `HTTP ${res.status}`,
        issues: errBody.issues,
        status: res.status,
      };
      // lanciando un oggetto plain, il chiamante può leggere code/message
      throw structured;
    }

    const msg = typeof errBody === 'string' ? errBody : (errBody as ErrorResponse)?.error || `HTTP ${res.status}`;
    const e = new Error(msg) as Error & { status: number };
    e.status = res.status;
    throw e;
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
export async function safeFetchJsonPost(url: string, body: Record<string, unknown>, options?: RequestInit): Promise<ApiResponse> {
  const fullUrl = url.startsWith('/api/') ? `${getApiBaseUrl()}${url}` : url;
  return safeFetchJson(fullUrl, {
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
export async function safeFetchJsonPatch(url: string, body: Record<string, unknown>, options?: RequestInit): Promise<ApiResponse> {
  const fullUrl = url.startsWith('/api/') ? `${getApiBaseUrl()}${url}` : url;
  return safeFetchJson(fullUrl, {
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
export async function safeFetchJsonDelete(url: string, params?: Record<string, string>, options?: RequestInit): Promise<ApiResponse> {
  const base = url.startsWith('/api/') ? `${getApiBaseUrl()}${url}` : url;
  const urlWithParams = params ? `${base}?${new URLSearchParams(params).toString()}` : base;
  return safeFetchJson(urlWithParams, {
    method: 'DELETE',
    ...options,
  });
}
