import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { UtenteInput, Utente } from '@/services/utenti.service';
import FormModificaDipendente from './FormModificaDipendente';

interface ModaleModificaDipendenteProps {
  isOpen: boolean;
  onClose: () => void;
  utente: Utente | null;
  onSave: (data: UtenteInput) => Promise<void>;
}

export default function ModaleModificaDipendente({
  isOpen,
  onClose,
  utente,
  onSave,
}: ModaleModificaDipendenteProps) {
  const [formData, setFormData] = useState<UtenteInput>({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    pin: 0,
    ore_contrattuali: 8.0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Popola dati quando si apre il modale
  useEffect(() => {
    if (isOpen && utente) {
      setFormData({
        nome: utente.nome || '',
        cognome: utente.cognome || '',
        email: utente.email ?? '',
        telefono: utente.telefono ?? '',
        pin: utente.pin || 0,
        ore_contrattuali: utente.ore_contrattuali || 8.0,
        descrizione_contratto: utente.descrizione_contratto ?? '',
      });
      setErrors({});
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, utente]);

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
      void _error;
      setErrors({ general: 'Errore durante il salvataggio' });
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (field: keyof UtenteInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !utente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border-2"
        style={{
          backgroundColor: '#2b0048',
          borderColor: 'rgba(231, 116, 240, 0.6)',
          boxShadow: '0 0 20px rgba(231, 116, 240, 0.3), inset 0 0 20px rgba(231, 116, 240, 0.1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 id="modal-title" className="text-xl font-bold text-white">
            Modifica Dipendente
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-gray-300 hover:text-white"
            aria-label="Chiudi modale"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body scrollabile */}
          <div className="overflow-y-auto max-h-[60vh] p-6">
            <FormModificaDipendente
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              onInputChange={handleInputChange}
              firstInputRef={firstInputRef}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-600">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-white border-2 border-violet-600 text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
