// Service client per la configurazione PIN (due scope: admin e general).
import { safeFetchJson, safeFetchJsonPut } from '@/lib/safeFetch';
import { adminAuthHeader } from '@/lib/adminAuth';
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
  const res = await safeFetchJsonPut<{ ok: boolean }>(`/api/settings/pin/${scope}`, { requirePin }, { headers: adminAuthHeader() });
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
  }, { headers: adminAuthHeader() });
  if (isError(res)) {
    throw new Error(res.error || 'Errore cambio PIN');
  }
}

// ===== Avviso timbrature anomale (fasce orarie) =====

/** Config dell'avviso: toggle + fasce entrata (2 finestre) e uscita (sera/notte). */
export interface AlertConfig {
  enabled: boolean;
  e1_start: string; e1_end: string; // 1ª finestra entrata (HH:MM)
  e2_start: string; e2_end: string; // 2ª finestra entrata
  u_evening_from: string;           // uscita valida da (sera)
  u_night_until: string;            // uscita valida fino a (notte)
}

export const ALERT_DEFAULTS: AlertConfig = {
  enabled: true,
  e1_start: '16:45', e1_end: '17:15',
  e2_start: '19:15', e2_end: '19:45',
  u_evening_from: '22:45', u_night_until: '03:45',
};

/** Legge la config avviso. Fallback ai default se l'API fallisce. */
export async function getAlertConfig(): Promise<AlertConfig> {
  const res = await safeFetchJson<AlertConfig>('/api/settings/alert');
  if (isError(res) || !res.data) return ALERT_DEFAULTS;
  return { ...ALERT_DEFAULTS, ...res.data };
}

/** Aggiorna la config avviso (solo i campi passati). */
export async function updateAlertConfig(patch: Partial<AlertConfig>): Promise<void> {
  const res = await safeFetchJsonPut<{ ok: boolean }>('/api/settings/alert', patch, { headers: adminAuthHeader() });
  if (isError(res)) {
    throw new Error(res.error || 'Errore salvataggio avviso');
  }
}
