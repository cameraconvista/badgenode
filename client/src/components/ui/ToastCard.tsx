import { X } from "lucide-react";

export type ToastVariant = 'success-entrata' | 'success-uscita' | 'error';

type ToastCardProps = {
  open: boolean;
  variant: ToastVariant;
  nome?: string;
  cognome?: string;
  timestampText?: string; // stringa già formattata dall'app
  messageOverride?: string; // eventuale testo custom
  onClose: () => void;
  inline?: boolean; // se true, il toast è in flow (non absolute)
  showClose?: boolean; // mostra/nasconde la X
};

export default function ToastCard({ open, variant, nome, cognome, timestampText, messageOverride, onClose, inline = false, showClose = true }: ToastCardProps) {
  if (!open) return null;

  const isError = variant === 'error';
  const isEntrata = variant === 'success-entrata';

  const base = 'rounded-2xl px-4 py-3 shadow-lg ring-1 animate-in fade-in-0 slide-in-from-top-1 duration-200';
  const color = isError
    ? 'bg-white text-rose-600 ring-rose-400/60'
    : isEntrata
      ? 'bg-emerald-600/90 text-white ring-emerald-400/40'
      : 'bg-rose-600/90 text-white ring-rose-400/40';

  const role = isError ? 'alert' : 'status';
  const ariaLive = 'polite';

  const title = `${(nome || '')} ${(cognome || '')}`.trim() || undefined;
  const line2 = messageOverride ?? (isEntrata ? 'ENTRATA Registrata!' : isError ? 'Errore' : 'USCITA Registrata!');

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`${inline ? 'w-full mt-3 mb-3' : 'absolute left-1/2 -translate-x-1/2 mt-3 max-w-[90%]'} ${base} ${color}`}
      style={{ zIndex: inline ? undefined : 60 }}
    >
      {showClose && (
        <button
          aria-label="Chiudi notifica"
          className="absolute right-2 top-2 opacity-80 hover:opacity-100"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className={`pr-6 ${inline ? 'text-center' : ''}`}>
        {title && <div className="text-sm font-semibold">{title}</div>}
        <div className="text-sm tracking-wide font-extrabold">
          {line2}
        </div>
        {timestampText && (
          <div className="text-xs opacity-90">
            {timestampText}
          </div>
        )}
      </div>
    </div>
  );
}
