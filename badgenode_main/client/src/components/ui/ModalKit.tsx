import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalKitProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string; // per body
  contentClassName?: string; // per content container
  // Se true, impedisce la chiusura con click esterno o tasto ESC
  preventDismiss?: boolean;
};

export default function ModalKit({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children, 
  footer, 
  className,
  contentClassName,
  preventDismiss,
}: ModalKitProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bn-overlay bn-z-modal fixed inset-0" />
        <Dialog.Content
          onInteractOutside={preventDismiss ? (e) => e.preventDefault() : undefined}
          onPointerDownOutside={preventDismiss ? (e) => e.preventDefault() : undefined}
          onEscapeKeyDown={preventDismiss ? (e) => e.preventDefault() : undefined}
          className={cn("bn-modal bn-z-modal fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] max-w-[880px] max-h-[80vh] overflow-hidden focus:outline-none", contentClassName)}
        >
          <div className="bn-modal-header pr-12">
            {title && <Dialog.Title className="text-white text-xl font-semibold">{title}</Dialog.Title>}
            {description && <Dialog.Description className="text-white/70 mt-1">{description}</Dialog.Description>}
            <Dialog.Close className="absolute right-4 top-4 text-white/90 hover:text-white">
              <X className="w-5 h-5"/>
            </Dialog.Close>
          </div>
          <div className={cn("bn-modal-body overflow-auto", className)}>
            {children}
          </div>
          {footer && <div className="bn-modal-footer">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
