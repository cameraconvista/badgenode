import { useState, useEffect } from 'react';
import { Timbratura, formatDataItaliana } from '@/lib/time';
import { validateTimbratura } from '@/lib/validation';
import type { FormData } from './types';

export function useModaleTimbrature(
  isOpen: boolean,
  timbrature: Timbratura[],
  giornologico: string,
  onSave: (updates: FormData) => Promise<void>,
  onDelete: () => Promise<void>,
  onClose: () => void
) {
  const [formData, setFormData] = useState<FormData>({
    dataEntrata: '',
    oraEntrata: '',
    dataUscita: '',
    oraUscita: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Inizializza form quando si apre il modale
  useEffect(() => {
    if (isOpen && timbrature.length > 0) {
      const entrata = timbrature.find(t => t.tipo === 'entrata');
      const uscita = timbrature.find(t => t.tipo === 'uscita');

      setFormData({
        dataEntrata: entrata?.data || formatDataItaliana(new Date().toISOString()),
        oraEntrata: entrata?.ore?.substring(0, 5) || '',
        dataUscita: uscita?.data || formatDataItaliana(new Date().toISOString()),
        oraUscita: uscita?.ore?.substring(0, 5) || ''
      });
      setErrors([]);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, timbrature]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Validazioni base
    if (!formData.dataEntrata) newErrors.push('Data entrata obbligatoria');
    if (!formData.oraEntrata) newErrors.push('Ora entrata obbligatoria');
    if (!formData.dataUscita) newErrors.push('Data uscita obbligatoria');
    if (!formData.oraUscita) newErrors.push('Ora uscita obbligatoria');

    if (newErrors.length === 0) {
      // Crea oggetti temporanei per validazione business
      const entrataTemp: Timbratura = {
        id: 'temp-entrata',
        pin: timbrature[0]?.pin || 0,
        tipo: 'entrata',
        data: formData.dataEntrata,
        ore: formData.oraEntrata + ':00',
        giornologico: giornologico,
        nome: timbrature[0]?.nome || '',
        cognome: timbrature[0]?.cognome || '',
        created_at: new Date().toISOString()
      };

      const uscitaTemp: Timbratura = {
        id: 'temp-uscita',
        pin: timbrature[0]?.pin || 0,
        tipo: 'uscita',
        data: formData.dataUscita,
        ore: formData.oraUscita + ':00',
        giornologico: giornologico,
        nome: timbrature[0]?.nome || '',
        cognome: timbrature[0]?.cognome || '',
        created_at: new Date().toISOString()
      };

      // Valida coerenza business
      const validation = validateTimbratura(entrataTemp, uscitaTemp);
      if (!validation.valid) {
        newErrors.push(...validation.errors);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Errore durante il salvataggio']);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Errore durante l\'eliminazione']);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleDelete
  };
}
