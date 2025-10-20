// client/src/lib/apiBase.ts
export function getApiBaseUrl() {
  const env: any = (import.meta as any).env || {};
  // In produzione usa same-origin (backend e frontend stesso dominio)
  if (env.MODE === 'production') {
    return '';
  }
  // In dev consenti override via .env, altrimenti backend locale
  return env.VITE_API_BASE_URL || 'http://localhost:3001';
}
