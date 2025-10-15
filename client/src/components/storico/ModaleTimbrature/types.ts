import type { Timbratura } from '@/types/timbrature';
import type { Utente } from '@/services/utenti.service';

export interface FormData {
  dataEntrata: string;
  oraEntrata: string;
  dataUscita: string;
  oraUscita: string;
}

export interface ModaleTimbratureProps {
  isOpen: boolean;
  onClose: () => void;
  giorno_logico: string;
  timbrature: Timbratura[];
  dipendente?: Utente;
  onSave: (updates: {
    dataEntrata: string;
    oraEntrata: string;
    dataUscita: string;
    oraUscita: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}
