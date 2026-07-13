// Service client per la configurazione PIN (due scope: admin e general).
import { safeFetchJson, safeFetchJsonPut } from '@/lib/safeFetch';
import { isError } from '@/types/api';

/** Scope PIN: 'admin' = area amministrazione, 'general' = accesso app. */
export type PinScope = 'admin' | 'general';

export interface PinSettings {
  requirePin: boolean;
  pin: string;
}

/** Legge la config PIN di uno scope. Fallback ai default se l'API fallisce. */
export async function getPinSettings(scope: PinScope): Promise<PinSettings> {
  const res = await safeFetchJson<PinSettings>(`/api/settings/pin/${scope}`);
  if (isError(res) || !res.data) {
    // Fallback prudente: gate disattivato (comportamento di default sicuro per l'UX).
    return { requirePin: false, pin: '1909' };
  }
  return res.data;
}

/** Aggiorna il toggle "Richiedi PIN" di uno scope. */
export async function setRequirePin(scope: PinScope, requirePin: boolean): Promise<void> {
  const res = await safeFetchJsonPut<{ ok: boolean }>(`/api/settings/pin/${scope}`, { requirePin });
  if (isError(res)) {
    throw new Error(res.error || 'Errore aggiornamento impostazioni');
  }
}

/**
 * Cambia il PIN di uno scope. Richiede il PIN attuale corretto (verificato lato server).
 * Propaga il messaggio d'errore del server (es. "PIN attuale non corretto").
 */
export async function changePin(scope: PinScope, currentPin: string, newPin: string): Promise<void> {
  const res = await safeFetchJsonPut<{ ok: boolean }>(`/api/settings/pin/${scope}`, {
    pin: newPin,
    currentPin,
  });
  if (isError(res)) {
    throw new Error(res.error || 'Errore cambio PIN');
  }
}
