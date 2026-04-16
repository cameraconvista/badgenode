import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Archive, Trash2 } from 'lucide-react';
import { Utente } from '@/services/utenti.service';
import { ArchiviaDialog } from './ConfirmDialogs';

interface ArchivioActionsProps {
  utente: Utente;
  onModifica: (utente: Utente) => void;
  onArchivia: (id: string, reason?: string) => Promise<void>;
  onElimina: (utente: Utente) => void;
}

export default function ArchivioActions({
  utente,
  onModifica,
  onArchivia,
  onElimina,
}: ArchivioActionsProps) {
  const [showArchiviaDialog, setShowArchiviaDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleModifica = () => {
    onModifica(utente);
  };

  const handleArchivia = async (reason?: string) => {
    setIsLoading(true);
    try {
      await onArchivia(utente.id, reason);
      setShowArchiviaDialog(false);
    } catch (_error) {
      void _error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminaClick = () => {
    onElimina(utente);
  };

  return (
    <>
      {/* Matita bianca (edit) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleModifica}
        className="p-1 no-default-hover-elevate no-default-active-elevate"
        title="Modifica dipendente"
      >
        <Edit className="icon-action edit" />
      </Button>

      {/* Archivio giallo tenue */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowArchiviaDialog(true)}
        className="p-1 no-default-hover-elevate no-default-active-elevate"
        title="Archivia dipendente"
      >
        <Archive className="icon-action archive text-yellow-400/90 hover:text-yellow-300" />
      </Button>

      {/* Cestino rosso */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEliminaClick}
        className="p-1 no-default-hover-elevate no-default-active-elevate"
        title="Elimina dipendente"
      >
        <Trash2 className="icon-action trash text-red-400 hover:text-red-300" />
      </Button>

      {/* Dialogo archiviazione */}
      <ArchiviaDialog
        isOpen={showArchiviaDialog}
        onClose={() => setShowArchiviaDialog(false)}
        utente={utente}
        onConfirm={handleArchivia}
        isLoading={isLoading}
      />
    </>
  );
}
