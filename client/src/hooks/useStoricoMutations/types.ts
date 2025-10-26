import type { Timbratura } from '../../../../shared/types/database';

export interface UpdateData {
  dataEntrata: string;
  oraEntrata: string;
  dataUscita: string;
  oraUscita: string;
}

// Tipi per mutations (eliminare any types)
export interface UpsertTimbroInput {
  pin: number;
  tipo: 'entrata' | 'uscita';
  giorno: string;
  ora: string;
  anchorDate?: string;
}

export interface UpsertTimbroResult {
  success: boolean;
  data?: Timbratura;
  error?: string;
}

export interface DeleteTimbroInput {
  pin: number;
  giorno: string;
}

// Tipi legacy per compatibilità (deprecati)
export interface LegacyTimbratura {
  id: number;
  tipo: 'entrata' | 'uscita';
  data_locale: string;
  ora_locale: string;
}

// Parametri hook principale
export interface StoricoMutationsParams {
  pin: number;
  dal: string;
  al: string;
}
