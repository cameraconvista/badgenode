import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import ExDipendentiTable from '@/components/admin/ExDipendentiTable';
import { useAuth } from '@/contexts/AuthContext';
import { useExDipendentiQuery } from '@/hooks/useExDipendenti';
import { RestoreDialog, DeleteExDialog } from '@/components/admin/ConfirmDialogs';
import ExStoricoModal from '@/components/admin/ExStoricoModal';
import { UtentiService, ExDipendente } from '@/services/utenti.service';
import { TimbratureService } from '@/services/timbrature.service';
import { useQueryClient } from '@tanstack/react-query';

export default function ExDipendenti() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEx, setSelectedEx] = useState<ExDipendente | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showStorico, setShowStorico] = useState(false);
  const [storicoLoading, setStoricoLoading] = useState(false);
  const [storicoRaw, setStoricoRaw] = useState<any[]>([]);
  
  // Query ex-dipendenti con hook dedicato
  const { data: exDipendenti = [], isLoading, isError } = useExDipendentiQuery();

  const handleBackToArchivio = () => {
    setLocation('/archivio-dipendenti');
  };

  const handleOpenDelete = (exDipendente: ExDipendente) => {
    setSelectedEx(exDipendente);
    setShowDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEx) return;
    try {
      const result = await UtentiService.deleteExDipendente(selectedEx.pin);
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['ex-dipendenti'] });
        setShowDelete(false);
        setSelectedEx(null);
      } else {
        console.warn('[ExDipendenti] Delete failed:', result.error?.code);
      }
    } finally {
      // no-op
    }
  };

  const handleStorico = async (pin: number) => {
    const ex = exDipendenti.find(e => e.pin === pin) || null;
    setSelectedEx(ex as any);
    if (!ex) return;
    try {
      setStoricoLoading(true);
      // Carica timbrature fino alla data di archiviazione (in base allo schema reale: archiviato_il)
      const rows = await TimbratureService.getTimbratureByRange({ pin: ex.pin, to: ex.archiviato_il?.slice(0,10) });
      setStoricoRaw(rows || []);
      setShowStorico(true);
    } catch (e) {
      console.warn('[ExDipendenti] Caricamento storico fallito:', (e as Error).message);
      setStoricoRaw([]);
      setShowStorico(true);
    } finally {
      setStoricoLoading(false);
    }
  };

  const handleEsporta = (exDipendente: any) => {
    // TODO(BUSINESS): Implementare esportazione dati ex-dipendente
    console.log('Esporta ex-dipendente:', exDipendente);
  };

  const handleOpenRestore = (exDipendente: ExDipendente) => {
    setSelectedEx(exDipendente);
    setShowRestore(true);
  };

  const handleConfirmRestore = async (newPin: string) => {
    if (!selectedEx) return;
    try {
      setIsRestoring(true);
      const result = await UtentiService.restoreUtente(String(selectedEx.pin), { newPin });
      if (result.success) {
        // Invalida cache liste
        queryClient.invalidateQueries({ queryKey: ['ex-dipendenti'] });
        queryClient.invalidateQueries({ queryKey: ['utenti'] });
        setShowRestore(false);
        setSelectedEx(null);
      } else {
        console.warn('[ExDipendenti] Restore failed:', result.error?.code);
      }
    } finally {
      setIsRestoring(false);
    }
  };

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
          {/* Header con logo centrato */}
          <div className="flex justify-center mb-4">
            <img src="/logo2_app.png" alt="BADGENODE" className="h-10 w-auto" />
          </div>
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-white mb-2">Ex-Dipendenti</h1>
            <p className="text-yellow-300 text-base md:text-lg font-medium">
              {exDipendenti.length} ex-dipendenti archiviati
            </p>
          </div>

          <div className="flex-1 overflow-hidden mb-4">
            <ExDipendentiTable
              exDipendenti={exDipendenti}
              isLoading={isLoading}
              isError={isError}
              onStorico={handleStorico}
              onEsporta={handleEsporta}
              onRipristina={handleOpenRestore}
              onElimina={handleOpenDelete}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-3 border-t border-gray-600">
            <Button
              variant="outline"
              onClick={handleBackToArchivio}
              className="flex items-center gap-2 bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Archivio
            </Button>
            
          </div>
        </div>
      </div>
      <RestoreDialog
        isOpen={showRestore}
        onClose={() => { setShowRestore(false); setSelectedEx(null); }}
        utente={selectedEx ? { nome: selectedEx.nome, cognome: selectedEx.cognome, pin: selectedEx.pin } : null}
        onConfirm={handleConfirmRestore}
        isLoading={isRestoring}
      />
      <DeleteExDialog
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setSelectedEx(null); }}
        utente={selectedEx ? { nome: selectedEx.nome, cognome: selectedEx.cognome, pin: selectedEx.pin } : null}
        onConfirm={handleConfirmDelete}
        isLoading={false}
      />
      <ExStoricoModal
        isOpen={showStorico}
        onClose={() => { setShowStorico(false); }}
        utente={selectedEx ? { nome: selectedEx.nome, cognome: selectedEx.cognome, pin: selectedEx.pin } : null}
        archiviatoIl={selectedEx?.archiviato_il}
        rawRows={storicoRaw}
        isLoading={storicoLoading}
      />
    </div>
  );
}
