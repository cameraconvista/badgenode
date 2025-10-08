import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Utente, UtenteInput } from '@/services/utenti.service';
import FormDipendente from './FormDipendente';

interface ModaleDipendenteProps {
  isOpen: boolean;
  onClose: () => void;
  utente?: Utente | null;
  onSave: (data: UtenteInput) => Promise<void>;
}

export default function ModaleDipendente({
  isOpen,
  onClose,
  utente,
  onSave,
}: ModaleDipendenteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<UtenteInput>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    pin: 1,
    ore_contrattuali: 8.0,
  });

  // Popola dati iniziali quando si apre la modale
  useEffect(() => {
    if (isOpen) {
      if (utente) {
        // Modalità modifica
        setInitialData({
          nome: utente.nome,
          cognome: utente.cognome,
          email: utente.email || '',
          telefono: utente.telefono || '',
          pin: utente.pin,
          ore_contrattuali: utente.ore_contrattuali,
        });
      } else {
        // Modalità creazione
        setInitialData({
          nome: '',
          cognome: '',
          email: '',
          telefono: '',
          pin: 1,
          ore_contrattuali: 8.0,
        });
      }
    }
  }, [isOpen, utente]);

  const handleSave = async (data: UtenteInput) => {
    setIsLoading(true);
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      throw error; // Rilancia per gestione in FormDipendente
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {utente ? 'Modifica Dipendente' : 'Nuovo Dipendente'}
          </DialogTitle>
          <DialogDescription>
            {utente 
              ? `Modifica i dati di ${utente.nome} ${utente.cognome}. Il PIN ${utente.pin} non può essere modificato.`
              : 'Inserisci i dati del nuovo dipendente. Il PIN verrà assegnato automaticamente.'
            }
          </DialogDescription>
        </DialogHeader>

        <FormDipendente
          initialData={initialData}
          onSubmit={handleSave}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
