import { useEffect, useState } from "react";
import { LogIn, LogOut, AlertCircle } from "@/lib/icons";

export type ToastVariant = 'success-entrata' | 'success-uscita' | 'error';

type ToastCardProps = {
  open: boolean;
  variant: ToastVariant;
  nome?: string;
  cognome?: string;
  timestampText?: string;
  messageOverride?: string;
  onClose: () => void;
  inline?: boolean;
  showClose?: boolean;
  hideTimestamp?: boolean;
  modal?: boolean;
};

// Durata visualizzazione modale in ms
const MODAL_DURATION = 3000;

export default function ToastCard({
  open,
  variant,
  nome,
  cognome,
  timestampText,
  messageOverride,
  onClose,
  inline = false,
  showClose = true,
  hideTimestamp = false,
  modal = false,
}: ToastCardProps) {
  const [progress, setProgress] = useState(100);

  // Auto-close del modale: deve coincidere con la fine della barra (solo success)
  useEffect(() => {
    if (!open || !modal) return;
    if (variant === 'error') return;
    const t = window.setTimeout(() => {
      onClose();
    }, MODAL_DURATION);
    return () => window.clearTimeout(t);
  }, [open, modal, variant, onClose]);

  // Barra di progresso animata per il modale
  useEffect(() => {
    if (!open || !modal) {
      setProgress(100);
      return;
    }
    setProgress(100);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / MODAL_DURATION) * 100);
      setProgress(pct);
      if (pct > 0) {
        requestAnimationFrame(tick);
      }
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, modal]);

  if (!open) return null;

  const isError = variant === 'error';
  const isEntrata = variant === 'success-entrata';

  const title = `${nome || ''} ${cognome || ''}`.trim() || undefined;
  const line2 = messageOverride ?? (isEntrata ? 'ENTRATA Registrata!' : isError ? 'Errore' : 'USCITA Registrata!');

  // ── MODALE OVERLAY ────────────────────────────────────────────────────────
  if (modal) {
    const backdropColor = isError
      ? 'bg-black/70'
      : 'bg-black/65';

    const cardBg = isError
      ? 'bg-white text-rose-600'
      : isEntrata
        ? 'bg-emerald-600 text-white'
        : 'bg-rose-600 text-white';

    const progressColor = isError
      ? 'bg-rose-600'
      : 'bg-white';

    const Icon = isError ? AlertCircle : isEntrata ? LogIn : LogOut;

    return (
      <div
        role={isError ? 'alert' : 'status'}
        aria-live="polite"
        className={`bn-modal-backdrop fixed inset-0 z-[200] flex items-center justify-center p-6 ${backdropColor} backdrop-blur-sm`}
        onClick={onClose}
      >
        <div
          className={`bn-modal-card relative w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden ${cardBg}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icona grande */}
          <div className="flex flex-col items-center pt-8 pb-2 px-6">
            <div className={`rounded-full p-4 mb-4 ${isError ? 'bg-rose-100' : 'bg-white/20'}`}>
              <Icon className="w-12 h-12" />
            </div>

            {/* Nome dipendente */}
            {title && (
              <div className="text-lg font-bold tracking-wide uppercase text-center opacity-90">
                {title}
              </div>
            )}

            {/* Messaggio principale */}
            <div className="text-2xl font-extrabold tracking-wide text-center mt-1">
              {line2}
            </div>

            {/* Timestamp */}
            {timestampText && !hideTimestamp && (
              <div className="text-sm mt-2 opacity-80 text-center">
                {timestampText}
              </div>
            )}
          </div>

          {/* Barra di progresso auto-close */}
          <div className="h-1 w-full bg-white/25 mt-6">
            <div
              className={`h-full transition-none ${progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

      </div>
    );
  }

  // ── INLINE (fallback originale) ───────────────────────────────────────────
  const base = 'rounded-2xl px-4 py-3 shadow-lg ring-1 animate-in fade-in-0 slide-in-from-top-1 duration-200';
  const color = isError
    ? 'bg-white text-rose-600 ring-rose-400/60'
    : isEntrata
      ? 'bg-emerald-600 text-white ring-emerald-400/40'
      : 'bg-rose-600 text-white ring-rose-400/40';

  const role = isError ? 'alert' : 'status';

  return (
    <div
      role={role}
      aria-live="polite"
      className={`${inline ? 'w-full mt-3 mb-3' : 'absolute left-1/2 -translate-x-1/2 mt-3 max-w-[90%]'} ${base} ${color}`}
      style={{ zIndex: inline ? undefined : 60 }}
    >
      {showClose && (
        <button
          aria-label="Chiudi notifica"
          className="absolute right-2 top-2 opacity-80 hover:opacity-100"
          onClick={onClose}
        >
          ✕
        </button>
      )}
      <div className={`pr-6 ${inline ? 'text-center' : ''}`}>
        {title && <div className="text-sm font-semibold">{title}</div>}
        <div className="text-sm tracking-wide font-extrabold">{line2}</div>
        {timestampText && !hideTimestamp && (
          <div className="text-xs opacity-90">{timestampText}</div>
        )}
      </div>
    </div>
  );
}
