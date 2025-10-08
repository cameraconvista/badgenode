import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Utente } from '@/services/utenti.service';
import { ArchiviaDialog, EliminaDialog } from './ConfirmDialogs';

interface ArchivioActionsProps {
  utente: Utente;
  onStorico: (pin: number) => void;
  onModifica: (utente: Utente) => void;
  onArchivia: (id: string) => Promise<void>;
  onElimina: (id: string) => Promise<void>;
}

export default function ArchivioActions({
  utente,
  onStorico,
  onModifica,
  onArchivia,
  onElimina,
}: ArchivioActionsProps) {
  const [showArchiviaDialog, setShowArchiviaDialog] = useState(false);
  const [showEliminaDialog, setShowEliminaDialog] = useState(false);
  const [showConfermaElimina, setShowConfermaElimina] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStorico = () => {
    onStorico(utente.pin);
  };

  const handleModifica = () => {
    onModifica(utente);
  };

  const handleArchivia = async () => {
    setIsLoading(true);
    try {
      await onArchivia(utente.id);
      setShowArchiviaDialog(false);
    } catch (error) {
      console.error('Errore archiviazione:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleElimina = async () => {
    setIsLoading(true);
    try {
      await onElimina(utente.id);
      setShowEliminaDialog(false);
      setShowConfermaElimina(false);
    } catch (error) {
      console.error('Errore eliminazione:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminaClick = async () => {
    if (!showConfermaElimina) {
      setShowConfermaElimina(true);
      setShowEliminaDialog(true);
    } else {
      await handleElimina();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Storico */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStorico}
        className="p-2 hover:bg-accent/10"
        title="Visualizza storico"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </Button>

      {/* Modifica */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleModifica}
        className="p-2 hover:bg-accent/10"
        title="Modifica dipendente"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Button>

      {/* Archivia */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowArchiviaDialog(true)}
        className="p-2 hover:bg-yellow-100 text-yellow-600"
        title="Archivia dipendente"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      </Button>

      {/* Elimina */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowEliminaDialog(true)}
        className="p-2 hover:bg-red-100 text-red-600"
        title="Elimina dipendente"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>

      {/* Dialoghi di conferma */}
      <ArchiviaDialog
        isOpen={showArchiviaDialog}
        onClose={() => setShowArchiviaDialog(false)}
        utente={utente}
        onConfirm={handleArchivia}
        isLoading={isLoading}
      />

      <EliminaDialog
        isOpen={showEliminaDialog}
        onClose={() => {
          setShowConfermaElimina(false);
          setShowEliminaDialog(false);
        }}
        utente={utente}
        onConfirm={handleEliminaClick}
        isLoading={isLoading}
        showConferma={showConfermaElimina}
      />
    </div>
  );
}
