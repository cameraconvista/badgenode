import { useState } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import ExDipendentiTable from '@/components/admin/ExDipendentiTable';
import { useExDipendentiQuery } from '@/hooks/useExDipendenti';
import { RestoreDialog, DeleteExDialog } from '@/components/admin/ConfirmDialogs';
import ExStoricoModal from '@/components/admin/ExStoricoModal';
import { UtentiService, ExDipendente } from '@/services/utenti.service';
import { TimbratureService } from '@/services/timbrature.service';
import { useQueryClient } from '@tanstack/react-query';

export default function ExDipendenti() {
  const queryClient = useQueryClient();
  const [selectedEx, setSelectedEx] = useState<ExDipendente | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showStorico, setShowStorico] = useState(false);
  const [storicoLoading, setStoricoLoading] = useState(false);
  const [storicoRaw, setStoricoRaw] = useState<Array<{ tipo?: unknown; ora_locale?: unknown; giorno_logico?: unknown; data_locale?: unknown; created_at?: unknown }>>([]);
  
  const { data: exDipendenti = [], isLoading, isError } = useExDipendentiQuery();

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
    setSelectedEx(ex);
    if (!ex) return;
    try {
      setStoricoLoading(true);
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
    <AdminLayout title="Ex-Dipendenti">
      <div className="flex h-full flex-col">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-[#1C0A10]">Ex-Dipendenti</h1>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <ExDipendentiTable
            exDipendenti={exDipendenti}
            isLoading={isLoading}
            isError={isError}
            onStorico={handleStorico}
            onRipristina={handleOpenRestore}
            onElimina={handleOpenDelete}
          />
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
    </AdminLayout>
  );
}
