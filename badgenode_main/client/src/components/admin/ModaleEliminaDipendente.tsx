import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from "@/lib/icons";
import { Utente } from '@/services/utenti.service';

interface ModaleEliminaDipendenteProps {
  isOpen: boolean;
  onClose: () => void;
  utente: Utente | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export default function ModaleEliminaDipendente({
  isOpen,
  onClose,
  utente,
  onConfirm,
  isLoading,
}: ModaleEliminaDipendenteProps) {
  const [showConferma, setShowConferma] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Reset stato quando si apre/chiude il modale
  useEffect(() => {
    if (isOpen) {
      setShowConferma(false);
    }
  }, [isOpen]);

  // Focus trap e gestione ESC
  useEffect(() => {
    if (!isOpen) return;

    // Focus iniziale sul pulsante Annulla (sicuro)
    setTimeout(() => cancelButtonRef.current?.focus(), 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleProcedi = async () => {
    if (!showConferma) {
      setShowConferma(true);
    } else {
      await onConfirm();
    }
  };

  if (!isOpen || !utente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl border-2"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(122, 18, 40, 0.25)',
          boxShadow: '0 8px 40px rgba(122, 18, 40, 0.10)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(122,18,40,0.12)]">
          <h2 id="modal-title" className="text-xl font-bold text-[#1C0A10]">
            {!showConferma ? 'Elimina Dipendente' : 'CONFERMA ELIMINAZIONE'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-[#7A5A64] hover:text-white"
            aria-label="Chiudi modale"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Icona di avviso */}
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-red-600/20">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Messaggio principale */}
          <div className="text-center space-y-3">
            {!showConferma ? (
              <>
                <p className="text-[#1C0A10] text-lg">Stai per eliminare definitivamente</p>
                <p className="text-xl font-bold text-[#1C0A10]">
                  {utente.nome} {utente.cognome}
                </p>
                <p className="text-[#7A5A64]">
                  PIN: <span className="font-mono text-[#7A1228]">{utente.pin}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-red-600 text-lg font-bold">
                  ATTENZIONE: ELIMINAZIONE DEFINITIVA
                </p>
                <p className="text-[#1C0A10] text-lg">Confermi di voler eliminare per sempre</p>
                <p className="text-xl font-bold text-[#1C0A10]">
                  {utente.nome} {utente.cognome}
                </p>
                <p className="text-red-300">Tutti i dati associati andranno persi.</p>
              </>
            )}
          </div>

          {/* Avviso operazione irreversibile */}
          {!showConferma && (
            <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-600">Operazione irreversibile</p>
              </div>
              <p className="text-sm text-red-300">
                Tutti i dati associati al dipendente andranno persi definitivamente. Si consiglia di
                esportare lo storico prima di procedere.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[rgba(122,18,40,0.12)]">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-white border-2 border-[#7A1228] text-[#7A1228] hover:bg-[#F5EBE0] hover:shadow-md transition-all"
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={handleProcedi}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-600"
          >
            {isLoading ? 'Eliminazione...' : !showConferma ? 'Procedi' : 'ELIMINA DEFINITIVAMENTE'}
          </Button>
        </div>
      </div>
    </div>
  );
}
