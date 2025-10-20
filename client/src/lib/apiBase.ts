// client/src/lib/apiBase.ts
export function getApiBaseUrl() {
  const env: any = (import.meta as any).env || {};
  // In produzione usa SEMPRE l'URL assoluto dal .env (Render)
  if (env.MODE === 'production') {
    return env.VITE_API_BASE_URL || 'https://badgenode2.onrender.com';
  }
  // In dev consenti override via .env, altrimenti backend locale
  return env.VITE_API_BASE_URL || 'http://localhost:3001';
}
