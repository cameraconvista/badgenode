import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from "@/lib/icons";
import { UtenteInput, UtentiService } from '@/services/utenti.service';
import { normalizeUserError } from '@/lib/normalizeError';
import FormNuovoDipendente from './FormNuovoDipendente';

interface ModaleNuovoDipendenteProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UtenteInput) => Promise<void>;
}

export default function ModaleNuovoDipendente({
  isOpen,
  onClose,
  onSave,
}: ModaleNuovoDipendenteProps) {
  const [formData, setFormData] = useState<UtenteInput>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    pin: 0, // Inizia vuoto, sarà validato come errore
    ore_contrattuali: 8.0,
    descrizione_contratto: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset form quando si apre/chiude
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        pin: 0, // Reset a vuoto
        ore_contrattuali: 8.0,
        descrizione_contratto: '',
      });
      setErrors({});
      // Focus sul primo campo
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Focus trap e gestione ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, input, textarea, [tabindex]:not([tabindex="-1"])'
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome obbligatorio';
    if (!formData.cognome.trim()) newErrors.cognome = 'Cognome obbligatorio';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email non valida';
    if (!formData.pin || formData.pin < 1 || formData.pin > 99)
      newErrors.pin = 'PIN deve essere tra 1 e 99';
    if (formData.ore_contrattuali <= 0 || formData.ore_contrattuali > 24)
      newErrors.ore_contrattuali = 'Ore devono essere tra 0.25 e 24';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (_error) {
      const msg = normalizeUserError(_error);
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (field: keyof UtenteInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Verifica disponibilità PIN in tempo reale
    if (field === 'pin' && typeof value === 'number') {
      checkPinAvailability(value);
    }
  };
  const checkPinAvailability = async (pin: number) => {
    if (pin < 1 || pin > 99) return;

    try {
      const result = await UtentiService.isPinAvailable(pin);
      if (result.error) {
        // Errore di rete/401 - non bloccare, solo avviso neutro
        setErrors((prev) => ({ ...prev, pin: result.error || 'Errore sconosciuto' }));
      } else if (!result.available) {
        // Solo se count > 0 (PIN realmente esistente)
        setErrors((prev) => ({ ...prev, pin: `PIN ${pin} già in uso` }));
      }
    } catch (_error) {
      const msg = normalizeUserError(_error);
      setErrors((prev) => ({ ...prev, pin: msg }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bn-overlay fixed inset-0 z-50 flex items-center justify-center p-4 lg:left-[16rem]">
      <div
        ref={modalRef}
        className="bn-admin-modal w-full max-w-[25.2rem] max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="bn-admin-modal__header">
          <h2 id="modal-title" className="bn-admin-modal__title">
            Aggiungi Nuovo Dipendente
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-transparent text-[#7A5A64] hover:text-[#7A1228]"
            aria-label="Chiudi modale"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body scrollabile */}
          <div className="overflow-y-auto max-h-[60vh] p-6">
            <FormNuovoDipendente
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              firstInputRef={firstInputRef}
            />
          </div>

          {/* Footer */}
          <div className="bn-admin-modal__footer">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bn-modal-btn-cancel"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bn-modal-btn-confirm"
            >
              {isLoading ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
