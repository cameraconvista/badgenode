import { useState, useEffect } from 'react';
import { formatDataItaliana } from '@/lib/time';
import { toInputDate } from '@/lib/dateFmt';
import type { Timbratura } from '@/types/timbrature';
import { validateTimbratura } from '@/lib/validation';
import type { FormData } from './types';

export function useModaleTimbrature(
  isOpen: boolean,
  timbrature: Timbratura[],
  giorno_logico: string,
  onSave: (updates: FormData) => Promise<void>,
  onDelete: (params: { giorno: string }) => Promise<void>,
  onClose: () => void
) {
  const [formData, setFormData] = useState<FormData>({
    dataEntrata: '',
    oraEntrata: '',
    dataUscita: '',
    oraUscita: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Inizializza form quando si apre il modale
  useEffect(() => {
    if (isOpen && timbrature.length > 0) {
      const entrata = timbrature.find((t) => t.tipo === 'entrata');
      const uscita = timbrature.find((t) => t.tipo === 'uscita');

      setFormData({
        dataEntrata: entrata?.data_locale || formatDataItaliana(new Date().toISOString()),
        oraEntrata: entrata?.ora_locale?.substring(0, 5) || '',
        dataUscita: uscita?.data_locale || formatDataItaliana(new Date().toISOString()),
        oraUscita: uscita?.ora_locale?.substring(0, 5) || '',
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
        id: 0, // temp ID
        pin: timbrature[0]?.pin || 0,
        tipo: 'entrata',
        ts_order: new Date().toISOString(),
        giorno_logico: giorno_logico,
        data_locale: formData.dataEntrata,
        ora_locale: formData.oraEntrata + ':00',
        nome: timbrature[0]?.nome || '',
        cognome: timbrature[0]?.cognome || '',
        created_at: new Date().toISOString(),
      };

      const uscitaTemp: Timbratura = {
        id: 0, // temp ID
        pin: timbrature[0]?.pin || 0,
        tipo: 'uscita',
        ts_order: new Date().toISOString(),
        giorno_logico: giorno_logico,
        data_locale: formData.dataUscita,
        ora_locale: formData.oraUscita + ':00',
        nome: timbrature[0]?.nome || '',
        cognome: timbrature[0]?.cognome || '',
        created_at: new Date().toISOString(),
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
      // Identifica ID delle timbrature esistenti
      const entrata = timbrature.find((t) => t.tipo === 'entrata');
      const uscita = timbrature.find((t) => t.tipo === 'uscita');

      // Prepara dati per saveFromModal (CREATE/UPDATE unificato)
      const saveData = {
        idEntrata: entrata?.id,
        idUscita: uscita?.id,
        dataEntrata: formData.dataEntrata,
        oraEntrata: formData.oraEntrata,
        dataUscita: formData.dataUscita,
        oraUscita: formData.oraUscita,
      };

      console.log('[MODALE] handleSave →', { saveData, hasEntrata: !!entrata, hasUscita: !!uscita });

      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('[MODALE] save error →', error);
      setErrors([error instanceof Error ? error.message : 'Errore durante il salvataggio']);
    }
  };

  const handleDelete = async () => {
    try {
      // Usa giorno_logico oppure la data dal form come fallback
      const giornoLogico = giorno_logico || toInputDate(formData.dataEntrata) || toInputDate(formData.dataUscita);
      
      if (!giornoLogico) {
        setErrors(['Impossibile determinare il giorno da eliminare']);
        return;
      }
      
      console.log('[MODALE] handleDelete →', { giornoLogico });
      await onDelete({ giorno: giornoLogico });
      onClose();
    } catch (error) {
      console.error('[MODALE] delete error →', error);
      setErrors([error instanceof Error ? error.message : "Errore durante l'eliminazione"]);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleSave,
    handleDelete,
  };
}
