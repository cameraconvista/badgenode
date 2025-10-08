import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import LogoHeader from '@/components/home/LogoHeader';
import ThemeToggle from '@/components/admin/ThemeToggle';
import ArchivioTable from '@/components/admin/ArchivioTable';
import ModaleDipendente from '@/components/admin/ModaleDipendente';
import { UtentiService, Utente, UtenteInput } from '@/services/utenti.service';

export default function ArchivioDipendenti() {
  const [, setLocation] = useLocation();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModaleModifica, setShowModaleModifica] = useState(false);
  const [showModaleNuovo, setShowModaleNuovo] = useState(false);
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);

  // Carica utenti all'avvio
  useEffect(() => {
    loadUtenti();
  }, []);

  const loadUtenti = async () => {
    setIsLoading(true);
    try {
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
      throw error;
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

  const handleSalvaModifica = async (data: UtenteInput) => {
    if (!utenteSelezionato) return;
    
    try {
      await UtentiService.updateUtente(utenteSelezionato.id, data);
      await loadUtenti(); // Ricarica lista
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
    <div className="min-h-screen bg-background">
      {/* Header fisso */}
      <header className="sticky top-0 z-15 bg-card border-b border-border shadow-sm">
        <div className="max-w-[1120px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <LogoHeader className="mb-0" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Contenuto principale */}
      <main className="max-w-[1120px] mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Titolo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Archivio Dipendenti
            </h1>
            <p className="text-muted-foreground">
              Gestione dipendenti attivi - Accesso amministratore
            </p>
          </div>

          {/* Tabella con scroll interno */}
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="p-6">
              <ArchivioTable
                utenti={utenti}
                isLoading={isLoading}
                onStorico={handleStorico}
                onModifica={handleModifica}
                onArchivia={handleArchivia}
                onElimina={handleElimina}
              />
            </div>
          </div>

          {/* Footer azioni */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Login Utenti
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleExDipendenti}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Ex-Dipendenti
              </Button>
              
              <Button
                onClick={() => setShowModaleNuovo(true)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Aggiungi
              </Button>
            </div>
          </div>
        </div>
      </main>

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

      <ModaleDipendente
        isOpen={showModaleNuovo}
        onClose={() => setShowModaleNuovo(false)}
        utente={null}
        onSave={handleSalvaNuovo}
      />
    </div>
  );
}
