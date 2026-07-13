// Tipi/interfacce estratti da timbratureRpc.ts
// Solo dichiarazioni di tipo (nessuna logica): re-esportati da timbratureRpc.ts per compatibilita

import type { TimbratureUpdate } from '../../../shared/types/database';

export interface InsertTimbroParams {
  pin: number;
  tipo: 'entrata' | 'uscita';
  client_event_id?: string;
  traceId?: string;
}

export interface InsertTimbroResult {
  success: boolean;
  data?: unknown;
  error?: string;
  code?: string;
}

export interface UpdateTimbroParams {
  id: number;
  updateData: Partial<TimbratureUpdate>;
}

export interface UpdateTimbroResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
