import * as Dialog from "@radix-ui/react-dialog";
import { X, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { useId, useRef, useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export default function ConfirmFullscreen({
  open,
  title,
  description,
  confirmText = "Elimina",
  cancelText = "Annulla",
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId();
  const descId = useId();
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [open]);

  const safeDescription = description || "Conferma eliminazione delle timbrature del giorno selezionato.";

  const overlay = (
    <Dialog.Root open={open} modal onOpenChange={(v) => { if (!v) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="fixed z-[9999] pointer-events-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md rounded-2xl bg-[#1b1126] text-white shadow-2xl ring-1 ring-white/10 p-6"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <button
            aria-label="Chiudi"
            className="absolute right-4 top-4 text-white/90 hover:text-white"
            onClick={onCancel}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-3">
            <div className="shrink-0 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <Dialog.Title id={titleId} className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Description id={descId} className="mt-1 text-white/80 text-sm">
                {safeDescription}
              </Dialog.Description>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              ref={cancelBtnRef}
              className="h-10 px-4 rounded-lg bg-white/10 text-white hover:bg-white/20"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  if (typeof window === "undefined") return null;
  return createPortal(overlay, document.body);
}
