import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Plus } from "@/lib/icons";
import AdminLayout from '@/components/admin/layout/AdminLayout';
import ArchivioTable from '@/components/admin/ArchivioTable';
import ModaleNuovoDipendente from '@/components/admin/ModaleNuovoDipendente';
import ModaleModificaDipendente from '@/components/admin/ModaleModificaDipendente';
import ModaleEliminaDipendente from '@/components/admin/ModaleEliminaDipendente';
import { UtentiService, Utente, UtenteInput } from '@/services/utenti.service';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import { invalidateUtenti, debounce } from '@/state/timbrature.cache';
import { useQueryClient } from '@tanstack/react-query';

export default function ArchivioDipendenti() {
  const [, setLocation] = useLocation();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModaleModifica, setShowModaleModifica] = useState(false);
  const [showModaleNuovo, setShowModaleNuovo] = useState(false);
  const [showModaleElimina, setShowModaleElimina] = useState(false);
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);
  const [isEliminaLoading, setIsEliminaLoading] = useState(false);
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!isAdmin) return;
    const debouncedInvalidate = debounce(() => {
      invalidateUtenti();
      loadUtenti();
    }, 250);
    const unsubscribe = subscribeTimbrature({
      onChange: (_payload: unknown) => {
        void _payload;
        debouncedInvalidate();
      },
    });
    return () => unsubscribe();
  }, [isAdmin]);
  useEffect(() => {
    loadUtenti();
  }, []);
  const loadUtenti = async () => {
    setIsLoading(true);
    try {
      const data = await UtentiService.getUtenti();
      setUtenti(data);
    } catch (_error) {
      void _error;
    } finally {
      setIsLoading(false);
    }
  };
  const handleStorico = (pin: number) => {
    setLocation(`/storico-timbrature/${pin}`);
  };
  const handleModifica = (utente: Utente) => {
    setUtenteSelezionato(utente);
    setShowModaleModifica(true);
  };
  const handleArchivia = async (id: string, reason?: string) => {
    try {
      const result = await UtentiService.archiveUtente(id, { reason });
      
      if (result.success) {
        // Ricarica le liste utenti e ex-dipendenti
        await loadUtenti();
        
        // Invalida cache ex-dipendenti per aggiornamento immediato
        queryClient.invalidateQueries({ queryKey: ['ex-dipendenti'] });

        // TODO(BUSINESS): Implementare toast di successo
      } else {
        // Gestione errori con messaggi specifici
        const errorMessage = getErrorMessage(result.error?.code);
        console.error('Errore archiviazione:', errorMessage);
        // TODO(BUSINESS): Implementare toast di errore
      }
    } catch (error) {
      console.error('Errore archiviazione:', error);
      // TODO(BUSINESS): Implementare toast di errore generico
    }
  };

  // Messaggi d'errore specifici per codici
  const getErrorMessage = (code?: string): string => {
    switch (code) {
      case 'OPEN_SESSION':
        return 'Impossibile archiviare: sessione timbratura aperta.';
      case 'ALREADY_ARCHIVED':
        return 'Utente già archiviato.';
      case 'ARCHIVE_FAILED':
        return 'Archiviazione non riuscita. Riprova.';
      default:
        return 'Errore durante l\'archiviazione.';
    }
  };
  const handleEliminaClick = (utente: Utente) => {
    setUtenteSelezionato(utente);
    setShowModaleElimina(true);
  };
  const handleConfermaElimina = async () => {
    if (!utenteSelezionato) return;
    setIsEliminaLoading(true);
    try {
      await UtentiService.deleteUtente(utenteSelezionato.pin);
      await loadUtenti();
      setShowModaleElimina(false);
      setUtenteSelezionato(null);
    } catch (error) {
      console.error('Errore eliminazione dipendente:', error);
      // L'errore viene gestito dal modale che rimane aperto
    } finally {
      setIsEliminaLoading(false);
    }
  };
  const handleSalvaModifica = async (datiUtente: UtenteInput) => {
    if (!utenteSelezionato) return;
    try {
      await UtentiService.updateUtente(utenteSelezionato.pin, datiUtente);
      await loadUtenti();
      setShowModaleModifica(false);
      setUtenteSelezionato(null);
    } catch (error) {
      throw error;
    }
  };
  const handleSalvaNuovo = async (data: UtenteInput) => {
    try {
      await UtentiService.createUtente(data);
      await loadUtenti();
      setShowModaleNuovo(false);
    } catch (error) {
      throw error;
    }
  };
  return (
    <AdminLayout title="Dipendenti">
      <div className="flex h-full flex-col">
        <div className="relative mb-4 text-center">
          <h1 className="mb-1 text-2xl font-bold text-[#7A1228]">Archivio Dipendenti</h1>
          <p className="text-base font-medium text-[#1C0A10] md:text-lg">
            {utenti.length} dipendenti attivi
          </p>
          {/* Pulsante Nuovo in alto a destra (non altera l'altezza del blocco titolo).
              Su mobile: solo icona "+" tonda per non invadere il titolo.
              Da sm in su: "+ Nuovo" con testo, come su desktop. */}
          <Button
            onClick={() => setShowModaleNuovo(true)}
            aria-label="Nuovo dipendente"
            className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full p-0 bg-[#3E7D52] text-white hover:bg-[#4A9061] sm:h-auto sm:w-auto sm:gap-2 sm:rounded-md sm:px-4 sm:py-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo</span>
          </Button>
        </div>
        <div className="min-h-0 flex-1 p-1">
          <ArchivioTable
            utenti={utenti}
            isLoading={isLoading}
            onStorico={handleStorico}
            onModifica={handleModifica}
            onArchivia={handleArchivia}
            onElimina={handleEliminaClick}
          />
        </div>
      </div>

      <ModaleModificaDipendente
        isOpen={showModaleModifica}
        onClose={() => {
          setShowModaleModifica(false);
          setUtenteSelezionato(null);
        }}
        utente={utenteSelezionato}
        onSave={handleSalvaModifica}
      />
      <ModaleNuovoDipendente
        isOpen={showModaleNuovo}
        onClose={() => setShowModaleNuovo(false)}
        onSave={handleSalvaNuovo}
      />
      <ModaleEliminaDipendente
        isOpen={showModaleElimina}
        onClose={() => {
          setShowModaleElimina(false);
          setUtenteSelezionato(null);
        }}
        utente={utenteSelezionato}
        onConfirm={handleConfermaElimina}
        isLoading={isEliminaLoading}
      />
    </AdminLayout>
  );
}
