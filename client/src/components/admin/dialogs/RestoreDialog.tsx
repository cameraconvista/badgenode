import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from '@/lib/icons';

export interface RestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: { nome: string; cognome: string; pin: number } | null;
  onConfirm: (newPin: string) => Promise<void>;
  isLoading: boolean;
}

export function RestoreDialog({ isOpen, onClose, utente, onConfirm, isLoading }: RestoreDialogProps) {
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [newPin, setNewPin] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShowSecondConfirm(false);
      setNewPin('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => cancelButtonRef.current?.focus(), 100);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'input,button,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const isPinValid = () => {
    const n = parseInt(newPin, 10);
    return !isNaN(n) && n >= 1 && n <= 99;
  };

  const handleProcedi = async () => {
    if (!showSecondConfirm) {
      setShowSecondConfirm(true);
      return;
    }
    await onConfirm(newPin);
  };

  if (!isOpen || !utente) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bn-modal-overlay lg:left-[16rem]"
      style={{ backdropFilter: 'none', pointerEvents: 'auto' }}
    >
      <div
        ref={modalRef}
        className="bn-admin-modal w-full max-w-lg overflow-hidden z-[1001]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-restore"
      >
        <div className="bn-admin-modal__header">
          <h2 id="modal-title-restore" className="bn-admin-modal__title">
            {!showSecondConfirm ? 'Ripristina Ex-Dipendente' : 'Conferma Ripristino'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className="bn-admin-modal__box p-3 !rounded-full">
              <AlertTriangle className="w-8 h-8 text-[#3E7D52]" />
            </div>
          </div>

          <div className="text-center space-y-3">
            {!showSecondConfirm ? (
              <>
                <p className="text-[#1C0A10] text-lg">Vuoi ripristinare</p>
                <p className="text-xl font-bold text-[#1C0A10]">
                  {utente.nome} {utente.cognome}
                </p>
                <p className="text-[#7A5A64]">
                  PIN archiviato: <span className="font-mono text-[#7A1228]">{utente.pin}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-[#3E7D52] text-lg font-bold">Confermi il ripristino?</p>
                <p className="text-sm text-[#7A5A64]">
                  Assegna un <span className="font-semibold">nuovo PIN</span> (1-99):
                </p>
                <div className="mt-3">
                  <input
                    inputMode="numeric"
                    pattern="^[0-9]{1,2}$"
                    maxLength={2}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Nuovo PIN"
                    className="w-32 text-center p-3 rounded-lg bg-[#FDFAF8] border border-[rgba(122,18,40,0.25)] text-[#1C0A10] placeholder:text-[#7A5A64]/60 focus:border-[#7A1228] focus:outline-none"
                  />
                  {!isPinValid() && newPin !== '' && (
                    <p className="text-xs text-red-600 mt-1">PIN deve essere tra 1 e 99</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

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
            disabled={isLoading || (showSecondConfirm && !isPinValid())}
            className="bn-modal-btn-confirm"
          >
            {isLoading ? 'Ripristino...' : !showSecondConfirm ? 'Procedi' : 'Conferma'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
