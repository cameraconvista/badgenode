// client/src/lib/apiBase.ts

// Tipi per Vite env
interface ViteEnv {
  DEV?: boolean;
  MODE?: string;
  VITE_API_BASE_URL?: string;
}

export function getApiBaseUrl() {
  const env = (import.meta as { env: ViteEnv }).env || {};
  // In dev con proxy Vite, usa same-origin per sfruttare il proxy
  // Il proxy Vite inoltra /api/* a http://localhost:3001
  if (env.DEV) {
    return '';
  }
  // In produzione usa same-origin (backend e frontend stesso dominio)
  if (env.MODE === 'production') {
    return '';
  }
  // Fallback per casi edge
  return env.VITE_API_BASE_URL || 'http://localhost:3001';
}
