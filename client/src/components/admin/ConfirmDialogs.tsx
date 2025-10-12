import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Utente } from '@/services/utenti.service';

interface ArchiviaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: Utente;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function ArchiviaDialog({
  isOpen,
  onClose,
  utente,
  onConfirm,
  isLoading,
}: ArchiviaDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archivia Dipendente</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler archiviare{' '}
            <strong>
              {utente.nome} {utente.cognome}
            </strong>
            ?
            <br />
            Il dipendente verrà spostato negli ex-dipendenti e il PIN {utente.pin} sarà liberato.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? 'Archiviazione...' : 'Archivia'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface EliminaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: Utente;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  showConferma: boolean;
}

export function EliminaDialog({
  isOpen,
  onClose,
  utente,
  onConfirm,
  isLoading,
  showConferma,
}: EliminaDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {!showConferma ? 'Elimina Dipendente' : 'CONFERMA ELIMINAZIONE'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {!showConferma ? (
              <>
                Stai per eliminare definitivamente{' '}
                <strong>
                  {utente.nome} {utente.cognome}
                </strong>
                .
                <br />
                <strong className="text-red-600">Questa operazione è irreversibile!</strong>
                <br />
                Si consiglia di esportare lo storico prima di procedere.
              </>
            ) : (
              <>
                <strong className="text-red-600">ATTENZIONE: ELIMINAZIONE DEFINITIVA</strong>
                <br />
                Confermi di voler eliminare per sempre{' '}
                <strong>
                  {utente.nome} {utente.cognome}
                </strong>
                ?
                <br />
                Tutti i dati associati andranno persi.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Eliminazione...' : !showConferma ? 'Procedi' : 'ELIMINA DEFINITIVAMENTE'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
