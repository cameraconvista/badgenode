import { Utente } from '@/services/utenti.service';

export interface ArchiviaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: Utente;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading: boolean;
}

export interface DeleteExDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: { nome: string; cognome: string; pin: number } | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export interface RestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: { nome: string; cognome: string; pin: number } | null;
  onConfirm: (newPin: number) => Promise<void>;
  isLoading: boolean;
}
