import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Archive, Trash2 } from 'lucide-react';
import { Utente } from '@/services/utenti.service';
import { ArchiviaDialog } from './ConfirmDialogs';

interface ArchivioActionsProps {
  utente: Utente;
  onModifica: (utente: Utente) => void;
  onArchivia: (id: string) => Promise<void>;
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

  const handleArchivia = async () => {
    setIsLoading(true);
    try {
      await onArchivia(utente.id);
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
    <div className="flex items-center gap-2">
      {/* Modifica */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleModifica}
        className="p-2 hover:bg-blue-600/20 text-gray-300 hover:text-blue-400"
        title="Modifica dipendente"
      >
        <Edit className="w-4 h-4" />
      </Button>

      {/* Archivia */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowArchiviaDialog(true)}
        className="p-2 hover:bg-yellow-600/20 text-yellow-400 hover:text-yellow-300"
        title="Archivia dipendente"
      >
        <Archive className="w-4 h-4" />
      </Button>

      {/* Elimina */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleEliminaClick}
        className="p-2 hover:bg-red-600/20 text-red-400 hover:text-red-300"
        title="Elimina dipendente"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Dialogo archiviazione */}
      <ArchiviaDialog
        isOpen={showArchiviaDialog}
        onClose={() => setShowArchiviaDialog(false)}
        utente={utente}
        onConfirm={handleArchivia}
        isLoading={isLoading}
      />
    </div>
  );
}
