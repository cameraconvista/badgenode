import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Archive, X } from '@/lib/icons';
import type { Utente } from '@/services/utenti.service';

export interface ArchiviaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: Utente;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading: boolean;
}

export function ArchiviaDialog({ isOpen, onClose, utente, onConfirm, isLoading }: ArchiviaDialogProps) {
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShowSecondConfirm(false);
      setReason('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => cancelButtonRef.current?.focus(), 100);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, textarea, [tabindex]:not([tabindex="-1"])'
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
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleProcedi = async () => {
    if (!showSecondConfirm) {
      setShowSecondConfirm(true);
      return;
    }
    await onConfirm(reason);
  };

  if (!isOpen || !utente) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bn-modal-overlay"
      style={{ backdropFilter: 'none', pointerEvents: 'auto' }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden rounded-3xl border-2 bn-modal-solid z-[1001]"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(122, 18, 40, 0.25)',
          boxShadow: '0 8px 40px rgba(122, 18, 40, 0.08)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgba(122,18,40,0.12)]">
          <h2 id="modal-title" className="text-xl font-bold text-[#1C0A10]">
            {!showSecondConfirm ? 'Archivia Dipendente' : 'Conferma Archiviazione'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-transparent text-[#7A5A64] hover:text-white"
            aria-label="Chiudi modale"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-amber-700/15">
              <Archive className="w-8 h-8 text-amber-700" />
            </div>
          </div>

          <div className="text-center space-y-3">
            {!showSecondConfirm ? (
              <>
                <p className="text-[#1C0A10] text-lg">Vuoi archiviare</p>
                <p className="text-xl font-bold text-[#1C0A10]">
                  {utente.nome} {utente.cognome}
                </p>
                <p className="text-[#7A5A64]">
                  PIN: <span className="font-mono text-[#7A1228]">{utente.pin}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-amber-700 text-lg font-bold">Confermi l'archiviazione definitiva di</p>
                <p className="text-xl font-bold text-[#1C0A10]">
                  {utente.nome} {utente.cognome}
                </p>

                <div className="mt-4 text-left">
                  <label htmlFor="reason" className="block text-sm font-medium text-[#7A5A64] mb-2">
                    Motivo archiviazione (opzionale)
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Es: Dimissioni, fine contratto..."
                    className="w-full p-3 rounded-lg bg-[#FDFAF8] border border-[rgba(122,18,40,0.25)] text-[#1C0A10] placeholder:text-[#7A5A64]/60 focus:border-[#7A1228] focus:outline-none resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-[#7A5A64] mt-1">{reason.length}/200 caratteri</p>
                </div>
              </>
            )}
          </div>

          {!showSecondConfirm && (
            <div className="bg-amber-700/10 border border-amber-700/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Archive className="w-5 h-5 text-amber-700" />
                <p className="font-semibold text-amber-700">PIN sarà liberato</p>
              </div>
              <p className="text-sm text-amber-800">
                Il dipendente verrà spostato negli ex-dipendenti e il PIN {utente.pin} sarà disponibile
                per riuso.
              </p>
            </div>
          )}
        </div>

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
            className="bg-amber-700 hover:bg-amber-800 text-white border-2 border-amber-700"
          >
            {isLoading ? 'Archiviazione...' : !showSecondConfirm ? 'Continua' : 'Conferma definitiva'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
