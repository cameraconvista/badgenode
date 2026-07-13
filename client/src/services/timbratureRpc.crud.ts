// CRUD timbrature (delete/update) estratto da timbratureRpc.ts
// Comportamento invariato: stesse chiamate endpoint, stessi log, stessi return.

import { safeFetchJsonPatch, safeFetchJsonDelete } from '@/lib/safeFetch';
import { adminAuthHeader } from '@/lib/adminAuth';
import { isError, type DeleteResult } from '@/types/api';
import type { TimbratureUpdate } from '../../../shared/types/database';

/**
 * Elimina tutte le timbrature di un giorno logico via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function deleteTimbratureGiornata({ pin, giorno }: { pin: number; giorno: string }) {
  console.info('[SERVICE] deleteTimbratureGiornata →', { pin, giorno });

  try {
    const result = await safeFetchJsonDelete<DeleteResult>('/api/timbrature/day', {
      pin: String(pin),
      giorno
    }, { headers: adminAuthHeader() });

    if (isError(result)) {
      throw new Error(result.error);
    }

    console.info('[SERVICE] deleteTimbratureGiornata OK →', {
      pin,
      giorno,
      deletedCount: (result as { deleted_count?: number })?.deleted_count ?? 0
    });
    return result; // { success, deleted_count, ids, deleted_records }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVICE] deleteTimbratureGiornata ERR →', { pin, giorno, error: errorMsg });
    throw error;
  }
}

/**
 * Aggiorna timbratura esistente via endpoint server
 * Usa SERVICE_ROLE_KEY lato server per bypassare RLS
 */
export async function callUpdateTimbro({ id, updateData }: { id: number; updateData: Partial<TimbratureUpdate> }) {
  console.info('[SERVICE] callUpdateTimbro (ENDPOINT) →', { id, updateData });

  try {
    const result = await safeFetchJsonPatch(`/api/timbrature/${id}`, updateData, { headers: adminAuthHeader() });

    console.info('[SERVICE] update OK →', { id, success: result.success });
    return result; // { success: true, data: { ... } }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
    console.error('[SERVICE] update ERR →', { id, error: errorMsg });
    throw error;
  }
}
