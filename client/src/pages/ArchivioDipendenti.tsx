import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Archive, Plus } from 'lucide-react';
import LogoHeader from '@/components/home/LogoHeader';
import ArchivioTable from '@/components/admin/ArchivioTable';
import ModaleNuovoDipendente from '@/components/admin/ModaleNuovoDipendente';
import ModaleModificaDipendente from '@/components/admin/ModaleModificaDipendente';
import ModaleEliminaDipendente from '@/components/admin/ModaleEliminaDipendente';
import { UtentiService, Utente, UtenteInput } from '@/services/utenti.service';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeTimbrature } from '@/lib/realtime';
import { invalidateUtenti, debounce } from '@/state/timbrature.cache';

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
  useEffect(() => {
    if (!isAdmin) return;
    const debouncedInvalidate = debounce(() => {
      invalidateUtenti();
      loadUtenti();
    }, 250);
    const unsubscribe = subscribeTimbrature({
      onChange: (payload) => {
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
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  const handleStorico = (pin: number) => {
    setLocation(`/storico-timbrature/${pin}`);
  };
  const onEditClick: (_id: number) => void = (_id) => {
    setLocation(`/storico-timbrature/${_id}`);
  };
  const handleModifica = (utente: Utente) => {
    setUtenteSelezionato(utente);
    setShowModaleModifica(true);
  };
  const handleArchivia = async (id: string) => {};
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
      await UtentiService.updateUtente(utenteSelezionato.id, datiUtente);
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
  const handleBackToLogin = () => setLocation('/');
  const handleRealtimeChange = useCallback((_payload: unknown) => {}, []);
  const handleExDipendenti = () => {};

  return (
    <div
      className="h-screen flex items-center justify-center p-4 overflow-hidden fixed inset-0"
      style={{
        background: 'radial-gradient(ellipse at center, #2d1b3d 0%, #1a0f2e 50%, #0f0a1a 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-[1120px] flex items-center justify-center h-full">
        <div
          className="rounded-3xl p-4 shadow-2xl border-2 w-full h-[90vh] overflow-hidden relative flex flex-col"
          style={{
            backgroundColor: '#2b0048',
            borderColor: 'rgba(231, 116, 240, 0.6)',
            boxShadow: '0 0 20px rgba(231, 116, 240, 0.3), inset 0 0 20px rgba(231, 116, 240, 0.1)',
          }}
        >
          {/* Header con logo centrato e toggle tema */}
          <div className="flex items-center justify-center mb-4">
            <LogoHeader />
          </div>
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">Archivio Dipendenti</h1>
            <div className="text-sm text-gray-400">
              <strong className="text-violet-400">{utenti.length}</strong> dipendenti attivi
            </div>
          </div>
          <div className="flex-1 overflow-hidden mb-4">
            <ArchivioTable
              utenti={utenti}
              isLoading={isLoading}
              onStorico={handleStorico}
              onModifica={handleModifica}
              onArchivia={handleArchivia}
              onElimina={handleEliminaClick}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-3 border-t border-gray-600">
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="flex items-center gap-2 bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Login Utenti
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExDipendenti}
                className="flex items-center gap-2 bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all"
              >
                <Archive className="w-4 h-4" />
                Ex-Dipendenti
              </Button>
              <Button
                onClick={() => setShowModaleNuovo(true)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Aggiungi
              </Button>
            </div>
          </div>
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
    </div>
  );
}
