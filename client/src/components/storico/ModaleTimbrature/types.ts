import { Timbratura } from '@/lib/time';

export interface FormData {
  dataEntrata: string;
  oraEntrata: string;
  dataUscita: string;
  oraUscita: string;
}

export interface ModaleTimbratureProps {
  isOpen: boolean;
  onClose: () => void;
  giornologico: string;
  timbrature: Timbratura[];
  onSave: (updates: {
    dataEntrata: string;
    oraEntrata: string;
    dataUscita: string;
    oraUscita: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}
