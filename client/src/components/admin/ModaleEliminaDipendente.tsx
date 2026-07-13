import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from "@/lib/icons";
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
    <div className="bn-overlay fixed inset-0 z-50 flex items-center justify-center p-4 lg:left-[16rem]">
      <div
        ref={modalRef}
        className="bn-admin-modal w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="bn-admin-modal__header">
          <h2 id="modal-title" className="bn-admin-modal__title">
            {!showConferma ? 'Elimina Dipendente' : 'CONFERMA ELIMINAZIONE'}
          </h2>
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
                <p className="text-red-600">Tutti i dati associati andranno persi.</p>
              </>
            )}
          </div>

          {/* Avviso operazione irreversibile */}
          {!showConferma && (
            <div className="bn-admin-modal__box">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="font-semibold text-red-600">Operazione irreversibile</p>
              </div>
              <p className="text-sm text-[#1C0A10] text-center">
                Tutti i dati associati al dipendente andranno persi definitivamente. Si consiglia di
                esportare lo storico prima di procedere.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bn-admin-modal__footer">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bn-modal-btn-cancel"
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={handleProcedi}
            disabled={isLoading}
            className="bn-modal-btn-danger"
          >
            {isLoading ? 'Eliminazione...' : !showConferma ? 'Procedi' : 'ELIMINA DEFINITIVAMENTE'}
          </Button>
        </div>
      </div>
    </div>
  );
}
