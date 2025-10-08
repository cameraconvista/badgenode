import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Archive, Plus } from 'lucide-react';
import LogoHeader from '@/components/home/LogoHeader';
import ThemeToggle from '@/components/admin/ThemeToggle';
import ArchivioTable from '@/components/admin/ArchivioTable';
import ModaleDipendente from '@/components/admin/ModaleDipendente';
import ModaleNuovoDipendente from '@/components/admin/ModaleNuovoDipendente';
import { UtentiService, Utente, UtenteInput } from '@/services/utenti.service';

export default function ArchivioDipendenti() {
  const [, setLocation] = useLocation();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModaleModifica, setShowModaleModifica] = useState(false);
  const [showModaleNuovo, setShowModaleNuovo] = useState(false);
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);

  // Carica utenti all'avvio
  useEffect(() => { loadUtenti(); }, []);
  const loadUtenti = async () => {
    setIsLoading(true);
    try {
      // TODO: Ripristinare connessione Supabase quando disponibile
      // Per ora usa sempre il servizio mock che gestisce i dati in memoria
      const data = await UtentiService.getUtenti();
      setUtenti(data);
    } catch (error) {
      console.error('Errore caricamento utenti:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleStorico = (pin: number) => {
    // TODO: Navigazione a pagina storico con parametro PIN
    console.log('📊 Navigazione storico per PIN:', pin);
    // setLocation(`/storico/${pin}`);
  };
  const handleModifica = (utente: Utente) => {
    setUtenteSelezionato(utente);
    setShowModaleModifica(true);
  };

  const handleArchivia = async (id: string) => {
    try {
      await UtentiService.archiviaUtente(id, 'Archiviato da admin');
      await loadUtenti(); // Ricarica lista
    } catch (error) {
      console.error('Errore archiviazione:', error);
    }
  };

  const handleElimina = async (id: string) => {
    try {
      await UtentiService.deleteUtente(id);
      await loadUtenti(); // Ricarica lista
    } catch (error) {
      console.error('Errore eliminazione:', error);
      throw error;
    }
  };
  const handleSalvaModifica = async (datiUtente: UtenteInput) => {
    if (!utenteSelezionato) return;
    
    try {
      await UtentiService.updateUtente(utenteSelezionato.id, datiUtente);
      await loadUtenti(); //Ricarica lista
      setShowModaleModifica(false);
      setUtenteSelezionato(null);
    } catch (error) {
      console.error('Errore modifica:', error);
      throw error;
    }
  };

  const handleSalvaNuovo = async (data: UtenteInput) => {
    try {
      await UtentiService.createUtente(data);
      await loadUtenti(); // Ricarica lista
      setShowModaleNuovo(false);
    } catch (error) {
      console.error('Errore creazione:', error);
      throw error;
    }
  };
  const handleBackToLogin = () => {
    setLocation('/');
  };
  const handleExDipendenti = () => {
    // TODO: Navigazione a pagina ex-dipendenti
    console.log('📋 Navigazione ex-dipendenti');
    // setLocation('/ex-dipendenti');
  };

  return (
    <div 
      className="h-screen flex items-center justify-center p-4 overflow-hidden fixed inset-0"
      style={{ 
        background: 'radial-gradient(ellipse at center, #2d1b3d 0%, #1a0f2e 50%, #0f0a1a 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Container principale stile Home */}
      <div className="w-full max-w-[1120px] flex items-center justify-center h-full">
        <div 
          className="rounded-3xl p-4 shadow-2xl border-2 w-full h-[90vh] overflow-hidden relative flex flex-col"
          style={{
            backgroundColor: '#2b0048',
            borderColor: 'rgba(231, 116, 240, 0.6)',
            boxShadow: '0 0 20px rgba(231, 116, 240, 0.3), inset 0 0 20px rgba(231, 116, 240, 0.1)'
          }}
        >
          {/* Header con theme toggle */}
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>

          {/* Logo centrato */}
          <div className="text-center mb-4">
            <LogoHeader className="mb-0" />
          </div>

          {/* Titolo */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-white">
              Archivio Dipendenti
            </h1>
          </div>

          {/* Contenuto scrollabile - occupa spazio rimanente */}
          <div className="flex-1 overflow-hidden mb-4">
            <ArchivioTable
              utenti={utenti}
              isLoading={isLoading}
              onStorico={handleStorico}
              onModifica={handleModifica}
              onArchivia={handleArchivia}
              onElimina={handleElimina}
            />
          </div>

          {/* Footer azioni */}
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

      {/* Modali */}
      <ModaleDipendente
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
    </div>
  );
}
