import { TimbratureService } from '@/services/timbrature.service';
import { invalidateAfterTimbratura } from '@/state/timbrature.cache';
import { safeFetchJson } from '@/lib/safeFetch';

interface TimbratureActionsProps {
  pin: string;
  setPin: (pin: string) => void;
  setLoading: (loading: boolean) => void;
  setFeedback: (feedback: { type: 'success' | 'error' | null; message: string }) => void;
}

export function useTimbratureActions({
  pin,
  setPin,
  setLoading,
  setFeedback,
}: TimbratureActionsProps) {
  // Validazione PIN online tramite API; offline → consenti per non bloccare
  const validatePIN = async (pinNumber: number): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
      const resp = await safeFetchJson(`/api/pin/validate?pin=${encodeURIComponent(pinNumber)}`);
      if ((resp as any)?.success === true && (resp as any)?.ok === true) return true;
      if ((resp as any)?.success === false && (resp as any)?.status === 404) return false;
      // In caso di 4xx diverso/5xx → fallback conservativo: non bloccare, lascia a TimbratureService l'esito
      return true;
    } catch {
      // Errori di rete → non bloccare il flusso (TimbratureService gestirà offline/queue)
      return true;
    }
  };

  const handleEntrata = async () => {
    if (pin.length === 0) {
      setFeedback({ type: 'error', message: 'Inserire il PIN' });
      setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
      return;
    }

    setLoading(true);
    try {
      const pinNumber = Number(pin);

      // VALIDAZIONE PIN LOCALE - Verifica esistenza prima di timbrare
      const isPinValid = await validatePIN(pinNumber);
      if (!isPinValid) {
        setFeedback({ type: 'error', message: 'PIN non registrato nel sistema' });
        setLoading(false);
        setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
        return;
      }

      const _id = await TimbratureService.timbra(pinNumber, 'entrata');
      void _id;

      // Invalida cache per refresh automatico
      invalidateAfterTimbratura(pinNumber);

      setFeedback({ type: 'success', message: 'Entrata registrata' });
      setPin('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante la registrazione';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
    }
  };

  const handleUscita = async () => {
    if (pin.length === 0) {
      setFeedback({ type: 'error', message: 'Inserire il PIN' });
      setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
      return;
    }

    setLoading(true);
    try {
      const pinNumber = Number(pin);

      // VALIDAZIONE PIN LOCALE - Verifica esistenza prima di timbrare
      const isPinValid = await validatePIN(pinNumber);
      if (!isPinValid) {
        setFeedback({ type: 'error', message: 'PIN non registrato nel sistema' });
        setLoading(false);
        setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
        return;
      }

      const _id = await TimbratureService.timbra(pinNumber, 'uscita');
      void _id;

      // Invalida cache per refresh automatico
      invalidateAfterTimbratura(pinNumber);

      setFeedback({ type: 'success', message: 'Uscita registrata' });
      setPin('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante la registrazione';
      setFeedback({ type: 'error', message });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
    }
  };

  return {
    handleEntrata,
    handleUscita,
  };
}
