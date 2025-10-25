import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, Archive, AlertTriangle } from 'lucide-react';
import { Utente } from '@/services/utenti.service';

interface ArchiviaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: Utente;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading: boolean;
}

interface DeleteExDialogProps {
  isOpen: boolean;
  onClose: () => void;
  utente: { nome: string; cognome: string; pin: number } | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteExDialog({ isOpen, onClose, utente, onConfirm, isLoading }: DeleteExDialogProps) {
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShowSecondConfirm(false);
    }
  }, [isOpen]);

  // Disattiva interazioni sul background quando il modale è aperto
  useEffect(() => {
    const html = document.documentElement;
    const root = document.getElementById('root') || document.getElementById('app');
    if (isOpen) {
      html.classList.add('modal-open');
      root?.setAttribute('inert', '');
    } else {
      html.classList.remove('modal-open');
      root?.removeAttribute('inert');
    }
    return () => { html.classList.remove('modal-open'); root?.removeAttribute('inert'); };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => cancelButtonRef.current?.focus(), 100);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll('button,[tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleProcedi = async () => {
    if (!showSecondConfirm) {
      setShowSecondConfirm(true);
    } else {
      await onConfirm();
    }
  };

  if (!isOpen || !utente) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bn-modal-overlay" style={{ backdropFilter: 'none', pointerEvents: 'auto' }}>
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden rounded-3xl border-2 bn-modal-solid z-[1001]"
        style={{
          backgroundColor: '#2b0048',
          borderColor: 'rgba(231, 116, 240, 0.6)',
          boxShadow: 'none',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-delete-ex"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 id="modal-title-delete-ex" className="text-xl font-bold text-white">
            {!showSecondConfirm ? 'Elimina definitivamente' : 'Conferma eliminazione'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-transparent text-gray-300 hover:text-white"
            aria-label="Chiudi modale"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-red-600/20">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="text-center space-y-3">
            {!showSecondConfirm ? (
              <>
                <p className="text-white text-lg">Questa operazione è irreversibile.</p>
                <p className="text-xl font-bold text-white">{utente.nome} {utente.cognome}</p>
                <p className="text-gray-300">PIN archiviato: <span className="font-mono text-violet-400">{utente.pin}</span></p>
              </>
            ) : (
              <>
                <p className="text-red-400 text-lg font-bold">Confermi l'eliminazione definitiva?</p>
                <p className="text-sm text-gray-300">Le timbrature esistenti non verranno toccate.</p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-600">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-white border-2 border-violet-600 text-violet-600"
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={handleProcedi}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-600"
          >
            {isLoading ? 'Eliminazione...' : !showSecondConfirm ? 'Continua' : 'Conferma'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}


interface RestoreDialogProps {
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
    setTimeout(() => cancelButtonRef.current?.focus(), 100);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll('input,button,[tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isPinValid = () => {
    const n = parseInt(newPin, 10);
    return !isNaN(n) && n >= 1 && n <= 99;
  };

  const handleProcedi = async () => {
    if (!showSecondConfirm) {
      setShowSecondConfirm(true);
    } else {
      await onConfirm(newPin);
    }
  };

  if (!isOpen || !utente) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bn-modal-overlay" style={{ backdropFilter: 'none', pointerEvents: 'auto' }}>
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden rounded-3xl border-2 bn-modal-solid z-[1001]"
        style={{
          backgroundColor: '#2b0048',
          borderColor: 'rgba(231, 116, 240, 0.6)',
          boxShadow: 'none',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title-restore"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 id="modal-title-restore" className="text-xl font-bold text-white">
            {!showSecondConfirm ? 'Ripristina Ex-Dipendente' : 'Conferma Ripristino'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-transparent text-gray-300 hover:text-white"
            aria-label="Chiudi modale"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-green-600/20">
              <AlertTriangle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="text-center space-y-3">
            {!showSecondConfirm ? (
              <>
                <p className="text-white text-lg">Vuoi ripristinare</p>
                <p className="text-xl font-bold text-white">{utente.nome} {utente.cognome}</p>
                <p className="text-gray-300">PIN archiviato: <span className="font-mono text-violet-400">{utente.pin}</span></p>
              </>
            ) : (
              <>
                <p className="text-green-400 text-lg font-bold">Confermi il ripristino?</p>
                <p className="text-sm text-gray-300">Assegna un <span className="font-semibold">nuovo PIN</span> (1-99):</p>
                <div className="mt-3">
                  <input
                    inputMode="numeric"
                    pattern="^[0-9]{1,2}$"
                    maxLength={2}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Nuovo PIN"
                    className="w-32 text-center p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-violet-400 focus:outline-none"
                  />
                  {!isPinValid() && newPin !== '' && (
                    <p className="text-xs text-red-400 mt-1">PIN deve essere tra 1 e 99</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-600">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-white border-2 border-violet-600 text-violet-600"
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={handleProcedi}
            disabled={isLoading || (showSecondConfirm && !isPinValid())}
            className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-600"
          >
            {isLoading ? 'Ripristino...' : !showSecondConfirm ? 'Continua' : 'Conferma'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ArchiviaDialog({
  isOpen,
  onClose,
  utente,
  onConfirm,
  isLoading,
}: ArchiviaDialogProps) {
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Reset stato quando si apre/chiude il modale
  useEffect(() => {
    if (isOpen) {
      setShowSecondConfirm(false);
      setReason('');
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
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleProcedi = async () => {
    if (!showSecondConfirm) {
      setShowSecondConfirm(true);
    } else {
      // Passa il motivo al callback
      await onConfirm(reason);
    }
  };

  if (!isOpen || !utente) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black bn-modal-overlay" style={{ backdropFilter: 'none', pointerEvents: 'auto' }}>
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden rounded-3xl border-2 bn-modal-solid z-[1001]"
        style={{
          backgroundColor: '#2b0048',
          borderColor: 'rgba(231, 116, 240, 0.6)',
          boxShadow: 'none',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 id="modal-title" className="text-xl font-bold text-white">
            {!showSecondConfirm ? 'Archivia Dipendente' : 'Conferma Archiviazione'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-transparent text-gray-300 hover:text-white"
            aria-label="Chiudi modale"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Icona di avviso */}
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-yellow-600/20">
              <Archive className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          {/* Messaggio principale */}
          <div className="text-center space-y-3">
            {!showSecondConfirm ? (
              <>
                <p className="text-white text-lg">Vuoi archiviare</p>
                <p className="text-xl font-bold text-white">
                  {utente.nome} {utente.cognome}
                </p>
                <p className="text-gray-300">
                  PIN: <span className="font-mono text-violet-400">{utente.pin}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-400 text-lg font-bold">
                  Confermi l'archiviazione definitiva di
                </p>
                <p className="text-xl font-bold text-white">
                  {utente.nome} {utente.cognome}
                </p>
                
                {/* Campo motivo opzionale */}
                <div className="mt-4 text-left">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo archiviazione (opzionale)
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Es: Dimissioni, fine contratto..."
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-violet-400 focus:outline-none resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1">{reason.length}/200 caratteri</p>
                </div>
              </>
            )}
          </div>

          {/* Avviso PIN liberato */}
          {!showSecondConfirm && (
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Archive className="w-5 h-5 text-yellow-400" />
                <p className="font-semibold text-yellow-400">PIN sarà liberato</p>
              </div>
              <p className="text-sm text-yellow-300">
                Il dipendente verrà spostato negli ex-dipendenti e il PIN {utente.pin} sarà disponibile per riuso.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-600">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all"
          >
            Annulla
          </Button>
          <Button
            type="button"
            onClick={handleProcedi}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 text-white border-2 border-yellow-600"
          >
            {isLoading ? 'Archiviazione...' : !showSecondConfirm ? 'Continua' : 'Conferma definitiva'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

